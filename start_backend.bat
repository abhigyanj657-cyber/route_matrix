@echo off
echo Starting LastMileSaathi FastAPI Backend Server on http://127.0.0.1:8000 ...
cd /d "%~dp0"
call backend\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --reload --port 8000 --host 127.0.0.1
pause
