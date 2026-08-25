# Founder Inputs Required

Local work continues without these values. Production configuration and external actions fail closed at the exact boundary.

| Input                                                                                 | Required for                                    | Safe local substitute                                         |
| ------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Final legal operator/entity name                                                      | Public policy, Terms, store seller disclosures  | `[FOUNDER_INPUT:LEGAL_OPERATOR]` in nonproduction drafts only |
| Legal/public mailing address and required public phone                                | Policies, support, DSA/regional disclosures     | Explicit founder-input marker                                 |
| Support email and authorized contact details                                          | App/site/store support                          | `support@example.invalid` rejected by production validation   |
| Final domain and hosting/deployment authorization                                     | Privacy, Terms, support, marketing URLs         | Local static site and relative links                          |
| Final product-name decision and professional clearance                                | App record, icon/brand, legal/store lock        | Centralized working name `Only Signature`                     |
| Final copyright holder/year                                                           | App Store copyright field                       | Explicit founder-input marker                                 |
| Apple Team ID                                                                         | Signing/native configuration                    | Development-only invalid marker                               |
| Final bundle identifier and SKU                                                       | Apple app record and product ID                 | Safe reverse-domain development fixture                       |
| App Store Connect role/credential or approved API key                                 | Record, build, TestFlight, metadata, submission | No portal mutation                                            |
| Apple signing/EAS credential authorization                                            | Signed iOS builds                               | Prebuild/config only                                          |
| Paid Applications Agreement, tax, and banking status                                  | IAP sale                                        | Mock/StoreKit configuration only                              |
| Final StoreKit product identifier                                                     | App/IAP record alignment                        | Development fixture ID                                        |
| Approval of planned U.S. $1.99 per-set model                                          | Price schedule and paywall fixture              | StoreKit localized mock fixture                               |
| Final territory selection                                                             | Availability and regional obligations           | U.S.-only planning default, no portal action                  |
| DSA trader/non-trader decision and verification materials                             | EU distribution                                 | EU disabled                                                   |
| Professional review of Privacy Policy, Terms, authorized-use and regional disclosures | Release legal readiness                         | Clearly labeled legal-preparation drafts                      |
| Final export-compliance determination/specialist input if required                    | TestFlight/App Store compliance                 | Unanswered release gate                                       |
| Physical iPhone/iPad and sandbox/TestFlight authorization                             | Native behavior evidence                        | Deterministic mocks and test plans                            |
| Website deployment authorization                                                      | Public URLs                                     | Local build only                                              |
| TestFlight, App Review, submission, and release authorization                         | External publication                            | No external action                                            |

Coding, tests, copy drafts, fixture documents, screenshot composition, StoreKit mock logic, and documentation are not founder inputs.
