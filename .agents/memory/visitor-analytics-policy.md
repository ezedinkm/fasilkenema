---
name: Visitor analytics policy
description: User decisions for public-site traffic measurement and visitor privacy.
---

Use first-party in-app analytics for the club website. Visitors do not need to accept an analytics banner. Keep stored data limited to hashed random session IDs, public page paths, external referrer hostnames, coarse device category, and timestamps; do not persist IP addresses, names, email addresses, or full user-agent strings. Historical analytics retention is 12 months.

**Why:** The user chose first-party analytics stored in this app and explicitly selected anonymous tracking without a visitor-facing notice.

**How to apply:** Preserve these limits when expanding analytics. Keep admin/member routes excluded, avoid adding identifying fields, and maintain the announced retention period.
