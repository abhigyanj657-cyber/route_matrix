# LastMileSaathi (Route Matrix) — 1-Command Startup Guide

Run both the **FastAPI Backend (Port 8000)** and **Vite React Frontend (Port 5173)** simultaneously using a single command.

---

## 🚀 Quick Launch (Single Command)

### Option A: Windows 1-Click (Recommended)
Double-click:
```bash
start_all.bat
```

### Option B: Python Unified Runner
Run from project root:
```bash
backend\venv\Scripts\python.exe run_all.py
```
*(or `python run_all.py` if your default environment has Python 3.10+)*

---

## 🌐 Active Service Endpoints

Once launched, the runner will automatically spin up all services and open your browser to:

| Service | URL | Description |
|---|---|---|
| **Frontend Dashboard** | [http://localhost:5173](http://localhost:5173) | Interactive Leaflet Map, Telematics Simulator, Shipper Portal & Driver Console |
| **FastAPI Swagger Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive OpenAPI / Swagger test interface |
| **Backend Root** | [http://127.0.0.1:8000/](http://127.0.0.1:8000/) | Health-check endpoint |

---

## 🛑 Clean Graceful Shutdown

Press **`Ctrl + C`** in the terminal window at any time. The runner will cleanly terminate all child process trees (FastAPI and Vite) without leaving zombie ports open on port 8000 or 5173.
