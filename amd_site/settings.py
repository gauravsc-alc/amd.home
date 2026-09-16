import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ─────────────────────────────────────────────────
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-amd-home-interiors-local-dev-key-change-for-prod",
)
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() != "false"
ALLOWED_HOSTS = ["*"]  # static site — no external requests in prod

# ── Build mode: switches STATIC_URL to relative paths ────────
BUILD_MODE = os.environ.get("BUILD_MODE", "false").lower() == "true"
STATIC_URL = "static/" if BUILD_MODE else "/static/"

# ── Applications ─────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "site_app",
]

MIDDLEWARE = []

ROOT_URLCONF = "amd_site.urls"

# ── Templates ────────────────────────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": False,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    }
]

WSGI_APPLICATION = "amd_site.wsgi.application"

# ── Static files ─────────────────────────────────────────────
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "docs" / "static"

# ── Internationalisation ─────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = False
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Content directory ────────────────────────────────────────
CONTENT_DIR = BASE_DIR / "content"
