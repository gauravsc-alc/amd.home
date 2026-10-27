# Project folders and image galleries

The active Django website reads [content/portfolio.json](../content/portfolio.json). Each card opens its own HTML project page with room groups, image captions, project-switching links, and a full-size image viewer. Navigation uses ordinary links and works without JavaScript. With JavaScript, the viewer's previous/next buttons stay inside the selected project. See [Page Navigation and Animation](./NAVIGATION_AND_ANIMATION_GUIDE.md).

## Imported inventory

All 53 JPG/JPEG/PNG images found under `H:\Rekha_Projects\my projects` were imported as web-optimized JPEGs. Originals remain untouched on the source drive.

| Source folder | Images | Website behavior |
| --- | ---: | --- |
| mujeet yelanka | 6 | Public title Project 6; kids bedroom gallery |
| project 1 | 9 | Overview, bedroom 2, kitchen |
| project 2 | 14 | Kids bedroom, kitchen, master bedroom, bedroom 3, TV unit |
| project 3 | 11 | Living/dining, kids bedroom, kitchen, master bedroom |
| project 4 | 13 | Living/dining, kids bedroom, kitchen, master bedroom |
| project 5 | 0 | Clickable coming-soon card; no invented images |

`Kids_Bedroom_Renders.pdf` is a document, not an image, and is excluded. No exterior images were supplied; the expertise section still labels missing exterior images honestly.

Repository copies live under [static/images/projects/](../static/images/projects/). They are JPEG quality 85 with a maximum dimension of 1920 pixels, preserving aspect ratio without upscaling. This is every supplied image, not a byte-for-byte archive of large original files. EXIF orientation is applied, metadata is not copied, and transparent areas are flattened onto white. Original working files should remain backed up separately.

## Add the next batch using the existing workflow

1. Keep all projects under a single source root. Add a top-level folder for a new project and optional subfolders for rooms. Put JPG, JPEG, or PNG files inside. Nested room folders are supported. Images directly inside a project appear under **Project Overview**.
2. From the repository root in **Windows PowerShell**, run:

   ```powershell
   .\scripts\import-project-images.ps1 -SourceRoot 'H:\Rekha_Projects\my projects'
   ```

   Use another source root if the drive changes. No local drive path is needed at runtime or on GitHub Actions. If PowerShell blocks the script, review its contents and use your organization's approved script execution policy; do not weaken the machine-wide policy.

3. Optionally edit project titles, descriptions, visibility, room labels, image captions, and covers in [content/portfolio.json](../content/portfolio.json).
4. Preview with Django, exactly as before:

   ```powershell
   .\.venv\Scripts\python.exe run_local.py
   ```

5. Stop the preview with Ctrl+C, then build:

   ```powershell
   .\.venv\Scripts\python.exe build.py
   git status --short
   git diff --stat
   ```

6. Check each project and its image count, then publish when ready:

   ```powershell
   git add content templates static site_app amd_site scripts build.py .gitignore documentation README.md index.html
   git diff --cached --stat
   git commit -m "Update project galleries and images"
   git push
   ```

A push to `main` invokes the existing GitHub Actions workflow. It builds from repository content and deploys to `gh-pages`; neither the H: drive nor PowerShell is needed by the hosted website. Check the Actions result. The ignored `docs/` output is recreated by the build; never store originals there.

## Repeat imports and file safety

- The importer rebuilds the project list from the **entire source root**. Do not point it at just Project 1 or a temporary subset if you want to retain all projects.
- Every supported source file gets one deterministic repository path. Relative-path hashes distinguish files such as `kitchen/1.png` and `kids room/1.png` without overwriting one another. Project folders whose names produce the same URL ID cause an error rather than a silent merge.
- Repeat imports preserve project `title`, `description`, `enabled`, optional public URL `slug` and numeric display `order`, room titles, image titles, and an existing `cover` if that image is still present. Do not change `source_folder`, image `source`, or generated IDs if you want those settings matched on the next import. Public titles do not rename your source folders.
- Adding photos to Project 5 automatically replaces its placeholder with a real cover and gallery.
- Removed or renamed source folders/files disappear from the new JSON. Old repository JPEGs are deliberately **not deleted**. Review stale files manually before deleting anything, especially photos referenced by the hero or services.
- The importer reports unsupported files (including PDF/WebP/HEIC); convert those to PNG/JPEG first if you want the importer to include them. Manually configured website images may also be WebP.
- The script overwrites only its generated JPEG paths and the portfolio JSON. Back up or commit custom changes before importing. If processing fails, the JSON is not replaced until every image has been processed, but some generated JPEGs may already have been refreshed; fix the source image and rerun before building.
- Optional `-MaxDimension 2560 -Quality 90` exports higher-resolution, larger images. Defaults are intended to keep deployment size reasonable.

## Content format and manual updates

The top-level JSON array contains projects, not individual photographs. A project has this shape (the sample path must be replaced with a real repository image):

```json
{
  "id": "project-1",
  "source_folder": "project 1",
  "title": "Project 1",
  "description": "Explore the living spaces, bedrooms, and kitchen.",
  "enabled": true,
  "cover": "images/projects/project-1/overview/your-photo.jpg",
  "image_count": 1,
  "rooms": [
    {
      "id": "overview",
      "title": "Project Overview",
      "source_folder": "",
      "images": [
        {
          "image": "images/projects/project-1/overview/your-photo.jpg",
          "title": "Living Room",
          "source": "living room.png",
          "width": 1920,
          "height": 1080
        }
      ]
    }
  ]
}
```

Use unique, URL-safe project IDs and room IDs. Image and cover paths are relative to `static/`, with forward slashes and exact filename capitalization. If adding manually, set the actual dimensions and keep `image_count` equal to the total number of images in the rooms. Do not fabricate client details or locations. Set `cover` to an image path already in that project's gallery.

For an empty project use `"cover": ""`, `"image_count": 0`, and `"rooms": []`. To hide an entire project set `"enabled": false`; the importer preserves that switch. To hide all projects, set `portfolio.enabled` to `false` in [content/config.json](../content/config.json). See [Website Features](./WEBSITE_FEATURES.md). Hiding is not access control: files remain publicly accessible if deployed.

Link to `portfolio.html` or a project page such as `gallery-project-1.html`. A room fragment can be appended using that room's ID. The optional project `slug` controls its filename (`gallery-<slug>.html`); if absent, the existing project `id` is used. Slugs must be unique and URL-safe. Project 6 uses `"slug": "project-6"`, while retaining the original source folder mapping. Old homepage fragment links are no longer project permalinks. Captions and room labels can be edited without changing templates or Python. Previously selected JPEGs under `static/images/portfolio/` remain for the existing hero and expertise cards.
