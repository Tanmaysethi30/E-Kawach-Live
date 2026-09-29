@echo off
setlocal EnableDelayedExpansion
title E-KAWACH Local Server ^& Domain Launcher

echo ========================================================
echo   E-KAWACH Local Server and Domain Launcher (ekawach.co.in)
echo ========================================================
echo.

REM Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        echo [INFO] Created .env from .env.example
    ) else (
        echo PORT=3000 > .env
        echo NODE_ENV=development >> .env
        echo [INFO] Created default .env
    )
)

REM Ensure dependencies exist
if not exist "node_modules" (
    echo [INFO] Installing required dependencies...
    call npm install
)

echo 1. Starting E-KAWACH server on port 3000...
start "E-KAWACH Server" cmd /k "npm run dev"

timeout /t 4 /nobreak >nul

where cloudflared >nul 2>nul
if %errorlevel% equ 0 (
    echo 2. Starting Cloudflare Tunnel for ekawach.co.in...
    start "Cloudflare Tunnel" cmd /k "cloudflared tunnel run ekawach-local"
) else (
    echo 2. Cloudflare tunnel CLI not found - running locally only.
)

echo.
echo ========================================================
echo   E-KAWACH is now running!
echo   - Local Access:  http://localhost:3000
echo   - Emergency Hub: http://localhost:3000/patient/emergency
echo   - Live Domain:   https://ekawach.co.in (if tunnel active)
echo ========================================================
echo.
REM Open browser
start http://localhost:3000

echo Keep the server command window open while testing.
pause
