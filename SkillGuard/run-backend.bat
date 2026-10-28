@echo off
cd /d "%~dp0app\server"
if not exist .env copy .env.example .env
npm install
npm run dev
pause
