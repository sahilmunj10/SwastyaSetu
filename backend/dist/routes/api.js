"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authController_1 = require("../controllers/authController");
const patientController_1 = require("../controllers/patientController");
const triageController_1 = require("../controllers/triageController");
const appointmentController_1 = require("../controllers/appointmentController");
const teleconsultController_1 = require("../controllers/teleconsultController");
const referralController_1 = require("../controllers/referralController");
const diagnosticController_1 = require("../controllers/diagnosticController");
const medicineController_1 = require("../controllers/medicineController");
const followupController_1 = require("../controllers/followupController");
const dashboardController_1 = require("../controllers/dashboardController");
const auditController_1 = require("../controllers/auditController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Apply auth middleware globally to extract tokens/demo roles
router.use(authMiddleware_1.authenticate);
// 1. Authentication, Sign-Up & User Profile
router.post('/auth/register', authController_1.register);
router.post('/auth/login', authController_1.login);
router.get('/auth/me', authMiddleware_1.requireAuth, authController_1.getCurrentUser);
router.put('/auth/profile', authMiddleware_1.requireAuth, authController_1.updateProfile);
router.get('/auth/demo-accounts', authController_1.getDemoAccounts);
// 2. Facilities
router.get('/facilities', async (req, res) => {
    try {
        const facilities = await prisma.facility.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ facilities });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch facilities.' });
    }
});
// 3. Patients & Longitudinal Records
router.get('/patients', patientController_1.getAllPatients);
router.get('/patients/:id', patientController_1.getPatientById);
router.post('/patients', (0, authMiddleware_1.requireRole)('ASHA', 'DOCTOR', 'ADMIN'), patientController_1.createPatient);
router.put('/patients/:id', (0, authMiddleware_1.requireRole)('ASHA', 'DOCTOR', 'ADMIN'), patientController_1.updatePatient);
router.post('/patients/:id/vitals', (0, authMiddleware_1.requireRole)('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), patientController_1.addVitals);
router.post('/patients/sync-offline', (0, authMiddleware_1.requireRole)('ASHA', 'DOCTOR', 'ADMIN'), patientController_1.syncOfflineBatch);
// 4. Digital Triage (Rule-based clinical decision support)
router.post('/triage/evaluate', triageController_1.runTriage);
router.get('/triage/history/:patientId', triageController_1.getTriageHistory);
// 5. Appointments & Dynamic Queue
router.get('/appointments', appointmentController_1.getAppointments);
router.get('/appointments/queue/live', appointmentController_1.getLiveQueue);
router.post('/appointments', authMiddleware_1.requireAuth, appointmentController_1.bookAppointment);
router.patch('/appointments/:id/status', (0, authMiddleware_1.requireRole)('DOCTOR', 'ADMIN', 'ASHA'), appointmentController_1.updateAppointmentStatus);
// 6. Teleconsultation
router.post('/teleconsult/complete', (0, authMiddleware_1.requireRole)('DOCTOR'), teleconsultController_1.completeConsultation);
// 7. Referral Lifecycle
router.get('/referrals', referralController_1.getAllReferrals);
router.post('/referrals', (0, authMiddleware_1.requireRole)('DOCTOR', 'ADMIN'), referralController_1.createReferral);
router.patch('/referrals/:id/stage', (0, authMiddleware_1.requireRole)('DOCTOR', 'ADMIN', 'ASHA'), referralController_1.updateReferralStage);
// 8. Diagnostics
router.get('/diagnostics', diagnosticController_1.getDiagnosticRequests);
router.get('/diagnostics/catalog', diagnosticController_1.getPublicTestCatalog);
router.post('/diagnostics', (0, authMiddleware_1.requireRole)('DOCTOR', 'ADMIN'), diagnosticController_1.createDiagnosticRequest);
router.patch('/diagnostics/:id/status', (0, authMiddleware_1.requireRole)('LAB', 'ADMIN'), diagnosticController_1.updateDiagnosticStatus);
// 9. Medicine Inventory & Search
router.get('/medicines', medicineController_1.getMedicines);
router.get('/medicines/search', medicineController_1.searchMedicineAcrossFacilities);
router.patch('/medicines/:id/stock', (0, authMiddleware_1.requireRole)('PHARMACY', 'ADMIN'), medicineController_1.updateMedicineStock);
// 10. Follow-ups & AI Risk
router.get('/followups', followupController_1.getFollowUps);
router.post('/followups', (0, authMiddleware_1.requireRole)('DOCTOR', 'ADMIN', 'ASHA'), followupController_1.createFollowUp);
router.patch('/followups/:id/complete', (0, authMiddleware_1.requireRole)('ASHA', 'DOCTOR', 'ADMIN'), followupController_1.completeFollowUp);
// 11. Government / District Dashboard
router.get('/dashboard/overview', dashboardController_1.getDashboardOverview);
// 12. Notifications & Audit Logs
router.get('/notifications', auditController_1.getNotifications);
router.patch('/notifications/:id/read', authMiddleware_1.requireAuth, auditController_1.markNotificationRead);
router.get('/audit-logs', (0, authMiddleware_1.requireRole)('ADMIN', 'DISTRICT_OFFICER'), auditController_1.getAuditLogs);
exports.default = router;
