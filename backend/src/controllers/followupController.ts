import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateFollowupRisk } from '../services/aiFollowupRisk';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditMiddleware';

const prisma = new PrismaClient();

export async function getFollowUps(req: Request, res: Response) {
  try {
    const { assignedWorkerId, status, category, priority, patientId } = req.query;

    const where: any = {};
    if (assignedWorkerId) where.assignedWorkerId = String(assignedWorkerId);
    if (status) where.status = String(status);
    if (category) where.category = String(category);
    if (priority) where.priority = String(priority);
    if (patientId) {
      where.patient = { OR: [{ id: String(patientId) }, { patientId: String(patientId) }] };
    }

    const followups = await prisma.followUp.findMany({
      where,
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
            triageAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
          }
        },
        assignedWorker: { select: { id: true, name: true, phone: true } }
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' }
      ]
    });

    const today = new Date().toISOString().split('T')[0];
    const enriched = followups.map(f => {
      const isPastDue = f.status === 'PENDING' && f.dueDate < today;
      return {
        ...f,
        isPastDue,
        effectiveStatus: isPastDue ? 'OVERDUE' : f.status
      };
    });

    res.json({
      followups: enriched,
      pendingCount: enriched.filter(f => f.effectiveStatus === 'PENDING').length,
      overdueCount: enriched.filter(f => f.effectiveStatus === 'OVERDUE').length,
      completedCount: enriched.filter(f => f.effectiveStatus === 'COMPLETED').length
    });
  } catch (err: any) {
    console.error('Get followups error:', err);
    res.status(500).json({ error: 'Failed to fetch follow-up tasks.' });
  }
}

export async function createFollowUp(req: AuthRequest, res: Response) {
  try {
    const {
      patientId,
      assignedWorkerId,
      category,
      description,
      dueDate,
      priority,
      notes
    } = req.body;

    if (!patientId || !category || !dueDate) {
      return res.status(400).json({ error: 'Patient ID, category, and due date are required.' });
    }

    const patient = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { patientId }] },
      include: {
        vitals: { orderBy: { recordedAt: 'desc' }, take: 1 }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // AI Risk calculation
    const lastVital = patient.vitals[0];
    const isAbnormalVital = !!lastVital && (
      (lastVital.systolicBp || 0) >= 140 ||
      (lastVital.diastolicBp || 0) >= 90 ||
      (lastVital.bloodGlucose || 0) >= 180
    );

    const aiRisk = calculateFollowupRisk({
      isHighRiskPregnancy: patient.pregnancyStatus,
      hasChronicCondition: !!patient.chronicConditions,
      recentAbnormalVitals: isAbnormalVital,
      age: patient.age
    });

    const followUp = await prisma.followUp.create({
      data: {
        patientId: patient.id,
        assignedWorkerId: assignedWorkerId || req.user?.id || null,
        category,
        description: description || 'Routine health follow-up',
        dueDate,
        status: 'PENDING',
        priority: priority || (aiRisk.score > 0.6 ? 'HIGH' : 'ROUTINE'),
        aiRiskScore: aiRisk.score,
        notes: notes || `AI Risk Category: ${aiRisk.riskCategory}. Intervention: ${aiRisk.recommendedIntervention}`
      },
      include: {
        patient: true,
        assignedWorker: true
      }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Healthcare Staff',
      userRole: req.user?.role || 'ASHA',
      action: 'SCHEDULE_FOLLOWUP',
      entity: 'FollowUp',
      entityId: followUp.id,
      details: `Scheduled ${category} follow-up for ${patient.name} due on ${dueDate} (AI Risk: ${aiRisk.score}).`
    });

    res.status(201).json({
      followUp,
      aiRiskAnalysis: aiRisk,
      message: 'Follow-up task created with predictive risk scoring.'
    });
  } catch (err: any) {
    console.error('Create follow-up error:', err);
    res.status(500).json({ error: 'Failed to schedule follow-up.' });
  }
}

export async function completeFollowUp(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const existing = await prisma.followUp.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Follow-up task not found.' });
    }

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date().toISOString().split('T')[0],
        notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}${notes}` : existing.notes
      },
      include: { patient: true }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'ASHA Worker',
      userRole: req.user?.role || 'ASHA',
      action: 'COMPLETE_FOLLOWUP',
      entity: 'FollowUp',
      entityId: updated.id,
      details: `Completed follow-up for ${updated.patient.name}.`
    });

    res.json({ followUp: updated, message: 'Follow-up marked as completed.' });
  } catch (err: any) {
    console.error('Complete follow-up error:', err);
    res.status(500).json({ error: 'Failed to complete follow-up.' });
  }
}
