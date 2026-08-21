@echo off
echo Starting LastMileSaathi React Dashboard on http://localhost:5173 ...
cd /d "%~dp0\frontend"
call npm.cmd run dev
pause
