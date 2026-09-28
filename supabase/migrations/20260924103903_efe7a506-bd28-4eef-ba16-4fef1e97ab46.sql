create or replace function public.leaderboard_today(p_date date)
returns table (user_id uuid, display_name text, attempts integer, time_seconds integer)
language sql
stable
security invoker
set search_path = public
as $$
  select g.user_id, p.display_name, g.attempts, g.time_seconds
  from public.game_results g
  join public.profiles p on p.id = g.user_id
  where g.puzzle_date = p_date and g.won
  order by g.attempts asc, g.time_seconds asc
  limit 25;
$$;

create or replace function public.leaderboard_alltime()
returns table (user_id uuid, display_name text, wins bigint, games bigint)
language sql
stable
security invoker
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