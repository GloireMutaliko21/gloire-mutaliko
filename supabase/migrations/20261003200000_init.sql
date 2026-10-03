-- Portfolio schema. Translated text fields are jsonb objects shaped { "en": "", "fr": "" }.
-- Every table has row level security on and no policy: only the server, using the
-- secret key, reads and writes. The browser never talks to these tables.

create extension if not exists pgcrypto;

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

/* Content */

create table profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role jsonb not null default '{"en":"","fr":""}',
  headline jsonb not null default '{"en":"","fr":""}',
  bio jsonb not null default '{"en":"","fr":""}',
  location jsonb not null default '{"en":"","fr":""}',
  email text not null default '',
  years_of_experience int not null default 0,
  available boolean not null default true,
  availability jsonb not null default '{"en":"","fr":""}',
  avatar jsonb,
  cv jsonb,
  socials jsonb not null default '[]',
  cal_link text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'frontend'
    check (category in ('frontend', 'backend', 'devops', 'data', 'tools')),
  level int not null default 3 check (level between 1 and 5),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  company_url text not null default '',
  role jsonb not null default '{"en":"","fr":""}',
  location jsonb not null default '{"en":"","fr":""}',
  start_month text not null check (start_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  end_month text check (end_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  summary jsonb not null default '{"en":"","fr":""}',
  highlights jsonb not null default '[]',
  stack text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null default '{"en":"","fr":""}',
  summary jsonb not null default '{"en":"","fr":""}',
  description jsonb not null default '{"en":"","fr":""}',
  images jsonb not null default '[]' check (jsonb_array_length(images) <= 10),
  tags text[] not null default '{}',
  live_url text not null default '',
  repo_url text not null default '',
  year int not null default extract(year from now())::int,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_tags_idx on projects using gin (tags);

create trigger profile_updated_at before update on profile for each row execute function set_updated_at();
create trigger skills_updated_at before update on skills for each row execute function set_updated_at();
create trigger experiences_updated_at before update on experiences for each row execute function set_updated_at();
create trigger projects_updated_at before update on projects for each row execute function set_updated_at();

/* Inbox and analytics */

create table messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null default '',
  body text not null,
  locale text not null default 'en',
  country text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_unread_idx on messages (read) where not read;

create table page_views (
  id bigint generated always as identity primary key,
  path text not null,
  locale text not null default '',
  country text not null default '',
  visitor text not null,
  referrer text not null default '',
  created_at timestamptz not null default now()
);
create index page_views_created_at_idx on page_views (created_at);

create table downloads (
  id bigint generated always as identity primary key,
  kind text not null default 'cv',
  locale text not null default '',
  country text not null default '',
  created_at timestamptz not null default now()
);
create index downloads_created_at_idx on downloads (created_at);

/* Versioning */

create table revisions (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('profile', 'skill', 'experience', 'project')),
  entity_id uuid not null,
  version int not null,
  action text not null check (action in ('create', 'update', 'delete', 'restore')),
  label text not null default '',
  restored_from int,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (entity, entity_id, version)
);
create index revisions_created_at_idx on revisions (created_at desc);

/* Lock everything down: no policies means no access with the publishable key. */

alter table profile enable row level security;
alter table skills enable row level security;
alter table experiences enable row level security;
alter table projects enable row level security;
alter table messages enable row level security;
alter table page_views enable row level security;
alter table downloads enable row level security;
alter table revisions enable row level security;

/* Only the server role gets table access; anon and authenticated get nothing. */

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

/* Dashboard figures in one round trip. */

create or replace function dashboard_stats(days int)
returns jsonb
language sql
stable
set search_path = public
as $$
  with bounds as (
    select date_trunc('day', now() at time zone 'utc') at time zone 'utc' - make_interval(days => days - 1) as since
  ),
  pv as (
    select * from page_views where created_at >= (select since from bounds)
  )
  select jsonb_build_object(
    'since', (select since from bounds),
    'views', (select count(*) from pv),
    'visitors', (select count(distinct visitor) from pv),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('date', d, 'views', v, 'visitors', u) order by d)
      from (
        select to_char(created_at at time zone 'utc', 'YYYY-MM-DD') as d, count(*) as v, count(distinct visitor) as u
        from pv group by 1
      ) x
    ), '[]'),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'locale', locale, 'views', v))
      from (select path, locale, count(*) as v from pv group by 1, 2) x
    ), '[]'),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('country', country, 'views', v, 'visitors', u) order by u desc, v desc)
      from (
        select country, count(*) as v, count(distinct visitor) as u
        from pv group by 1 order by 3 desc, 2 desc limit 12
      ) x
    ), '[]'),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('host', referrer, 'views', v) order by v desc)
      from (
        select referrer, count(*) as v from pv where referrer <> ''
        group by 1 order by 2 desc limit 8
      ) x
    ), '[]'),
    'downloads', (select count(*) from downloads where kind = 'cv' and created_at >= (select since from bounds)),
    'downloadsAllTime', (select count(*) from downloads where kind = 'cv'),
    'unread', (select count(*) from messages where not read),
    'messages', (select count(*) from messages where created_at >= (select since from bounds))
  );
$$;

revoke execute on function dashboard_stats(int) from public, anon, authenticated;
grant execute on function dashboard_stats(int) to service_role;

/* Files: one public bucket for project images, the profile photo and the CV. */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'application/pdf']
)
on conflict (id) do nothing;
