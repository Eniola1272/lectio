-- ============================================================
-- 1. Tables (create all first so cross-table policies can reference them)
-- ============================================================

-- profiles: one row per auth user
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);

-- reading_entries: one row per chapter logged
create table reading_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  testament text not null check (testament in ('old','new')),
  book text not null,
  chapter int not null check (chapter > 0),
  read_at date not null default current_date,
  created_at timestamptz default now()
);

create index on reading_entries (user_id, read_at);
create unique index on reading_entries (user_id, testament, book, chapter);

-- friendships: undirected, store with smaller uuid first
create table friendships (
  user_a uuid not null references profiles(id) on delete cascade,
  user_b uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('pending','accepted')),
  requested_by uuid not null references profiles(id),
  created_at timestamptz default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);


-- ============================================================
-- 2. Enable RLS
-- ============================================================

alter table profiles         enable row level security;
alter table reading_entries  enable row level security;
alter table friendships      enable row level security;


-- ============================================================
-- 3. Policies — profiles
-- ============================================================

create policy "profiles_select_authenticated"
  on profiles for select to authenticated using (true);

create policy "profiles_insert_own"
  on profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ============================================================
-- 4. Policies — reading_entries
-- ============================================================

-- own rows: full access
create policy "entries_own"
  on reading_entries for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- accepted friends can read each other's entries
-- (friendships table exists by the time this runs)
create policy "entries_friends_select"
  on reading_entries for select to authenticated
  using (
    exists (
      select 1 from friendships
      where status = 'accepted'
        and (
          (user_a = auth.uid() and user_b = reading_entries.user_id)
          or
          (user_b = auth.uid() and user_a = reading_entries.user_id)
        )
    )
  );


-- ============================================================
-- 5. Policies — friendships
-- ============================================================

create policy "friendships_select_participant"
  on friendships for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

create policy "friendships_insert_requester"
  on friendships for insert to authenticated
  with check (requested_by = auth.uid());

-- only the non-requester can accept (set status = 'accepted')
create policy "friendships_update_accepter"
  on friendships for update to authenticated
  using (
    (user_a = auth.uid() or user_b = auth.uid())
    and requested_by != auth.uid()
  )
  with check (status = 'accepted');
