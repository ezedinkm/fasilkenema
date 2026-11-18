CREATE TABLE "member_accounts" (
  "id" serial PRIMARY KEY NOT NULL,
  "full_name" text NOT NULL,
  "email" text,
  "phone" text,
  "password" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "member_accounts_email_lower_unique"
  ON "member_accounts" USING btree (lower("email"))
  WHERE "email" IS NOT NULL;

CREATE UNIQUE INDEX "member_accounts_phone_unique"
  ON "member_accounts" USING btree ("phone")
  WHERE "phone" IS NOT NULL;

ALTER TABLE "members"
  ADD COLUMN "account_id" integer
  REFERENCES "member_accounts"("id")
  ON DELETE SET NULL;

ALTER TABLE "pending_member_applications"
  ADD COLUMN "account_id" integer
  REFERENCES "member_accounts"("id")
  ON DELETE SET NULL;

CREATE INDEX "members_account_id_idx"
  ON "members" USING btree ("account_id");
