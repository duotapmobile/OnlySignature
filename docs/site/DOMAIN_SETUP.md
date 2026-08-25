# Domain and DNS Setup

Prepared: 2026-08-25  
Status: waiting for founder domain and hosting authorization

## Founder decisions required

- final cleared product name;
- purchased domain and registrar account owner;
- production host;
- canonical hostname choice, such as apex domain or `www`;
- support email domain and provider;
- legal operator name and mailing address;
- authorization to create DNS, TLS, and deployment records.

Do not purchase, transfer, or configure a domain without that authorization. `onlysignature.com` is already registered and must not be represented as owned.

## Recommended hostname model

Choose one canonical HTTPS origin, for example `https://example.com`. Redirect every alternate HTTP/HTTPS or `www`/apex variant to that origin with a permanent redirect. Do not serve duplicate copies across multiple hostnames.

Required public paths are listed in `REQUIRED_PUBLIC_URLS.md`.

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
