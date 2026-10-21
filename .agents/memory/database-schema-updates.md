---
name: Database schema updates
description: Cautions for pushing schema changes against this project's existing PostgreSQL databases.
---

Do not force Drizzle Kit push through table-name conflict prompts. It stops before applying changes when existing schema drift requires interactive rename choices; inspect the proposed changes and avoid altering unrelated tables. The development and production databases are separate targets, and production Neon is not migrated by the development shell.

For memberships, annual is the only supported option for new registrations and renewals. Keep legacy monthly-price columns and honor the cycle on already-created payment records; do not drop or rewrite their data during this UI change.

**Why:** A development schema push encountered an interactive table-name conflict and exited before changing the database. Existing membership data and already-initialized monthly payments also need to remain intact while new checkout becomes annual-only.

**How to apply:** Verify the database target before writing. For additive changes, use a narrowly scoped migration when a global push would require unrelated rename decisions; do not assume publishing updates the external production database. Only remove legacy membership columns after an explicit request and a safe data-migration plan.
