---
name: Database schema updates
description: Cautions for pushing schema changes against this project's existing PostgreSQL databases.
---

Do not force Drizzle Kit push through table-name conflict prompts. It stops before applying changes when existing schema drift requires interactive rename choices; inspect the proposed changes and avoid altering unrelated tables. The development and production databases are separate targets, and production Neon is not migrated by the development shell.

**Why:** A development schema push encountered an interactive table-name conflict and exited before changing the database. The production Neon connection is separate from the development workspace.

**How to apply:** Verify the database target before writing. For additive changes, use a narrowly scoped migration when a global push would require unrelated rename decisions; do not assume publishing updates the external production database.
