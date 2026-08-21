@echo off
title LastMileSaathi - Unified Platform Runner
cd /d "%~dp0"
echo ========================================================================
echo   Starting LastMileSaathi Platform (FastAPI + Vite React)
echo ========================================================================
backend\venv\Scripts\python.exe run_all.py
pause
