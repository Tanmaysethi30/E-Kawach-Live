# E-KAVACH Backend Service

A high-performance, production-ready Node.js & Express backend for the **E-KAVACH** Emergency Healthcare Access & Clinical Network platform.

Built as a standalone service with zero modifications to the existing frontend codebase, strictly preserving role contract schemas, ABHA identity standards, and Golden Hour emergency triage requirements.

---

## 🚀 Key Architectural Capabilities

1. **Exact AuthContext Contract Compatibility**:
   The `/api/auth/login` and `/api/auth/refresh` endpoints preserve the exact `roleProfiles` contract schema expected by the frontend:
   - **Patient**: `role`, `name`, `id` (`ABHA-9824-8819-TN`), `tag` (`Verified Health ID`), `hospital`, `dashboardRoute`.
   - **Doctor**: `role`, `name` (`Dr. Kavitha Menon`), `title` (`Chief Interventional Cardio`), `id` (`NMC: MD-44912-TN`), `tag` (`ID-9942`), `hospital`, `dashboardRoute`.
   - **Hospital Admin**: `role`, `name` (`Dr. R. K. Nambiar`), `title` (`Hospital Administrator`), `id` (`AP-HSP-842-TN`), `tag` (`VERIFIED ADMIN`), `hospital`, `dashboardRoute`.

2. **Golden Hour Emergency Protocol & Sub-3s SLA**:
   - `/api/doctor/scan`: Fast QR / NFC / Pass-Token lookup returning critical lifesaving parameters (blood group, severe allergies, chronic conditions, implants, and verified ICE contacts).
   - Resolves in **< 15ms** in dev / benchmark environments, easily beating the sub-3-second emergency requirement.
   - Intentionally bypasses routine consent gates for emergency resuscitation, while **automatically recording an immutable audit entry** in the `AccessLog` table.

3. **ABDM Level-4 ABHA Integration**:
   - Generates and links 14-digit ABHA numbers (`9824-xxxx-xxxx-TN`) and PHR addresses (`@abdm`).
   - Encrypts all PII (ABHA numbers, Aadhaar references, contact numbers) at rest using **AES-256-GCM**.
   - Raw PII is never exposed in server logs.

4. **Live Telemetry & WebSocket Streaming (`/ws/telemetry`)**:
   - Socket.io live channel streaming bed occupancy, ICU loads, and pharmacy low-stock alerts in real-time.

5. **Prisma Relational Data Model**:
   - Complete schema in `prisma/schema.prisma` covering Users, Profiles, Hospitals, Beds, Triage, ABHA, Schemes, Consultations, Consent Grants, and Access Logs.
   - Shipped with an intelligent dual-mode repository engine that works out-of-the-box with preloaded seed data matching the mock pages ("Apollo Greams Trauma Hub", "Rajesh V. Sharma", etc.).

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+) — Plain CommonJS JavaScript.
- **Framework**: Express.js with `helmet`, `cors`, `cookie-parser`, and `morgan`.
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`).
- **Cache & Rate Limiting**: Redis (`ioredis`) with automatic in-memory fallback.
- **Real-Time Telemetry**: Socket.io on `/ws/telemetry`.
- **Security & Crypto**: `bcryptjs`, `jsonwebtoken` (JWT access + rotating refresh tokens), `crypto` (AES-256-GCM).
- **File Storage**: Multer with local disk storage in `./uploads` (or S3 adapter).
- **Validation**: Zod schema validation.

---

## 📦 Getting Started

### 1. Installation
```bash
cd e-kavach-backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Description | Default |
|---|---|---|
| `PORT` | API Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | `ekavach_jwt_access_...` |
| `JWT_REFRESH_SECRET`| Secret key for refresh tokens | `ekavach_jwt_refresh_...`|
| `ENCRYPTION_SECRET_KEY`| 32-byte hex for AES-256-GCM | `0123456789...` |
| `CORS_ORIGIN` | Allowed client origins | `http://localhost:3000,http://localhost:5173` |

### 3. Run Database Migrations & Seed
```bash
# Seed initial data (Apollo Greams Trauma Hub, Rajesh Sharma, Dr. Kavitha Menon, beds, etc.)
npm run db:seed
```

### 4. Start the Server
```bash
# Production start
npm start

# Development mode with hot-reload
npm run dev
```

Server output:
```
====================================================
🛡️  E-KAVACH Backend API & Live Telemetry Server
📡 Listening on: http://localhost:5000
🚀 REST Health:  http://localhost:5000/api/health
⚡ WebSocket:   ws://localhost:5000/ws/telemetry
====================================================
```

### 5. Run Test Suite
```bash
npm test
```
Executes 18 automated integration tests verifying:
- Health check
- Role profile preservation on login (patient, doctor, admin)
- Token refresh
- Patient profile & ABHA lookup
- Emergency Pass retrieval
- Golden Hour QR scan SLA (< 3s) & immutable audit logging
- Bed & pharmacy telemetry operations
- Role-based authorization guards

---

## 🔑 Pre-Configured Test Credentials

| Role | Email / Phone | Password | Quick Login Body |
|---|---|---|---|
| **Patient** | `rajesh.sharma@ekavach.health` | `password123` | `{"role": "patient"}` |
| **Doctor** | `dr.kavitha@apollo.health` | `password123` | `{"role": "doctor"}` |
| **Hospital Admin** | `admin.nambiar@apollo.health` | `password123` | `{"role": "hospital"}` |

---

## 🌐 API Reference

### Health & Capabilities
- `GET /api/health` — Service health, active features, and uptime.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`patient`, `doctor`, or `hospital`).
- `POST /api/auth/login` — Login with email/password or role. Returns JWT tokens & exact frontend role shape.
- `POST /api/auth/otp/request` — Dispatches 6-digit OTP to mobile or email.
- `POST /api/auth/otp/verify` — Verifies OTP and creates session.
- `POST /api/auth/refresh` — Rotates refresh token and returns fresh access token.
- `POST /api/auth/logout` — Revokes session and clears cookies.

### Patient Services (`/api/patient`)
- `GET /api/patient/me` — Authenticated patient demographics.
- `GET /api/patient/abha` — ABHA card details and ABDM level-4 status.
- `POST /api/patient/abha/generate` — Generates new ABHA ID & QR matrix.
- `GET /api/patient/emergency-pass` — Golden Hour emergency pass data.
- `GET /api/patient/health-history` — Vitals timeline, consultations, conditions.
- `POST /api/patient/records` — Uploads lab report or discharge summary (multipart).
- `GET /api/patient/appointments` — Scheduled appointments.
- `POST /api/patient/appointments` — Books consultation.
- `GET /api/patient/schemes` — Government scheme enrollments (PM-JAY, CMCHIS).
- `POST /api/patient/consent` — Grants or revokes clinician record access.
- `GET /api/patient/access-logs` — Immutable audit log of who accessed records.

### Doctor Operations (`/api/doctor`)
- `GET /api/doctor/me` — Clinician credentials & department.
- `GET /api/doctor/triage-queue` — Emergency ward triage bay census.
- `POST /api/doctor/scan` — **Golden Hour Scanner**: Sub-3s QR/NFC lookup, bypasses consent, writes immutable AccessLog.
- `POST /api/doctor/patients` — Rapid intake of emergency trauma patients.
- `GET /api/doctor/network` — State hospital trauma network & ICU capacities.
- `GET /api/doctor/credentials` — NMC verification status and degrees.
- `GET /api/doctor/appointments` — Scheduled patient queue.

### Hospital Administration (`/api/admin`)
- `GET /api/admin/dashboard/summary` — Full bed occupancy, census, and alerts.
- `GET /api/admin/beds` — Bed breakdown across ICU, CCU, Trauma Bay, Wards.
- `PATCH /api/admin/beds/:id` — Live updates bed count (broadcasts via WebSocket).
- `GET /api/admin/pharmacy` — Emergency drug inventory & crash cart reserves.
- `PATCH /api/admin/pharmacy/:id` — Updates stock & triggers low-stock alerts.
- `GET /api/admin/staff` — On-duty medical personnel and roster.
- `GET /api/admin/doctors` — Hospital clinician roster.
- `GET /api/admin/patients` — Admitted inpatient registry.
- `GET /api/admin/hospital-network` — Regional partner hospital telemetry.

### Live Telemetry (`/ws/telemetry`)
- `telemetry:snapshot` — Instant state emitted on connection.
- `telemetry:heartbeat` — Pulse sent every 10s with real-time ICU loads and O2 reserves.
- `bed:update` — Emitted when bed occupancy is altered by admin.
- `pharmacy:alert` — Emitted when critical medicine drops below reorder threshold.

---

## 🔗 Connecting Existing Frontend (`E-Kavaach/`)

The frontend repository remains **100% untouched**. When the frontend is pointed at this backend, you can configure the client API base URL:

1. **Environment Variable**: Set `VITE_API_BASE_URL=http://localhost:5000/api` in your frontend runtime.
2. **Reverse Proxy (Vite config or Nginx)**:
   ```javascript
   // vite.config.js proxy example
   server: {
     proxy: {
       '/api': 'http://localhost:5000',
       '/ws': {
         target: 'http://localhost:5000',
         ws: true
       }
     }
   }
   ```
3. Because the user authentication endpoint returns the exact `roleProfiles` object (`role`, `name`, `id`, `tag`, `hospital`, `dashboardRoute`, `title`), no transformation is needed on the frontend.
