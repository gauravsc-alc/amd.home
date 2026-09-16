#!/usr/bin/env python3
"""
Generate SVG placeholder images for AMD Home Interiors portfolio website.

Run once:
    python generate_placeholders.py

Replace any placeholder with a real photo by:
  1. Dropping your image file into assets/images/ (or assets/images/portfolio/)
  2. Updating the src="..." attribute in index.html to match your filename
"""

from pathlib import Path

BASE = Path(__file__).parent / "static" / "images"

IMAGES = [
    # (relative_path, width, height, bg_hex, label, hint)
    ("hero.svg",                    1920, 900,  "#2C1A0E", "Hero Image",             "1920x900 px — your best project photo"),
    ("expertise-bungalow.svg",       800, 450,  "#8B5E3C", "Bungalow Design",        "Replace with bungalow exterior photo"),
    ("expertise-terrace.svg",        800, 450,  "#4A7A3A", "Terrace Design",         "Replace with terrace / rooftop photo"),
    ("expertise-elevation.svg",      800, 450,  "#3A5C8A", "Building Elevation",     "Replace with facade / elevation photo"),
    ("expertise-pergola.svg",        800, 450,  "#5D4E37", "Pergola Design",         "Replace with pergola photo"),
    ("expertise-living.svg",         800, 450,  "#C8603A", "Living Room",            "Replace with living room photo"),
    ("expertise-kitchen.svg",        800, 450,  "#5D8A72", "Modular Kitchen",        "Replace with kitchen photo"),
    ("expertise-bedroom.svg",        800, 450,  "#9B7A5A", "Bedroom",                "Replace with bedroom photo"),
    # Portfolio — Bungalow
    ("portfolio/bungalow-1.svg",     800, 600,  "#7A5C3C", "Bungalow · Project 1",  "800x600 px"),
    ("portfolio/bungalow-2.svg",    1200, 675,  "#8B6A46", "Bungalow · Project 2",  "Wide card — 1200x675 px"),
    ("portfolio/bungalow-3.svg",     800, 600,  "#6B4E2C", "Bungalow · Project 3",  "800x600 px"),
    # Portfolio — Terrace
    ("portfolio/terrace-1.svg",     1200, 675,  "#3A6A2A", "Terrace · Project 1",   "Wide card — 1200x675 px"),
    ("portfolio/terrace-2.svg",      800, 600,  "#4A7A3A", "Terrace · Project 2",   "800x600 px"),
    # Portfolio — Elevation
    ("portfolio/elevation-1.svg",    800, 600,  "#2A4A7A", "Elevation · Project 1", "800x600 px"),
    ("portfolio/elevation-2.svg",   1200, 675,  "#3A5C8A", "Elevation · Project 2", "Wide card — 1200x675 px"),
    # Portfolio — Pergola
    ("portfolio/pergola-1.svg",      800, 600,  "#4A3A2A", "Pergola · Project 1",   "800x600 px"),
    ("portfolio/pergola-2.svg",      800, 600,  "#5D4E37", "Pergola · Project 2",   "800x600 px"),
    # Portfolio — Living Room
    ("portfolio/living-1.svg",      1200, 675,  "#B85A2A", "Living Room · Project 1","Wide card — 1200x675 px"),
    ("portfolio/living-2.svg",       800, 600,  "#C8703A", "Living Room · Project 2","800x600 px"),
    # Portfolio — Kitchen
    ("portfolio/kitchen-1.svg",      800, 600,  "#4A7A5A", "Kitchen · Project 1",   "800x600 px"),
    ("portfolio/kitchen-2.svg",      800, 600,  "#3A6A4A", "Kitchen · Project 2",   "800x600 px"),
    # Portfolio — Bedroom
    ("portfolio/bedroom-1.svg",     1200, 675,  "#8A6A4A", "Bedroom · Project 1",   "Wide card — 1200x675 px"),
    ("portfolio/bedroom-2.svg",      800, 600,  "#9B7A5A", "Bedroom · Project 2",   "800x600 px"),
]


def lum(h: str) -> float:
    r, g, b = int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)
    return (0.299*r + 0.587*g + 0.114*b) / 255


def svg(w: int, h: int, bg: str, label: str, hint: str) -> str:
    fg   = "#FFFFFF" if lum(bg) < 0.5 else "#1A1A1A"
    sub  = "#FFFFFFB0" if lum(bg) < 0.5 else "#333333A0"
    grid = fg + "18"
    cx, cy = w // 2, h // 2

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{label}">
  <defs>
    <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="{grid}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="{bg}"/>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  <rect x="{cx-160}" y="{cy-64}" width="320" height="128" rx="6"
        fill="none" stroke="{fg}33" stroke-width="1.5" stroke-dasharray="10 5"/>
  <text x="{cx}" y="{cy-12}" text-anchor="middle"
        font-family="Georgia,serif" font-size="20" fill="{fg}" font-weight="bold">{label}</text>
  <text x="{cx}" y="{cy+18}" text-anchor="middle"
        font-family="sans-serif" font-size="12" fill="{sub}">{hint}</text>
  <text x="{w-8}" y="{h-8}" text-anchor="end"
        font-family="monospace" font-size="10" fill="{fg}44">placeholder · {w}x{h}</text>
</svg>"""


def main():
    (BASE / "portfolio").mkdir(parents=True, exist_ok=True)

    for rel, w, h, bg, label, hint in IMAGES:
        path = BASE / rel
        path.write_text(svg(w, h, bg, label, hint), encoding="utf-8")
        print(f"  OK  {rel}")

    print(f"\nAll placeholders written to assets/images/")
    print("Replace any file with your real photo and update the src= in index.html")


if __name__ == "__main__":
    main()
