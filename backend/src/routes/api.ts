import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { login, register, getCurrentUser, updateProfile, getDemoAccounts } from '../controllers/authController';
import { getAllPatients, getPatientById, createPatient, addVitals, syncOfflineBatch } from '../controllers/patientController';
import { runTriage, getTriageHistory } from '../controllers/triageController';
import { getAppointments, getLiveQueue, bookAppointment, updateAppointmentStatus } from '../controllers/appointmentController';
import { completeConsultation } from '../controllers/teleconsultController';
import { getAllReferrals, createReferral, updateReferralStage } from '../controllers/referralController';
import { getDiagnosticRequests, getPublicTestCatalog, createDiagnosticRequest, updateDiagnosticStatus } from '../controllers/diagnosticController';
import { getMedicines, searchMedicineAcrossFacilities, updateMedicineStock } from '../controllers/medicineController';
import { getFollowUps, createFollowUp, completeFollowUp } from '../controllers/followupController';
import { getDashboardOverview } from '../controllers/dashboardController';
import { getAuditLogs, getNotifications, markNotificationRead } from '../controllers/auditController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware globally to extract tokens/demo roles
router.use(authenticate);

// 1. Authentication, Sign-Up & User Profile
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', getCurrentUser);
router.put('/auth/profile', updateProfile);
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
router.post('/patients', createPatient);
router.post('/patients/:id/vitals', addVitals);
router.post('/patients/sync-offline', syncOfflineBatch);

// 4. Digital Triage
router.post('/triage/evaluate', runTriage);
router.get('/triage/history/:patientId', getTriageHistory);

// 5. Appointments & Dynamic Queue
router.get('/appointments', getAppointments);
router.get('/appointments/queue/live', getLiveQueue);
router.post('/appointments', bookAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// 6. Teleconsultation
router.post('/teleconsult/complete', completeConsultation);

// 7. Referral Lifecycle
router.get('/referrals', getAllReferrals);
router.post('/referrals', createReferral);
router.patch('/referrals/:id/stage', updateReferralStage);

// 8. Diagnostics
router.get('/diagnostics', getDiagnosticRequests);
router.get('/diagnostics/catalog', getPublicTestCatalog);
router.post('/diagnostics', createDiagnosticRequest);
router.patch('/diagnostics/:id/status', updateDiagnosticStatus);

// 9. Medicine Inventory & Search
router.get('/medicines', getMedicines);
router.get('/medicines/search', searchMedicineAcrossFacilities);
router.patch('/medicines/:id/stock', updateMedicineStock);

// 10. Follow-ups & AI Risk
router.get('/followups', getFollowUps);
router.post('/followups', createFollowUp);
router.patch('/followups/:id/complete', completeFollowUp);

// 11. Government / District Dashboard
router.get('/dashboard/overview', getDashboardOverview);

// 12. Notifications & Audit Logs
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.get('/audit-logs', getAuditLogs);

export default router;
