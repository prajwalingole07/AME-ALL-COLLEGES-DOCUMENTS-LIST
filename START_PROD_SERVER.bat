@echo off
setlocal
chcp 65001 >nul 2>&1
title Maharashtra Admission - PRODUCTION SERVER (localhost:3000)
color 0A
cd /d "%~dp0"
echo ============================================================
echo   PRODUCTION SERVER - http://localhost:3000
echo ============================================================
where node >nul 2>&1 || ( echo [ERROR] Node missing & pause & exit /b 1 )
if not exist "node_modules" ( echo Installing... & call npm install )
echo Building production (once)...
call npm.cmd run build
if %ERRORLEVEL% NEQ 0 ( echo Build failed! & pause & exit /b 1 )
echo Build OK. Starting production server...
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
set NODE_ENV=production
set PORT=3000
call node server.js
pause
endlocal
