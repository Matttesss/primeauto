@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Nainstalujte Node.js 24 LTS z https://nodejs.org/ a zkuste to znovu.
  pause
  exit /b 1
)
node scripts/start-local.mjs
pause
