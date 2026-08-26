# Required Public URLs

Prepared: 2026-08-25  
Canonical origin: `https://onlysignature.app`

The founder supplied this domain for the first publication. All launch URLs must use HTTPS and remain available without login. Hosting and DNS changes still require authorization.

| Purpose        | Required path     | App Store use                                     | Launch requirement                                                                            |
| -------------- | ----------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Marketing home | `/`               | Marketing URL                                     | Product name, scope, no-document-upload, pricing scope, and formats are accurate              |
| Privacy Policy | `/privacy/`       | Required Privacy Policy URL                       | Legal identity, host logs, support address, effective date, and final code practices complete |
| Terms of Use   | `/terms/`         | Support/legal link and possible license reference | Operator, address, governing law, Apple terms, and purchase scope complete                    |
| Support        | `/support/`       | Required Support URL                              | Working contact, troubleshooting, deletion/storage notice, and app version support path       |
| Purchase FAQ   | `/faq/`           | Review/support reference                          | Localized price distinction, per-set scope, unclaimed slot, deletion, and refunds accurate    |
| Accessibility  | `/accessibility/` | Public accessibility information                  | Claims limited to features actually tested for the released version                           |
| Contact        | `/contact/`       | Public operator/support contact                   | Working founder-authorized email; no nonfunctional `.invalid` address                         |
| App download   | `/download/`      | Marketing call to action                          | May remain a clearly labeled placeholder until Apple creates the public URL                   |
| Sitemap        | `/sitemap.xml`    | Search discovery                                  | Contains only canonical, indexable public pages                                               |
| Robots         | `/robots.txt`     | Search discovery                                  | References the canonical sitemap                                                              |
| Not found      | `/404.html`       | Host error page                                   | Host returns HTTP 404 rather than 200                                                         |

## App Store Connect mapping

Use the final origins exactly:

```text
Privacy Policy URL: https://onlysignature.app/privacy/
Support URL:        https://onlysignature.app/support/
Marketing URL:      https://onlysignature.app/
```

The in-app Settings/About screen must open the same final privacy, Terms, support, FAQ, and accessibility pages. The URLs must also match centralized mobile release configuration owned outside this site scope.

## Release verification

- no `.invalid`, `example.com`, bracketed legal placeholder, or draft-only language remains except the intentionally clear App Store pre-release status;
- privacy and Terms pages are readable without JavaScript, cookies, account, region prompt, or consent wall;
- support works from a logged-out device;
- every page has a unique title, description, canonical URL, Open Graph data, favicon, accessible heading, and visible navigation;
- redirects preserve the path and do not create loops;
- TLS is valid and renewal is automated;
- the public host returns correct `Content-Type` headers for HTML, CSS, SVG, XML, and text;
- an unknown path returns the branded 404 page with HTTP status 404;
- App Store Connect links are rechecked immediately before submission.
