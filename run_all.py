import os
import sys
import time
import subprocess
import signal
import webbrowser

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Platform-specific executables
if sys.platform == "win32":
    PYTHON_EXE = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
    NPM_CMD = "npm.cmd"
else:
    PYTHON_EXE = os.path.join(BACKEND_DIR, "venv", "bin", "python")
    NPM_CMD = "npm"

if not os.path.exists(PYTHON_EXE):
    PYTHON_EXE = sys.executable

def main():
    print("=" * 72)
    print("   LastMileSaathi (Route Matrix) - Unified Multi-Process Runner")
    print("=" * 72)
    print("-> Starting FastAPI Backend & Vite React Frontend concurrently...\n")

    processes = []

    def shutdown(signum=None, frame=None):
        print("\n" + "=" * 72)
        print("-> Gracefully shutting down LastMileSaathi servers...")
        print("=" * 72)
        for proc in processes:
            if proc and proc.poll() is None:
                try:
                    if sys.platform == "win32":
                        # Terminate process tree to avoid zombie ports on Windows
                        subprocess.run(
                            ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL
                        )
                    else:
                        proc.terminate()
                except Exception:
                    pass
        print("-> All servers stopped cleanly. Goodbye!\n")
        sys.exit(0)

    # Register signal handlers
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        # 1. Launch FastAPI Backend
        print("[1/2] Launching FastAPI Backend (Port 8000)...")
        backend_cmd = [
            PYTHON_EXE,
            "-m",
            "uvicorn",
            "main:app",
            "--app-dir",
            BACKEND_DIR,
            "--reload",
            "--port",
            "8000",
            "--host",
            "127.0.0.1"
        ]
        backend_proc = subprocess.Popen(backend_cmd, cwd=ROOT_DIR)
        processes.append(backend_proc)

        # 2. Launch Vite React Frontend
        print("[2/2] Launching Vite React Frontend (Port 5173)...")
        frontend_cmd = [NPM_CMD, "run", "dev"]
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)
        processes.append(frontend_proc)

        # Brief delay for server startup
        time.sleep(2.0)

        print("\n" + "=" * 72)
        print("   ALL SERVICES ARE LIVE AND OPERATIONAL!")
        print("=" * 72)
        print("   * Frontend App:  http://localhost:5173")
        print("   * Backend Docs:  http://127.0.0.1:8000/docs")
        print("   * Backend API:   http://127.0.0.1:8000/")
        print("=" * 72)
        print("   Press [Ctrl + C] in this window to stop all services.\n")

        # Open frontend in default web browser
        try:
            webbrowser.open("http://localhost:5173")
        except Exception:
            pass

        # Monitor processes
        while True:
            for proc in processes:
                ret = proc.poll()
                if ret is not None:
                    print(f"[Notice] Process PID {proc.pid} exited with code {ret}.")
                    shutdown()
            time.sleep(1)

    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    main()
