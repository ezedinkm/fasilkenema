BEGIN;

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'super_admin',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id serial PRIMARY KEY,
  actor_admin_id integer,
  actor_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  resource text NOT NULL,
  status_code integer NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_logs_actor_admin_id_admin_users_id_fk
    FOREIGN KEY (actor_admin_id)
    REFERENCES public.admin_users(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx
  ON public.admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS admin_audit_logs_actor_admin_id_idx
  ON public.admin_audit_logs(actor_admin_id);

COMMIT;
