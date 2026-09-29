const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

test('E-KAVACH Extended End-to-End System & Lifecycle Verification', async (t) => {
  let patientToken = '';
  let doctorToken = '';
  let adminToken = '';
  let createdRecordId = '';
  const timestamp = Date.now();

  const testPatientEmail = `e2e_patient_${timestamp}@test.health`;
  const testPatientPhone = `+91 99${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPatientAadhaar = `8841-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  await t.test('1. User Registration & Strict Database Duplicate Prevention', async (t1) => {
    // 1a. Register fresh patient
    await t1.test('Successfully register a new patient', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testPatientEmail,
          phone: testPatientPhone,
          password: 'Password@123',
          role: 'patient',
          name: 'E2E Test Patient',
          additionalDetails: {
            aadhaar: testPatientAadhaar,
            bloodGroup: 'B+ Rh Pos',
            pincode: '600028',
          },
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.accessToken);
      assert.equal(res.body.user.role, 'patient');
      patientToken = res.body.accessToken;
    });

    // 1b. Duplicate Email Conflict
    await t1.test('Prevent duplicate registration with same email (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testPatientEmail,
          phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: 'Password@123',
          role: 'patient',
          name: 'Imposter Patient',
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /already exists/i);
    });

    // 1c. Duplicate Phone Conflict
    await t1.test('Prevent duplicate registration with same phone (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `different_${timestamp}@test.health`,
          phone: testPatientPhone,
          password: 'Password@123',
          role: 'patient',
          name: 'Imposter Phone',
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /phone number is already registered/i);
    });
  });

  await t.test('2. Role Authentication & Token Verification', async (t2) => {
    // 2a. Doctor Login
    await t2.test('Doctor login returns valid doctorToken and NMC license', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'dr.kavitha@apollo.health',
          password: 'password123',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.role, 'doctor');
      assert.ok(res.body.user.id.includes('MD-44912-TN') || res.body.user.id.includes('NMC'));
      doctorToken = res.body.accessToken;
    });

    // 2b. Admin Login
    await t2.test('Admin login returns valid adminToken and hospital identifier', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin.nambiar@apollo.health',
          password: 'password123',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.role, 'hospital');
      assert.equal(res.body.user.id, 'AP-HSP-842-TN');
      adminToken = res.body.accessToken;
    });
  });

  await t.test('3. Cross-Role Access Control (RBAC)', async (t3) => {
    await t3.test('Patient cannot access /api/doctor/scan', async () => {
      const res = await request(app)
        .post('/api/doctor/scan')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ passToken: 'EK-TR-88190-V4' });

      assert.equal(res.status, 403);
    });

    await t3.test('Patient cannot access /api/admin/dashboard/summary', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/summary')
        .set('Authorization', `Bearer ${patientToken}`);

      assert.equal(res.status, 403);
    });

    await t3.test('Doctor cannot access /api/admin/beds', async () => {
      const res = await request(app)
        .get('/api/admin/beds')
        .set('Authorization', `Bearer ${doctorToken}`);

      assert.equal(res.status, 403);
    });
  });

  await t.test('4. Medical Document Upload & Clinical Verification Lifecycle', async (t4) => {
    // 4a. Patient uploads a medical report
    await t4.test('Patient can upload a medical record', async () => {
      const res = await request(app)
        .post('/api/patient/records')
        .set('Authorization', `Bearer ${patientToken}`)
        .field('title', 'Annual Cardiac ECG Report')
        .field('recordType', 'ECG_REPORT')
        .field('notes', 'Resting 12-lead ECG, normal sinus rhythm');

      assert.equal(res.status, 201);
      assert.ok(res.body.record);
      assert.equal(res.body.record.title, 'Annual Cardiac ECG Report');
      createdRecordId = res.body.record.id;
    });

    // 4b. Patient cannot verify documents (Forbidden)
    await t4.test('Patient cannot verify their own document (403)', async () => {
      const res = await request(app)
        .patch(`/api/patient/records/${createdRecordId}/verify`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ status: 'VERIFIED' });

      assert.equal(res.status, 403);
    });

    // 4c. Doctor verifies patient document
    await t4.test('Doctor can verify patient document via /api/doctor/records/:id/verify', async () => {
      const res = await request(app)
        .patch(`/api/doctor/records/${createdRecordId}/verify`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          status: 'VERIFIED',
          notes: 'Clinically verified against hospital digital archive.',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.record.verificationStatus, 'VERIFIED');
      assert.ok(res.body.record.verifiedBy);
    });
  });

  await t.test('5. Consent Request & Patient Data Sharing Governance', async (t5) => {
    // 5a. Doctor requests access to patient
    await t5.test('Doctor requests patient clinical record access', async () => {
      const res = await request(app)
        .post('/api/doctor/request-access')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ patientId: 'patient-rajesh' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    // 5b. Patient checks consent requests
    await t5.test('Patient fetches pending consent requests', async () => {
      // Use seeded patient token
      const pLogin = await request(app)
        .post('/api/auth/login')
        .send({ role: 'patient' });
      const rajeshToken = pLogin.body.accessToken;

      const res = await request(app)
        .get('/api/patient/consent-requests')
        .set('Authorization', `Bearer ${rajeshToken}`);

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.requests));
    });
  });

  await t.test('6. Hospital Admin Doctor Management, Linking & Deletion Lifecycle', async (t6) => {
    let createdDocId = null;
    const testNmc = `TN-MC-TEST-${Math.floor(10000 + Math.random() * 90000)}`;

    // 6a. Admin creates a new doctor profile
    await t6.test('Hospital Admin can register a new physician', async () => {
      const res = await request(app)
        .post('/api/admin/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Ananya Sharma',
          nmc: testNmc,
          specialty: 'Neurology',
          ward: 'Neuro ICU',
          status: 'Available',
          degrees: 'MBBS, DM Neuro',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.doctor.linked, false);
      assert.equal(res.body.doctor.specialization, 'Neurology');
      createdDocId = res.body.doctor.id;
    });

    // 6b. Adding doctor with identical NMC number updates and links to hospital
    await t6.test('Adding physician with identical NMC links to existing profile', async () => {
      const res = await request(app)
        .post('/api/admin/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Ananya Sharma',
          nmc: testNmc,
          specialty: 'Pediatric Neurology',
          ward: 'Children Neuro Wing',
          status: 'In Consult',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.doctor.linked, true);
      assert.equal(res.body.doctor.id, createdDocId);
      assert.equal(res.body.doctor.specialization, 'Pediatric Neurology');
    });

    // 6c. Non-hospital roles cannot add or delete doctors (RBAC)
    await t6.test('Patient cannot delete a doctor (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/admin/doctors/${createdDocId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      assert.equal(res.status, 403);
    });

    // 6d. Hospital Admin can delete doctor
    await t6.test('Hospital Admin can delete doctor', async () => {
      const res = await request(app)
        .delete(`/api/admin/doctors/${createdDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  await t.test('7. AI IVR Voice Emergency Dispatch Webhook & Golden-Hour Triage Integration', async (t7) => {
    await t7.test('Receive and process IVR voice emergency call payload', async () => {
      const res = await request(app)
        .post('/api/ai/ivr-webhook')
        .send({
          callerPhone: '+91 98401 22819',
          location: 'Palasia Square, Indore',
          hospitalName: 'Apollo Greams Trauma Hub',
          detectedLanguage: 'hi',
          transcript: 'मरीज को सीने में तेज दर्द है, तुरंत एम्बुलेंस भेजें',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'DISPATCHED');
      assert.ok(res.body.alertData);
      assert.ok(res.body.alertData.patient);
      assert.equal(res.body.alertData.detectedLanguage, 'hi');
      assert.ok(res.body.alertData.triageLink.includes('/doctor/patient-history'));
    });

    await t7.test('Support fallback alias /api/ai/emergency-dispatch with VAPI format', async () => {
      const res = await request(app)
        .post('/api/ai/emergency-dispatch')
        .send({
          message: {
            toolCalls: [
              {
                function: {
                  name: 'trigger_emergency_dispatch',
                  arguments: JSON.stringify({
                    phone_number: '+91 98401 22819',
                    location: 'Indore Central',
                    hospital_name: 'nearest',
                  }),
                },
              },
            ],
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'DISPATCHED');
      assert.ok(res.body.alertData.targetHospital);
    });

    await t7.test('VAPI direct parameter format (patient_phone_number, approximate_location, hospital_name)', async () => {
      const res = await request(app)
        .post('/api/ai/ivr-webhook')
        .send({
          patient_phone_number: '9840122819',
          approximate_location: 'Rajwada Palace, Indore',
          hospital_name: 'Choithram Hospital and Research Centre',
          detected_language: 'hi',
          transcript: 'मरीज बेहोश है और सांस लेने में तकलीफ है',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'DISPATCHED');
      assert.equal(res.body.alertData.patient.name, 'Rajesh V. Sharma');
      assert.ok(res.body.alertData.bayNumber);
      assert.ok(res.body.alertData.triageEntry);
    });

    await t7.test('VAPI toolCall arguments object format without nested string serialization', async () => {
      const res = await request(app)
        .post('/api/ai/ivr-webhook')
        .send({
          message: {
            toolCalls: [
              {
                id: 'call_123',
                type: 'function',
                function: {
                  name: 'trigger_emergency_dispatch',
                  arguments: {
                    patient_phone_number: '+91 98401 22819',
                    approximate_location: 'Chappan Dukan, Indore',
                    hospital_name: 'nearest',
                    detected_language: 'en',
                  },
                },
              },
            ],
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'DISPATCHED');
      assert.ok(res.body.alertData.location);
    });

    await t7.test('Resilient fallback when unregistered caller calls emergency IVR', async () => {
      const res = await request(app)
        .post('/api/ai/ivr-webhook')
        .send({
          patient_phone_number: '+91 99999 88888',
          approximate_location: 'Indore Bypass',
          hospital_name: 'nearest',
          detected_language: 'ta',
          transcript: 'அவசர சிகிச்சை தேவைப்படுகிறது',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.status, 'DISPATCHED');
      assert.ok(res.body.alertData.patient);
      assert.equal(res.body.alertData.detectedLanguage, 'ta');
    });
  });
});
