"""
content_loader.py — Reads all JSON and Markdown files from content/
and returns a single context dict for the Django view.

To add new content:
  - Portfolio project → edit content/portfolio.json
  - Service card      → edit content/services.json
  - Process step      → edit content/process.json
  - Site settings     → edit content/config.json
  - Page text         → edit content/pages/home.md
"""

import json
import markdown
from pathlib import Path
from django.conf import settings

CONTENT_DIR = Path(settings.CONTENT_DIR)


def _load_json(filename: str) -> dict | list:
    path = CONTENT_DIR / filename
    return json.loads(path.read_text(encoding="utf-8"))


def _load_markdown(filename: str) -> str:
    path = CONTENT_DIR / "pages" / filename
    raw = path.read_text(encoding="utf-8")
    return markdown.markdown(raw, extensions=["extra", "nl2br"])


def get_home_context() -> dict:
    return {
        "config":     _load_json("config.json"),
        "portfolio":  _load_json("portfolio.json"),
        "services":   _load_json("services.json"),
        "process":    _load_json("process.json"),
        "intro_html": _load_markdown("home.md"),
    }
