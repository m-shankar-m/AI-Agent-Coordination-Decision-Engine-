"""
Aegis Banking Pure Python Root Entry Point
Can be run directly from the project root:
    python3 run_python_app.py
or from inside backend:
    python3 backend/pure_server.py

Zero external dependencies required (Pure Python 3 standard library).
"""
import sys
import os

# Add backend directory to sys.path so it works whether run from root or anywhere
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from backend.pure_server import run_server

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"===========================================================")
    print(f"  Aegis Banking Multi-Agent Platform (Pure Python Server)  ")
    print(f"  Running on: http://0.0.0.0:{port}                        ")
    print(f"  Includes: UI Dashboard + REST APIs + Agents + Tools      ")
    print(f"===========================================================")
    run_server(port)
