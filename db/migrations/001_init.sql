-- WOPCAA platform: initial schema
-- Users and sessions live in neon_auth (Managed Better Auth). Everything the
-- application owns lives in public and points at neon_auth."user".id.

create extension if not exists pgcrypto;

-- ───────────────────────── People ─────────────────────────
create table if not exists profiles (
  user_id     uuid primary key references neon_auth."user"(id) on delete cascade,
  role        text not null default 'reporter' check (role in ('reporter','editor','admin','super_admin')),
  full_name   text,
  phone       text,
  county      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ───────────────────────── Reports ─────────────────────────
-- Sensitive text is sealed by the application (AES-256-GCM) before it is stored:
-- description, location_detail, perpetrator_detail, contact_value, support_other.
-- The coarse classification stays readable for triage and statistics.
create table if not exists reports (
  id                 uuid primary key default gen_random_uuid(),
  reference_code     text not null unique,
  access_key_hash    text,                     -- anonymous follow-up: sha256 of the key shown once to the reporter
  reporter_user_id   uuid references neon_auth."user"(id) on delete set null,
  is_anonymous       boolean not null default true,
  category           text not null,
  subcategories      text[] not null default '{}',
  victim             text not null default 'self' check (victim in ('self','someone_else')),
  incident_date      date,
  incident_ongoing   boolean not null default false,
  county             text,
  description        text not null,            -- sealed
  location_detail    text,                     -- sealed
  perpetrator_relation text,
  perpetrator_detail text,                     -- sealed
  support_needed     text[] not null default '{}',
  support_other      text,                     -- sealed
  wants_contact      boolean not null default false,
  contact_method     text check (contact_method in ('phone','sms','whatsapp','email') or contact_method is null),
  contact_value      text,                     -- sealed
  contact_hash       text,                     -- blind index of contact_value
  safe_times         text,
  urgency            text not null default 'normal' check (urgency in ('low','normal','high','critical')),
  status             text not null default 'new' check (status in ('new','in_review','referred','resolved','closed')),
  assigned_to        uuid references neon_auth."user"(id) on delete set null,
  consent_share      boolean not null default false,
  source             text not null default 'web',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  resolved_at        timestamptz
);
create index if not exists reports_status_idx on reports(status, created_at desc);
create index if not exists reports_reporter_idx on reports(reporter_user_id, created_at desc);

create table if not exists report_attachments (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references reports(id) on delete cascade,
  object_key  text not null,       -- key in the private "evidence" bucket
  file_name   text not null,
  mime_type   text not null,
  size_bytes  integer not null,
  created_at  timestamptz not null default now()
);

-- Messages between the case team and the reporter, plus internal notes and system events.
create table if not exists report_updates (
  id           uuid primary key default gen_random_uuid(),
  report_id    uuid not null references reports(id) on delete cascade,
  author_id    uuid references neon_auth."user"(id) on delete set null,
  author_kind  text not null check (author_kind in ('admin','reporter','system')),
  kind         text not null default 'message' check (kind in ('message','note','status','assignment')),
  body         text not null,      -- sealed
  created_at   timestamptz not null default now()
);
create index if not exists report_updates_report_idx on report_updates(report_id, created_at);

-- ───────────────────────── Notifications ─────────────────────────
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references neon_auth."user"(id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, read_at, created_at desc);

-- ───────────────────────── Content studio ─────────────────────────
create table if not exists site_settings (
  id          text primary key default 'site' check (id = 'site'),
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references neon_auth."user"(id) on delete set null
);

-- A page is an ordered list of sections. Editors work on draft_*; publishing copies draft to live.
create table if not exists pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  seo_description text,
  sections        jsonb not null default '[]',
  draft_title     text,
  draft_seo_description text,
  draft_sections  jsonb,
  status          text not null default 'draft' check (status in ('draft','published')),
  show_in_nav     boolean not null default false,
  nav_order       integer not null default 100,
  nav_group       text,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      uuid references neon_auth."user"(id) on delete set null
);

create table if not exists page_revisions (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references pages(id) on delete cascade,
  title       text not null,
  seo_description text,
  sections    jsonb not null,
  note        text,
  created_at  timestamptz not null default now(),
  created_by  uuid references neon_auth."user"(id) on delete set null
);
create index if not exists page_revisions_page_idx on page_revisions(page_id, created_at desc);

-- Articles, press releases and events.
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  kind          text not null default 'article' check (kind in ('article','press','event')),
  title         text not null,
  excerpt       text,
  body          text not null default '',
  cover_image   text,
  author        text,
  category      text,
  event_start   timestamptz,
  event_location text,
  status        text not null default 'draft' check (status in ('draft','published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_kind_idx on posts(kind, status, published_at desc);

create table if not exists media (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  object_key  text,
  alt         text,
  mime_type   text,
  size_bytes  integer,
  created_at  timestamptz not null default now(),
  created_by  uuid references neon_auth."user"(id) on delete set null
);

-- Newsletter, contact and membership enquiries from the public site.
create table if not exists enquiries (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('contact','newsletter','membership')),
  name        text,
  email       text not null,
  phone       text,
  message     text,
  meta        jsonb not null default '{}',
  handled_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- ───────────────────────── Audit and rate limits ─────────────────────────
create table if not exists audit_log (
  id          bigserial primary key,
  actor_id    uuid,
  action      text not null,
  target      text,
  meta        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  hits         integer not null
);

create or replace function rate_limit_hit(p_key text, p_window_seconds int, p_max int)
returns table(allowed boolean, remaining int, retry_after int)
language plpgsql as $$
declare r rate_limits;
begin
  insert into rate_limits as t(key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when t.window_start < now() - make_interval(secs => p_window_seconds) then 1 else t.hits + 1 end,
    window_start = case when t.window_start < now() - make_interval(secs => p_window_seconds) then now() else t.window_start end
  returning * into r;
  return query select r.hits <= p_max, greatest(p_max - r.hits, 0),
    greatest(0, ceil(extract(epoch from (r.window_start + make_interval(secs => p_window_seconds) - now())))::int);
end $$;
