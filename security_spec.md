# E-KAVACH ABDM Firestore Security Specification & Invariants

## 1. Data Invariants
1. **User Identity & Roles**: A UserProfile document at `/users/{userId}` can only be created if `request.auth.uid == userId`. The user's role cannot be self-elevated to `admin`. The user's ABHA ID, name, email, and phone must conform to strict schema boundaries.
2. **Admin Authority**: Trusted administrators are verified against `/admins/{adminId}` where `request.auth.token.email == "namanjain82670@gmail.com"` and `request.auth.token.email_verified == true`.
3. **Appointment Lifecycle**:
   - Patients can create appointment requests (`PENDING`) where `patientId == request.auth.uid`.
   - Patients CANNOT directly approve (`CONFIRMED`) or decline (`DECLINED`) an appointment slot.
   - Patients can cancel their own pending appointment (`CANCELLED`).
   - Doctors or Admins can transition status between `PENDING` -> `CONFIRMED` / `DECLINED`.
   - Once an appointment reaches a terminal state (`CANCELLED`, `COMPLETED`), non-admins cannot mutate the record.
   - All appointment IDs and fields must adhere to strict volumetric string lengths and regex guards.
4. **Bed Telemetry**: Hospital bed telemetry and ICU load under `/beds/{bedId}` are read-accessible to authenticated users, but writable only by doctors, hospital administrators, or the bootstrapped admin.
5. **Access & Audit Logs**: Emergency scan audit trail entries under `/accessLogs/{logId}` are strictly append-only (immutable once created) and can only be created by verified medical personnel or admins with valid accessor UID matching `request.auth.uid`. No updates or deletes are permitted.
6. **No Blanket Reads**: Every query must evaluate `resource.data` to prevent unauthorized query scraping.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1 (Identity Spoofing on User Registration)**:
   - Path: `/users/victim_user_123`
   - Actor: `request.auth.uid = "attacker_456"`
   - Attempt: Write a UserProfile with `uid: "victim_user_123"` to claim someone else's ABHA ID.
   - Expected: `PERMISSION_DENIED`

2. **Payload 2 (Self-Assigned Admin Role Elevation)**:
   - Path: `/users/attacker_456`
   - Actor: `request.auth.uid = "attacker_456"`
   - Attempt: Write `{ role: "admin", name: "Hacker", email: "hacker@test.com", id: "attacker_456", uid: "attacker_456" }` without admin authorization.
   - Expected: `PERMISSION_DENIED`

3. **Payload 3 (Shadow Field Injection on Appointment)**:
   - Path: `/appointments/apt_001`
   - Actor: `request.auth.uid = "patient_123"`
   - Attempt: Create appointment with ghost field `{ ..., isVipFastTrack: true, overrideBilling: true }`.
   - Expected: `PERMISSION_DENIED`

4. **Payload 4 (Patient Status Self-Confirmation)**:
   - Path: `/appointments/apt_001`
   - Actor: `request.auth.uid = "patient_123"`
   - Attempt: Patient attempts to update status from `PENDING` to `CONFIRMED` to bypass doctor triage.
   - Expected: `PERMISSION_DENIED`

5. **Payload 5 (Unauthenticated Anonymous Mutation)**:
   - Path: `/beds/bed_icu_01`
   - Actor: `request.auth = null`
   - Attempt: Overwrite ICU telemetry oxygen levels or occupancy status.
   - Expected: `PERMISSION_DENIED`

6. **Payload 6 (Resource Poisoning / Denial of Wallet Attack)**:
   - Path: `/appointments/apt_poison`
   - Actor: `request.auth.uid = "patient_123"`
   - Attempt: Inject a 2MB string payload into the `symptoms` or `notes` field.
   - Expected: `PERMISSION_DENIED`

7. **Payload 7 (Path ID Poisoning)**:
   - Path: `/appointments/` + `'a'.repeat(2000)`
   - Actor: `request.auth.uid = "patient_123"`
   - Attempt: Create a document with an excessively long path ID containing invalid characters.
   - Expected: `PERMISSION_DENIED`

8. **Payload 8 (Terminal State Tampering)**:
   - Path: `/appointments/apt_cancelled`
   - Actor: `request.auth.uid = "patient_123"`
   - Attempt: Update an already `CANCELLED` appointment back to `PENDING` or `CONFIRMED`.
   - Expected: `PERMISSION_DENIED`

9. **Payload 9 (Audit Log Mutation / Tampering)**:
   - Path: `/accessLogs/log_emergency_01`
   - Actor: `request.auth.uid = "doctor_789"`
   - Attempt: Delete or edit an existing emergency scan audit trail record to hide unauthorized access.
   - Expected: `PERMISSION_DENIED`

10. **Payload 10 (Email Spoofing without Verification)**:
    - Path: `/admins/admin_spoof`
    - Actor: `request.auth.token.email = "namanjain82670@gmail.com"`, `request.auth.token.email_verified = false`
    - Attempt: Write admin records or bypass admin checks with an unverified email token.
    - Expected: `PERMISSION_DENIED`

11. **Payload 11 (Cross-Patient Appointment Cancellation)**:
    - Path: `/appointments/apt_other_user`
    - Actor: `request.auth.uid = "attacker_456"` (where `resource.data.patientId = "victim_123"`)
    - Attempt: Cancel another patient's appointment slot.
    - Expected: `PERMISSION_DENIED`

12. **Payload 12 (Direct Bed State Tampering by Non-Staff)**:
    - Path: `/beds/bed_icu_02`
    - Actor: `request.auth.uid = "patient_123"`
    - Attempt: Mutate hospital bed availability or oxygen reserve stats.
    - Expected: `PERMISSION_DENIED`

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)
Validates that all 12 negative vectors fail with permission denials and that legitimate operational flows (patient booking, doctor approval, bed telemetry streaming, immutable access logging) pass under correct RBAC assertions.
