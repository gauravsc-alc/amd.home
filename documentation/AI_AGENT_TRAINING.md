# AI agent training exercises and acceptance checks

These are onboarding exercises for Claude Code and OpenAI Codex, not model weights, a fine-tuning dataset, or visitor-chatbot training. Use them with [the shared handbook](./AI_AGENT_GUIDE.md) and [repository instructions](../AGENTS.md). Run exercises only when requested, preferably on a safe local copy; a checklist does not authorize edits, uploads, or deployment.

## Starter prompt for either coding agent

```text
Read AGENTS.md, CLAUDE.md if applicable, documentation/AI_AGENT_GUIDE.md,
and the guide relevant to my task. Inspect the existing working changes.
Explain which source files control the requested behavior, preserve the
Django-to-static GitHub Pages workflow, and propose focused acceptance checks.
Implement only the requested change. Do not commit, push, publish, upload
client assets, expose services, or add dependencies without my approval.
At handoff list the changed files, checks actually run, and remaining risks.
Task: [describe the exact outcome and approved inputs here]
```

## Exercise 1: Repository understanding, no edits

**Prompt:** Explain how a project photo becomes a public gallery page, where to change a public title, and whether GitHub Pages runs Django.

**Expected answer:** Originals go through the PowerShell importer into repository-owned optimized images plus a JSON manifest. Django renders templates; the build exports static pages. Public title and slug are separate from source identity. GitHub Pages serves the output, not a running Python/Django backend.

**Pass:** Agent names the active files, distinguishes legacy/generated files, and makes no edits. **Fail:** It changes legacy Jekyll data, invents a backend, or assumes the H: drive exists in production.

## Exercise 2: Update a portfolio description

**Prompt:** Change only Project 1's description to the approved wording I provide. Preserve IDs, source folders, image paths, slug, cover, and order. Rebuild and verify the corresponding gallery.

**Pass:** Only intended content/source and expected generated output change; the gallery and portfolio card still link correctly. Agent does not rewrite other projects or invent client facts.

## Exercise 3: Repeat an image import

**Prompt:** After I approve a new photo in the full source folder, use the existing importer, preserve my custom titles and visibility settings, rebuild, and report the changed image counts.

**Checks:** Record manifest counts before/after; verify new image decoding and dimensions, stable existing source mapping, preserved edited metadata, valid cover, no external drive paths in HTML, and repository assets copied to `docs/static/`. Do not assume the initial 53-image count is permanent. If the H: drive is unavailable, report the missing input rather than overwriting the manifest or fabricating photos.

## Exercise 4: Extend the sequential concepts

**Prompt:** Add a study-room concept after Bedroom using the local SVG style. Keep manual selection, pause/resume/replay, motion preferences, and the portfolio visibility fallback. Update the animation documentation.

**Expected scope:** Scene template, matching selector, explicit new artwork branch, initial edition count, styles only if needed, generated output, and guide. Do not alter the importer or existing project images.

**Acceptance matrix (current four-scene baseline):**

| Scenario | Expected observation |
| --- | --- |
| Fresh visible page, normal motion | Architecture -> Living -> Kitchen -> Bedroom, 6.2 seconds each |
| IntersectionObserver unavailable or callbacks delayed | Direct initial/scroll/resize visibility checks still start and pause the concept sequence |
| Last scene completes | Bedroom remains assembled, Play again appears; no endless loop |
| Pause during a delayed layer | Artwork and countdown freeze; Resume continues the remaining time |
| Replay from any state | Architecture restarts; no duplicate timers or skipped scenes |
| Select Kitchen manually | Complete Kitchen appears, button is pressed, playback waits for Resume |
| Resume after manual selection | Kitchen assembles, then Bedroom follows; no unexpected focus movement |
| Scroll offscreen / return | Progress is held while offscreen and resumes only if not user-paused |
| Switch browser tabs / return | Same preservation while the document is hidden |
| Reduced-motion preference at load | No autoplay, no playback controls; static scene selection works |
| Enable reduced motion mid-playback | Active scene becomes fully assembled; sequence stops |
| Restore normal motion | No surprise restart after a previously started sequence; Resume is available |
| `animations.enabled: false` | Static illustration and selectors; no motion |
| JavaScript disabled | Complete Architecture remains, controls hidden, normal page links work |
| Portfolio disabled | Concept CTA opens Services; no hidden-gallery link leaks |
| Keyboard-only interaction | Controls reachable, focus visible, Enter/Space activate; focus never auto-moves |
| 320/390/768/1366 widths | Readable controls, stable illustration frame, no horizontal overflow |
| DOM/assets | Unique IDs, one visible panel, no console errors or missing resources |

Adjust the expected sequence/count only when a new scene is approved. Record observed timings with reasonable browser scheduling tolerance, not millisecond-perfect wall-clock assumptions. Check screenshots as well as DOM state: valid markup does not prove a good visual result.

## Exercise 5: Hide and restore a project

**Prompt:** Hide one specified project using its existing enabled flag, rebuild, and verify navigation, routes, and sitemap. Do not delete assets. Restore the original state after a temporary test unless I asked for a permanent change.

**Pass:** Its gallery is omitted from exported pages and sitemap, Django returns 404, and no published navigation references it. Other projects retain their order. The agent explains that existing public images are not access-protected.

## Exercise 6: Prepare an owner-controlled launch checklist

**Prompt:** Read the search/social/VR/chatbot guides and list what I must configure next. Do not create accounts, publish, or start network services.

**Pass:** Agent distinguishes implemented configuration from documented plans, requests only necessary non-secret input, explains GitHub Pages' static limits, and does not promise ranking, model training, working VR assets, or a running chatbot. It never requests credentials in a public repo file.

## Review rubric

Mark each applicable item **pass**, **fail**, or **not checked**, with evidence:

1. Correct source of truth and minimal diff; existing work preserved.
2. Required behavior observed; counts/titles/paths grounded in current files.
3. Accessibility and feature toggles preserved.
4. Build/static links validated; no unsupported deployment claim.
5. Privacy/security and approval boundaries respected.
6. Relevant owner and agent documentation updated consistently.

Any failure involving data loss, private uploads, unauthorized publication, broken image mappings, or inaccessible motion blocks acceptance. Correct the cause and rerun the affected checks; do not hide failures by changing the checklist. A human reviews the final diff before publication.

## Handoff template

```text
Requested outcome:
Source files changed:
Generated outputs refreshed:
Checks performed and observed results:
Not checked / limitations:
Owner actions required:
Deployment: local only / explicitly approved and verified [details]
```
