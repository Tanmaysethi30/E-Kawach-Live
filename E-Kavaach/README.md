# E-KAVACH (ई-कवच) 🏥
### Universal Emergency Health Access & Clinical Network Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.10-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ABDM Aligned](https://img.shields.io/badge/ABDM-ABHA%20Enabled-006876?style=flat-square)](https://abdm.gov.in/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**E-KAVACH** (*Electronic Kavach / Shield*) is a unified digital health and emergency triage system engineered to bridge critical communication gaps between patients, emergency response teams, healthcare specialists, and hospital networks. Built with India's **Ayushman Bharat Digital Mission (ABDM)** standards in mind, E-KAVACH enables instant medical data retrieval during the golden hour, coordinated ambulance routing, dynamic ICU bed tracking, and encrypted inter-hospital transfers.

---

## 🌟 Key Highlights

- **⚡ Golden-Hour Triage Acceleration**: Instant QR / ABHA-based patient scanning allows ER staff to retrieve critical allergies, blood group, past surgical history, and emergency contacts in under 3 seconds.
- **🛡️ Role-Based Portals**: Dedicated workspaces customized for **Patients**, **Doctors / ER Clinicians**, and **Hospital Administrators**.
- **🌐 ABDM & ABHA Compliant**: Integrated ABHA (Ayushman Bharat Health Account) card generator, QR verification, and PM-JAY government healthcare scheme navigator.
- **🏥 Inter-Hospital Grid**: Real-time telemetry across partner hospitals showing emergency bed availability, ICU ventilators, oxygen reserves, and blood bank stocks.
- **🎨 M3-Inspired Healthcare Design System**: Accessible, high-contrast, clinical UI built using Tailwind CSS and Material Design 3 tokens optimized for low-stress rapid decision making.

---

## 🧭 System Architecture & Portals

```
                             ┌────────────────────────┐
                             │    E-KAVACH Gateway    │
                             │      (/) Landing       │
                             └───────────┬────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│    Patient Portal    │    │    Doctor Console    │    │    Admin Command     │
│       (/patient)     │    │       (/doctor)      │    │       (/admin)       │
├──────────────────────┤    ├──────────────────────┤    ├──────────────────────┤
│ • ABHA Health Card   │    │ • Real-time Triage   │    │ • Bed & ICU Grid     │
│ • Health Timeline    │    │ • Emergency Scanner  │    │ • Staff Directory    │
│ • Booking & Consults │    │ • Patient Onboarding │    │ • Doctor Roster      │
│ • Emergency Pass     │    │ • Clinical Consults  │    │ • Pharmacy Inventory │
│ • PM-JAY Schemes     │    │ • Specialist Network │    │ • ER Ward Allocation │
│ • Consent & Privacy  │    │ • Credentials & NMC  │    │ • Inter-Hospital Net │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

---

## 🚀 Role Capabilities

### 1. 👤 Patient Portal (`/patient`)
- **ABHA Health ID**: Generate and display Ayushman Bharat Health Account details with live verifiable QR codes.
- **Emergency Access Card**: One-tap digital emergency medical profile containing blood group, chronic conditions, active medications, and ICE contacts.
- **Clinical Consultations & Booking**: Book in-person or tele-consultations across clinical departments.
- **Health History Timeline**: Longitudinal medical records repository (lab reports, prescriptions, discharge summaries).
- **Government Schemes (PM-JAY)**: Eligibility checker and coverage tracking for national and state welfare schemes.
- **Granular Privacy Controls**: Consent management system to revoke or grant doctor access to specific medical records.

### 2. 🩺 Doctor Console (`/doctor`)
- **Emergency Triage Queue**: Color-coded urgency triage (Red: Immediate, Yellow: Delayed, Green: Minor, Black: Deceased).
- **Fast ABHA Scanner**: Instant camera / barcode intake to fetch records before patient arrival.
- **Add Patient & Rapid Intake**: Streamlined intake forms for unlinked or unconscious emergency patients.
- **Doctor Network**: Seamless internal and external referral network to transfer patients to specialists.
- **NMC Credential Verification**: Transparent medical council registration badge and clinical verification status.

### 3. 🏢 Hospital Administration Hub (`/admin`)
- **Central Hospital Command**: High-level overview of patient footfall, admissions, bed utilization, and emergency cases.
- **Emergency Ward & Bed Tracking**: Real-time management of ICU, Ventilator, High Dependency Unit (HDU), and General ward allocations.
- **Pharmacy & Drug Management**: Monitor inventory levels, near-expiry drug warnings, essential emergency supplies, and dispensation records.
- **Doctor & Staff Operations**: Duty shifts, department allocation, and verified staff directory.
- **Regional Hospital Network**: Live visibility into bed capacities of neighboring trauma centers for coordinated patient diversions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev/) |
| **Build Tool** | [Vite 5](https://vitejs.dev/) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) with `@tailwindcss/forms` & `@tailwindcss/container-queries` |
| **Icons & Typography** | Google Material Symbols Outlined, Inter, Space Grotesk |
| **State Management** | React Context API (`AuthContext`) with reactive session persistence |
| **Automated QA** | [TestSprite CLI](https://github.com/testsprite) Test Plans |

---

## 📂 Project Structure

```text
e-kavach/
├── .claude/                   # Claude agent skill configs
├── .testsprite/               # TestSprite configuration
├── public/                    # Static assets
├── src/
│   ├── assets/
│   │   └── images/            # Platform branding, background, and logos
│   ├── components/
│   │   ├── common/            # Reusable UI primitives (Avatar, Toast, EmergencyMarquee)
│   │   └── layout/            # Role layouts (PublicLayout, PatientLayout, DoctorLayout, AdminLayout)
│   ├── context/
│   │   └── AuthContext.jsx    # Session management, simulated auth & active role switching
│   ├── pages/
│   │   ├── admin/             # Hospital Administration suite (8 modules)
│   │   ├── doctor/            # Doctor & Triage console (9 modules)
│   │   ├── patient/           # Patient self-service & records (12 modules)
│   │   └── public/            # Landing page with multi-role login & registration
│   ├── styles/
│   │   └── index.css          # Custom styling & Tailwind directives
│   ├── App.jsx                # Route declarations & role guards
│   └── main.jsx               # React DOM entry point
├── testsprite-plans/          # TestSprite QA integration test definitions
│   ├── 01_landing_page_registration.json
│   │   ...
├── index.html                 # HTML template with Google Fonts & Material Symbols
├── package.json               # Dependencies and execution scripts
├── tailwind.config.js         # Custom clinical design tokens and color scheme
└── vite.config.js             # Vite configuration
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/Avinesh-Shukla/E-Kavaach.git
cd E-Kavaach
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to explore the platform.

### 4. Build for Production
```bash
npm run build
```
The optimized production output will be generated inside the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🧪 Quality Assurance & TestSprite Suite

E-KAVACH comes pre-configured with end-to-end QA scenarios defined in `testsprite-plans/`:
- `01_landing_page_registration.json`: Verification of patient, doctor, and hospital registration flows with OTP unlock.
- `02_patient_dashboard_overview.json`: Verification of patient metric widgets, emergency passes, and quick actions.
- `03_patient_settings_modules.json`: Verification of security settings, emergency contact management, and consent logs.
- `04_doctor_portal_triage.json`: Verification of triage intake and patient scanner UI.
- `05_admin_portal_overview.json`: Verification of emergency ward bed metrics and hospital network telemetry.

Run test plans using the TestSprite CLI:
```bash
npx testsprite run
```

---

## 🔒 Security & Privacy Architecture

- **Patient-Controlled Consent**: Health records cannot be transferred between departments without explicit patient authorization.
- **Zero Critical Data Exposure**: Emergency health passes only surface critical intervention data (Allergies, Blood Group, Implants, Emergency Contacts) in lock-screen mode.
- **Audit Trails**: Every clinician access to patient records creates an immutable access log visible in the patient security console.

---

## 📄 License

This project is distributed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.

---

<p align="center">
  Built with ❤️ for rapid emergency healthcare access and patient-centric digital health integration.
</p>
