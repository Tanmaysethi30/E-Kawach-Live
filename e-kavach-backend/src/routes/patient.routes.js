const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const aiController = require('../controllers/ai.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Publicly browseable doctors list, hospitals list, road routing and quick ID creation + booking
router.get('/doctors', (req, res, next) => patientController.getDoctors(req, res, next));
router.get('/hospitals', (req, res, next) => patientController.getNearbyHospitals(req, res, next));
router.get('/emergency-hospitals', (req, res, next) => patientController.getNearbyHospitals(req, res, next));
router.get('/route', (req, res, next) => patientController.getRoute(req, res, next));
router.get('/ip-location', (req, res, next) => patientController.getIpLocation(req, res, next));
router.get('/search-location', (req, res, next) => patientController.searchLocation(req, res, next));
router.post('/quick-id-and-book', (req, res, next) => patientController.quickIdAndBook(req, res, next));

// Golden-Hour Emergency Triage Scan (Sub-3-second emergency SLA)
router.get('/golden-hour-scan', async (req, res, next) => {
  try {
    const token = req.query.token || req.query.passToken;
    const doctorService = require('../services/doctor.service');
    const result = await doctorService.scanPatient({ passToken: token }, null);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Verifiable ABHA Card Payload & QR Matrix
router.get('/abha/card', async (req, res, next) => {
  try {
    const patientService = require('../services/patient.service');
    const patientId = req.query.patientId || 'patient-rajesh';
    const abha = await patientService.getAbhaDetails(patientId);
    const pass = await patientService.getEmergencyPass(patientId);
    res.json({
      success: true,
      card: {
        ...abha,
        bloodGroup: pass?.bloodGroup || 'O+ (Rh Pos)',
        criticalAllergies: pass?.criticalAllergies || 'Penicillin (Severe anaphylaxis)',
        chronicConditions: pass?.chronicConditions || 'Type II Diabetes, Mild Hypertension',
        implants: pass?.implants || 'Coronary Stent (DES - 2021)',
        emergencyToken: pass?.passToken || 'EK-TR-88190-V4',
        qrPayload: abha?.qrPayload || `EKAWACH:ABHA:9824-8819-3320-TN:TOKEN:EK-TR-88190-V4`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// All subsequent patient endpoints require authentication
router.use(authenticateToken);

router.get('/me', requireRole('patient'), (req, res, next) => patientController.getMe(req, res, next));
router.put('/me', requireRole('patient'), (req, res, next) => patientController.updateMe(req, res, next));
router.patch('/me', requireRole('patient'), (req, res, next) => patientController.updateMe(req, res, next));
router.get('/abha', (req, res, next) => patientController.getAbha(req, res, next));
router.post('/abha/generate', requireRole('patient'), (req, res, next) => patientController.generateAbha(req, res, next));
router.get('/emergency-pass', (req, res, next) => patientController.getEmergencyPass(req, res, next));
router.get('/health-history', (req, res, next) => patientController.getHealthHistory(req, res, next));
router.post('/records', requireRole('patient', 'doctor'), upload.single('document'), (req, res, next) => patientController.uploadRecord(req, res, next));
router.delete('/records/:id', requireRole('patient', 'doctor'), (req, res, next) => patientController.deleteRecord(req, res, next));
router.patch('/records/:id/verify', (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'Access Denied: Patients cannot clinically verify medical records. Only authorized doctors have clinical verification rights.',
    code: 'DOCTOR_VERIFICATION_ONLY',
  });
});
router.get('/appointments', (req, res, next) => patientController.getAppointments(req, res, next));
router.post('/appointments', (req, res, next) => patientController.createAppointment(req, res, next));
router.patch('/appointments/:id/cancel', (req, res, next) => patientController.cancelAppointment(req, res, next));
router.delete('/appointments/:id', (req, res, next) => patientController.cancelAppointment(req, res, next));

// Access Control Enforcement: Patients CANNOT approve or decline appointments.
// Only doctors have clinical authorization to approve or decline slots.
router.patch('/appointments/:id/status', (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'Access Denied: Patients cannot approve or decline appointments. Only authorized doctors have clinical access.',
    code: 'DOCTOR_ACCESS_ONLY',
  });
});
router.patch('/appointments/:id/approve', (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'Access Denied: Patients cannot approve appointments. Only authorized doctors have clinical access.',
    code: 'DOCTOR_ACCESS_ONLY',
  });
});
router.patch('/appointments/:id/decline', (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'Access Denied: Patients cannot decline appointments. Only authorized doctors have clinical access.',
    code: 'DOCTOR_ACCESS_ONLY',
  });
});
router.get('/schemes', (req, res, next) => patientController.getSchemes(req, res, next));
router.post('/consent', requireRole('patient'), (req, res, next) => patientController.updateConsent(req, res, next));
router.get('/consent-requests', requireRole('patient'), (req, res, next) => patientController.getConsentRequests(req, res, next));
router.post('/consent/respond', requireRole('patient'), (req, res, next) => patientController.respondConsent(req, res, next));
router.get('/access-logs', (req, res, next) => patientController.getAccessLogs(req, res, next));
router.post('/access-logs', (req, res, next) => patientController.createAccessLog(req, res, next));

// Gemini AI Chatbot & Medical Document / Prescription Analysis Endpoints
router.post('/ai/chat', (req, res, next) => aiController.chat(req, res, next));
router.post('/ai/analyze-document', (req, res, next) => aiController.analyzeDocument(req, res, next));

module.exports = router;
