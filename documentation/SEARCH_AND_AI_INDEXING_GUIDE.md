# Search engines and AI discovery

This guide covers the Django-to-static website in this repository. It does **not** register your website, verify accounts, submit URLs, or guarantee rankings. Complete the account steps yourself after publishing. Prepared October 28, 2026: Google's AI/verification guidance and OpenAI's crawler documentation were directly reviewed. Some linked Bing and Pinterest help pages did not load during review; confirm their current account-specific instructions when setting up verification.

## 1. What the website now generates

- Separate, directly accessible HTML pages for Home, Services, Projects, Our Process, About, Contact, and each enabled project.
- Unique page titles and descriptions from [content/page_metadata.json](../content/page_metadata.json). Project metadata uses its `title` and `description` in [content/portfolio.json](../content/portfolio.json).
- Canonical URLs, Open Graph and Twitter-card metadata, with a project cover or the configured hero image for sharing.
- Organization JSON-LD populated from actual site configuration, including configured social profile URLs in `sameAs`. No invented ratings, reviews, credentials, prices, opening hours, or street addresses are added.
- An XML sitemap containing enabled pages only. Hidden projects and a disabled portfolio are omitted from generated HTML pages and the sitemap.
- Optional verification meta tags for Google, Bing, and Pinterest.

This improves the site's technical foundations; it is not proof that any crawler has indexed it. Google's [Organization documentation](https://developers.google.com/search/docs/appearance/structured-data/organization) explains the role of structured data. It does not guarantee a special search appearance.

## 2. Set the real public URL first

Edit `site_url` in [content/config.json](../content/config.json):

```json
"site_url": "https://gauravsc-alc.github.io/amd.home"
```

This is the configured GitHub Pages target, not a confirmation that this revision is live. If deploying to your custom domain, use its actual HTTPS site root instead. Do not use localhost, the source drive, `/docs`, or an individual HTML filename. Keep the GitHub Pages domain setting, DNS, canonical URL, sitemap URL, and social-profile website links consistent.

Run the existing workflow:

```powershell
.\.venv\Scripts\python.exe build.py
```

Preview locally, review changes, and commit/push when ready. The workflow publishes `docs/`. With the configured URL, the sitemap should then be accessible at:

```text
https://gauravsc-alc.github.io/amd.home/sitemap.xml
```

Open it on the **public** site and check that all URLs point to the final host. Search engines cannot crawl your local preview. The sitemap intentionally does not invent `lastmod` timestamps for unchanged pages.

## 3. Verify with Google Search Console

1. Sign in to [Google Search Console](https://search.google.com/search-console) with a studio-controlled account.
2. For the GitHub project URL, add a **URL-prefix** property for the complete public prefix, including `/amd.home/`. For a custom domain you own, DNS verification is another option; it requires access to that domain's DNS.
3. If using HTML-tag verification, select that method and copy only the value of its `content` attribute.
4. Put that value in `seo.google_site_verification` inside the existing [configuration](../content/config.json). Do not paste the whole HTML tag:

   ```json
   "seo": {
     "google_site_verification": "YOUR_GOOGLE_VERIFICATION_VALUE",
     "bing_site_verification": "",
     "pinterest_domain_verify": ""
   }
   ```

5. Rebuild and deploy. View the public homepage source to confirm the `google-site-verification` meta tag exists, then return to Search Console and verify.
6. Submit the public sitemap URL in **Sitemaps**. Use **URL Inspection** for the homepage and a populated project page, such as `gallery-project-1.html`, to inspect accessibility and request indexing where offered.
7. Leave the verification value in place. Review indexing errors after Google processes the site; submitting does not guarantee indexing or a deadline.

Reference: [Google's ownership-verification instructions](https://support.google.com/webmasters/answer/9008080) and [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## 4. Verify with Bing Webmaster Tools

Add the same public website in [Bing Webmaster Tools](https://www.bing.com/webmasters/). Use its Google Search Console import option if available and appropriate, or the offered verification method. For an HTML meta tag, save only its `content` value in `seo.bing_site_verification`; the template emits `msvalidate.01`. Rebuild, deploy, verify, then submit the sitemap. Review URL Inspection and sitemap processing errors.

References: [Add and verify a site](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b), [Bing sitemaps](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed), and [Bing's discovery guidance for AI-powered search](https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/). This repository does not implement automatic IndexNow submissions.

## 5. AI discovery is not model training

There is no universal registration that guarantees an AI answer will cite the studio. Keep factual service descriptions, room captions, and business contact details available as readable HTML. The new project pages expose those details without needing a visitor to expand a gallery or run JavaScript.

Google says its normal search fundamentals apply to AI Overviews and AI Mode; no special AI text file or special schema is required. Indexability, useful text, internal links, and accurate structured data matter. See [Google's AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features). We have not added an `llms.txt` file or presented it as an indexing requirement.

OpenAI distinguishes **OAI-SearchBot**, used for search discovery, from **GPTBot**, used for content that may support model training. Their permissions are independent. Allowing one does not require allowing the other. See the [official OpenAI crawler documentation](https://developers.openai.com/api/docs/bots). No crawler policy has been changed by this update.

### Important GitHub project-site limitation

Crawler rules belong at the **host root**, for example `https://gauravsc-alc.github.io/robots.txt`, not `/amd.home/robots.txt`. A file inside this project site's subdirectory would not control host-wide crawling. See [Google's robots.txt location rules](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).

If you control the host root, review its existing rules with the owner before changing anything. On a custom domain, ensure any intended policy is actually served at `/robots.txt`. This build does not generate that file; putting a file only in the repository root will not automatically copy it into `docs/`. Host-root deployment needs an explicit build/deployment change.

For illustration only, a host owner who chooses search access but opts out of GPTBot training could use the following rules, merged carefully with their existing policy:

```text
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

Sitemap: https://gauravsc-alc.github.io/amd.home/sitemap.xml
```

Do not install this example without reviewing the scope and your preferences. These are voluntary crawler directives, not access control. Removing confidential images from public hosting is necessary; hiding a project or listing it in robots.txt does not secure its files. Other providers have their own crawler policies; do not assume these OpenAI-specific names control them.

## 6. Improve the actual content

For each project, replace the generic description with a short, accurate explanation of the spaces shown, relevant design choices, and what the viewer can learn. Keep client identities and exact addresses private unless publication is authorized. Label renders as renders, not photographs of completed construction. Do not invent materials, budgets, dates, locations, certifications, or testimonials.

Example using only the supplied room structure:

> Project 1 brings together living-space, bedroom, and kitchen design renders. Explore nine views, including the kitchen's breakfast slab and utility area.

Edit descriptions and captions in [portfolio content](../content/portfolio.json), page headings and search descriptions in [page metadata](../content/page_metadata.json), and actual contact details in [configuration](../content/config.json). Refresh Django for preview; rebuild and redeploy for the public website. Use descriptive text naturally instead of repeating search keywords.

An eligible studio can also maintain a Google Business Profile, with the same real name, website, and contact information. Check [Google's eligibility requirements](https://support.google.com/business/answer/13763036) first; do not create an invented office or location solely for search exposure.

## 7. After each publication

- Confirm important page URLs return successfully on the public host and all images load on mobile.
- Check the sitemap, canonical URLs, and sharing previews after changing domains or project slugs.
- Check that hidden projects are absent from both navigation and sitemap. Existing external search results may take time to change.
- Review Search Console and Bing reports for crawl errors, discovered pages, impressions, and clicks. Do not repeatedly resubmit unchanged URLs expecting immediate rankings.
- Ask real clients how they found the studio and record enquiries. Search/AI referrals are not guaranteed, and third-party analytics has not been installed by this update.
- When changing a project slug, update your social and internal links. This build removes the old generated page; it does not automatically create a redirect.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Verification fails | Public source contains the exact token; correct URL-prefix property; successful deployment; no login barrier |
| Canonical URL points to the wrong host | Correct `site_url` and rebuild before requesting indexing |
| Sitemap still lists a hidden project | Confirm the switch is a JSON boolean, rebuild, and check the deployed sitemap rather than an old local copy |
| Search listing differs from your title or description | Inspect the crawled page and allow recrawling; the engine controls its displayed result |
| An AI answer does not mention the studio | No provider guarantees selection; review crawl access and improve factual project content |
| Social share shows an old image | Check the public metadata and image URL; platforms can cache previews |

Continue with [Social Media Setup and Updates](./SOCIAL_MEDIA_SETUP_GUIDE.md).
