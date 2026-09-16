#!/usr/bin/env python3
"""
build.py — Static site generator for AMD Home Interiors.

Uses Django's test client to render pages to HTML, then copies
static files. Output goes to docs/ for GitHub Pages.

Usage:
    python build.py
"""

import os
import sys
import shutil
from pathlib import Path

# ── Set build mode BEFORE importing Django ──────────────────
os.environ["BUILD_MODE"] = "true"
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "amd_site.settings")

import django                               # noqa: E402
django.setup()

from django.test import Client             # noqa: E402
from django.conf import settings           # noqa: E402

DOCS = Path("docs")


def clean():
    print("  Cleaning docs/ ...")
    shutil.rmtree(DOCS, ignore_errors=True)
    DOCS.mkdir()


def build_pages():
    client = Client()
    pages = [
        ("/", "index.html"),
    ]
    for url, output in pages:
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


def main():
    print("\nBuilding static site ...")
    clean()
    build_pages()
    copy_static()
    print("\nBuild complete!  Output: docs/\n")


if __name__ == "__main__":
    main()
