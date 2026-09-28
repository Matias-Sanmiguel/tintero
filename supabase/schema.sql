-- Tintero. Correr en el SQL editor de Supabase.
-- La app entra con la service role key. No hay políticas para anon.

create table if not exists members (
  id text primary key,
  email text unique not null,
  name text not null,
  password_hash text not null,
  role text not null,
  career text not null default '',
  year text not null default '',
  status text not null,
  joined_at timestamptz not null default now()
);

create table if not exists ideas (
  id text primary key,
  title text not null,
  body text not null,
  tags jsonb not null default '[]',
  votes jsonb not null default '[]',
  author_id text not null,
  status text not null,
  project_id text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id text primary key,
  name text not null,
  summary text not null default '',
  status text not null,
  owner_id text not null,
  idea_id text,
  created_at timestamptz not null default now()
);

create table if not exists budgets (
  id text primary key,
  project_id text not null,
  title text not null,
  recipient text not null,
  subject text not null,
  rationale text not null default '',
  status text not null,
  due_date date,
  items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists inventory_items (
  id text primary key,
  name text not null,
  quantity integer not null,
  condition text not null,
  location text not null default '',
  holder text not null default '',
  project_id text,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id text primary key,
  kind text not null,
  title text not null,
  body text not null,
  pinned boolean not null default false,
  author_id text not null,
  capacity integer,
  event_date date,
  signups jsonb not null default '[]',
  comments jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  title text not null,
  date date not null,
  kind text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table members enable row level security;
alter table ideas enable row level security;
alter table projects enable row level security;
alter table budgets enable row level security;
alter table inventory_items enable row level security;
alter table posts enable row level security;
alter table events enable row level security;
