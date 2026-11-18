ALTER TABLE "members"
  ADD COLUMN "account_owner_member_id" integer;

ALTER TABLE "members"
  ADD CONSTRAINT "members_account_owner_member_id_fkey"
  FOREIGN KEY ("account_owner_member_id")
  REFERENCES "members"("id")
  ON DELETE SET NULL;

ALTER TABLE "pending_member_applications"
  ADD COLUMN "account_owner_member_id" integer
  REFERENCES "members"("id")
  ON DELETE SET NULL;

CREATE INDEX "members_account_owner_member_id_idx"
  ON "members" USING btree ("account_owner_member_id");
