"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeConsultation = completeConsultation;
const client_1 = require("@prisma/client");
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const prisma = new client_1.PrismaClient();
async function completeConsultation(req, res) {
    try {
        const { appointmentId, patientId, facilityId, chiefComplaints, clinicalNotes, diagnosis, assessment, followUpDate, prescriptions, diagnosticOrder, referralOrder } = req.body;
        if (!patientId || !diagnosis) {
            return res.status(400).json({ error: 'Patient ID and Diagnosis are required.' });
        }
        const patient = await prisma.patient.findFirst({
            where: { OR: [{ id: patientId }, { patientId }] }
        });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found.' });
        }
        const doctorId = req.user?.id || (await prisma.user.findFirst({ where: { role: 'DOCTOR' } }))?.id;
        const effectiveFacilityId = facilityId || req.user?.facilityId || patient.facilityId || (await prisma.facility.findFirst())?.id;
        // Create consultation
        const consultation = await prisma.consultation.create({
            data: {
                appointmentId: appointmentId || null,
                patientId: patient.id,
                doctorId,
                facilityId: effectiveFacilityId,
                chiefComplaints: chiefComplaints || 'Routine symptoms review',
                clinicalNotes: clinicalNotes || 'Patient evaluated via telemedicine portal.',
                diagnosis,
                assessment: assessment || 'Standard clinical course',
                followUpDate: followUpDate || null
            }
        });
        // Mark appointment completed if linked
        if (appointmentId) {
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: 'COMPLETED' }
            });
        }
        // Add Prescriptions
        const createdPrescriptions = [];
        if (Array.isArray(prescriptions) && prescriptions.length > 0) {
            for (const p of prescriptions) {
                const item = await prisma.prescription.create({
                    data: {
                        consultationId: consultation.id,
                        patientId: patient.id,
                        doctorId,
                        medicineName: p.medicineName,
                        dosage: p.dosage || '500mg',
                        frequency: p.frequency || '1-0-1',
                        durationDays: Number(p.durationDays) || 5,
                        instructions: p.instructions || 'After meals'
                    }
                });
                createdPrescriptions.push(item);
            }
        }
        // If doctor ordered diagnostics
        let createdDiagnostic = null;
        if (diagnosticOrder && diagnosticOrder.testName) {
            createdDiagnostic = await prisma.diagnosticRequest.create({
                data: {
                    patientId: patient.id,
                    doctorId,
                    facilityId: diagnosticOrder.facilityId || effectiveFacilityId,
                    testName: diagnosticOrder.testName,
                    testCategory: diagnosticOrder.testCategory || 'Pathology',
                    priority: diagnosticOrder.priority || 'HIGH',
                    status: 'REQUESTED',
                    appointmentDate: diagnosticOrder.appointmentDate || new Date().toISOString().split('T')[0]
                }
            });
        }
        // If doctor initiated referral
        let createdReferral = null;
        if (referralOrder && referralOrder.destinationFacilityId) {
            createdReferral = await prisma.referral.create({
                data: {
                    patientId: patient.id,
                    referringDoctorId: doctorId,
                    originFacilityId: effectiveFacilityId,
                    destinationFacilityId: referralOrder.destinationFacilityId,
                    reason: referralOrder.reason || diagnosis,
                    clinicalSummary: referralOrder.clinicalSummary || clinicalNotes,
                    priority: referralOrder.priority || 'HIGH',
                    status: 'CREATED',
                    trackingTimeline: JSON.stringify([
                        {
                            stage: 'CREATED',
                            timestamp: new Date(),
                            actor: req.user?.name || 'Doctor Tele-Consultation',
                            notes: 'Referral generated during tele-consultation session.'
                        }
                    ])
                }
            });
        }
        await (0, auditMiddleware_1.logAuditEvent)({
            userId: doctorId,
            userName: req.user?.name || 'Doctor',
            userRole: 'DOCTOR',
            action: 'COMPLETE_CONSULTATION',
            entity: 'Consultation',
            entityId: consultation.id,
            details: `Completed teleconsultation for ${patient.name}. Diagnosis: ${diagnosis}. Prescriptions: ${createdPrescriptions.length}.`
        });
        res.status(201).json({
            consultation,
            prescriptions: createdPrescriptions,
            diagnostic: createdDiagnostic,
            referral: createdReferral,
            message: 'Consultation recorded and prescriptions issued successfully.'
        });
    }
    catch (err) {
        console.error('Teleconsult complete error:', err);
        res.status(500).json({ error: 'Failed to record consultation and prescriptions.' });
    }
}
