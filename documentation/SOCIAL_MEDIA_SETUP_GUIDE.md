# Create and maintain the studio's social profiles

This is an owner-operated checklist, not an automatic account-creation or posting integration. No accounts have been created, messages sent, ads purchased, or posts published. Prepared October 28, 2026: the linked Facebook Page and LinkedIn creation references were directly reviewed. Some Instagram and Pinterest help pages did not load in this environment; use their linked official guidance and your account's current interface if labels differ.

## 1. Prepare a consistent identity

Before opening accounts, collect an approved studio name, logo, short biography, contact email, phone number, public website URL, and project images you are authorized to publish. Confirm the contact details in [content/config.json](../content/config.json) are real and monitored. The sample values in examples below are not registered handles.

Suggested bio, to adapt to your actual services:

> Ashapura Maison Design — interiors and architecture shaped around everyday Indian life. Explore our design concepts, room galleries, and approach to creating a home.

Use a business-controlled recovery email, strong unique passwords, and multi-factor authentication. Give collaborators platform roles instead of sharing the owner's password. Keep recovery codes in a password manager, never in this repository or frontend JavaScript.

## 2. Set up the channels you can maintain

### Instagram

Create a studio account or use the account settings to switch an appropriate existing account to a professional/business account. Choose the correct business category, add the approved identity and contact information, and add the public website link. Avoid converting a private personal account accidentally. Review Meta's [Instagram business setup training](https://www.facebookblueprint.com/student/path/262506-establish-your-business-with-instagram) for the account-specific setup flow.

For this studio, consider room-by-room carousels, render walkthroughs, material discussions you can substantiate, and stories answering common design questions. Suggested highlights: Projects, Kitchens, Bedrooms, Process, and Contact. These are editorial suggestions, not promises of reach.

### Facebook

Create a business **Page**, using an authorized person's account to administer it. Fill in the business name, category, description, website, and actual contact details; upload approved logo and cover artwork. Review publishing and access settings before inviting collaborators. Meta's [Facebook Page course](https://www.facebookblueprint.com/student/path/211566-online-business-presence-facebook-page) covers creating a Page, posting, and audience tools.

Post approved project previews that link to the matching gallery page. If you connect Facebook and Instagram, confirm the selected accounts belong to the studio before publishing to both. Use drafts and any scheduling tools offered in your account, and verify that scheduled work actually publishes. The website itself does not connect to Meta or manage its posting queue.

### LinkedIn

Using an authorized LinkedIn account, open the desktop **For Business** menu and choose **Create a Company Page**. Select the suitable Page type, enter the studio identity and website, and confirm authority to represent it. Add a logo and useful description, then assign trusted administrators. See [LinkedIn's creation instructions](https://www.linkedin.com/help/linkedin/answer/a542801).

Use [the Page's publishing tools](https://business.linkedin.com/advertise/linkedin-pages) to share thoughtful project case studies and collaboration updates. Avoid unsupported client or partner endorsements.

### Pinterest

Create a business account or convert an appropriate existing account using [Pinterest's setup guide](https://help.pinterest.com/en/business/article/get-a-business-account). Create boards around real themes such as kitchen planning, bedroom concepts, and living spaces. Pin approved images with useful descriptions and links to the correct project page.

To claim the website, follow [Pinterest's website-claim instructions](https://help.pinterest.com/en/business/article/claim-your-website). You need the relevant website control; Pinterest lists HTML tag, file, and DNS options. For the HTML-tag option, copy only the token into `seo.pinterest_domain_verify` in [configuration](../content/config.json). Build and deploy before completing verification. The template supplies the `p:domain_verify` meta tag. Do not assume claiming an account grants rights to someone else's images.

## 3. Connect profiles to the website

After creating and checking each real profile, edit the existing `social` object in [content/config.json](../content/config.json). Replace only the values you have verified. Example format:

```json
"social": {
  "instagram": "https://www.instagram.com/YOUR_ACTUAL_HANDLE/",
  "facebook": "https://www.facebook.com/YOUR_ACTUAL_PAGE/",
  "linkedin": "https://www.linkedin.com/company/YOUR_ACTUAL_PAGE/",
  "pinterest": "https://www.pinterest.com/YOUR_ACTUAL_HANDLE/",
  "whatsapp": "#"
}
```

Do not paste placeholder handles into the live configuration. Preserve other existing keys unless deliberately removing them. Set an unused profile to `"#"` or an empty string to hide its icon. Use full HTTPS public URLs, not login/admin screens, local paths, passwords, or access tokens.

The footer shows configured profiles on every page, and the Contact page shows them beside the contact details. Genuine HTTP(S) profile URLs also populate organization `sameAs` metadata. Updating these URLs creates **links only**; it does not create accounts, embed feeds, or publish posts.

Preview and publish through the existing workflow:

```powershell
.\.venv\Scripts\python.exe run_local.py
```

Check every icon and destination. Stop the preview with Ctrl+C, then:

```powershell
.\.venv\Scripts\python.exe build.py
git status --short
git add content templates static site_app amd_site scripts build.py .gitignore documentation README.md index.html
git diff --cached --stat
git commit -m "Update website and social profiles"
git push
```

Only run the commit/push commands after reviewing the staged changes. Wait for the existing GitHub Pages workflow to succeed, then check the public website in a signed-out browser.

## 4. Update a project and its social posts together

1. Add the next photographs/renders to the correct project folder and run the [existing importer](./PROJECT_GALLERY_GUIDE.md).
2. Review public project titles and captions. The source folder `mujeet yelanka` now displays as **Project 6**, with permalink `gallery-project-6.html`; do not publish the source folder name as a client identifier.
3. Write an accurate description and publish the website first. Check the project's permalink on the public host.
4. Prepare a platform-appropriate crop from an approved image. Keep the original backed up and retain the website's optimized copy. Check the current upload preview rather than assuming one crop works everywhere.
5. Draft a caption identifying the project and whether the image is a **design render** or completed-site photograph. Explain one genuine detail; include an appropriate contact action and the project link where the platform supports it.
6. Add descriptive alternative text where available. Proofread image labels, contact details, and links before publishing.
7. Verify the actual published post, including its mobile crop and destination. Respond to legitimate enquiries through the studio's monitored account.

Example original caption for the supplied content:

> Inside Project 1: a collection of living-space, bedroom, and kitchen design renders. Explore all nine views on our website, including the breakfast slab and utility area. Planning your own space? Start a conversation with Ashapura Maison Design.

Link it to the real public `gallery-project-1.html` page. Do not claim a location, client name, completed build, budget, or material specification unless you have verified permission and facts. The animated home illustration is conceptual artwork, not evidence of a completed client project.

## 5. A manageable maintenance routine

This is a suggested starting routine, not a platform requirement:

| When | Action |
| --- | --- |
| Each new project | Publish the website gallery first, then share an approved overview and room detail |
| Weekly | Review messages, check draft/scheduled content, and prepare one useful design explanation |
| Monthly | Audit profile links, contact information, admin access, and which posts generated real enquiries |
| After rebranding/domain changes | Update profile bios, website links, `site_url`, canonical metadata, and the sitemap together |

If a post is wrong, correct its caption or replace/archive it using the platform's tools. If a project is withdrawn, review linked social posts as well as the website; hiding it in JSON does not remove copies already published elsewhere.

The website's contact form prepares an email draft, not an automatically delivered enquiry. No analytics, social auto-posting service, marketing pixels, or chat integration is enabled here. API-based publishing would be a separate, authenticated backend integration; never place social access tokens in the static site.

For discovery and account verification, see [Search and AI Indexing](./SEARCH_AND_AI_INDEXING_GUIDE.md).
