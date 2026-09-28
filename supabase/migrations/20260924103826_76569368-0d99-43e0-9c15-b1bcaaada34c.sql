-- Player profiles (one per account)
create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  created_at timestamptz not null default now()
);

-- One row per player per daily puzzle
create table public.game_results (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  puzzle_date date not null,
  won boolean not null,
  attempts integer not null default 0,
  time_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, puzzle_date)
);

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.game_results TO authenticated;
GRANT SELECT ON public.game_results TO anon;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.game_results TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

create policy "Anyone can view profiles"
  on public.profiles for select to anon, authenticated using (true);
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Anyone can view game results"
  on public.game_results for select to anon, authenticated using (true);
create policy "Users can insert own results"
  on public.game_results for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own results"
  on public.game_results for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile on signup, seeded with Google name or email prefix
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leaderboard: today's winners, fewest guesses then fastest time
create or replace function public.leaderboard_today(p_date date)
returns table (user_id uuid, display_name text, attempts integer, time_seconds integer)
language sql
stable
security definer
set search_path = public
as $$
  select g.user_id, p.display_name, g.attempts, g.time_seconds
  from public.game_results g
  join public.profiles p on p.id = g.user_id
  where g.puzzle_date = p_date and g.won
  order by g.attempts asc, g.time_seconds asc
  limit 25;
$$;

-- Leaderboard: all-time top players by total wins
create or replace function public.leaderboard_alltime()
returns table (user_id uuid, display_name text, wins bigint, games bigint)
language sql
stable
security definer
set search_path = public
as $$
  select g.user_id, p.display_name,
         count(*) filter (where g.won) as wins,
         count(*) as games
  from public.game_results g
  join public.profiles p on p.id = g.user_id
  group by g.user_id, p.display_name
  order by wins desc, games asc
  limit 25;
$$;

grant execute on function public.leaderboard_today(date) to anon, authenticated;
grant execute on function public.leaderboard_alltime() to anon, authenticated;