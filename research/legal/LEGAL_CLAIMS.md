# Legal-Claim Boundaries

Research date: 2026-08-25  
Status: Preliminary legal preparation, not legal advice  
Scope: Product claims for a local signature-image utility; United States and European Union concepts used to establish conservative marketing and UI boundaries

Only Signature creates a reusable image/vector asset based on strokes drawn by the user. It is not a document-signing platform. Whether a person’s later use of an exported asset constitutes a valid electronic signature depends on the document, intent, attribution, consent, governing law, recipient requirements, and surrounding process. Founder counsel must review final Terms, claims, territory choices, and operator facts.

## Locked legal-claim rule

Only Signature may say it creates a signature image or signature asset. It must not say or imply that it verifies identity, issues a certificate, creates a qualified electronic signature, notarizes a document, establishes enforceability, supplies an audit trail, proves consent, or guarantees recipient acceptance.

## Evidence records

### LEG-001 — Image of a handwritten signature

| Field | Record |
|---|---|
| Claim | A drawn signature image is a graphic asset. Standing alone, it does not establish who drew or placed it, the signer’s intent, its association with a particular record, integrity of that record, consent to electronic process, or recipient acceptance. In a particular transaction it may be used as an electronic signature if the applicable definition and other legal requirements are satisfied, but the asset is not automatically a legally operative signature. |
| Source | [15 U.S.C. §7006(5)](https://uscode.house.gov/view.xhtml?req=%28title%3A15+section%3A7006+edition%3Aprelim%29); [eIDAS Regulation, Article 3](https://eur-lex.europa.eu/eli/reg/2014/910) |
| Source type | Official U.S. Code and official EU law (EUR-Lex) |
| Publication/access date | U.S. Code text current through 2026-08-20 edition; consolidated EU text accessed 2026-08-25 |
| Confidence | High for the definitional boundary; application to a transaction is fact- and jurisdiction-specific |
| Product effect | Call the output “your signature image,” “signature asset,” or “transparent signature export.” Do not call creation alone “signing a document.” Preview only on fictional samples. |
| May change before submission? | Legal definitions are comparatively stable, but statutes, case law, exceptions, and jurisdictional application can change. Counsel recheck is required. |

### LEG-002 — Electronic signature under U.S. federal law

| Field | Record |
|---|---|
| Claim | E-SIGN defines an electronic signature as an electronic sound, symbol, or process attached to or logically associated with a contract or record and executed or adopted with intent to sign it. E-SIGN generally prevents denial of legal effect solely because a signature or record is electronic, but it does not make every electronic mark valid, does not erase other substantive requirements, and contains scope, consent, retention, and exception provisions. |
| Source | [15 U.S.C. §7006](https://uscode.house.gov/view.xhtml?req=%28title%3A15+section%3A7006+edition%3Aprelim%29); [15 U.S.C. Chapter 96, including §§7001 and 7003](https://uscode.house.gov/view.xhtml?edition=prelim&path=%2Fprelim%40title15%2Fchapter96) |
| Source type | Official U.S. Code |
| Publication/access date | U.S. Code preliminary edition in effect/accessed 2026-08-25 |
| Confidence | High for federal statutory text; transaction outcome requires counsel |
| Product effect | The app does not attach the asset to the user’s actual record, capture document-specific intent/consumer consent, attribute a signer, retain the signed record, or decide whether an exception applies. Do not market the app as creating a legally binding e-signature. |
| May change before submission? | Yes; federal/state law and interpretation may evolve. |

### LEG-003 — Electronic signature under EU eIDAS

| Field | Record |
|---|---|
| Claim | eIDAS defines an electronic signature broadly as electronic data attached to or logically associated with other electronic data and used by the signatory to sign. An electronic signature cannot be denied legal effect solely because it is electronic or not qualified, but eIDAS does not give every electronic signature the same legal effect as a handwritten signature. |
| Source | [Regulation (EU) No 910/2014, Articles 3 and 25](https://eur-lex.europa.eu/eli/reg/2014/910) |
| Source type | Official EU legislation on EUR-Lex |
| Publication/access date | Consolidated text accessed 2026-08-25 |
| Confidence | High for EU statutory distinction; member-state/transaction application requires counsel |
| Product effect | The exported image may be used as data in a later signing act, but Only Signature does not perform or certify that act. Avoid “EU-compliant signature,” “same as handwritten,” and universal acceptance claims. |
| May change before submission? | Yes; eIDAS implementation and related rules evolve. Recheck before EU release. |

### LEG-004 — Digital and cryptographic signature

| Field | Record |
|---|---|
| Claim | NIST defines a digital signature as the result of a cryptographic transformation using asymmetric keys, enabling verification of origin/authenticity and data integrity and supporting non-repudiation. This is fundamentally different from a raster or vector picture of handwriting. Cryptographic assurance also does not by itself decide every legal question about authority, intent, or document acceptance. |
| Source | [NIST CSRC digital signature glossary](https://csrc.nist.gov/glossary/term/digital_signature); [NIST Digital Signature Standard, FIPS 186-5](https://www.nist.gov/publications/digital-signature-standard-dss-3); [NIST SP 800-63-4 glossary](https://pages.nist.gov/800-63-4/sp800-63/glossary/) |
| Source type | Official U.S. National Institute of Standards and Technology definitions and standard |
| Publication/access date | FIPS 186-5 published 2023-02-03; glossary pages accessed 2026-08-25 |
| Confidence | High |
| Product effect | Never call the product output a “digital signature” or “cryptographic signature” in technical/legal claims. The app generates no signing key, certificate, document digest signature, validation service, or revocation status. |
| May change before submission? | Low for the core technical distinction; standards and terminology can be updated. |

### LEG-005 — Advanced electronic signature

| Field | Record |
|---|---|
| Claim | Under eIDAS, an advanced electronic signature must be uniquely linked to the signatory, capable of identifying the signatory, created using signature-creation data under the signatory’s sole control with high confidence, and linked to signed data so later changes are detectable. A transparent image asset does not provide these capabilities. |
| Source | [Regulation (EU) No 910/2014, Articles 3 and 26](https://eur-lex.europa.eu/eli/reg/2014/910) |
| Source type | Official EU legislation on EUR-Lex |
| Publication/access date | Consolidated text accessed 2026-08-25 |
| Confidence | High |
| Product effect | Do not describe exports as advanced electronic signatures or claim tamper detection, sole-control signing data, or signer identification. |
| May change before submission? | Yes; recheck EU legislation and implementing standards before EU distribution. |

### LEG-006 — Qualified electronic signature

| Field | Record |
|---|---|
| Claim | A qualified electronic signature under eIDAS is an advanced electronic signature created by a qualified electronic signature creation device and based on a qualified certificate. It receives the legal effect of a handwritten signature in the EU. Only Signature supplies none of those qualified trust-service components. |
| Source | [Regulation (EU) No 910/2014, Articles 3 and 25](https://eur-lex.europa.eu/eli/reg/2014/910); [EU Trusted List Browser](https://eidas.ec.europa.eu/efda/tl-browser/) |
| Source type | Official EU legislation and European Commission trusted-list service |
| Publication/access date | Accessed 2026-08-25 |
| Confidence | High |
| Product effect | Never use “qualified,” “QES,” “certified,” “trusted provider,” “qualified certificate,” or “equivalent to handwritten” for the app or its output. |
| May change before submission? | Yes; eIDAS framework and qualified-provider status are regulatory facts. |

### LEG-007 — Notarized signature or notarial act

| Field | Record |
|---|---|
| Claim | Notarization is a regulated notarial act performed by an authorized notary under jurisdiction-specific requirements. Electronic and remote notarization can require identity verification, personal or audiovisual appearance, credential analysis, a notarial certificate/seal, journal or recording, and technology under the notary’s control. A signature image generator is not a notary service. |
| Source | [Florida Statutes Chapter 117, Part II](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0100-0199%2F0117%2F0117PartIIContentsIndex.html); [Florida Statutes §117.021](https://www.leg.state.fl.us/Statutes/index.cfm/Ch0893/index.cfm?App_mode=Display_Statute&Search_String=&URL=0100-0199%2F0117%2FSections%2F0117.021.html); [California Secretary of State Notary Public Handbook](https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf); [Uniform Law Commission, Revised Uniform Law on Notarial Acts](https://www.uniformlaws.org/acts/catalog/current/l) |
| Source type | Official state statutes/regulator handbook and official uniform-law body (model law, not itself enacted law) |
| Publication/access date | Florida statutes and current California handbook accessed 2026-08-25; ULC catalog accessed 2026-08-25 |
| Confidence | High that app functionality is not notarization; exact requirements vary materially by jurisdiction |
| Product effect | Never use “notarize,” “notary,” “notarial,” or a notary-seal visual. Terms state no notary service. Support must direct users to the recipient or a qualified professional for notarization requirements. |
| May change before submission? | Yes, high jurisdictional variation. |

### LEG-008 — Legally binding signing platform

| Field | Record |
|---|---|
| Claim | A legally operative electronic-signing workflow generally requires more than a reusable image: association with the specific record, intent to sign, attribution, any required consumer consent, ability to retain/accurately reproduce the record, and compliance with document- and jurisdiction-specific formalities. Some products add authentication, timestamps, evidence logs, tamper detection, certificates, and retention, but no platform can guarantee enforceability or acceptance for every document and recipient. |
| Source | [15 U.S.C. §§7001, 7003, and 7006](https://uscode.house.gov/view.xhtml?edition=prelim&path=%2Fprelim%40title15%2Fchapter96); [eIDAS Regulation, Articles 3, 25, and 26](https://eur-lex.europa.eu/eli/reg/2014/910) |
| Source type | Official U.S. Code and official EU legislation |
| Publication/access date | Accessed 2026-08-25 |
| Confidence | High as a conservative boundary; exact elements depend on facts and law |
| Product effect | Only Signature must not add or imply document upload/signing, identity verification, signer authentication, witness/notary service, document retention, workflow audit trail, tamper-evident sealed document, or legal-status determination. |
| May change before submission? | Yes; legal requirements and recipient policies vary. |

### LEG-009 — Recipient acceptance and document exceptions

| Field | Record |
|---|---|
| Claim | Electronic-signature statutes do not force every recipient to accept every method and do not eliminate all document-specific formalities. U.S. E-SIGN includes exclusions and consumer-disclosure/consent rules. Notary, witness, agency, court, real-estate, testamentary, family-law, and other requirements can vary. |
| Source | [15 U.S.C. Chapter 96, including §§7001 and 7003](https://uscode.house.gov/view.xhtml?edition=prelim&path=%2Fprelim%40title15%2Fchapter96); [eIDAS Regulation](https://eur-lex.europa.eu/eli/reg/2014/910) |
| Source type | Official U.S. Code and official EU legislation |
| Publication/access date | Accessed 2026-08-25 |
| Confidence | High that no universal guarantee is supportable; specific outcomes require local advice |
| Product effect | Use: “Place your signature on any document” only as visual placement utility copy, not an acceptance promise. FAQ must say recipients decide what they accept and users should check their requirements. Prefer “Place your signature on a document” if counsel considers “any” too categorical. |
| May change before submission? | Yes; recheck claim wording during legal review. |

### LEG-010 — No identity verification or ownership proof

| Field | Record |
|---|---|
| Claim | Neither a handwritten-image asset nor local storage proves the legal identity, authority, or ownership of the person whose signature is depicted. Digital-signature/notarial systems can add verification mechanisms that this app intentionally lacks. |
| Source | [NIST digital signature glossary](https://csrc.nist.gov/glossary/term/digital_signature); [Florida Statutes Chapter 117, Part II](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0100-0199%2F0117%2F0117PartIIContentsIndex.html); [eIDAS Regulation, Article 26](https://eur-lex.europa.eu/eli/reg/2014/910) |
| Source type | Official technical standard, state statute, and EU legislation |
| Publication/access date | Accessed 2026-08-25 |
| Confidence | High |
| Product effect | Terms prohibit forgery, impersonation, fraud, misrepresentation, unauthorized use of another person’s signature, and illegal document alteration. UI must not say the user “owns” or has “verified” a signature. The app may be used only for a signature the user is authorized to use. |
| May change before submission? | Low for product capability; legal remedies and precise prohibited-use wording require counsel. |

### LEG-011 — No certificate or audit trail

| Field | Record |
|---|---|
| Claim | Certificates, cryptographic validation evidence, and transaction/document audit trails are distinct evidence mechanisms. Only Signature stores local drawing and purchase/export state; it does not issue a signer certificate, sign a document digest, retain a signed-record event log, or certify a signing ceremony. |
| Source | [NIST FIPS 186-5](https://www.nist.gov/publications/digital-signature-standard-dss-3); [eIDAS Regulation, Article 3](https://eur-lex.europa.eu/eli/reg/2014/910); [15 U.S.C. §7006](https://uscode.house.gov/view.xhtml?req=%28title%3A15+section%3A7006+edition%3Aprelim%29) |
| Source type | Official technical standard and statutes |
| Publication/access date | Accessed 2026-08-25 |
| Confidence | High |
| Product effect | Do not call StoreKit receipts, local hashes, diagnostics, or export metadata a signature certificate or audit trail. Local hashes protect app state and transaction correlation; they do not authenticate a signer or document. |
| May change before submission? | Low for current architecture; re-audit if document workflows are ever proposed (currently out of scope). |

## Approved and prohibited copy

### Supported factual copy

- “Create a signature and initials.”
- “Export with a transparent background.”
- “Created on your device. We do not upload it.” — only while final binary/network verification supports it and with user-selected sharing and Apple purchase processing explained in the Privacy Policy.
- “We do not sign your documents. We give you your signature.”
- “Signature image” or “signature asset.”
- “No identity verification. No notary service. No audit trail.”
- “Check whether your recipient accepts an image signature.”

### Prohibited or counsel-gated copy

- “Legally binding signature” or “guaranteed legal signature.”
- “Digital signature,” “cryptographic signature,” “advanced electronic signature,” or “qualified electronic signature.”
- “Certified,” “verified signer,” “identity verified,” “authentic,” or “fraud-proof.”
- “Notarized,” “online notary,” or “notary approved.”
- “Complete audit trail,” “tamper-proof signed document,” or “certificate of completion.”
- “Accepted everywhere,” “works for every document,” or “guaranteed acceptance.”
- “Establishes intent,” “proves consent,” or “proves ownership.”
- “Legal advice” or recommendations about whether a particular instrument may be signed electronically.

## Required FAQ boundary answer

**Is this a certified digital signature?**  
No. Only Signature creates an image of the signature or initials you draw. It does not verify identity, issue a certificate, apply a cryptographic digital signature, notarize a document, or create an audit trail.

**Can every recipient accept an image signature?**  
No. Requirements depend on the recipient, document, and applicable law. Check with the recipient before relying on an image signature.

**Can I use another person’s signature?**  
Only if you are legally authorized to use it. Forgery, impersonation, fraud, and other unauthorized uses are prohibited.

## Legal-review release gates

- Confirm operator legal identity, address, support contact, governing law, territory list, and DSA trader status.
- Have qualified counsel review Terms, Privacy Policy, authorized-use language, consumer purchase disclosures, disclaimer/limitation language, and this claims matrix for the selected territories.
- Review every App Store, website, screenshot, app-preview, paywall, FAQ, and in-app string against the prohibited-copy list.
- Recheck current U.S. federal/state and EU/UK law before release outside the initial territory.
- Preserve the hard scope boundary: no real-document upload, document signing, signature requests, identity verification, certificates, notarization, or legal acceptance decision.

