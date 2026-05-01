-- ============================================================
-- Drop the chapter-ticking model; replace with a single
-- position bookmark per user.
-- ============================================================

drop table if exists reading_entries;

-- Current position: one row per user (upsert on every bookmark move)
create table reading_progress (
  user_id uuid primary key references profiles(id) on delete cascade,
  book text not null,
  chapter int not null check (chapter > 0),
  chapter_index int not null check (chapter_index >= 1 and chapter_index <= 1189),
  updated_at timestamptz default now()
);

alter table reading_progress enable row level security;

create policy "progress_own"
  on reading_progress for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Friends can read each other's current position
create policy "progress_friends_select"
  on reading_progress for select to authenticated
  using (
    exists (
      select 1 from friendships
      where status = 'accepted'
        and (
          (user_a = auth.uid() and user_b = reading_progress.user_id)
          or
          (user_b = auth.uid() and user_a = reading_progress.user_id)
        )
    )
  );


-- Position history: one row per bookmark move (for activity view)
create table progress_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  book text not null,
  chapter int not null,
  chapter_index int not null,
  recorded_at timestamptz default now()
);

create index on progress_history (user_id, recorded_at);

alter table progress_history enable row level security;

create policy "history_own"
  on progress_history for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
