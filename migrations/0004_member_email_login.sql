-- Members may authenticate with a verified email instead of a phone number.
-- Existing phone and email values remain unchanged.
ALTER TABLE "members" ALTER COLUMN "phone" DROP NOT NULL;
ALTER TABLE "pending_member_applications" ALTER COLUMN "phone" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "members_email_lower_unique"
  ON "members" USING btree (lower("email"))
  WHERE "email" IS NOT NULL;
