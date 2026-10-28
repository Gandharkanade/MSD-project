@echo off
cd /d "%~dp0app\client"
npm install
npm run dev
pause
