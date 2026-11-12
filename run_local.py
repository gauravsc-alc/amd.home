#!/usr/bin/env python3
"""
run_local.py — Start the Ashapura Maison Design development server.

Creates a virtual environment (if one doesn't exists), installs dependencies,
then launches Django's built-in server with live template reloading.

Usage:
    python run_local.py
"""

import os
import sys
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VENV = ROOT / ".venv"


def _venv_python():
    """Return the Python interpreter inside the virtual environment."""
    if sys.platform == "win32":
        return str(VENV / "Scripts" / "python.exe")
    return str(VENV / "bin" / "python")


def create_venv():
    """Create a virtual environment if one doesn't already exist."""
    if VENV.exists():
        print("  .venv already exists — skipping creation")
        return True
    print("  Creating virtual environment .venv/ ...")
    return subprocess.check_call(
        [sys.executable, "-m", "venv", str(VENV)],
        cwd=ROOT,
    )


def install_requirements():
    """Install Python packages from requirements.txt using the venv pip."""
    venv_pip = _venv_python().replace("python", "pip")
    print("  Installing dependencies from requirements.txt ...")
    return subprocess.check_call(
        [venv_pip, "install", "-r", "requirements.txt"],
        cwd=ROOT,
    )


def check_dependencies():
    """Create venv and install requirements if Django is not importable."""
    try:
        import django  # noqa: F401
        import markdown  # noqa: F401
    except ImportError:
        print("Dependencies not found — setting up virtual environment...")
        create_venv()
        install_requirements()
        print()


def main():
    check_dependencies()

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "amd_site.settings")
    os.chdir(ROOT)

    print("=" * 52)
    print("  Ashapura Maison Design — Development Server")
    print("  URL: http://127.0.0.1:8000/")
    print("  Press Ctrl+C to stop")
    print("=" * 52)
    print()

    subprocess.run(
        [_venv_python(), "manage.py", "runserver", "127.0.0.1:8000"],
        cwd=ROOT,
    )


if __name__ == "__main__":
    main()
