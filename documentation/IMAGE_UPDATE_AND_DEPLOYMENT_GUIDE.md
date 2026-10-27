# Image Update and Deployment Guide

This project uses Django templates and JSON content files to generate a static website. You can update images by copying them into the repository and editing the JSON files; no template or Python changes are needed. GitHub Pages serves the generated static site, not a running Django server.

## Where Images Live

- Hero image path: `content/config.json`, under `hero.image`
- Service image paths: `content/services.json`, under each service's `image`
- Portfolio image paths: `content/portfolio.json`, under each project's `cover` and `rooms[].images[].image`
- Image files: `static/images/`, `static/images/portfolio/`, and `static/images/projects/`

Some SVG files are placeholders; the existing interior photos are JPEG files in `static/images/portfolio/`. Any of these image files can be reused for the hero, services, or portfolio. For future updates, copy photos from your project folders into `static/images/` before referencing them; files on another drive are not included in the repository or deployment.

Paths in JSON are relative to `static/`, start with `images/`, and must match the filename and capitalization exactly. Do not use a drive path, `static/` prefix, or leading slash. Supported formats include `.jpg`, `.png`, and `.webp`.

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

3. Update only the `image` value inside the existing `hero` object, leaving its other fields unchanged:

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

The active Django site shows configured project images first. An empty `image` value displays an intentional “Project images coming soon” panel, so unavailable exterior photos are not replaced with unrelated interior renders. Set the image path once the appropriate photo is available.

1. Add your service images to `static/images/`.

2. Open `content/services.json`.

3. Update the `image` field of the appropriate service, leaving its other fields unchanged. For example:

   ```json
   {
     "title": "Modular Kitchen",
     "image": "images/kitchen-project.webp"
   }
   ```

## Update Portfolio Images

Each top-level source folder becomes a clickable project with a separate HTML page containing all imported images grouped by room subfolder. Project 1 includes all nine images, not just its former selected cover photos. Empty folders have an explicit coming-soon state. The original `mujeet yelanka` folder is publicly named Project 6.

Follow the [Project Gallery and Import Guide](./PROJECT_GALLERY_GUIDE.md) for the full data format, image inventory, and manual editing instructions. To switch the entire portfolio on/off, or hide a single project, see [Website Features and Portfolio Switch](./WEBSITE_FEATURES.md).

For the next batch, add photos under the appropriate project/room folder on your source drive, then run from the repository root in Windows PowerShell:

```powershell
.\scripts\import-project-images.ps1 -SourceRoot 'H:\Rekha_Projects\my projects'
.\.venv\Scripts\python.exe run_local.py
```

The importer creates optimized repository-owned JPEGs and updates `content/portfolio.json`. It preserves existing project titles, descriptions, visibility switches, room/image titles, and valid cover selections. It does not change originals. Stop the preview with Ctrl+C, build, review, commit, and push using the existing workflow.

Previously selected files under `static/images/portfolio/` remain in place because the hero and expertise cards use them. The old flat one-image portfolio format has been replaced by project objects with room/image arrays; do not add flat entries to the new JSON.

## Preview Changes Locally

Run the Django development server from the repository root:

```bash
python run_local.py
```

Open `http://127.0.0.1:8000/`. Refresh the browser after editing JSON or adding images. This preview reads the source files directly and does not require a static build.

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

This deletes and recreates `docs/`, renders all enabled HTML pages and the sitemap, then mirrors generated pages to the repository root for preview. Back up any changes in generated files before running the build. `docs/` and additional root preview pages are ignored by Git; do not keep original images or content there. See [Page Navigation and Animation](./NAVIGATION_AND_ANIMATION_GUIDE.md).

## Deploy Updates

After checking the site locally:

```bash
git add content templates static site_app amd_site scripts build.py .gitignore documentation README.md index.html
git commit -m "Update website images and content"
git push
```

Make sure the copied images appear in `git status` before committing. A push to `main` triggers the existing GitHub Actions workflow, which builds the site and publishes `docs/` to the `gh-pages` branch. Check the Actions tab for success and ensure GitHub Pages is configured to serve that branch. The workflow can also be started manually from the Actions tab; a local build is useful for previewing but is not required for that workflow.

The workflow regenerates placeholder SVGs, so do not replace placeholder `.svg` files with custom SVG artwork under the same names. Use new filenames and update the JSON paths instead; JPG, PNG, and WebP files are not overwritten by the placeholder generator.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Image does not show | Confirm the file exists under `static/images/` and the JSON path starts with `images/` |
| Works locally but not on GitHub Pages | Confirm the image and JSON changes were committed and pushed, including exact filename capitalization |
| Old image still appears | Hard refresh the browser with `Ctrl+Shift+R` |
| Build removes files in `docs/` | This is expected. Keep source files in `static/`, `content/`, and `templates/` |
| Images look stretched | Use the recommended aspect ratios above |

