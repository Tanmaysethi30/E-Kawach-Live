process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

test('E-KAVACH Backend Comprehensive Test Suite', async (t) => {
  let patientToken = null;
  let doctorToken = null;
  let adminToken = null;

  // Initialize test auth session tokens
  const initPatientRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rajesh.sharma@ekawach.health', password: 'password123' });
  patientToken = initPatientRes.body.accessToken;

  const initDoctorRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dr.kavitha@apollo.health', password: 'password123' });
  doctorToken = initDoctorRes.body.accessToken;

  const initAdminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin.nambiar@apollo.health', password: 'password123' });
  adminToken = initAdminRes.body.accessToken;

  await t.test('1. Health Check Endpoint', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'e-kavach-backend');
    assert.ok(res.body.features.goldenHourTriage);
  });

  await t.test('2. Authentication & Role Shape Preservation', async (t2) => {
    // 2a. Patient Login
    await t2.test('Patient login preserves exact frontend roleProfiles shape', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rajesh.sharma@ekavach.health',
          password: 'password123',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.accessToken);
      patientToken = res.body.accessToken;

      // Verify exact shape expected by AuthContext
      const user = res.body.user;
      assert.equal(user.role, 'patient');
      assert.equal(user.name, 'Rajesh V. Sharma');
      assert.ok(user.id.includes('9824-8819'));
      assert.equal(user.tag, 'Verified Health ID');
      assert.equal(user.hospital, 'Apollo Greams Trauma Hub');
      assert.equal(user.dashboardRoute, '/patient/dashboard');
    });

    // 2b. Doctor Login
    await t2.test('Doctor login preserves exact frontend roleProfiles shape with title', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'dr.kavitha@apollo.health',
          password: 'password123',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      doctorToken = res.body.accessToken;

      const user = res.body.user;
      assert.equal(user.role, 'doctor');
      assert.equal(user.name, 'Dr. Kavitha Menon');
      assert.equal(user.title, 'Chief Interventional Cardio');
      assert.equal(user.id, 'NMC: MD-44912-TN');
      assert.equal(user.tag, 'ID-9942');
      assert.equal(user.hospital, 'Apollo Greams Trauma Hub');
      assert.equal(user.dashboardRoute, '/doctor/dashboard');
    });

    // 2c. Hospital Admin Login
    await t2.test('Admin login preserves exact frontend roleProfiles shape with title', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin.nambiar@apollo.health',
          password: 'password123',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      adminToken = res.body.accessToken;

      const user = res.body.user;
      assert.equal(user.role, 'hospital');
      assert.equal(user.name, 'Dr. R. K. Nambiar');
      assert.equal(user.title, 'Hospital Administrator');
      assert.equal(user.id, 'AP-HSP-842-TN');
      assert.equal(user.tag, 'VERIFIED ADMIN');
      assert.equal(user.hospital, 'Apollo Greams Trauma Hub');
      assert.equal(user.dashboardRoute, '/admin/dashboard');
    });

    // 2d. Token Refresh
    await t2.test('Token refresh issues new access token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ role: 'patient' });

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: loginRes.body.refreshToken });

      assert.equal(refreshRes.status, 200);
      assert.ok(refreshRes.body.accessToken);
    });
  });

  await t.test('3. Patient Endpoints & ABHA Verification', async (t3) => {
    await t3.test('GET /api/patient/me returns authenticated patient profile', async () => {
      const res = await request(app)
        .get('/api/patient/me')
        .set('Authorization', `Bearer ${patientToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.profile.name, 'Rajesh V. Sharma');
      assert.equal(res.body.profile.bloodGroup, 'O+ (Rh Pos)');
    });

    await t3.test('GET /api/patient/emergency-pass returns valid Golden Hour pass', async () => {
      const res = await request(app)
        .get('/api/patient/emergency-pass')
        .set('Authorization', `Bearer ${patientToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.emergencyPass.passToken, 'EK-TR-88190-V4');
      assert.equal(res.body.emergencyPass.bloodGroup, 'O+ (Rh Pos)');
      assert.ok(res.body.emergencyPass.criticalAllergies.includes('Penicillin'));
    });
  });

  await t.test('4. Emergency Scan, SLA & Immutable Audit Logging', async (t4) => {
    await t4.test('POST /api/doctor/scan resolves in sub-3s and creates immutable AccessLog', async () => {
      const initialLogCount = await db.accessLog.count();

      const startTime = Date.now();
      const res = await request(app)
        .post('/api/doctor/scan')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          passToken: 'EK-TR-88190-V4',
          qrData: 'EKAVACH:ABHA:9824-8819-3320-TN:TOKEN:EK-TR-88190-V4',
        });

      const responseTimeMs = Date.now() - startTime;

      assert.equal(res.status, 200);
      assert.ok(responseTimeMs < 3000, `SLA breached: Took ${responseTimeMs}ms, expected < 3000ms`);
      assert.equal(res.body.patient.name, 'Rajesh V. Sharma');
      assert.equal(res.body.patient.bloodGroup, 'O+ (Rh Pos)');

      // Verify immutable audit log was created
      const newLogCount = await db.accessLog.count();
      assert.equal(newLogCount, initialLogCount + 1);

      const latestLog = await db.accessLog.findFirst({
        orderBy: { timestamp: 'desc' },
      });
      assert.equal(latestLog.accessType, 'EMERGENCY_PASS_BYPASS');
      assert.equal(latestLog.accessorRole, 'doctor');
    });
  });

  await t.test('5. Admin Dashboard & Telemetry Operations', async (t5) => {
    await t5.test('GET /api/admin/dashboard/summary returns hospital metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.summary.hospital.name, 'Apollo Greams Trauma Hub');
      assert.ok(res.body.summary.bedMetrics.total >= 400);
      assert.ok(res.body.summary.operationsMetrics.totalStaff >= 5);
    });

    await t5.test('PATCH /api/admin/beds/:id updates bed telemetry', async () => {
      const res = await request(app)
        .patch('/api/admin/beds/bed-icu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ occupiedBeds: 47 });

      assert.equal(res.status, 200);
      assert.equal(res.body.bed.occupiedBeds, 47);
      assert.equal(res.body.bed.availableBeds, 3);
    });
  });

  await t.test('6. Role Authorization Guards', async (t6) => {
    await t6.test('Patient cannot access /api/admin/beds', async () => {
      const res = await request(app)
        .get('/api/admin/beds')
        .set('Authorization', `Bearer ${patientToken}`);

      assert.equal(res.status, 403);
    });

    await t6.test('Doctor cannot access /api/admin/dashboard/summary', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard/summary')
        .set('Authorization', `Bearer ${doctorToken}`);

      assert.equal(res.status, 403);
    });
  });

  await t.test('7. Appointment Lifecycle, Token Generation & Clinical Access Governance', async (t7) => {
    let createdAptId = null;
    let createdTokenNum = null;

    await t7.test('7a. GET /api/patient/appointments returns guaranteed EK-SLOT tokens', async () => {
      const res = await request(app)
        .get('/api/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.appointments));
      assert.ok(res.body.appointments.length >= 1);

      for (const apt of res.body.appointments) {
        assert.ok(apt.tokenNumber, `Appointment ${apt.id} missing tokenNumber`);
        assert.match(apt.tokenNumber, /^EK-SLOT-\d+$/, `Invalid token format: ${apt.tokenNumber}`);
        assert.ok(apt.patientName, `Appointment ${apt.id} missing patientName`);
        assert.ok(apt.timeSlot, `Appointment ${apt.id} missing timeSlot`);
      }
    });

    await t7.test('7b. POST /api/patient/appointments generates unique token and PENDING status', async () => {
      const res = await request(app)
        .post('/api/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorProfileId: 'doctor-kavitha',
          patientName: 'Ananya S. Sharma',
          patientPhone: '+91 98401 22819',
          scheduledAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          timeSlot: '02:30 PM',
          mode: 'IN_PERSON',
          department: 'Cardiology',
          symptoms: 'Routine lipid & cardiovascular evaluation',
          serviceType: 'DOCTOR_CONSULT',
          relation: 'Spouse',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.appointment);
      assert.ok(res.body.appointment.tokenNumber);
      assert.match(res.body.appointment.tokenNumber, /^EK-SLOT-\d+$/);
      assert.equal(res.body.appointment.status, 'PENDING');
      assert.equal(res.body.appointment.patientName, 'Ananya S. Sharma');

      createdAptId = res.body.appointment.id;
      createdTokenNum = res.body.appointment.tokenNumber;
    });

    await t7.test('7c. Access Control: Patient cannot modify appointment status (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/patient/appointments/${createdAptId}/status`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ status: 'CONFIRMED' });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.includes('Only authorized doctors'));
    });

    await t7.test('7d. Doctor can approve appointment to CONFIRMED', async () => {
      const res = await request(app)
        .patch(`/api/doctor/appointments/${createdAptId}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'CONFIRMED' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.appointment.status, 'CONFIRMED');
    });

    await t7.test('7e. Quick-ID dynamic booking generates valid token and PENDING status', async () => {
      const res = await request(app)
        .post('/api/patient/quick-id-and-book')
        .send({
          name: 'Vikram Sethi',
          phone: '+91 97890 55432',
          gender: 'Male',
          bloodGroup: 'B+ (Rh Pos)',
          doctorProfileId: 'doctor-kavitha',
          department: 'Cardiology',
          timeSlot: '04:00 PM',
          mode: 'IN_PERSON',
          symptoms: 'Post-CABG follow-up',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.appointment);
      assert.ok(res.body.appointment.tokenNumber);
      assert.match(res.body.appointment.tokenNumber, /^EK-SLOT-\d+$/);
      assert.equal(res.body.appointment.status, 'PENDING');
      assert.equal(res.body.appointment.patientName, 'Vikram Sethi');
    });

    await t7.test('7f. Doctor can decline appointment to DECLINED', async () => {
      const res = await request(app)
        .patch(`/api/doctor/appointments/${createdAptId}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'DECLINED' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.appointment.status, 'DECLINED');
    });

    await t7.test('7g. Patient can cancel slot to CANCELLED', async () => {
      const res = await request(app)
        .patch(`/api/patient/appointments/${createdAptId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.appointment.status, 'CANCELLED');
    });
  });

  await t.test('8. Doctor Inter-Hospital Referrals & Hospital Admin Triage Queue', async (t8) => {
    let createdReferralId = null;

    await t8.test('8a. Doctor can create an inter-hospital referral with bay allocation', async () => {
      const res = await request(app)
        .post('/api/doctor/referrals')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patientName: 'Rajesh V. Sharma',
          abhaNumber: '9824-8819-3320-TN',
          toDoctorName: 'Dr. Arjun Nair, MD, DM',
          destinationHospital: 'Fortis Grid Hub',
          priorityLevel: 'Priority 1 (Critical)',
          bayAllocated: 'Bay 02',
          clinicalSummary: 'Acute coronary syndrome requiring tertiary catheterization and emergency triage handover.',
          vitals: { bp: '138/88', spo2: '97%', heartRate: '92 bpm' }
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.referral);
      assert.ok(res.body.triageEntry);
      assert.equal(res.body.referral.patientName, 'Rajesh V. Sharma');
      assert.equal(res.body.referral.destinationHospital, 'Fortis Grid Hub');
      assert.equal(res.body.referral.bayAllocated, 'Bay 02');
      createdReferralId = res.body.referral.id;
    });

    await t8.test('8b. Doctor can retrieve sent referrals', async () => {
      const res = await request(app)
        .get('/api/doctor/referrals')
        .set('Authorization', `Bearer ${doctorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.referrals));
      const found = res.body.referrals.find((r) => r.id === createdReferralId);
      assert.ok(found);
    });

    await t8.test('8c. Admin can retrieve triage queue containing referral entries', async () => {
      const res = await request(app)
        .get('/api/admin/triage-queue')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.queue));
      assert.ok(res.body.queue.length > 0);
    });
  });
});
