# Domain and DNS Setup

Prepared: 2026-08-25  
Status: validated static output is published on remote `gh-pages` at `e0d9c6d`; waiting only for GitHub Pages activation, custom-domain confirmation, DNS changes, and HTTPS issuance.

## Founder decisions required

- production host: GitHub Pages selected;
- registrar/DNS: Namecheap BasicDNS observed; founder retains account control;
- support email: `admin@onlysignature.app` confirmed; preserve Namecheap email forwarding;
- legal operator is confirmed; the private Apple membership address and phone must not be published;
- founder completion of the GitHub Pages activation and Namecheap DNS records below.

Do not purchase, transfer, or configure a domain without that authorization. `onlysignature.com` is already registered and must not be represented as owned.

## Recommended hostname model

The canonical HTTPS origin is `https://onlysignature.app`. Redirect every alternate HTTP/HTTPS or `www`/apex variant to that origin with a permanent redirect. Do not serve duplicate copies across multiple hostnames.

Required public paths are listed in `REQUIRED_PUBLIC_URLS.md`.

## Selected routing: GitHub Pages through Namecheap BasicDNS

Public DNS observed on 2026-08-26 uses Namecheap BasicDNS. The apex currently points to Namecheap parking at `162.255.119.176`, while `www` points to `parkingpage.namecheap.com`. The MX and SPF records support `admin@onlysignature.app` and must remain unchanged.

The validated `apps/site/dist` output is published as remote `gh-pages` commit `e0d9c6d`. Select `gh-pages` and `/ (root)` under **GitHub repository > Settings > Pages**, save, and then set the Pages custom domain to `onlysignature.app`. GitHub recommends associating the domain with the Pages site before pointing public DNS at it.

In **Namecheap > Domain List > onlysignature.app > Advanced DNS**, delete only the current parking `A` record for host `@` and the parking `CNAME` for host `www`. Add these records with TTL `Automatic`:

| Type         | Host  | Value                    |
| ------------ | ----- | ------------------------ |
| A Record     | `@`   | `185.199.108.153`        |
| A Record     | `@`   | `185.199.109.153`        |
| A Record     | `@`   | `185.199.110.153`        |
| A Record     | `@`   | `185.199.111.153`        |
| AAAA Record  | `@`   | `2606:50c0:8000::153`    |
| AAAA Record  | `@`   | `2606:50c0:8001::153`    |
| AAAA Record  | `@`   | `2606:50c0:8002::153`    |
| AAAA Record  | `@`   | `2606:50c0:8003::153`    |
| CNAME Record | `www` | `duotapmobile.github.io` |

Do not delete or edit the five `eforward*.registrar-servers.com` MX records or the `v=spf1 include:spf.efwd.registrar-servers.com ~all` TXT record. Do not add wildcard DNS. If GitHub domain verification displays a `_github-pages-challenge-duotapmobile` TXT value, add the exact generated value; it cannot be precomputed.

After DNS resolves, enable **Enforce HTTPS** in GitHub Pages. With `onlysignature.app` configured as the custom domain, GitHub redirects `www.onlysignature.app` to the canonical apex.

## DNS procedure

1. Verify the registrar account and legal owner.
2. Enable registrar multi-factor authentication, recovery controls, transfer lock, and auto-renew.
3. Add only the DNS records required by the selected static host. Use the host’s exact current CNAME, ALIAS/ANAME, or A/AAAA instructions.
4. Remove stale records that point to unrelated infrastructure only after confirming ownership and rollback needs.
5. Add CAA records if the host documents supported certificate authorities and the founder approves the restriction.
6. Complete host-side domain validation and wait for a valid certificate.
7. Force HTTPS and the chosen canonical host.
8. Rebuild with `PUBLIC_SITE_URL` set to the canonical origin; otherwise canonical, Open Graph, robots, and sitemap URLs remain wrong.
9. Configure `PUBLIC_SUPPORT_EMAIL` and the final App Store URL when available.
10. Run `npm run release:check`, deploy, and verify from an uncached network.

## Email authentication

If the domain sends support email, configure SPF, DKIM, and DMARC according to the selected provider. Start with a monitored DMARC policy appropriate to the provider setup, review legitimate sources, then strengthen it. Do not publish guessed records.

Support email may receive personal information voluntarily supplied by users. Select a provider and retention/access policy, restrict mailbox access, enable MFA, and update the Privacy Policy with accurate provider/retention facts before launch.

## Security headers

Configure at the static host when supported:

```text
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

Astro emits one inline JSON-LD script and inline/scoped CSS may appear in generated HTML, so the sample CSP permits inline script/style. A host-specific nonce/hash CSP can be stricter after inspecting the final build. Do not paste headers blindly if the chosen platform uses different syntax.

## Privacy checks

- Confirm browser storage has no non-essential cookie, local storage, or tracking identifier.
- Confirm network requests are limited to the same-origin static assets and user-initiated `mailto`, App Store, Apple refund, or external legal/support links.
- Document the host/CDN’s automatic request logs, security processing, and retention in the Privacy Policy.
- Do not add analytics merely to verify traffic. Use App Store Connect for product measurement and ordinary host security logs only as disclosed.

## Renewal and incident ownership

Record the registrar, host, DNS owner, certificate automation, renewal date, billing owner, MFA recovery method, and incident contact in a private founder system—not this public repository. Establish who can replace a broken privacy/support page during App Review or after launch.
