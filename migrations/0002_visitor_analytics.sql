BEGIN;

CREATE TABLE IF NOT EXISTS public.visitor_pageviews (
  id serial PRIMARY KEY,
  session_hash varchar(64) NOT NULL,
  page_path varchar(512) NOT NULL,
  referrer_host varchar(255),
  device_category varchar(16) NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitor_pageviews_created_at_idx
  ON public.visitor_pageviews(created_at);
CREATE INDEX IF NOT EXISTS visitor_pageviews_session_created_idx
  ON public.visitor_pageviews(session_hash, created_at);
CREATE INDEX IF NOT EXISTS visitor_pageviews_page_created_idx
  ON public.visitor_pageviews(page_path, created_at);
CREATE INDEX IF NOT EXISTS visitor_pageviews_referrer_created_idx
  ON public.visitor_pageviews(referrer_host, created_at);

CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  session_hash varchar(64) PRIMARY KEY,
  current_page_path varchar(512) NOT NULL,
  referrer_host varchar(255),
  device_category varchar(16) NOT NULL DEFAULT 'unknown',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitor_sessions_last_seen_idx
  ON public.visitor_sessions(last_seen_at);
CREATE INDEX IF NOT EXISTS visitor_sessions_started_at_idx
  ON public.visitor_sessions(started_at);

COMMIT;
