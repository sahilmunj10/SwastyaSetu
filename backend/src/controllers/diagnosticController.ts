import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditMiddleware';

const prisma = new PrismaClient();

export async function getDiagnosticRequests(req: Request, res: Response) {
  try {
    const { facilityId, patientId, status, priority } = req.query;

    const where: any = {};
    if (facilityId) where.facilityId = String(facilityId);
    if (patientId) {
      where.patient = { OR: [{ id: String(patientId) }, { patientId: String(patientId) }] };
    }
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);

    const diagnostics = await prisma.diagnosticRequest.findMany({
      where,
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 }
          }
        },
        doctor: { select: { id: true, name: true } },
        facility: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ diagnostics });
  } catch (err: any) {
    console.error('Get diagnostics error:', err);
    res.status(500).json({ error: 'Failed to fetch diagnostic requests.' });
  }
}

export async function getPublicTestCatalog(req: Request, res: Response) {
  try {
    const catalog = [
      {
        testName: 'Urine Routine & Spot Protein (Albumin)',
        category: 'Pathology',
        sampleType: 'Urine Sample',
        turnaroundTime: '45 mins',
        standardCost: 'Free (Govt. Public Health Scheme)',
        availableFacilities: ['PHC Kalyan Rural', 'Thane District Civil Hospital', 'Sub-District Rural Hospital Dombivli']
      },
      {
        testName: 'Complete Blood Count (CBC) with Platelet Count',
        category: 'Pathology',
        sampleType: 'Whole Blood (EDTA)',
        turnaroundTime: '2 hours',
        standardCost: 'Free (Govt. Public Health Scheme)',
        availableFacilities: ['PHC Kalyan Rural', 'Thane District Civil Hospital', 'Sub-District Rural Hospital Dombivli', 'Rural Sub-District Hospital Bhiwandi']
      },
      {
        testName: 'Glycated Hemoglobin (HbA1c)',
        category: 'Biochemistry',
        sampleType: 'Whole Blood',
        turnaroundTime: '4 hours',
        standardCost: 'Free (Govt. NCD Scheme)',
        availableFacilities: ['PHC Kalyan Rural', 'Thane District Civil Hospital', 'Sub-District Rural Hospital Dombivli']
      },
      {
        testName: 'Obstetric Sonography / Pelvic Ultrasound (USG)',
        category: 'Radiology',
        sampleType: 'Non-invasive Scan',
        turnaroundTime: 'Same Day',
        standardCost: 'Free (PMMVY / ANC Govt Scheme)',
        availableFacilities: ['Thane District Civil Hospital', 'Sub-District Rural Hospital Dombivli']
      },
      {
        testName: 'Digital Chest X-Ray (PA View)',
        category: 'Radiology',
        sampleType: 'Radiograph',
        turnaroundTime: '1 hour',
        standardCost: 'Free (Govt. TB Elimination / Public Scheme)',
        availableFacilities: ['Thane District Civil Hospital', 'Sub-District Rural Hospital Dombivli', 'Rural Sub-District Hospital Bhiwandi']
      },
      {
        testName: '12-Lead Electrocardiogram (ECG)',
        category: 'Cardiology',
        sampleType: 'Diagnostic Trace',
        turnaroundTime: '15 mins',
        standardCost: 'Free (STEMI Public Protocol)',
        availableFacilities: ['PHC Kalyan Rural', 'Thane District Civil Hospital', 'Sub-District Rural Hospital Dombivli']
      }
    ];

    res.json({ catalog });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch diagnostic catalog.' });
  }
}

export async function createDiagnosticRequest(req: AuthRequest, res: Response) {
  try {
    const {
      patientId,
      facilityId,
      testName,
      testCategory,
      priority,
      appointmentDate
    } = req.body;

    if (!patientId || !testName) {
      return res.status(400).json({ error: 'Patient ID and Test Name are required.' });
    }

    const patient = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { patientId }] }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const effectiveFacilityId = facilityId || patient.facilityId || (await prisma.facility.findFirst())?.id!;
    const doctorId = req.user?.id || (await prisma.user.findFirst({ where: { role: 'DOCTOR' } }))?.id;

    const request = await prisma.diagnosticRequest.create({
      data: {
        patientId: patient.id,
        doctorId,
        facilityId: effectiveFacilityId,
        testName,
        testCategory: testCategory || 'Pathology',
        priority: priority || 'ROUTINE',
        status: 'REQUESTED',
        appointmentDate: appointmentDate || new Date().toISOString().split('T')[0]
      },
      include: {
        patient: true,
        facility: true
      }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Doctor',
      userRole: req.user?.role || 'DOCTOR',
      action: 'ORDER_DIAGNOSTIC',
      entity: 'DiagnosticRequest',
      entityId: request.id,
      details: `Ordered test ${testName} for ${patient.name} at ${request.facility.name}.`
    });

    res.status(201).json({ diagnostic: request, message: 'Diagnostic request scheduled.' });
  } catch (err: any) {
    console.error('Create diagnostic error:', err);
    res.status(500).json({ error: 'Failed to create diagnostic request.' });
  }
}

export async function updateDiagnosticStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      status,
      reportFindings,
      normalRange,
      testValue,
      isAbnormal
    } = req.body;

    const existing = await prisma.diagnosticRequest.findUnique({
      where: { id },
      include: { patient: true, facility: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Diagnostic request not found.' });
    }

    const isVerified = status === 'VERIFIED';
    const updated = await prisma.diagnosticRequest.update({
      where: { id },
      data: {
        status: status || existing.status,
        reportFindings: reportFindings !== undefined ? reportFindings : existing.reportFindings,
        normalRange: normalRange !== undefined ? normalRange : existing.normalRange,
        testValue: testValue !== undefined ? testValue : existing.testValue,
        isAbnormal: isAbnormal !== undefined ? Boolean(isAbnormal) : existing.isAbnormal,
        verifiedBy: isVerified ? (req.user?.name || 'Senior Lab Technician') : existing.verifiedBy,
        verifiedAt: isVerified ? new Date() : existing.verifiedAt
      },
      include: { patient: true, facility: true }
    });

    if (isVerified) {
      await prisma.notification.create({
        data: {
          type: 'DIAGNOSTIC',
          title: `Diagnostic Report Ready: ${updated.testName}`,
          message: `Verified report is now available for ${updated.patient.name}. Findings: ${updated.reportFindings?.slice(0, 100)}...`,
          link: `/diagnostics?id=${updated.id}`
        }
      });
    }

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Lab Staff',
      userRole: req.user?.role || 'LAB',
      action: isVerified ? 'VERIFY_REPORT' : 'UPDATE_DIAGNOSTIC_STATUS',
      entity: 'DiagnosticRequest',
      entityId: updated.id,
      details: `Updated test ${updated.testName} status to ${status}. Findings: ${reportFindings || 'Pending'}`
    });

    res.json({ diagnostic: updated, message: `Diagnostic status updated to ${status}.` });
  } catch (err: any) {
    console.error('Update diagnostic error:', err);
    res.status(500).json({ error: 'Failed to update diagnostic request.' });
  }
}
