@echo off
setlocal
chcp 65001 >nul 2>&1
title Maharashtra Engineering Admission 2026-27 - LOCALHOST SERVER
color 0B
cd /d "%~dp0"

echo ============================================================
echo   Maharashtra Engineering College Admission 2026-27
echo   LOCALHOST SERVER - Fees ^& Documents Website
echo   Project: %CD%
echo ============================================================
echo.
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js not found! Install Node.js 18+ from https://nodejs.org
  pause
  exit /b 1
)
for /f "tokens=*" %%i in ('node -v 2^>nul') do set NODEV=%%i
echo [OK] Node %NODEV%  NPM %NPMV%
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 ( echo [ERROR] npm not found! & pause & exit /b 1 )

echo [1/3] Checking dependencies...
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if %ERRORLEVEL% NEQ 0 ( echo [ERROR] npm install failed. & pause & exit /b 1 )
) else ( echo Dependencies OK. )

if not exist "package.json" ( echo [ERROR] package.json missing! & pause & exit /b 1 )
if not exist "server.js" ( echo [ERROR] server.js missing! & pause & exit /b 1 )

echo [2/3] Preparing server...
echo [3/3] Starting LOCALHOST server at http://localhost:3000
echo.
echo   Home:        http://localhost:3000
echo   Colleges:    http://localhost:3000/colleges
echo   Add College: http://localhost:3000/add-college  [admin login required]
echo.
echo Opening browser in 3 seconds... Press Ctrl+C to stop server.
timeout /t 3 /nobreak >nul 2>&1
start "" "http://localhost:3000"

REM Use custom server.js (handles localhost + network 0.0.0.0)
set PORT=3000
set HOSTNAME=0.0.0.0
call node server.js

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [FALLBACK] server.js failed, trying npm run dev...
  call npm.cmd run dev
)

echo.
echo Server stopped.
pause
endlocal
