import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Share2, Timer, Trophy } from "lucide-react";
import { Board, Keyboard, letterStatesFromGuesses } from "@/components/game";
import { Button } from "@/components/ui/button";
import {
  getMyResults,
  submitResult,
  type GameResultRow,
} from "@/lib/game.functions";
import {
  computeStreak,
  evaluateGuess,
  getDailyAnswer,
  getTodayKey,
  isValidGuess,
} from "@/lib/words";
import { cn } from "@/lib/utils";

const myResultsOptions = queryOptions({
  queryKey: ["my-results"],
  queryFn: getMyResults,
});

export const Route = createFileRoute("/_authenticated/play")({
  head: () => ({
    meta: [
      { title: "Play · Inkling" },
      {
        name: "description",
        content: "Guess today's five-letter word in six tries.",
      },
      { property: "og:title", content: "Play · Inkling" },
      {
        property: "og:description",
        content: "Guess today's five-letter word in six tries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myResultsOptions),
  component: PlayPage,
});

type Status = "playing" | "won" | "lost";

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PlayPage() {
  const { data: results } = useSuspenseQuery(myResultsOptions);
  const queryClient = useQueryClient();
  const submit = useServerFn(submitResult);

  const today = getTodayKey();
  const answer = useMemo(() => getDailyAnswer(today), [today]);
  const todayRow: GameResultRow | undefined = results.find(
    (r) => r.puzzle_date === today,
  );

  const storageKey = `inkling-${today}`;
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [lastRevealedRow, setLastRevealedRow] = useState<number | null>(null);
  const startedAt = useRef<number>(Date.now());
  const [hydrated, setHydrated] = useState(false);

  // Restore today's progress (same device)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          guesses?: unknown;
          startedAt?: unknown;
        };
        if (Array.isArray(saved.guesses)) {
          setGuesses(
            saved.guesses.filter(
              (g): g is string => typeof g === "string" && g.length === 5,
            ),
          );
        }
        if (typeof saved.startedAt === "number") startedAt.current = saved.startedAt;
      }
    } catch {
      // ignore corrupt state
    }
    setHydrated(true);
  }, [storageKey]);

  const status: Status = todayRow
    ? todayRow.won
      ? "won"
      : "lost"
    : guesses.includes(answer)
      ? "won"
      : guesses.length >= 6
        ? "lost"
        : "playing";

  // Persist progress
  useEffect(() => {
    if (!hydrated || status !== "playing") return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ guesses, startedAt: startedAt.current }),
      );
    } catch {
      // ignore quota errors
    }
  }, [guesses, hydrated, status, storageKey]);

  const finishMutation = useMutation({
    mutationFn: submit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-results"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (err: Error) =>
      toast.error(`Could not save your result: ${err.message}`),
  });

  const finish = useCallback(
    (won: boolean, attempts: number) => {
      const timeSeconds = Math.min(
        86_400,
        Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      );
      finishMutation.mutate({
        data: { puzzleDate: today, won, attempts, timeSeconds },
      });
    },
    [finishMutation, today],
  );

  const flashShake = () => {
    setShakeRow(guesses.length);
    window.setTimeout(() => setShakeRow(null), 600);
  };

  const onKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;
      if (key === "Enter") {
        const guess = current.toLowerCase();
        if (guess.length < 5) {
          toast.error("Not enough letters");
          flashShake();
          return;
        }
        if (!isValidGuess(guess)) {
          toast.error("Not a word in our list");
          flashShake();
          return;
        }
        const next = [...guesses, guess];
        setGuesses(next);
        setCurrent("");
        setLastRevealedRow(next.length - 1);
        if (guess === answer) {
          window.setTimeout(() => finish(true, next.length), 750);
        } else if (next.length >= 6) {
          window.setTimeout(() => finish(false, 6), 950);
        }
        return;
      }
      if (key === "Backspace") {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      if (/^[a-zA-Z]$/.test(key)) {
        setCurrent((c) => (c.length < 5 ? c + key.toLowerCase() : c));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, guesses, status, answer, finish],
  );

  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter" || e.key === "Backspace" || /^[a-zA-Z]$/.test(e.key)) {
        onKey(e.key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey]);

  const letterStates = useMemo(
    () => letterStatesFromGuesses(guesses, answer),
    [guesses, answer],
  );

  const stats = useMemo(() => {
    const played = results.length;
    const wins = results.filter((r) => r.won).length;
    const streak = computeStreak(results);
    const dist = [1, 2, 3, 4, 5, 6].map(
      (n) => results.filter((r) => r.won && r.attempts === n).length,
    );
    const best = results
      .filter((r) => r.won)
      .reduce((min, r) => Math.min(min, r.time_seconds), Infinity);
    return {
      played,
      winPct: played ? Math.round((wins / played) * 100) : 0,
      streak,
      dist,
      best: Number.isFinite(best) ? best : null,
    };
  }, [results]);

  const shareText = useMemo(() => {
    const grid = guesses
      .map((g) =>
        evaluateGuess(g, answer)
          .map((s) => (s === "correct" ? "🟩" : s === "present" ? "🟨" : "⬛"))
          .join(""),
      )
      .join("\n");
    const score = guesses.includes(answer) ? `${guesses.length}/6` : "X/6";
    return `Inkling · ${today} — ${score}\n${grid}`;
  }, [guesses, answer, today]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Result copied to clipboard");
    } catch {
      toast.error("Could not copy result");
    }
  };

  const maxDist = Math.max(1, ...stats.dist);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-8">
      <div className="py-4 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          {status === "won"
            ? "Splendid."
            : status === "lost"
              ? "Tough luck."
              : "Today's word"}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {today} · new word at midnight UTC
        </p>
      </div>

      {hydrated ? (
        <Board
          guesses={guesses}
          current={status === "playing" ? current : ""}
          answer={answer}
          shakeRow={shakeRow}
          lastRevealedRow={lastRevealedRow}
        />
      ) : (
        <div className="h-[330px]" aria-hidden />
      )}

      {status !== "playing" ? (
        <section className="animate-rise mx-auto mt-6 w-full max-w-md rounded-xl border border-border bg-card p-5">
          {status === "won" ? (
            <div className="flex items-center gap-2 text-center">
              <Trophy className="h-5 w-5 text-primary" />
              <p className="font-display text-lg font-bold">
                Solved in {todayRow ? todayRow.attempts : guesses.length}/6
                {todayRow ? (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {fmtTime(todayRow.time_seconds)}
                  </span>
                ) : null}
              </p>
            </div>
          ) : (
            <p className="text-center">
              The word was{" "}
              <span className="font-display text-lg font-bold uppercase tracking-wide">
                {answer}
              </span>
            </p>
          )}

          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-display text-xl font-bold">{stats.played}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Played
              </div>
            </div>
            <div>
              <div className="font-display text-xl font-bold">{stats.winPct}%</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Win rate
              </div>
            </div>
            <div>
              <div className="font-display text-xl font-bold">{stats.streak}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Streak
              </div>
            </div>
            <div>
              <div className="font-display text-xl font-bold">
                {stats.best != null ? fmtTime(stats.best) : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Best time
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            {stats.dist.map((count, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right font-semibold">{i + 1}</span>
                <div
                  className={cn(
                    "h-4 rounded-sm text-right",
                    count > 0
                      ? "bg-tile-correct text-primary-foreground"
                      : "bg-muted",
                  )}
                  style={{ width: `${Math.max(8, (count / maxDist) * 100)}%` }}
                >
                  <span className="mr-1.5 leading-4 font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <Button className="flex-1 font-semibold" onClick={() => void share()}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share result
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <a href="/leaderboard">Leaderboard</a>
            </Button>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
            <Timer className="h-3 w-3" /> Come back tomorrow for a new word
          </p>
        </section>
      ) : (
        <div className="mt-6">
          <Keyboard letterStates={letterStates} onKey={onKey} disabled={false} />
        </div>
      )}
    </main>
  );
}
