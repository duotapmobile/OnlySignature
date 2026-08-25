# Ratings and Reviews Plan

Use Apple’s native review-prompt mechanism only. No fake star selector, satisfaction gate, reward, repeated custom pressure, or routing of unhappy users away from rating.

## Eligibility moments

Consider requesting after a genuine value event:

- the second successful export; or
- a successful transparent export followed by later reuse of that same purchased set.

Do not request during drawing, preview, paywall, purchase pending/recovery, first export, an error, Delete All, or immediately after denial/cancellation. Respect Apple’s system rate limits; the system may show nothing.

## Local state

Store only coarse local eligibility: successful export count, whether a purchased set was later reused, last consideration app version/date, and whether a blocking error/recovery is active. Do not transmit it or associate it with set labels/content.

## Review monitoring

Weekly after launch: review new ratings/reviews in App Store Connect/live listing; classify product truth, price/subscription, purchase recovery, deletion, white box/alpha, export destinations, accessibility, confusion, misuse, and defects. Record actual review evidence separately from inference. Never infer prevalence from a few reviews.

Escalate reports of charge loss, duplicate payment, misleading subscription/lifetime language, lost purchased set without disclosed deletion, privacy transmission, inaccessible core task, or corrupt export to the release/incident process.
