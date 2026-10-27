# Pages, project navigation, and the home-building animation

The site now uses real HTML pages rather than one long homepage. Navigation items are ordinary links, not JavaScript-only tabs, so direct links, browser Back/Forward, new tabs, and no-JavaScript browsing remain available.

| Navigation | Generated file |
| --- | --- |
| Home | `index.html` |
| Services | `services.html` |
| Projects | `portfolio.html` |
| Our Process | `process.html` |
| About | `about.html` |
| Contact | `contact.html` |
| Individual project | `gallery-<slug>.html`, for example `gallery-project-1.html` |

Each project page contains its room galleries, project-switching links, previous/next navigation, and full-size image viewer. Project 5 retains its honest empty state. The original source folder `mujeet yelanka` displays as **Project 6**. Its optional `slug` is `project-6`; the source identity and existing asset filenames are retained for repeat imports. Changing a title does not rename files on the H: drive.

## Edit content without changing routes

- General page titles, headings, and search descriptions: [content/page_metadata.json](../content/page_metadata.json).
- Project title, description, optional `slug`, numeric display `order`, rooms, images, and visibility: [content/portfolio.json](../content/portfolio.json). Lower order values display first; projects without an order follow the configured ones.
- Site title, contact information, social profiles, public URL, and feature switches: [content/config.json](../content/config.json).
- Layout and illustrations: [templates/](../templates/), [styles](../static/css/style.css), and [interaction code](../static/js/main.js).

Use unique lowercase project slugs containing letters, digits, and single separating hyphens. The importer preserves an explicitly configured slug. If absent, the source project's existing `id` is used. Slugs determine public URLs; changing one breaks old external links unless you arrange a redirect separately. Update social posts and search-console records when necessary.

`portfolio.enabled: false` removes the Projects navigation, project links, all gallery pages, and their sitemap entries on the next build. A single project's `enabled: false` has the same effect for that project. Django returns 404 for unpublished project URLs. Images remain public assets if still deployed; these controls are not access security.

## Sequential portfolio concept animation

The homepage plays four original SVG concepts **one after another**, once per page visit. Each scene takes 6.2 seconds, including time to appreciate the completed illustration: about 24.8 seconds total, excluding pauses.

| Order | Concept | Assembly details |
| --- | --- | --- |
| 1 | Architecture | Blueprint, foundation, walls, windows, upper floor, roof, planting, warm lights |
| 2 | Living room | Floor, walls, window and artwork, rug and sofa, coffee table and plant, pendant light |
| 3 | Kitchen | Floor, walls, upper cabinets, countertop and sink, island and accessories, pendant light |
| 4 | Bedroom | Floor, walls, curtains and wardrobe, bed and bedding, bedside furniture, pendant light |

It uses local SVG, CSS, and a small JavaScript controller, not an external plugin or paid animation service. It is conceptual artwork, clearly described as such; it does not replace any supplied project images.

- Set `animations.enabled` to `false` in the existing configuration to disable motion.
- **Pause / Resume** freezes both the assembly and the scene countdown. **Replay all** restarts at Architecture. At the end, **Play again** restarts; it does not loop forever.
- Scene buttons immediately show a completed illustration and pause the sequence. Resume animates that scene, then continues with subsequent scenes. Keyboard users can Tab to each button and press Enter or Space; focus is never moved by playback.
- Playback suspends when the figure is less than 12% visible or the browser document is hidden, preserving remaining time. Returning does not override an intentional user pause.
- Initial layout, scrolling, resizing, and window load also check visibility directly, so playback does not depend on the first IntersectionObserver callback arriving. Scroll the illustration into view on smaller screens; intentionally offscreen animation remains paused.
- A visitor's reduced-motion preference disables animation and hides playback controls. Scene buttons still switch completed illustrations. Turning motion off mid-playback stops the sequence; turning it back on requires Resume if playback had already started.
- Without JavaScript, the fully assembled house remains visible and nonfunctional controls stay hidden; the ordinary portfolio link still works.
- Page headings, cards, and images retain restrained entrance and hover animations.

The link beneath the concepts opens the real portfolio, or Services when the portfolio is disabled. The scenes represent design categories, not a particular client's images; importing photos does not regenerate the SVG artwork. This keeps private project visibility independent from the concept sequence.

### Change timings, artwork, or add another scene

1. Edit [house-build.html](../templates/includes/house-build.html) for the architecture illustration, scene order, labels, and controls. Room artwork lives in [concept-room.html](../templates/includes/concept-room.html).
2. Set each panel's `data-duration` in milliseconds to a positive number. Keep it longer than the final layer delay plus its 0.5-second animation and a comfortable viewing interval. Current architecture ends assembly at 4.4 seconds; rooms at 4.1 seconds.
3. Each SVG group with `build-layer` uses `--build-delay` and `--build-offset`. Change these in the template. The `.blueprint-trace` paths draw first. Keep artwork complete without animation styles; do not make default opacity zero.
4. To add a room type, add an explicit conditional branch to the room include (the current final branch is bedroom). Add its include before the caption, with a unique room key and accessible title. Add exactly one matching scene button in the same order, with `aria-controls="concept-KEY"` and `aria-pressed="false"`. Every panel except the first starts with `hidden`.
5. Update the initial static edition count and the table above. The controller reads the panel order and durations; no hard-coded JavaScript scene list needs changing.
6. Preserve unique SVG IDs. Room panels share the grid and gradient definitions in the first SVG; retain those definitions if replacing Architecture.
7. Animation styles and controller live in [style.css](../static/css/style.css) and [main.js](../static/js/main.js). Keep the CSS duration and JavaScript countdown connected through `--scene-duration`. Do not add independent repeating timers or remote animation plugins.
8. Rebuild and verify order, end state, pause/resume, replay, manual selection, offscreen and hidden-tab pauses, reduced motion, motion disabled, no JavaScript, and widths 320/390/768/1366. Check console errors, unique IDs, focus visibility, and that only one panel is visible. See the [agent exercises](./AI_AGENT_TRAINING.md) for acceptance checks.

## Preview, build, and deploy

Use `python run_local.py` as before; Django now serves all `.html` routes. `python build.py` renders the enabled pages plus `sitemap.xml`, copies `static/`, and refreshes the repository-root preview copies. All internal page and asset links remain relative so GitHub project subpaths work.

Generated pages under `docs/` are ignored by Git. Root preview pages and `.generated-pages.json` are also ignored, except the existing tracked `index.html`. The manifest identifies previously generated root copies so an unpublished project's old preview file can be removed on rebuild. Do not edit generated output or keep original content there. Build after cloning before using a root-folder static preview.

Commit source changes, including `site_app/`, `amd_site/`, templates, content, static assets, importer, `build.py`, and `.gitignore`. The existing workflow builds everything on a push to `main`; no additional hosting service is needed. Search-engine verification and social-account setup are separate owner actions described in the [search guide](./SEARCH_AND_AI_INDEXING_GUIDE.md) and [social guide](./SOCIAL_MEDIA_SETUP_GUIDE.md).
