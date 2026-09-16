#!/usr/bin/env python3
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "amd_site.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Could not import Django. Run:  pip install -r requirements.txt"
        ) from exc
    execute_from_command_line(sys.argv)
