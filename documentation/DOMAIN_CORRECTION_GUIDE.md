# Correct the website domain after a GitHub push

## The exact names to use

| Purpose | Correct value |
| --- | --- |
| Repository name | `amd.home` |
| Public website | `https://www.amd.homes/` |
| GitHub Pages custom domain | `www.amd.homes` |
| Published branch's CNAME contents | `www.amd.homes` |
| Public URL in content configuration | `https://www.amd.homes` |
| GitHub account hostname for DNS | `gauravsc-alc.github.io` |

`amd.home`, `amd.homes`, and `amd.com` are not interchangeable. This guide uses the website address you supplied: **www.amd.homes**. Do not configure `amd.com` or buy/change a domain to follow these instructions.

## What was checked

- The live `https://www.amd.homes/index.html` request returned HTTP 200 without leaving that domain.
- Requests to `https://amd.homes/` and `https://gauravsc-alc.github.io/amd.home/` ended at `https://www.amd.homes/`.
- The published `gh-pages/CNAME` contained `www.amd.homes`.
- The animation HTML, JavaScript, and CSS were present on the live site; the normalized live JavaScript matched the repository source at inspection.
- The live canonical/social URLs still used the old GitHub project address. That is metadata, not a browser redirect.

An `amd.com` redirect was **not reproduced**. Private GitHub variables, repository Pages settings, and registrar forwarding settings were not accessible or changed. If the problem recurs, capture the complete starting and final URL, the successful deployment run, and the published CNAME at that time. A link clicked from search, a saved bookmark, a registrar forward, and a GitHub Pages redirect need different fixes.

## Why a push could change the custom domain

The previous [deployment workflow](../.github/workflows/deploy.yml) passed `${{ vars.CUSTOM_DOMAIN }}` to its publishing action. This repository variable could replace the CNAME on each deployment. Correcting only Settings > Pages would not correct a wrong value being supplied again by the next build. An empty value could also fail to preserve the intended custom-domain configuration when the publishing branch is replaced.

The workflow now explicitly publishes `cname: www.amd.homes`. That checked-in value is the domain authority for this repository's deployment; an outdated `CUSTOM_DOMAIN` variable no longer overrides it. [content/config.json](../content/config.json) now uses the same public host for canonical URLs, social image URLs, structured data, and the sitemap. Neither change alters DNS or account settings by itself.

## Owner correction checklist

### 1. Review and publish the source fix

Review the changed workflow, configuration, animation controller, documentation, and generated preview. Commit and push only when ready using your normal workflow; no push is performed automatically by the local assistant. A push to `main` runs **Build & Deploy to GitHub Pages**.

Confirm that the successful run contains `cname: www.amd.homes`. If you maintain other workflows or automation that publish to `gh-pages`, check that they do not overwrite CNAME afterward.

### 2. Check GitHub repository settings

Open repository `gauravsc-alc/amd.home` and select **Settings > Pages**:

```text
Source: Deploy from a branch
Branch: gh-pages
Folder: / (root)
Custom domain: www.amd.homes
```

Do not select `main /docs`: this repository ignores generated `docs/` on the source branch and the existing action publishes its contents to `gh-pages`. Do not switch to a different deployment model just to fix the domain.

Under **Settings > Secrets and variables > Actions > Variables**, review any old `CUSTOM_DOMAIN`. It is no longer consumed by this workflow. Remove it only if no other workflow uses it, or set it to `www.amd.homes` to avoid confusing future maintainers. Do not edit unrelated account or repository variables.

### 3. Check DNS and forwarding at the registrar

Before changing DNS, confirm the domain is yours, verify ownership in GitHub as recommended by its documentation, and save the current records. Configure the repository's Pages custom domain before pointing new DNS records at GitHub.

For `www.amd.homes`, the CNAME record is:

| Type | Host/name | Target |
| --- | --- | --- |
| CNAME | `www` | `gauravsc-alc.github.io` |

The target contains no `https://`, repository path, or `/index.html`. Do not point the DNS CNAME to `amd.com`. Check registrar forwarding separately: a forward to the wrong website can redirect visitors even when the repository files are correct. Do not delete mail/MX/TXT records or unrelated DNS entries.

The apex `amd.homes` already redirected correctly during inspection. If it later fails, use GitHub's official apex-domain DNS instructions linked below rather than guessing IP addresses. Keep `www.amd.homes` as the Pages custom domain if that is the desired primary host. Allow DNS verification and certificate provisioning to finish, then enable **Enforce HTTPS** when available.

### 4. Verify after the deployment completes

1. Check the latest Actions run succeeded for the commit you intended to publish.
2. Select the `gh-pages` branch and open `CNAME`; it must contain only `www.amd.homes`.
3. Open `https://www.amd.homes/index.html` in a private window. The address should remain on that host.
4. Open `https://amd.homes/` and the GitHub project URL; both should lead to the intended public host.
5. View page source: canonical and social URLs should start with `https://www.amd.homes`, and sitemap locations should use that host.
6. Confirm `static/js/main.js` and `static/css/style.css` return JavaScript/CSS, not a 404 or HTML page.
7. Scroll to the concept illustration. With normal motion enabled it should progress through the four scenes. Check Pause/Resume and Replay. Reduced-motion mode intentionally shows static artwork.

If the page is stale, first confirm the right commit deployed, then hard-refresh (Ctrl+Shift+R) or use a private window. Do not change DNS merely to clear a browser asset cache.

## Why the gitignore is correct

[.gitignore](../.gitignore) excludes generated `docs/` and root preview copies. It does **not** exclude [main.js](../static/js/main.js), [style.css](../static/css/style.css), or the [concept templates](../templates/includes/house-build.html). These tracked source files are built and copied into the published output by Actions. Do not force-add `docs/` or remove its ignore rule for this deployment method. Gitignore rules do not set or redirect domain names.

## Future domain changes

Change the workflow's `cname` and configuration's `site_url` together, then update Pages settings and DNS with owner approval. Rebuild and verify canonical URLs, sitemap, CNAME, and redirects. Keep this guide and the README consistent. Do not use the legacy Jekyll `_config.yml` to configure the active Django build.

## Official references

- [GitHub: managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub: verifying your custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Deployment action: CNAME option](https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-add-cname-file-cname)
