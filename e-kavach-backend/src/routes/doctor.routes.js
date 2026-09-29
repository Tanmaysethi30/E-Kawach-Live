const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { emergencyLimiter } = require('../middleware/rateLimiter');

router.use(authenticateToken);
router.use(requireRole('doctor', 'hospital'));

router.get('/me', (req, res, next) => doctorController.getMe(req, res, next));
router.get('/triage-queue', (req, res, next) => doctorController.getTriageQueue(req, res, next));
router.post('/scan', emergencyLimiter, (req, res, next) => doctorController.scanPatient(req, res, next));
router.post('/golden-hour-scan', emergencyLimiter, (req, res, next) => doctorController.scanPatient(req, res, next));
router.post('/patients', (req, res, next) => doctorController.addPatient(req, res, next));
router.get('/patients', (req, res, next) => doctorController.getPatients(req, res, next));
router.get('/network', (req, res, next) => doctorController.getNetwork(req, res, next));
router.get('/credentials', (req, res, next) => doctorController.getCredentials(req, res, next));
router.get('/appointments', (req, res, next) => doctorController.getAppointments(req, res, next));
router.patch('/appointments/:id/status', (req, res, next) => doctorController.updateAppointmentStatus(req, res, next));
router.post('/request-access', (req, res, next) => doctorController.requestPatientAccess(req, res, next));
router.get('/access-status/:patientId', (req, res, next) => doctorController.checkAccessStatus(req, res, next));
router.post('/prescription', (req, res, next) => doctorController.issuePrescription(req, res, next));
router.post('/referrals', (req, res, next) => doctorController.createReferral(req, res, next));
router.get('/referrals', (req, res, next) => doctorController.getReferrals(req, res, next));
router.get('/patient-history/:patientId', (req, res, next) => doctorController.getPatientHistory(req, res, next));
router.post('/emergency-break-glass', emergencyLimiter, (req, res, next) => doctorController.emergencyBreakGlass(req, res, next));
router.patch('/records/:id/verify', (req, res, next) => doctorController.verifyRecord(req, res, next));

module.exports = router;
