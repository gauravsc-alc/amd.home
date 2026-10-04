# Image Update and Deployment Guide

This project uses Django templates and content files to generate a static website. Edit the source files, run the build, then publish the generated output.

## Where Images Live

- Hero image: `static/images/hero.svg`
- Service images: `static/images/expertise-*.svg`
- Portfolio images: `static/images/portfolio/`

The current SVG files are placeholders. You can replace them with real `.jpg`, `.png`, or `.webp` files.

## Recommended Image Sizes

- Hero: `1920 x 900` or wider landscape image
- Service cards: `800 x 450`
- Regular portfolio cards: `800 x 600`
- Wide portfolio cards: `1200 x 675`

Use optimized images where possible. WebP is preferred for production because it loads faster.

## Update the Hero Image

1. Add the new image to `static/images/`, for example:

   ```text
   static/images/hero-living-room.webp
   ```

2. Open `content/config.json`.

3. Update:

   ```json
   "hero": {
     "image": "images/hero-living-room.webp"
   }
   ```

4. Run and preview:

   ```bash
   python run_local.py
   ```

## Update Service Images

1. Add your service images to `static/images/`.

2. Open `content/services.json`.

3. Update each `image` field:

   ```json
   {
     "title": "Modular Kitchen",
     "image": "images/kitchen-project.webp"
   }
   ```

## Update Portfolio Images

1. Add photos to `static/images/portfolio/`.

2. Open `content/portfolio.json`.

3. Update or add project entries:

   ```json
   {
     "image": "images/portfolio/whitefield-villa.webp",
     "category": "bungalow",
     "category_label": "Bungalow Design",
     "title": "Whitefield Villa",
     "location": "Bangalore, Karnataka",
     "wide": true
   }
   ```

Use `"wide": true` only for strong landscape images.

## Update Social Links

Open `content/config.json` and replace `#` with the real profile URLs:

```json
"social": {
  "instagram": "https://instagram.com/your-profile",
  "whatsapp": "https://wa.me/919035116542",
  "facebook": "https://facebook.com/your-page",
  "linkedin": "https://linkedin.com/company/your-company"
}
```

All configured social accounts render automatically in the contact section and footer.

## Build the Static Website

Run:

```bash
python build.py
```

This creates the production-ready website in `docs/` and mirrors `docs/index.html` to the root `index.html`.

## Deploy Updates

After checking the site locally:

```bash
git add .
git commit -m "Update website images and content"
git push
```

If GitHub Pages is connected, the website updates after the GitHub workflow or Pages build completes.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Image does not show | Confirm the file exists under `static/images/` and the JSON path starts with `images/` |
| Old image still appears | Hard refresh the browser with `Ctrl+Shift+R` |
| Build removes files in `docs/` | This is expected. Keep source files in `static/`, `content/`, and `templates/` |
| Images look stretched | Use the recommended aspect ratios above |

