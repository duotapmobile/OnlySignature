# Static Website Deployment

Prepared: 2026-08-25  
Project: `apps/site`  
Output: static files in `apps/site/dist`  
Backend: none

## Build contract

The site uses Astro static output. It ships semantic HTML and CSS with no client-side application bundle, analytics, advertising, external fonts, tracking pixels, contact form, cookie banner, or proprietary API.

Local commands from `apps/site`:

```powershell
npm ci --workspaces=false
npm run typecheck
$env:PUBLIC_SITE_URL = 'https://example.com'
$env:PUBLIC_SUPPORT_EMAIL = 'admin@onlysignature.app'
$env:PUBLIC_APP_STORE_URL = 'https://apps.apple.com/app/id0000000000'
npm run build
npm run validate
```

Replace the examples only with founder-authorized values. Do not store credentials in `.env` files committed to source control. These values are public configuration, but the selected deployment platform may also keep them as environment variables.

For a final public release, run:

```powershell
npm run release:check
```

The release check deliberately fails while the governing jurisdiction or any future placeholder remains in generated output. DuoTap LLC, `admin@onlysignature.app`, and `https://onlysignature.app` are confirmed.

## Option A — direct static upload

This requires no GitHub repository.

1. Complete every item in `docs/site/REQUIRED_PUBLIC_URLS.md` and `docs/site/DOMAIN_SETUP.md`.
2. Build locally with the final public environment values.
3. Run `npm run typecheck`, `npm run build`, `npm run validate`, and `npm run release:check`.
4. Inspect `dist/privacy/index.html`, `dist/terms/index.html`, `dist/robots.txt`, and `dist/sitemap.xml`.
5. Upload the **contents** of `apps/site/dist` to the chosen host’s public web root using its dashboard, SFTP, or static-upload interface.
6. Configure the host to serve `404.html` for unknown routes and `index.html` for directory paths. Do not add SPA fallback rewrites.
7. Enable HTTPS and redirect HTTP to HTTPS.
8. Verify every public URL, metadata preview, favicon, sitemap, and 404 response over HTTPS.

## Option B — Cloudflare Pages Direct Upload CLI

This option is documented but must not be run until the founder authorizes Cloudflare, the account, domain, and deployment.

Use Cloudflare Wrangler’s direct-upload flow, which does not require GitHub:

```powershell
npm run build
npx wrangler pages project create only-signature-site
npx wrangler pages deploy dist --project-name only-signature-site
```

Authenticate interactively or through the platform’s documented secret mechanism. Do not commit API tokens. Pin the exact Wrangler version in the authorized deployment environment or invoke an approved installed version rather than accepting an unreviewed package at release time.

After deployment, attach the authorized custom domain in Cloudflare Pages, configure DNS, rebuild using that canonical URL, redeploy, and run the public verification below.

## Public verification

Use a clean browser and command-line request checks:

```powershell
$site = 'https://example.com'
Invoke-WebRequest "$site/" -Method Head
Invoke-WebRequest "$site/privacy/" -Method Head
Invoke-WebRequest "$site/terms/" -Method Head
Invoke-WebRequest "$site/support/" -Method Head
Invoke-WebRequest "$site/robots.txt"
Invoke-WebRequest "$site/sitemap.xml"
```

Verify:

- all required pages return `200` and an unknown path returns `404`;
- canonical and Open Graph URLs use the final HTTPS domain;
- privacy, support, and marketing URLs match App Store Connect;
- no legal placeholder or `.invalid` address is visible;
- the App Store link is either the actual public product page or the clearly labeled pre-release placeholder page;
- no unexpected cookies or third-party requests appear in browser network/storage tools;
- website host request logs and retention are reflected accurately in the Privacy Policy;
- keyboard navigation, zoom to 200%, reduced motion, increased contrast, and screen-reader landmarks work on the deployed host.

## Rollback

Keep the previously verified `dist` artifact and deployment identifier. If a legal page, URL, TLS, or accessibility regression is discovered, restore the previous verified static artifact through the host’s rollback or upload process. Rollback does not replace correcting App Store privacy/support URLs if those public pages changed.

## Content integration

`legal/PRIVACY_POLICY.md` and `legal/TERMS_OF_USE.md` are the canonical legal files. The Astro privacy and terms routes import those Markdown documents at build time, so the site does not maintain a second legal copy. Product facts and FAQ copy are centralized in `apps/site/src/content/site.ts`. Future mobile/package integration should compare its shared content against this source until a parent-owned `packages/content` API is adopted; this site does not modify that package.
