#!/usr/bin/env python3
"""
build.py — Static site generator for Ashapura Maison Design.

Uses Django's test client to render pages to HTML, then copies
static files. Output goes to docs/ for GitHub Pages.

Usage:
    python build.py
    # If Django is not importable, this script will attempt
    # to create a virtual environment and install requirements first.
"""

import os
import sys
import shutil
import stat
import json
import re
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


# ── Set build mode BEFORE importing Django ──────────────────
os.environ["BUILD_MODE"] = "true"
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "amd_site.settings")

import django                               # noqa: E402
django.setup()

from django.test import Client             # noqa: E402
from django.conf import settings           # noqa: E402
from site_app.pages import get_build_pages

PROJECT_ROOT = Path(settings.BASE_DIR).resolve()
DOCS = PROJECT_ROOT / 'docs'
ROOT_MANIFEST = PROJECT_ROOT / '.generated-pages.json'


def _retry_writable(func, path, _exc):
    """Windows refuses to delete read-only folders; OneDrive marks synced folders read-only and
    copytree copies that flag into docs/. Clear it and retry, staying best-effort as before."""
    try:
        os.chmod(path, os.stat(path).st_mode | stat.S_IWRITE)
        func(path)
    except OSError:
        pass


def clean():
    if DOCS.resolve() != PROJECT_ROOT / 'docs':
        raise ValueError('Build output must be the repository docs directory, not a redirected path')
    print("  Cleaning docs/ ...")
    if sys.version_info >= (3, 12):
        shutil.rmtree(DOCS, onexc=_retry_writable)
    else:
        shutil.rmtree(DOCS, onerror=_retry_writable)
    DOCS.mkdir()


def build_pages(pages):
    client = Client()
    for url, output in pages + [('/sitemap.xml', 'sitemap.xml')]:
        print(f"  GET {url}  ->  docs/{output}")
        response = client.get(url)
        if response.status_code != 200:
            print(f"  ERROR: {url} returned HTTP {response.status_code}")
            sys.exit(1)
        (DOCS / output).write_bytes(response.content)


def copy_static():
    src = Path(settings.BASE_DIR) / "static"
    dst = DOCS / "static"
    print(f"  Copying static/  ->  docs/static/")
    shutil.copytree(src, dst, dirs_exist_ok=True)


def fix_static_paths():
    """Replace absolute /static/ with relative static/ so the site works at any subpath."""
    for html_file in DOCS.glob("**/*.html"):
        content = html_file.read_text(encoding="utf-8")
        fixed = content.replace('="/static/', '="static/')
        if fixed != content:
            html_file.write_text(fixed, encoding="utf-8")
            print(f"  Fixed static paths in {html_file.name}")


def mirror_root_pages(pages):
    filenames = {filename for _, filename in pages} | {'sitemap.xml'}
    previous = json.loads(ROOT_MANIFEST.read_text(encoding='utf-8')) if ROOT_MANIFEST.exists() else []
    allowed = r'(?:index|services|portfolio|process|about|contact|gallery-[a-z0-9-]+)\.html|sitemap\.xml'
    for filename in previous:
        if not isinstance(filename, str) or not re.fullmatch(allowed, filename):
            raise ValueError('Invalid generated-page manifest entry')
    for filename in set(previous) - filenames:
        (PROJECT_ROOT / filename).unlink(missing_ok=True)
    for filename in filenames:
        shutil.copyfile(DOCS / filename, PROJECT_ROOT / filename)
    ROOT_MANIFEST.write_text(json.dumps(sorted(filenames), indent=2) + '\n', encoding='utf-8')
    print('  Mirrored generated pages to the repository root')


def main():
    print("\nBuilding static site ...")
    pages = get_build_pages()
    clean()
    build_pages(pages)
    copy_static()
    fix_static_paths()
    mirror_root_pages(pages)
    print("\nBuild complete!  Output: docs/\n")


if __name__ == "__main__":
    main()
