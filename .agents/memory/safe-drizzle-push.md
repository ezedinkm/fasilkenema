---
name: Safe Drizzle schema pushes
description: Avoid data loss when Drizzle's push prompts about unique constraints on populated tables.
---

When Drizzle `push` proposes truncating a populated table to add a unique constraint, the prompt is triggered by existing rows, not proof of duplicate keys. Choose to add without truncating after checking duplicates. Never use `--force` for this: let PostgreSQL validate the constraint and fail safely if conflicting data exists. If a constraint cannot be added, preserve the rows and resolve the data conflict separately.

**Why:** Drizzle offered a destructive truncate for a populated members table even though a preflight check found no duplicate phone values. Choosing the non-truncating path preserved all existing members.

**How to apply:** Preview schema changes against the confirmed development database, inspect unique, `NOT NULL`, and type changes, and check existing data before approval. Use strict mode; never force destructive changes to make a schema push pass.
