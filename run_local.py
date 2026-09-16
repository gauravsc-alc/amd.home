#!/usr/bin/env python3
"""
run_local.py — Start the AMD Home Interiors development server.

Checks for dependencies, installs them if missing, then launches
Django's built-in server with live template reloading.

Usage:
    python run_local.py
"""

import os
import sys
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def check_dependencies():
    """Install requirements.txt if Django is not importable."""
    try:
        import django  # noqa: F401
        import markdown  # noqa: F401
    except ImportError:
        print("Installing dependencies from requirements.txt ...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            cwd=ROOT,
        )
        print()


def main():
    check_dependencies()

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "amd_site.settings")
    os.chdir(ROOT)

    print("=" * 52)
    print("  AMD Home Interiors — Development Server")
    print("  URL: http://127.0.0.1:8000/")
    print("  Press Ctrl+C to stop")
    print("=" * 52)
    print()

    subprocess.run(
        [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"],
        cwd=ROOT,
    )


if __name__ == "__main__":
    main()
