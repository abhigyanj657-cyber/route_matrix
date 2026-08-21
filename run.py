import os
import sys
import time
import subprocess
import webbrowser
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Platform-specific python binary paths
if sys.platform == "win32":
    PYTHON_EXE = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
    NPM_CMD = "npm.cmd"
else:
    PYTHON_EXE = os.path.join(BACKEND_DIR, "venv", "bin", "python")
    NPM_CMD = "npm"

if not os.path.exists(PYTHON_EXE):
    PYTHON_EXE = sys.executable

def banner():
    print("""
========================================================================
   _               _   __  __ _ _        ____              _   _     _ 
  | |    __ _ ___ | |_|  \/  (_) | ___  / ___|  __ _  __ _| |_| |__ (_)
  | |   / _` / __|| __| |\/| | | |/ _ \ \___ \ / _` |/ _` | __| '_ \| |
  | |__| (_| \__ \| |_| |  | | | |  __/  ___) | (_| | (_| | |_| | | | |
  |_____\__,_|___/ \__|_|  |_|_|_|\___| |____/ \__,_|\__,_|\__|_| |_|_|
  
   AI-Optimized Freight Consolidation & Backhaul Platform (Phase 1)
   Corridor: Bihar & Eastern India (NH-27 / NH-31 Logistics Grid)
========================================================================
""")

def seed_database():
    print("[1/3] Initializing & Seeding SQLite Database...")
    seed_script = os.path.join(BACKEND_DIR, "seed.py")
    res = subprocess.run([PYTHON_EXE, "-u", seed_script], cwd=BACKEND_DIR)
    if res.returncode != 0:
        print("[Warning] Seed script encountered an issue. Proceeding...")
    else:
        print("  -> Database successfully seeded with Patna-Madhubani corridor data.")

def launch_services():
    print("\n[2/3] Launching FastAPI Backend & Vite React Frontend...")
    processes = []

    try:
        # 1. Start FastAPI Backend on Port 8000
        print("  -> Starting FastAPI Backend on http://127.0.0.1:8000 ...")
        backend_proc = subprocess.Popen(
            [PYTHON_EXE, "-m", "uvicorn", "main:app", "--app-dir", BACKEND_DIR, "--reload", "--port", "8000", "--host", "127.0.0.1"],
            cwd=ROOT_DIR
        )
        processes.append(backend_proc)

        # 2. Start Vite Frontend on Port 5173
        print("  -> Starting Vite React Frontend on http://localhost:5173 ...")
        frontend_proc = subprocess.Popen(
            [NPM_CMD, "run", "dev"],
            cwd=FRONTEND_DIR
        )
        processes.append(frontend_proc)

        # Wait a moment for servers to spin up
        time.sleep(2.5)

        print("\n[3/3] Platform is LIVE!")
        print("========================================================================")
        print("  * Frontend Dashboard:   http://localhost:5173")
        print("  * Backend API Docs:     http://127.0.0.1:8000/docs")
        print("  * Backend Health Check: http://127.0.0.1:8000/")
        print("========================================================================")
        print("Press Ctrl+C at any time to cleanly stop all servers.\n")

        # Open in default browser
        try:
            webbrowser.open("http://localhost:5173")
        except Exception:
            pass

        # Keep alive
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[Shutting Down] Gracefully stopping backend & frontend servers...")
        for p in processes:
            p.terminate()
        print("All servers stopped cleanly. Goodbye!")

if __name__ == "__main__":
    banner()
    seed_database()
    launch_services()
