# E-KAWACH — Local Setup, Clean Reset & Execution Guide 🚀

This guide explains how to set up, configure, reset in a new folder, and run **E-KAWACH** on your local machine (Windows, macOS, or Linux).

---

## ⚡ Quick Start: 1-Click Automated Setup (Windows)

If you are on Windows, simply double-click:
👉 **`setup-and-run.bat`**

This script will automatically:
1. Verify Node.js is installed.
2. Auto-create your `.env` configuration file if missing.
3. Automatically run `npm install` if `node_modules` is not yet installed.
4. Check if port 3000 is occupied and free it.
5. Start the fullstack server and launch your browser to `http://localhost:3000`!

---

## 🔄 Step-by-Step: Fresh Setup in a New / Clean Folder

If you want to move or start everything cleanly in a brand-new folder (e.g. `C:\Projects\E-KAWACH` or `D:\E-KAWACH`):

### 1. Create Your New Folder & Copy Project Files
1. Create your desired folder, for example `C:\E-KAWACH`.
2. Extract all project files into this folder.
3. Make sure the root folder contains:
   - `package.json`
   - `server.ts`
   - `vite.config.ts`
   - `setup-and-run.bat` & `start-ekawach.bat`
   - `src/`
   - `e-kavach-backend/`
   - `.env.example`

### 2. Auto-Create or Configure the `.env` File
In your project folder, create `.env` from `.env.example`:

- **Windows (Command Prompt / Powershell)**:
  ```cmd
  copy .env.example .env
  ```
- **macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

Your `.env` file contains:
```env
# Unified Server Port (Default is 3000)
PORT=3000

# Environment mode
NODE_ENV=development

# Authentication & Cryptographic Secrets (Pre-configured safe defaults)
JWT_ACCESS_SECRET=ekawach_jwt_access_super_secret_key_32bytes_min_2026
JWT_REFRESH_SECRET=ekawach_jwt_refresh_super_secret_key_32bytes_min_2026
ENCRYPTION_SECRET_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Optional: Google Gemini API Key for AI-assisted clinical triage
GEMINI_API_KEY=
```

### 3. Install Dependencies
Open your command prompt or terminal in the project folder and run:
```bash
npm install
```
*(All frontend and backend packages are managed together from root `package.json`).*

### 4. Start the Application
Run:
```bash
npm run dev
```

Output:
```text
✅ Connected to local disk database pipeline (local_db.json)
✅ Real-time telemetry WebSocket service attached to HTTP server
✅ Vite middleware mounted serving root E-KAWACH frontend
🚀 E-KAWACH integrated fullstack server listening on http://0.0.0.0:3000
```

Open your browser to:
👉 **`http://localhost:3000`**

---

## 🚑 ER Hospital & Live GPS Locator Features

The **Emergency Hospital Hub** (`http://localhost:3000/patient/emergency`) features an integrated real-time emergency healthcare system:

1. **Automatic Geolocation Detection**:
   - Tries browser HTML5 GPS first (high accuracy).
   - If GPS permission is pending or denied, automatically detects city/area via fast client IP geolocation (~200ms).
   - If offline or on a private network, defaults seamlessly to the patient's registered city (or Delhi NCR default).

2. **Live Hospital Search & Grid**:
   - Searches OpenStreetMap Overpass & Nominatim endpoints with real-time bounding box queries.
   - Computes live driving/air distance in kilometers, available emergency trauma beds, ICU occupancy, and real-time transit ETA.
   - Includes interactive **1-Tap SOS Dispatch**, ambulance routing, and turn-by-turn emergency navigation.

3. **City Preset Selector & Manual Area Search**:
   - Quickly test any Indian metro (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune) using the built-in city preset pills.
   - Or type any neighborhood, district, or hospital name in the search bar.

---

## 🏥 Portals & Demo Accounts

| Portal | URL Path | Demo Login Email | Password |
|---|---|---|---|
| **Patient Health Portal** | `http://localhost:3000/patient/dashboard` | `rajesh.sharma@ekawach.health` | `password123` |
| **Doctor Clinical Console** | `http://localhost:3000/doctor/dashboard` | `dr.kavitha@ekawach.health` | `password123` |
| **Emergency Hospital Hub** | `http://localhost:3000/patient/emergency` | *(Direct access or patient login)* | *(None)* |
| **Hospital Telemetry Command** | `http://localhost:3000/hospital/telemetry` | `apollo.delhi@ekawach.health` | `password123` |

*Quick login buttons on the homepage (`/`) allow pre-populating any of these accounts in 1 click.*

---

## 🛠️ Port Configuration & Troubleshooting

### 1. Changing the Port
If port 3000 is occupied by another application, you can change the port in `.env`:
```env
PORT=3005
```
Or start with:
- **Windows (PowerShell)**: `$env:PORT="3005"; npm run dev`
- **Windows (CMD)**: `set PORT=3005 && npm run dev`
- **macOS / Linux**: `PORT=3005 npm run dev`

### 2. Freeing Port 3000 on Windows
If a previous node process is still running on port 3000:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```
*(The provided `setup-and-run.bat` automatically frees port 3000 for you).*

---

## 📦 Production Build

To test a full production build locally:
```bash
npm run build
npm start
```
This compiles the Vite frontend and bundles the Express + WebSocket backend into `dist/server.cjs`.
