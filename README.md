# AMD Home Interiors — Portfolio Website

A professional **interior design portfolio** built with **Django + Python**, deployed as a **static site** on GitHub Pages.

All content is managed through **JSON** and **Markdown** files — no HTML editing needed to add projects, update contact details, or change text.

---

## Live Website

**https://gauravsc-alc.github.io/amd.home/**

---

## How It Works

```
content/ JSON + MD files
         |
         v
Django renders templates
         |
    python build.py
         |
         v
    docs/  (static HTML + assets)
         |
         v
  GitHub Pages serves docs/
```

---

## Project Structure

```
amd.home/
│
├── content/                     ← ALL YOUR EDITABLE CONTENT
│   ├── config.json              │  Site title, contact, stats, hero text
│   ├── portfolio.json           │  Portfolio projects (add yours here)
│   ├── services.json            │  Service card content
│   ├── process.json             │  Process steps
│   └── pages/
│       └── home.md              │  About section (Markdown)
│
├── static/images/               ← DROP YOUR PHOTOS HERE
│   ├── hero.svg                 │  Main hero image (1920x900)
│   ├── expertise-*.svg          │  Service card images (800x450)
│   └── portfolio/
│       └── *.svg                │  Project photos (800x600 or 1200x675)
│
├── amd_site/                    ← Django project (settings, urls, wsgi)
├── site_app/                    ← Django app (views, content_loader)
├── templates/                   ← HTML templates (base + 10 includes)
├── static/css/style.css         ← All styles
├── static/js/main.js            ← Portfolio filter, lightbox, nav
│
├── build.py                     ← Generates docs/ from Django
├── run_local.py                 ← Starts local dev server
├── generate_placeholders.py     ← Creates SVG placeholder images
├── manage.py                    ← Django management CLI
├── requirements.txt             ← Python dependencies
└── .github/workflows/deploy.yml ← Auto-builds and deploys on git push
```

---

## Local Development

### Prerequisites
- Python 3.8 or higher
- pip (comes with Python)

### Step 1 — Install dependencies

```bash
pip install -r requirements.txt
```

### Step 2 — Generate placeholder images (first time only)

```bash
python generate_placeholders.py
```

### Step 3 — Start the dev server

```bash
python run_local.py
```

Open **http://127.0.0.1:8000/** in your browser.

The server reloads automatically when you edit templates or Python files.
When you edit JSON content files, refresh the browser to see changes.

---

## Building the Static Site Locally

```bash
python build.py
```

Output goes to `docs/`. Open `docs/index.html` in a browser to preview the exact production build.

---

## Adding a New Portfolio Project

### Step 1 — Add your photo

Drop your photo into `static/images/portfolio/`:

```
static/images/portfolio/bungalow-villa.jpg
```

Recommended sizes:
- Regular card: **800 × 600 px**
- Wide card (spans 2 cols): **1200 × 675 px**

### Step 2 — Add an entry to `content/portfolio.json`

Open `content/portfolio.json` and add a new object:

```json
{
  "image":          "images/portfolio/bungalow-villa.jpg",
  "category":       "bungalow",
  "category_label": "Bungalow Design",
  "title":          "Green Valley Bungalow",
  "location":       "Kothrud, Pune",
  "wide":           false
}
```

Set `"wide": true` to make the card span two columns (good for landscape photos).

**Categories:** `bungalow` · `terrace` · `elevation` · `pergola` · `living` · `kitchen` · `bedroom`

### Step 3 — Preview and push

```bash
python run_local.py           # check locally
git add .
git commit -m "Add Green Valley Bungalow project"
git push
```

GitHub Actions builds and deploys automatically — live in about 60 seconds.

---

## Editing Site Settings

Open `content/config.json` and update any value:

```json
{
  "title": "AMD Home Interiors",
  "contact": {
    "phone": "+91 98765 43210",
    "email": "your@email.com",
    "location": "Pune, Maharashtra"
  },
  "stats": [
    { "number": "75+", "label": "Projects Completed" }
  ]
}
```

---

## Editing the About Section

Open `content/pages/home.md` — it's a standard Markdown file:

```markdown
## About AMD Home Interiors

We specialise in bungalow design, terrace spaces ...

> "A well-designed home makes everyday life better."

- Point 1
- Point 2
```

---

## Editing Service Cards

Open `content/services.json`. Each object is one card:

```json
{
  "id":          "bungalow",
  "icon":        "&#127968;",
  "title":       "Bungalow Design",
  "description": "Your updated description here.",
  "image":       "images/expertise-bungalow.svg"
}
```

Replace the `.svg` image path with a real photo path when ready.

---

## Connect the Contact Form

The form works client-side by default (shows a thank-you message).
To receive real emails:

1. Sign up at **[Formspree.io](https://formspree.io)** (free plan available)
2. Create a form — copy your endpoint URL
3. Open `templates/includes/contact.html` and add:
   ```html
   <form class="contact__form" action="https://formspree.io/f/YOUR_ID" method="POST">
   ```
4. Remove the `id="contactForm"` attribute and the JS submit handler in `static/js/main.js`

---

## GitHub Pages Deployment (One-Time Setup)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **`gh-pages`** / **`/ (root)`**
5. Save

After that, every push to `main` triggers the GitHub Actions workflow (`deploy.yml`), which:
1. Installs Python dependencies
2. Regenerates placeholder images
3. Runs `python build.py` to generate `docs/`
4. Deploys `docs/` to the `gh-pages` branch

---

## Regenerating Placeholders

If you need fresh placeholder SVGs (e.g. after adding a new portfolio entry before you have real photos):

```bash
python generate_placeholders.py
```

This overwrites existing `.svg` files in `static/images/` and `static/images/portfolio/`.
Real photos (`.jpg`, `.png`, `.webp`) are **not** affected.

---

## Python Dependencies

| Package | Version | Purpose |
|---|---|---|
| Django | >=4.2 | Template rendering, URL routing, test client |
| Markdown | >=3.5 | Converts `content/pages/*.md` to HTML |

Install with:
```bash
pip install -r requirements.txt
```
