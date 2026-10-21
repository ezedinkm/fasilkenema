---
name: Safe npm lockfile recovery
description: Why this project explicitly keeps proxy-addr on its patched release.
---

Keep `proxy-addr` at 2.0.8 or newer while Express 4's dependency range still permits the vulnerable 2.0.7 lock. Do not bypass Replit's package firewall.

**Why:** The firewall blocked `proxy-addr@2.0.7` for a critical vulnerability during post-merge `npm ci`. Updating Express alone did not update the transitive lock; explicitly installing the patched compatible release resolved the lock and allowed setup to finish.

**How to apply:** If Express is upgraded later, remove the direct `proxy-addr` pin only after confirming the parent dependency range and lockfile resolve to 2.0.8 or newer.
