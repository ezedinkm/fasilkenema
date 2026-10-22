CREATE TABLE "admin_password_reset_tokens" (
  "id" serial PRIMARY KEY NOT NULL,
  "admin_id" integer NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "admin_password_reset_tokens_token_hash_key"
  ON "admin_password_reset_tokens" USING btree ("token_hash");

CREATE INDEX "admin_password_reset_tokens_admin_id_idx"
  ON "admin_password_reset_tokens" USING btree ("admin_id");

CREATE INDEX "admin_password_reset_tokens_expires_at_idx"
  ON "admin_password_reset_tokens" USING btree ("expires_at");
