import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditMiddleware';

const prisma = new PrismaClient();

export async function getAllReferrals(req: Request, res: Response) {
  try {
    const { originFacilityId, destinationFacilityId, status, priority, patientId } = req.query;

    const where: any = {};
    if (originFacilityId) where.originFacilityId = String(originFacilityId);
    if (destinationFacilityId) where.destinationFacilityId = String(destinationFacilityId);
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (patientId) {
      where.patient = { OR: [{ id: String(patientId) }, { patientId: String(patientId) }] };
    }

    const referrals = await prisma.referral.findMany({
      where,
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 }
          }
        },
        originFacility: true,
        destinationFacility: true,
        referringDoctor: { select: { id: true, name: true } }
      },
      orderBy: { createdDate: 'desc' }
    });

    const parsedReferrals = referrals.map(r => ({
      ...r,
      parsedTimeline: JSON.parse(r.trackingTimeline || '[]')
    }));

    res.json({ referrals: parsedReferrals });
  } catch (err: any) {
    console.error('Get referrals error:', err);
    res.status(500).json({ error: 'Failed to fetch referrals.' });
  }
}

export async function createReferral(req: AuthRequest, res: Response) {
  try {
    const {
      patientId,
      originFacilityId,
      destinationFacilityId,
      reason,
      clinicalSummary,
      priority
    } = req.body;

    if (!patientId || !originFacilityId || !destinationFacilityId || !reason) {
      return res.status(400).json({ error: 'Patient ID, origin facility, destination facility, and reason are required.' });
    }

    const patient = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { patientId }] }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const doctorId = req.user?.id || (await prisma.user.findFirst({ where: { role: 'DOCTOR' } }))?.id;

    const initialTimeline = [
      {
        stage: 'CREATED',
        timestamp: new Date(),
        actor: req.user?.name || 'Medical Officer',
        notes: `Referral initiated for: ${reason}`
      },
      {
        stage: 'SENT',
        timestamp: new Date(),
        actor: 'Swasthya Setu Interoperability Hub',
        notes: 'Transmitted to destination facility health exchange queue.'
      }
    ];

    const referral = await prisma.referral.create({
      data: {
        patientId: patient.id,
        referringDoctorId: doctorId,
        originFacilityId,
        destinationFacilityId,
        reason,
        clinicalSummary: clinicalSummary || 'Referral requested for specialized diagnosis & care.',
        priority: priority || 'HIGH',
        status: 'SENT',
        trackingTimeline: JSON.stringify(initialTimeline)
      },
      include: {
        patient: true,
        originFacility: true,
        destinationFacility: true
      }
    });

    // Create notification for ASHA and Patient
    await prisma.notification.create({
      data: {
        type: 'REFERRAL',
        title: `New Referral Created for ${patient.name}`,
        message: `Referred to ${referral.destinationFacility.name} (Priority: ${referral.priority}). Reason: ${reason}`,
        link: `/patient?patientId=${patient.id}`
      }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Doctor',
      userRole: req.user?.role || 'DOCTOR',
      action: 'CREATE_REFERRAL',
      entity: 'Referral',
      entityId: referral.id,
      details: `Referred ${patient.name} from ${referral.originFacility.name} to ${referral.destinationFacility.name}.`
    });

    res.status(201).json({
      referral: {
        ...referral,
        parsedTimeline: initialTimeline
      },
      message: 'Referral transmitted successfully across public healthcare facilities.'
    });
  } catch (err: any) {
    console.error('Create referral error:', err);
    res.status(500).json({ error: 'Failed to create referral.' });
  }
}

export async function updateReferralStage(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    const existing = await prisma.referral.findUnique({
      where: { id },
      include: { patient: true, destinationFacility: true, originFacility: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Referral not found.' });
    }

    const currentTimeline = JSON.parse(existing.trackingTimeline || '[]');
    currentTimeline.push({
      stage: stage.toUpperCase(),
      timestamp: new Date(),
      actor: req.user?.name || 'Healthcare Officer',
      notes: notes || `Referral transitioned to ${stage.toUpperCase()} stage.`
    });

    const updated = await prisma.referral.update({
      where: { id },
      data: {
        status: stage.toUpperCase(),
        trackingTimeline: JSON.stringify(currentTimeline)
      },
      include: { patient: true, destinationFacility: true, originFacility: true }
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        type: 'REFERRAL',
        title: `Referral Status Update: ${stage.toUpperCase()}`,
        message: `Your referral to ${updated.destinationFacility.name} is now ${stage.toUpperCase()}. ${notes || ''}`,
        link: `/patient?patientId=${updated.patient.id}`
      }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Officer',
      userRole: req.user?.role || 'DOCTOR',
      action: 'UPDATE_REFERRAL_STAGE',
      entity: 'Referral',
      entityId: updated.id,
      details: `Advanced referral #${updated.id} to stage ${stage.toUpperCase()}.`
    });

    res.json({
      referral: {
        ...updated,
        parsedTimeline: currentTimeline
      },
      message: `Referral successfully advanced to ${stage.toUpperCase()}`
    });
  } catch (err: any) {
    console.error('Update referral stage error:', err);
    res.status(500).json({ error: 'Failed to update referral stage.' });
  }
}
