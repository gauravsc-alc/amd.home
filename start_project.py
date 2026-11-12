#!/usr/bin/env python3
"""
start_project.py — Bootstrap the Ashapura Maison Design project.

This script:
  1. Creates a virtual environment (if one doesn't exist)
  2. Installs required packages from requirements.txt
  3. Runs the development server (or builds the static site)

Usage:
    python start_project.py        # Full bootstrap + dev server
    python start_project.py build  # Only build the static site
    python start_project.py run    # Only run the development server
"""

import os
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run_cmd(cmd, description):
    """Run a command and print status, exiting on failure."""
    print(f"\n>>> {description}")
    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode != 0:
        print(f"  Command failed: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        sys.exit(result.returncode)
    return result


def create_venv():
    """Create a virtual environment if one doesn't already exist."""
    venv_path = ROOT / ".venv"
    if venv_path.exists():
        print("  .venv already exists — skipping creation")
        return True
    print("  Creating virtual environment .venv/ ...")
    return run_cmd([sys.executable, "-m", "venv", str(venv_path)], "Creating virtual environment")


def install_requirements():
    """Install Python packages from requirements.txt using the venv pip."""
    venv_pip = ROOT / ".venv" / "Scripts" / "pip.exe" if sys.platform == "win32" else ROOT / ".venv" / "bin" / "pip"
    if not venv_pip.exists():
        # Fallback: try to find pip elsewhere
        venv_pip = subprocess.check_output([sys.executable, "-m", "pip", "--version"]).decode()
        print(f"  Using system pip at {sys.executable}")
    print("  Installing dependencies from requirements.txt ...")
    return run_cmd(
        [str(venv_pip), "install", "--upgrade", "pip"] if sys.platform == "win32" 
        else [sys.executable, "-m", "pip", "install", "--upgrade", "pip"],
        "Upgrading pip"
    ) or run_cmd(
        [str(venv_pip), "install", "-r", "requirements.txt"] if sys.platform == "win32"
        else [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
        "Installing requirements"
    )


def run_dev_server():
    """Start the Django development server."""
    print("\nStarting development server...")
    run_cmd(
        [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"],
        "Running Django dev server at http://127.0.0.1:8000/",
        cwd=ROOT,
    )


def build_site():
    """Build the static site using build.py."""
    print("\nBuilding static site...")
    run_cmd(
        [sys.executable, "build.py"],
        "Running static site generator",
        cwd=ROOT,
    )


def main():
    args = sys.argv[1:]

    if not args or "run" in args:
        create_venv()
        install_requirements()
        run_dev_server()
    elif "build" in args:
        create_venv()
        install_requirements()
        build_site()
    else:
        print("Usage:")
        print("  python start_project.py    # Bootstrap + start dev server")
        print("  python start_project.py run    # Only start dev server (venv assumed)")
        print("  python start_project.py build  # Only build static site (venv assumed)")
        sys.exit(1)


if __name__ == "__main__":
    main()