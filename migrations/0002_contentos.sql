-- ContentOS MVP schema: per-user content library, YouTube sources, moments, clips.

create table if not exists content_items (
  id text primary key,
  user_id text not null,
  title text not null,
  platform text not null,
  status text not null default 'draft',
  scheduled_at date,
  published_at date,
  notes text not null default '',
  views integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_user_idx on content_items (user_id);
create index if not exists content_items_user_platform_idx on content_items (user_id, platform);
create index if not exists content_items_user_status_idx on content_items (user_id, status);

create table if not exists youtube_sources (
  id text primary key,
  user_id text not null,
  youtube_url text not null,
  youtube_id text not null,
  title text not null,
  duration_sec integer not null default 0,
  thumbnail_url text,
  channel_title text,
  created_at timestamptz not null default now()
);

create index if not exists youtube_sources_user_idx on youtube_sources (user_id);

create table if not exists viral_moments (
  id text primary key,
  source_id text not null references youtube_sources (id) on delete cascade,
  user_id text not null,
  start_sec numeric not null,
  end_sec numeric not null,
  score numeric not null,
  reason_type text not null,
  reason_text text not null,
  rank integer not null default 0
);

create index if not exists viral_moments_source_idx on viral_moments (source_id);
create index if not exists viral_moments_user_idx on viral_moments (user_id);

create table if not exists clips (
  id text primary key,
  user_id text not null,
  source_id text not null references youtube_sources (id) on delete cascade,
  moment_id text references viral_moments (id) on delete set null,
  title text not null,
  in_sec numeric not null,
  out_sec numeric not null,
  aspect text not null default '9:16',
  captions_json jsonb not null default '[]'::jsonb,
  seo_json jsonb not null default '{}'::jsonb,
  export_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clips_user_idx on clips (user_id);
create index if not exists clips_source_idx on clips (source_id);

create table if not exists user_seeds (
  user_id text primary key,
  seeded_at timestamptz not null default now()
);
