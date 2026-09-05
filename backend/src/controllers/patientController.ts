import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditMiddleware';

const prisma = new PrismaClient();

export async function getAllPatients(req: Request, res: Response) {
  try {
    const { search, village, isPregnant, facilityId } = req.query;

    const where: any = {};

    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q } },
        { patientId: { contains: q } },
        { phone: { contains: q } },
        { village: { contains: q } }
      ];
    }

    if (village) {
      where.village = { contains: String(village) };
    }

    if (isPregnant === 'true') {
      where.pregnancyStatus = true;
    }

    if (facilityId) {
      where.facilityId = String(facilityId);
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        facility: true,
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        },
        triageAssessments: {
          orderBy: { assessedAt: 'desc' },
          take: 1
        },
        followUps: {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          orderBy: { dueDate: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ patients });
  } catch (err: any) {
    console.error('Get patients error:', err);
    res.status(500).json({ error: 'Failed to fetch patients list.' });
  }
}

export async function getPatientById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id },
          { patientId: id }
        ]
      },
      include: {
        facility: true,
        registeredByAsha: { select: { id: true, name: true, phone: true } },
        vitals: { orderBy: { recordedAt: 'asc' } },
        triageAssessments: { orderBy: { assessedAt: 'desc' } },
        healthRecords: { orderBy: { date: 'desc' } },
        appointments: {
          include: { doctor: { select: { id: true, name: true } }, facility: true },
          orderBy: { date: 'desc' }
        },
        consultations: {
          include: { doctor: { select: { id: true, name: true } }, facility: true, prescriptions: true },
          orderBy: { createdAt: 'desc' }
        },
        prescriptions: {
          include: { doctor: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        referrals: {
          include: {
            originFacility: true,
            destinationFacility: true,
            referringDoctor: { select: { id: true, name: true } }
          },
          orderBy: { createdDate: 'desc' }
        },
        diagnosticRequests: {
          include: { facility: true, doctor: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        },
        followUps: {
          include: { assignedWorker: { select: { id: true, name: true } } },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    res.json({ patient });
  } catch (err: any) {
    console.error('Get patient detail error:', err);
    res.status(500).json({ error: 'Failed to fetch patient longitudinal record.' });
  }
}

export async function createPatient(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      age,
      gender,
      phone,
      village,
      address,
      emergencyContact,
      pregnancyStatus,
      gestationalWeeks,
      bloodGroup,
      chronicConditions,
      allergies,
      facilityId,
      initialVitals
    } = req.body;

    if (!name || !age || !gender || !phone || !village) {
      return res.status(400).json({ error: 'Name, age, gender, phone, and village are mandatory.' });
    }

    const { allowDuplicate } = req.body;
    if (!allowDuplicate && phone) {
      const existingPatient = await prisma.patient.findFirst({
        where: { phone: phone.trim() }
      });
      if (existingPatient) {
        return res.status(409).json({
          error: `Citizen already registered with mobile number ${phone}: ${existingPatient.name} (ID: ${existingPatient.patientId}). Pass allowDuplicate: true to confirm registration if intentional.`,
          duplicatePatient: {
            id: existingPatient.id,
            patientId: existingPatient.patientId,
            name: existingPatient.name,
            phone: existingPatient.phone,
            village: existingPatient.village
          }
        });
      }
    }

    const count = await prisma.patient.count();
    const patientId = `MH-THN-${String(10000 + count + 1).padStart(5, '0')}`;

    const newPatient = await prisma.patient.create({
      data: {
        patientId,
        name,
        age: Number(age),
        gender,
        phone,
        village,
        address: address || `${village}, Thane District`,
        emergencyContact: emergencyContact || `${phone} (Self)`,
        pregnancyStatus: !!pregnancyStatus,
        gestationalWeeks: gestationalWeeks ? Number(gestationalWeeks) : null,
        bloodGroup: bloodGroup || 'Unknown',
        chronicConditions: chronicConditions || null,
        allergies: allergies || null,
        registeredByAshaId: req.user?.id || null,
        facilityId: facilityId || req.user?.facilityId || null
      }
    });

    if (initialVitals) {
      await prisma.vital.create({
        data: {
          patientId: newPatient.id,
          systolicBp: initialVitals.systolicBp ? Number(initialVitals.systolicBp) : null,
          diastolicBp: initialVitals.diastolicBp ? Number(initialVitals.diastolicBp) : null,
          heartRate: initialVitals.heartRate ? Number(initialVitals.heartRate) : null,
          spo2: initialVitals.spo2 ? Number(initialVitals.spo2) : null,
          temperature: initialVitals.temperature ? Number(initialVitals.temperature) : null,
          bloodGlucose: initialVitals.bloodGlucose ? Number(initialVitals.bloodGlucose) : null,
          weight: initialVitals.weight ? Number(initialVitals.weight) : null,
          recordedBy: req.user?.name || 'ASHA Frontline Worker',
          recordedRole: req.user?.role || 'ASHA',
          notes: initialVitals.notes || 'Recorded at initial registration'
        }
      });
    }

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'ASHA Worker',
      userRole: req.user?.role || 'ASHA',
      action: 'REGISTER_PATIENT',
      entity: 'Patient',
      entityId: newPatient.id,
      details: `Registered new patient ${newPatient.name} (ID: ${newPatient.patientId}) in village ${newPatient.village}.`
    });

    res.status(201).json({ patient: newPatient, message: 'Patient registered successfully.' });
  } catch (err: any) {
    console.error('Create patient error:', err);
    res.status(500).json({ error: 'Failed to create patient record.' });
  }
}

export async function updatePatient(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      gender,
      phone,
      village,
      address,
      emergencyContact,
      pregnancyStatus,
      gestationalWeeks,
      bloodGroup,
      chronicConditions,
      allergies,
      facilityId
    } = req.body;

    const existing = await prisma.patient.findFirst({
      where: { OR: [{ id }, { patientId: id }] }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const updated = await prisma.patient.update({
      where: { id: existing.id },
      data: {
        name: name ? name.trim() : undefined,
        age: age !== undefined ? Number(age) : undefined,
        gender: gender || undefined,
        phone: phone ? phone.trim() : undefined,
        village: village || undefined,
        address: address || undefined,
        emergencyContact: emergencyContact || undefined,
        pregnancyStatus: pregnancyStatus !== undefined ? !!pregnancyStatus : undefined,
        gestationalWeeks: gestationalWeeks !== undefined ? (gestationalWeeks ? Number(gestationalWeeks) : null) : undefined,
        bloodGroup: bloodGroup || undefined,
        chronicConditions: chronicConditions !== undefined ? chronicConditions : undefined,
        allergies: allergies !== undefined ? allergies : undefined,
        facilityId: facilityId || undefined
      },
      include: { facility: true }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Frontline Staff',
      userRole: req.user?.role || 'ASHA',
      action: 'UPDATE_PATIENT',
      entity: 'Patient',
      entityId: updated.id,
      details: `Updated demographic information for patient ${updated.name} (${updated.patientId}).`
    });

    res.json({ patient: updated, message: 'Patient information updated successfully.' });
  } catch (err: any) {
    console.error('Update patient error:', err);
    res.status(500).json({ error: 'Failed to update patient record.' });
  }
}

export async function addVitals(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      systolicBp,
      diastolicBp,
      heartRate,
      spo2,
      temperature,
      bloodGlucose,
      weight,
      notes
    } = req.body;

    const patient = await prisma.patient.findFirst({
      where: { OR: [{ id }, { patientId: id }] }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const vital = await prisma.vital.create({
      data: {
        patientId: patient.id,
        systolicBp: systolicBp ? Number(systolicBp) : null,
        diastolicBp: diastolicBp ? Number(diastolicBp) : null,
        heartRate: heartRate ? Number(heartRate) : null,
        spo2: spo2 ? Number(spo2) : null,
        temperature: temperature ? Number(temperature) : null,
        bloodGlucose: bloodGlucose ? Number(bloodGlucose) : null,
        weight: weight ? Number(weight) : null,
        recordedBy: req.user?.name || 'Frontline Worker',
        recordedRole: req.user?.role || 'ASHA',
        notes: notes || 'Routine vitals observation'
      }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Frontline Worker',
      userRole: req.user?.role || 'ASHA',
      action: 'RECORD_VITALS',
      entity: 'Vital',
      entityId: vital.id,
      details: `Recorded vitals for ${patient.name}: BP ${systolicBp}/${diastolicBp}, SpO2 ${spo2}%, Glucose ${bloodGlucose} mg/dL.`
    });

    res.status(201).json({ vital, message: 'Vitals recorded successfully.' });
  } catch (err: any) {
    console.error('Add vitals error:', err);
    res.status(500).json({ error: 'Failed to record vitals.' });
  }
}

export async function syncOfflineBatch(req: AuthRequest, res: Response) {
  try {
    const { offlineQueue } = req.body;

    if (!Array.isArray(offlineQueue) || offlineQueue.length === 0) {
      return res.json({ syncedCount: 0, message: 'No offline items to sync.' });
    }

    let syncedCount = 0;
    const results = [];

    for (const item of offlineQueue) {
      if (item.type === 'REGISTER_PATIENT') {
        const p = item.payload;
        const count = await prisma.patient.count();
        const patientId = `MH-THN-${String(10000 + count + 1).padStart(5, '0')}`;
        
        const created = await prisma.patient.create({
          data: {
            patientId,
            name: p.name,
            age: Number(p.age),
            gender: p.gender,
            phone: p.phone,
            village: p.village,
            address: p.address || `${p.village}, Thane District`,
            emergencyContact: p.emergencyContact || p.phone,
            pregnancyStatus: !!p.pregnancyStatus,
            gestationalWeeks: p.gestationalWeeks ? Number(p.gestationalWeeks) : null,
            bloodGroup: p.bloodGroup || 'Unknown',
            chronicConditions: p.chronicConditions || null,
            registeredByAshaId: req.user?.id || null,
            facilityId: p.facilityId || req.user?.facilityId || null
          }
        });

        if (p.vitals) {
          await prisma.vital.create({
            data: {
              patientId: created.id,
              systolicBp: p.vitals.systolicBp ? Number(p.vitals.systolicBp) : null,
              diastolicBp: p.vitals.diastolicBp ? Number(p.vitals.diastolicBp) : null,
              heartRate: p.vitals.heartRate ? Number(p.vitals.heartRate) : null,
              spo2: p.vitals.spo2 ? Number(p.vitals.spo2) : null,
              temperature: p.vitals.temperature ? Number(p.vitals.temperature) : null,
              bloodGlucose: p.vitals.bloodGlucose ? Number(p.vitals.bloodGlucose) : null,
              weight: p.vitals.weight ? Number(p.vitals.weight) : null,
              recordedBy: req.user?.name || 'ASHA (Offline Sync)',
              recordedRole: 'ASHA',
              notes: 'Synchronized from offline PWA field cache.'
            }
          });
        }
        syncedCount++;
        results.push({ localId: item.id, status: 'SYNCED', newPatientId: created.patientId });
      } else if (item.type === 'RECORD_VITALS') {
        const v = item.payload;
        const pat = await prisma.patient.findFirst({
          where: { OR: [{ id: v.patientId }, { patientId: v.patientId }] }
        });
        if (pat) {
          await prisma.vital.create({
            data: {
              patientId: pat.id,
              systolicBp: v.systolicBp ? Number(v.systolicBp) : null,
              diastolicBp: v.diastolicBp ? Number(v.diastolicBp) : null,
              heartRate: v.heartRate ? Number(v.heartRate) : null,
              spo2: v.spo2 ? Number(v.spo2) : null,
              temperature: v.temperature ? Number(v.temperature) : null,
              bloodGlucose: v.bloodGlucose ? Number(v.bloodGlucose) : null,
              weight: v.weight ? Number(v.weight) : null,
              recordedBy: req.user?.name || 'ASHA (Offline Sync)',
              recordedRole: 'ASHA',
              notes: v.notes || 'Recorded in offline mode'
            }
          });
          syncedCount++;
          results.push({ localId: item.id, status: 'SYNCED' });
        }
      }
    }

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'ASHA Worker',
      userRole: req.user?.role || 'ASHA',
      action: 'OFFLINE_SYNC',
      entity: 'SyncQueue',
      details: `Successfully synchronized ${syncedCount} offline records from frontline device.`
    });

    res.json({
      syncedCount,
      results,
      message: `All ${syncedCount} offline records synchronized successfully with backend database.`
    });
  } catch (err: any) {
    console.error('Offline sync error:', err);
    res.status(500).json({ error: 'Failed to synchronize offline records.' });
  }
}
