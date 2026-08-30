import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditMiddleware';

const prisma = new PrismaClient();

export async function getAppointments(req: Request, res: Response) {
  try {
    const { facilityId, doctorId, patientId, status, date } = req.query;

    const where: any = {};
    if (facilityId) where.facilityId = String(facilityId);
    if (doctorId) where.doctorId = String(doctorId);
    if (patientId) {
      where.patient = { OR: [{ id: String(patientId) }, { patientId: String(patientId) }] };
    }
    if (status) where.status = String(status);
    if (date) where.date = String(date);

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
            triageAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
          }
        },
        doctor: { select: { id: true, name: true, role: true } },
        facility: true
      },
      orderBy: [
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    res.json({ appointments });
  } catch (err: any) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
}

export async function getLiveQueue(req: Request, res: Response) {
  try {
    const { facilityId } = req.query;
    const today = new Date().toISOString().split('T')[0];

    const where: any = { date: today };
    if (facilityId) where.facilityId = String(facilityId);

    const queueItems = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
            triageAssessments: { orderBy: { assessedAt: 'desc' }, take: 1 }
          }
        },
        doctor: { select: { id: true, name: true } },
        facility: true
      },
      orderBy: [
        { status: 'asc' },
        { queuePosition: 'asc' }
      ]
    });

    // Calculate dynamic wait times
    let currentWaitingIndex = 0;
    const enrichedQueue = queueItems.map(item => {
      let estimatedWaitMins = 0;
      if (item.status === 'IN_PROGRESS') {
        estimatedWaitMins = 5;
      } else if (item.status === 'WAITING') {
        currentWaitingIndex++;
        estimatedWaitMins = currentWaitingIndex * 15;
      }
      return {
        ...item,
        estimatedWaitMins,
        isNextInLine: item.status === 'WAITING' && currentWaitingIndex === 1
      };
    });

    res.json({
      today,
      totalWaiting: queueItems.filter(q => q.status === 'WAITING').length,
      inConsultation: queueItems.filter(q => q.status === 'IN_PROGRESS').length,
      completedToday: queueItems.filter(q => q.status === 'COMPLETED').length,
      queue: enrichedQueue
    });
  } catch (err: any) {
    console.error('Get live queue error:', err);
    res.status(500).json({ error: 'Failed to fetch live queue status.' });
  }
}

export async function bookAppointment(req: AuthRequest, res: Response) {
  try {
    const {
      patientId,
      doctorId,
      facilityId,
      date,
      timeSlot,
      mode,
      urgency,
      reason
    } = req.body;

    if (!patientId || !facilityId) {
      return res.status(400).json({ error: 'Patient ID and Facility ID are required.' });
    }

    const patient = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { patientId }] }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const apptDate = date || new Date().toISOString().split('T')[0];
    const existingCountToday = await prisma.appointment.count({
      where: { facilityId, date: apptDate }
    });

    const tokenPrefix = mode === 'TELECONSULTATION' ? 'TC' : 'A';
    const tokenNumber = `${tokenPrefix}-${String(existingCountToday + 1).padStart(3, '0')}`;
    const queuePosition = existingCountToday + 1;

    const newAppt = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctorId || null,
        facilityId,
        tokenNumber,
        date: apptDate,
        timeSlot: timeSlot || '10:00 AM',
        queuePosition,
        status: 'WAITING',
        mode: mode || 'PHYSICAL',
        urgency: urgency || 'ROUTINE',
        reason: reason || 'General Consultation'
      },
      include: {
        patient: true,
        facility: true,
        doctor: { select: { id: true, name: true } }
      }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Frontline Staff',
      userRole: req.user?.role || 'ASHA',
      action: 'BOOK_APPOINTMENT',
      entity: 'Appointment',
      entityId: newAppt.id,
      details: `Booked ${newAppt.mode} appointment for ${patient.name} (Token: ${tokenNumber}) at ${newAppt.facility.name}.`
    });

    res.status(201).json({ appointment: newAppt, message: 'Appointment booked successfully with generated queue token.' });
  } catch (err: any) {
    console.error('Book appointment error:', err);
    res.status(500).json({ error: 'Failed to book appointment.' });
  }
}

export async function updateAppointmentStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, doctorId } = req.body;

    const existing = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, facility: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || existing.status,
        doctorId: doctorId || req.user?.id || existing.doctorId
      },
      include: { patient: true, doctor: true, facility: true }
    });

    await logAuditEvent({
      userId: req.user?.id,
      userName: req.user?.name || 'Healthcare Staff',
      userRole: req.user?.role || 'STAFF',
      action: 'UPDATE_QUEUE_STATUS',
      entity: 'Appointment',
      entityId: updated.id,
      details: `Updated queue status for ${updated.patient.name} (${updated.tokenNumber}) to ${status}.`
    });

    res.json({ appointment: updated, message: `Queue status updated to ${status}` });
  } catch (err: any) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'Failed to update queue status.' });
  }
}
