const db = require('../database/db');
const { logAccess } = require('../utils/auditLogger');

/**
 * Middleware ensuring a doctor or requester has valid consent to access a patient's records
 * Unless it's an emergency bypass, which is logged to immutable AccessLog.
 */
function requirePatientConsent({ allowEmergencyBypass = false } = {}) {
  return async (req, res, next) => {
    const startTime = Date.now();
    const patientId = req.params.patientId || req.query.patientId || (req.body && req.body.patientProfileId) || (req.user && req.user.patientProfile ? req.user.patientProfile.id : null);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'Patient identifier is required to verify clinical consent.',
      });
    }

    // 1. If the logged in user is the patient themselves, always grant access
    if (req.user.role === 'patient') {
      if (req.user.patientProfile && req.user.patientProfile.id === patientId) {
        return next();
      }
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only access your own clinical records.',
      });
    }

    // 2. If emergency bypass is explicitly flagged (Golden Hour Protocol)
    const isEmergencyBypass = allowEmergencyBypass || req.headers['x-emergency-bypass'] === 'true';

    if (isEmergencyBypass) {
      // Record immutable AccessLog audit entry for emergency bypass
      await logAccess({
        patientProfileId: patientId,
        accessorUserId: req.user.id,
        accessorRole: req.user.role,
        accessorName: req.user.doctorProfile ? req.user.doctorProfile.name : (req.user.hospitalAdminProfile ? req.user.hospitalAdminProfile.name : req.user.email),
        hospitalId: req.user.hospitalAdminProfile ? req.user.hospitalAdminProfile.hospitalId : 'hosp-apollo-greams',
        accessType: 'EMERGENCY_PASS_BYPASS',
        reason: req.headers['x-bypass-reason'] || 'ER Golden Hour Emergency Triage Protocol Access',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        latencyMs: Math.max(1, Date.now() - startTime),
      });

      req.isEmergencyBypass = true;
      return next();
    }

    // 3. Check for active ConsentGrant
    const doctorProfileId = req.user.doctorProfile ? req.user.doctorProfile.id : null;
    if (!doctorProfileId && req.user.role === 'doctor') {
      return res.status(403).json({
        success: false,
        error: 'Doctor profile not found for this account.',
      });
    }

    const consent = await db.consentGrant.findFirst({
      where: {
        patientProfileId: patientId,
        grantedToDoctorId: doctorProfileId,
        status: 'ACTIVE',
      },
    });

    if (!consent) {
      return res.status(403).json({
        success: false,
        error: 'Consent not granted: Patient has not authorized this clinician for full record access. Emergency bypass token required for emergency access.',
        consentRequired: true,
      });
    }

    // Consent exists - record standard audit log
    await logAccess({
      patientProfileId: patientId,
      accessorUserId: req.user.id,
      accessorRole: req.user.role,
      accessorName: req.user.doctorProfile ? req.user.doctorProfile.name : req.user.email,
      accessType: 'RECORDS_ACCESS',
      reason: 'Standard clinical consultation access with active consent',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      latencyMs: Math.max(1, Date.now() - startTime),
    });

    req.consentGrant = consent;
    next();
  };
}

module.exports = {
  requirePatientConsent,
};
