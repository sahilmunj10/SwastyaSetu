import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { login, register, getCurrentUser, updateProfile, getDemoAccounts } from '../controllers/authController';
import { getAllPatients, getPatientById, createPatient, updatePatient, addVitals, syncOfflineBatch } from '../controllers/patientController';
import { runTriage, getTriageHistory } from '../controllers/triageController';
import { getAppointments, getLiveQueue, bookAppointment, updateAppointmentStatus } from '../controllers/appointmentController';
import { completeConsultation } from '../controllers/teleconsultController';
import { getAllReferrals, createReferral, updateReferralStage } from '../controllers/referralController';
import { getDiagnosticRequests, getPublicTestCatalog, createDiagnosticRequest, updateDiagnosticStatus } from '../controllers/diagnosticController';
import { getMedicines, searchMedicineAcrossFacilities, updateMedicineStock } from '../controllers/medicineController';
import { getFollowUps, createFollowUp, completeFollowUp } from '../controllers/followupController';
import { getDashboardOverview } from '../controllers/dashboardController';
import { getAuditLogs, getNotifications, markNotificationRead } from '../controllers/auditController';
import { authenticate, requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware globally to extract tokens/demo roles
router.use(authenticate);

// 1. Authentication, Sign-Up & User Profile
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, getCurrentUser);
router.put('/auth/profile', requireAuth, updateProfile);
router.get('/auth/demo-accounts', getDemoAccounts);

// 2. Facilities
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ facilities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch facilities.' });
  }
});

// 3. Patients & Longitudinal Records
router.get('/patients', getAllPatients);
router.get('/patients/:id', getPatientById);
router.post('/patients', requireRole('ASHA', 'DOCTOR', 'ADMIN'), createPatient);
router.put('/patients/:id', requireRole('ASHA', 'DOCTOR', 'ADMIN'), updatePatient);
router.post('/patients/:id/vitals', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), addVitals);
router.post('/patients/sync-offline', requireRole('ASHA', 'DOCTOR', 'ADMIN'), syncOfflineBatch);

// 4. Digital Triage (Rule-based clinical decision support)
router.post('/triage/evaluate', runTriage);
router.get('/triage/history/:patientId', getTriageHistory);

// 5. Appointments & Dynamic Queue
router.get('/appointments', getAppointments);
router.get('/appointments/queue/live', getLiveQueue);
router.post('/appointments', requireAuth, bookAppointment);
router.patch('/appointments/:id/status', requireRole('DOCTOR', 'ADMIN', 'ASHA'), updateAppointmentStatus);

// 6. Teleconsultation
router.post('/teleconsult/complete', requireRole('DOCTOR'), completeConsultation);

// 7. Referral Lifecycle
router.get('/referrals', getAllReferrals);
router.post('/referrals', requireRole('DOCTOR', 'ADMIN'), createReferral);
router.patch('/referrals/:id/stage', requireRole('DOCTOR', 'ADMIN', 'ASHA'), updateReferralStage);

// 8. Diagnostics
router.get('/diagnostics', getDiagnosticRequests);
router.get('/diagnostics/catalog', getPublicTestCatalog);
router.post('/diagnostics', requireRole('DOCTOR', 'ADMIN'), createDiagnosticRequest);
router.patch('/diagnostics/:id/status', requireRole('LAB', 'ADMIN'), updateDiagnosticStatus);

// 9. Medicine Inventory & Search
router.get('/medicines', getMedicines);
router.get('/medicines/search', searchMedicineAcrossFacilities);
router.patch('/medicines/:id/stock', requireRole('PHARMACY', 'ADMIN'), updateMedicineStock);

// 10. Follow-ups & AI Risk
router.get('/followups', getFollowUps);
router.post('/followups', requireRole('DOCTOR', 'ADMIN', 'ASHA'), createFollowUp);
router.patch('/followups/:id/complete', requireRole('ASHA', 'DOCTOR', 'ADMIN'), completeFollowUp);

// 11. Government / District Dashboard
router.get('/dashboard/overview', getDashboardOverview);

// 12. Notifications & Audit Logs
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', requireAuth, markNotificationRead);
router.get('/audit-logs', requireRole('ADMIN', 'DISTRICT_OFFICER'), getAuditLogs);

export default router;
