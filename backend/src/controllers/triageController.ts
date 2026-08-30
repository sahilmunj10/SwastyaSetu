import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { evaluateTriage } from '../services/triageEngine';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditMiddleware';

const prisma = new PrismaClient();

export async function runTriage(req: AuthRequest, res: Response) {
  try {
    const {
      patientId,
      symptoms,
      symptomDuration,
      isPregnant,
      gestationalWeeks,
      systolicBp,
      diastolicBp,
      spo2,
      heartRate,
      temperature,
      bloodGlucose,
      notes
    } = req.body;

    if (!patientId || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Patient ID and symptoms array are required.' });
    }

    const patient = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { patientId }] }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient record not found.' });
    }

    const triageResult = evaluateTriage({
      patientId: patient.id,
      symptoms,
      symptomDuration,
      isPregnant: isPregnant !== undefined ? isPregnant : patient.pregnancyStatus,
      gestationalWeeks: gestationalWeeks || patient.gestationalWeeks || undefined,
      systolicBp,
      diastolicBp,
      spo2,
      heartRate,
      temperature,
      bloodGlucose,
      notes
    });

    // Save assessment to database
    const assessment = await prisma.triageAssessment.create({
      data: {
        patientId: patient.id,
        symptoms: JSON.stringify(symptoms),
        symptomDuration: symptomDuration || 'Recent',
        ruleTriggered: triageResult.ruleTriggered,
        riskLevel: triageResult.riskLevel,
        clinicalReasoning: triageResult.clinicalReasoning,
        recommendedAction: triageResult.recommendedAction,
        assessedBy: req.user?.name || 'ASHA Frontline Screening',
        assessedAt: new Date()
      }
    });

    // If emergency or high risk, trigger notification
    if (triageResult.riskLevel === 'EMERGENCY' || triageResult.riskLevel === 'HIGH') {
      await prisma.notification.create({
        data: {
          type: triageResult.riskLevel === 'EMERGENCY' ? 'EMERGENCY' : 'HIGH_RISK',
          title: `Triage Alert: ${patient.name} (${triageResult.riskLevel})`,
          message: `${triageResult.clinicalReasoning.slice(0, 140)}... Action: ${triageResult.recommendedAction}`,
          link: `/doctor?patientId=${patient.id}`
        }
      });
    }

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'ASHA Worker',
      userRole: req.user?.role || 'ASHA',
      action: 'TRIAGE_SCREENING',
      entity: 'TriageAssessment',
      entityId: assessment.id,
      details: `Screened ${patient.name}: result = ${triageResult.riskLevel} (${triageResult.ruleTriggered})`
    });

    res.json({
      assessment,
      triageResult
    });
  } catch (err: any) {
    console.error('Triage error:', err);
    res.status(500).json({ error: 'Failed to process triage evaluation.' });
  }
}

export async function getTriageHistory(req: Request, res: Response) {
  try {
    const { patientId } = req.params;
    const assessments = await prisma.triageAssessment.findMany({
      where: {
        patient: {
          OR: [{ id: patientId }, { patientId }]
        }
      },
      orderBy: { assessedAt: 'desc' }
    });

    res.json({ assessments });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch triage history.' });
  }
}
