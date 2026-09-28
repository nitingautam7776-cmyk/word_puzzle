import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Server publishable client — public read-only data only. */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type TodayLeader = {
  user_id: string;
  display_name: string;
  attempts: number;
  time_seconds: number;
};

export type AllTimeLeader = {
  user_id: string;
  display_name: string;
  wins: number;
  games: number;
};

export const getLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  const supa = publicClient();
  const today = new Date().toISOString().slice(0, 10);
  const [todayRes, allTimeRes] = await Promise.all([
    supa.rpc("leaderboard_today", { p_date: today }),
    supa.rpc("leaderboard_alltime"),
  ]);
  return {
    today: (todayRes.data ?? []) as TodayLeader[],
    allTime: (allTimeRes.data ?? []) as AllTimeLeader[],
    date: today,
  };
});

export type GameResultRow = {
  puzzle_date: string;
  won: boolean;
  attempts: number;
  time_seconds: number;
};

export const getMyResults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("game_results")
      .select("puzzle_date, won, attempts, time_seconds")
      .order("puzzle_date", { ascending: false })
      .limit(400);
    if (error) throw new Error(error.message);
    return (data ?? []) as GameResultRow[];
  });

export const submitResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        puzzleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        won: z.boolean(),
        attempts: z.number().int().min(1).max(6),
        timeSeconds: z.number().int().min(0).max(86_400),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("game_results")
      .select("id")
      .eq("user_id", userId)
      .eq("puzzle_date", data.puzzleDate)
      .maybeSingle();
    if (existing) return { recorded: false as const };
    const { error } = await supabase.from("game_results").insert({
      user_id: userId,
      puzzle_date: data.puzzleDate,
      won: data.won,
      attempts: data.attempts,
      time_seconds: data.timeSeconds,
    });
    if (error) throw new Error(error.message);
    return { recorded: true as const };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("display_name")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { display_name: data?.display_name ?? "Player" };
  });

export const updateDisplayName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ displayName: z.string().trim().min(1).max(30) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ display_name: data.displayName })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
