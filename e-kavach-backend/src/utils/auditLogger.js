const db = require('../database/db');
const { maskPII } = require('./crypto');

/**
 * Creates an immutable audit log entry in the AccessLog table
 *
 * @param {Object} params
 * @param {string} params.patientProfileId - Target patient profile ID
 * @param {string} [params.accessorUserId] - User ID of the clinician / requester
 * @param {string} params.accessorRole - Role of the accessor (patient, doctor, hospital)
 * @param {string} params.accessorName - Name of the accessor
 * @param {string} [params.hospitalId] - Hospital context
 * @param {string} params.accessType - e.g. 'EMERGENCY_PASS_BYPASS', 'CONSULTATION_VIEW', 'ABHA_SCAN', 'RECORDS_ACCESS'
 * @param {string} [params.reason] - Clinical justification
 * @param {string} [params.ipAddress] - Request IP
 * @param {string} [params.userAgent] - Request Client
 * @param {number} [params.latencyMs] - Request latency in ms
 */
async function logAccess({
  patientProfileId,
  accessorUserId = null,
  accessorRole,
  accessorName,
  hospitalId = null,
  accessType,
  reason = null,
  ipAddress = '127.0.0.1',
  userAgent = 'E-KAWACH API Client',
  latencyMs = 18,
}) {
  try {
    const entry = await db.accessLog.create({
      data: {
        patientProfileId,
        accessorUserId,
        accessorRole,
        accessorName,
        hospitalId,
        accessType,
        reason,
        ipAddress,
        userAgent,
        latencyMs,
        timestamp: new Date(),
      },
    });

    // Output secure audit log without raw PII
    console.log(
      `[AUDIT] [${new Date().toISOString()}] AccessType=${accessType} Patient=${maskPII(patientProfileId)} Accessor=${accessorName} (${accessorRole}) Latency=${latencyMs}ms`
    );

    return entry;
  } catch (err) {
    console.error('Audit Log Error (non-blocking):', err.message);
    return null;
  }
}

module.exports = {
  logAccess,
};
