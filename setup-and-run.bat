@echo off
setlocal EnableDelayedExpansion
title E-KAWACH - Automated Setup & Launcher

echo ==============================================================================
echo             E-KAWACH: National Trauma & Emergency Medical Network
echo ==============================================================================
echo.
echo [1/5] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js (version 18, 20, or 22 LTS) from:
    echo   https://nodejs.org/
    echo After installing, restart your command prompt and run this file again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   -- Found Node.js version: !NODE_VERSION!
echo.

echo [2/5] Setting up environment configuration (.env)...
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        echo   -- Created .env from .env.example
    ) else (
        echo PORT=3000 > .env
        echo NODE_ENV=development >> .env
        echo JWT_ACCESS_SECRET=ekawach_jwt_access_super_secret_key_32bytes_min_2026 >> .env
        echo JWT_REFRESH_SECRET=ekawach_jwt_refresh_super_secret_key_32bytes_min_2026 >> .env
        echo ENCRYPTION_SECRET_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef >> .env
        echo   -- Created new .env file with default configuration
    )
) else (
    echo   -- Existing .env file detected, preserving configuration.
)
echo.

echo [3/5] Checking dependencies (node_modules)...
if not exist "node_modules" (
    echo   -- node_modules not found. Running npm install (this may take 1-2 minutes)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an issue. Please review above logs.
        pause
        exit /b 1
    )
    echo   -- Dependencies successfully installed!
) else (
    echo   -- Dependencies already installed.
)
echo.

echo [4/5] Checking port 3000 status...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    set OCCUPIED_PID=%%a
)
if defined OCCUPIED_PID (
    echo   [WARNING] Port 3000 is currently occupied by process PID !OCCUPIED_PID!.
    echo   Attempting to free port 3000...
    taskkill /f /pid !OCCUPIED_PID! >nul 2>nul
    timeout /t 1 /nobreak >nul
    echo   -- Port 3000 freed.
) else (
    echo   -- Port 3000 is open and ready.
)
echo.

echo [5/5] Launching E-KAWACH fullstack server...
echo.
echo ==============================================================================
echo   E-KAWACH is starting up on http://localhost:3000
echo.
echo   * Patient Portal:     http://localhost:3000/patient/dashboard
echo   * Doctor Console:     http://localhost:3000/doctor/dashboard
echo   * ER Hospital Hub:    http://localhost:3000/patient/emergency
echo   * Hospital Command:   http://localhost:3000/hospital/telemetry
echo.
echo   Demo Logins:
echo   - Patient:   rajesh.sharma@ekawach.health / password123
echo   - Doctor:    dr.kavitha@ekawach.health   / password123
echo   - Hospital:  apollo.delhi@ekawach.health  / password123
echo ==============================================================================
echo.

REM Automatically open browser after 3 seconds in the background
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

REM Run dev server directly
npm run dev

pause
