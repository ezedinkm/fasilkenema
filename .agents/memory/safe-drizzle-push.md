---
name: Safe Drizzle schema pushes
description: Avoid data loss from Drizzle truncation prompts and destructive diffs for tables omitted from the ORM schema.
---

When Drizzle `push` proposes truncating a populated table to add a unique constraint, the prompt is triggered by existing rows, not proof of duplicate keys. Choose to add without truncating after checking duplicates. Never use `--force` for this: let PostgreSQL validate the constraint and fail safely if conflicting data exists. If a constraint cannot be added, preserve the rows and resolve the data conflict separately.

Drizzle can also propose `DROP TABLE ... CASCADE` for durable tables created by raw runtime SQL when those tables are missing from the ORM schema source. Add their exact columns, constraints, and indexes to the schema source before running a push; do not accept the drops.

**Why:** A push preview once proposed truncating populated member data, and later proposed dropping league tables that existed in the database but were absent from the ORM schema. Both cases could have caused avoidable data loss.

**How to apply:** Preview changes against the confirmed development database, inspect unique, `NOT NULL`, type, foreign-key, and table drops, and check existing data before approval. Use strict mode; never force destructive changes to make a schema push pass.
