# Website features and configuration

Edit [content/config.json](../content/config.json), not the generated HTML. The active site is the Django build using `templates/`, `content/`, and `static/`. The older Jekyll `_includes/`, `_data/`, and `assets/` directories are not used by that build.

## Turn the portfolio on or off

The following object already exists in `content/config.json`. Change its boolean value; do not replace the entire configuration file with this snippet.

```json
"portfolio": {
  "enabled": false
}
```

- `true`: publish the portfolio, individual project pages, navigation links, and gallery lightboxes.
- `false`: omit portfolio links, the home project preview, project pages, and their sitemap entries. The main hero button points to Services instead. Django returns 404 for unpublished portfolio routes.
- Use JSON booleans, not strings such as `"false"`. If the setting is absent, the portfolio remains enabled for compatibility with older configurations.

Refresh the Django preview after editing. For the static website, rebuild and redeploy before the change appears.

### Hide just one project

In [content/portfolio.json](../content/portfolio.json), add `"enabled": false` to that project's existing object. Set it to `true`, or remove the field, to publish the project. Its other fields stay unchanged.

The portfolio has one linked card per source project folder. Five folders contain 53 images in total; Project 5 has an empty, coming-soon page. Each project opens a separate HTML page with its room groups and images. The original `mujeet yelanka` folder is displayed as Project 6. See the [Project Gallery and Import Guide](./PROJECT_GALLERY_GUIDE.md) to import the next batch or edit the nested project data. Old flat placeholder entries have been replaced, not republished.

Visibility is not access control: hidden projects' image files are still copied into the static build and can be accessed by URL. Remove confidential files from the repository and deployment rather than relying on these switches.

## Expertise images

In [content/services.json](../content/services.json), use `"image": "images/portfolio/your-photo.jpg"`. Copy the photo into `static/images/portfolio/` first. The three interior services display the imported project renders first.

An empty `image` value intentionally renders an exterior service panel with “Project images coming soon,” not a broken image or a mislabeled interior photo. Add appropriate bungalow, terrace, elevation, and pergola photos to replace those panels. The service itself remains available in the enquiry form.

## Animation switch

```json
"animations": {
  "enabled": true
}
```

Set it to `false` to disable animated transitions. The site also respects the visitor's reduced-motion preference. Animations include the hero entrance, section reveals, image hover effects, and the lightbox entrance. Content stays visible if animation support or JavaScript is unavailable.

The homepage also plays Architecture, Living, Kitchen, and Bedroom concept assemblies in order (6.2 seconds each, once). Pause/Resume, Replay all, and manual scene selection keep the experience controllable. Offscreen/hidden-tab playback pauses; reduced motion or the feature switch shows static artwork. These are clearly labelled illustrations, not client photographs. See the [animation maintenance guide](./NAVIGATION_AND_ANIMATION_GUIDE.md) and [AI agent handbook](./AI_AGENT_GUIDE.md).

The lightbox supports keyboard activation, Escape, previous/next arrows, trapped focus, and focus restoration. Previous/next stays inside the selected project's page. Project navigation works without JavaScript; image links then open the JPEG directly. Project titles remain visible on touch screens. A reading-progress indicator and back-to-top link support longer pages.

## Virtual tour and chatbot

- [Enable a 360-degree/VR tour](./VR_SETUP_GUIDE.md): the configurable tour link is implemented; you must supply and publish the tour.
- [Connect a local Ollama chatbot](./OLLAMA_CHATBOT_GUIDE.md): implementation and deployment plan only. No chat widget, backend endpoint, or public tunnel is enabled by these changes.

## Enquiry form

The form prepares an email draft using `contact.email`. The visitor must review and send it in their email app. It does not claim that a message was delivered and does not store enquiries. An email application is required; the contact email link remains available as a fallback.

## Preview, build, and publish

From the repository root, using the project's Python environment:

```powershell
.\.venv\Scripts\python.exe run_local.py
```

Preview at `http://127.0.0.1:8000/`. Stop with Ctrl+C, then build:

```powershell
.\.venv\Scripts\python.exe build.py
git status --short
git add content templates static site_app amd_site scripts build.py .gitignore documentation README.md index.html
git commit -m "Update website features and images"
git push
```

The build replaces `docs/` and generated root preview pages; preserve any manual edits there first. It also writes `sitemap.xml`. Review staged changes before committing. A push to `main` triggers the existing deployment workflow. Confirm its success in Actions. Nothing on your local drive is uploaded until you commit and push it.

Before publishing, check expertise images, each project's room galleries, mobile navigation, keyboard lightbox controls, and both values of `portfolio.enabled`. Verify the hero CTA and footer do not point to a hidden portfolio.
