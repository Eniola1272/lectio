-- 003: dual OT / NT bookmarks
-- Each user now has two independent positions — one in the OT, one in the NT.
-- progress_history gains a `testament` column so we can compute per-testament deltas.

-- Drop and recreate reading_progress with separate OT / NT fields
drop table if exists reading_progress;

create table reading_progress (
  user_id       uuid primary key references profiles(id) on delete cascade,
  -- Old Testament bookmark (index is 1-based within OT: 1 = Genesis 1, 929 = Malachi 4)
  ot_book           text,
  ot_chapter        int  check (ot_chapter is null or ot_chapter > 0),
  ot_chapter_index  int  check (ot_chapter_index is null or (ot_chapter_index >= 1 and ot_chapter_index <= 929)),
  -- New Testament bookmark (index is 1-based within NT: 1 = Matthew 1, 260 = Revelation 22)
  nt_book           text,
  nt_chapter        int  check (nt_chapter is null or nt_chapter > 0),
  nt_chapter_index  int  check (nt_chapter_index is null or (nt_chapter_index >= 1 and nt_chapter_index <= 260)),
  updated_at    timestamptz default now()
);

alter table reading_progress enable row level security;

create policy "Users manage own progress"
  on reading_progress for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Drop and recreate progress_history with testament column
-- chapter_index is now testament-relative (OT: 1-929, NT: 1-260)
drop table if exists progress_history;

create table progress_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  testament     text not null check (testament in ('old', 'new')),
  book          text not null,
  chapter       int  not null,
  chapter_index int  not null,
  recorded_at   timestamptz default now()
);

alter table progress_history enable row level security;

create policy "Users manage own history"
  on progress_history for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
