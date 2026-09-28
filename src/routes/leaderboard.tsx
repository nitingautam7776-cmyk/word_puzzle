import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Crown } from "lucide-react";
import { getLeaderboard } from "@/lib/game.functions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const leaderboardOptions = queryOptions({
  queryKey: ["leaderboard"],
  queryFn: getLeaderboard,
});

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard · Inkling" },
      {
        name: "description",
        content:
          "Today's fastest word solvers and the all-time top players on Inkling, the daily word puzzle.",
      },
      { property: "og:title", content: "Leaderboard · Inkling" },
      {
        property: "og:description",
        content:
          "Today's fastest word solvers and the all-time top players on Inkling, the daily word puzzle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leaderboardOptions),
  component: LeaderboardPage,
});

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function rankClass(rank: number): string {
  if (rank === 1) return "bg-primary text-primary-foreground";
  if (rank === 2) return "bg-foreground/80 text-background";
  if (rank === 3) return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
}

function EmptyBoard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function LeaderboardPage() {
  const { data } = useSuspenseQuery(leaderboardOptions);

  return (
    <div className="paper-grain min-h-screen bg-background">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Inkling<span className="text-primary">.</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-extrabold">Leaderboard</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Today's board ranks winners by fewest guesses, then fastest time.
        </p>

        <Tabs defaultValue="today" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="alltime">All time</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            {data.today.length === 0 ? (
              <EmptyBoard text="No one has solved today's word yet. Be the first!" />
            ) : (
              <ol className="flex flex-col gap-2">
                {data.today.map((row, i) => (
                  <li
                    key={row.user_id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        rankClass(i + 1),
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {row.display_name}
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {row.attempts}/6 · {fmtTime(row.time_seconds)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>

          <TabsContent value="alltime" className="mt-4">
            {data.allTime.length === 0 ? (
              <EmptyBoard text="No games played yet. History starts with the first solve." />
            ) : (
              <ol className="flex flex-col gap-2">
                {data.allTime.map((row, i) => (
                  <li
                    key={row.user_id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        rankClass(i + 1),
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {row.display_name}
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {row.wins} {row.wins === 1 ? "win" : "wins"} · {row.games}{" "}
                      played
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-10 rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="font-display text-lg font-bold">Think you can top this?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Today's word is waiting for you.
          </p>
          <Button asChild className="mt-4 font-semibold">
            <Link to="/play">
              Play today's word <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
