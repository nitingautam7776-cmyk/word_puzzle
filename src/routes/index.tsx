import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inkling — Guess the word of the day" },
      {
        name: "description",
        content:
          "A daily five-letter word game. Six tries, one word, a fresh puzzle every day — with streaks and a global leaderboard.",
      },
      { property: "og:title", content: "Inkling — Guess the word of the day" },
      {
        property: "og:description",
        content:
          "A daily five-letter word game. Six tries, one word, a fresh puzzle every day — with streaks and a global leaderboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function DemoTile({
  letter,
  tone,
  delay,
}: {
  letter: string;
  tone: "correct" | "present" | "absent";
  delay: number;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center border-2 font-display text-2xl font-bold uppercase sm:h-16 sm:w-16 sm:text-3xl",
        tone === "correct" && "animate-tile-flip border-tile-correct bg-tile-correct text-primary-foreground",
        tone === "present" && "animate-tile-flip border-tile-present bg-tile-present text-primary-foreground",
        tone === "absent" && "animate-tile-flip border-tile-absent bg-tile-absent text-primary-foreground",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {letter}
    </div>
  );
}

function HowRow({
  word,
  states,
  text,
}: {
  word: string;
  states: ("correct" | "present" | "absent")[];
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {word.split("").map((letter, i) => (
          <div
            key={i}
            className={cn(
              "flex h-8 w-8 items-center justify-center border text-sm font-semibold uppercase",
              states[i] === "correct" && "border-tile-correct bg-tile-correct text-primary-foreground",
              states[i] === "present" && "border-tile-present bg-tile-present text-primary-foreground",
              states[i] === "absent" && "border-tile-absent bg-tile-absent text-primary-foreground",
            )}
          >
            {letter}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="paper-grain min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-display text-xl font-bold tracking-tight">
            Inkling<span className="text-primary">.</span>
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            The daily word puzzle
          </p>
          <h1 className="animate-rise mt-4 font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            One word.
            <br />
            Six tries.
          </h1>
          <div className="mt-8 flex gap-1.5">
            {[
              { l: "P", t: "present" as const },
              { l: "R", t: "absent" as const },
              { l: "I", t: "correct" as const },
              { l: "N", t: "present" as const },
              { l: "T", t: "absent" as const },
            ].map((tile, i) => (
              <DemoTile key={i} letter={tile.l} tone={tile.t} delay={400 + i * 160} />
            ))}
          </div>
          <p className="animate-rise mt-8 max-w-md text-muted-foreground">
            A fresh five-letter word every day. Guess it in six tries, keep your
            streak alive, and race the world on the leaderboard.
          </p>
          <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="font-semibold">
              <Link to="/play">
                Play today's word <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold">
              <Link to="/leaderboard">
                <Trophy className="mr-1 h-4 w-4" /> Leaderboard
              </Link>
            </Button>
          </div>
        </section>

        {/* How to play */}
        <section className="border-t border-border py-14">
          <h2 className="font-display text-2xl font-bold">How it works</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guess the word in six tries. After each guess, the tiles change color.
          </p>
          <div className="mt-8 flex flex-col gap-5">
            <HowRow
              word="crane"
              states={["correct", "absent", "absent", "absent", "absent"]}
              text="C is in the word and in the right spot."
            />
            <HowRow
              word="point"
              states={["absent", "absent", "present", "absent", "absent"]}
              text="I is in the word but in the wrong spot."
            />
            <HowRow
              word="flute"
              states={["absent", "absent", "absent", "absent", "absent"]}
              text="No letters from this guess are in the word."
            />
          </div>
        </section>

        {/* Streak + leaderboard blurb */}
        <section className="border-t border-border py-14">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">Keep your streak</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Solve the word every day to grow your streak. Miss a day and it
                resets to zero — no pressure.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">Climb the board</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fewest guesses and fastest solves win the day. The all-time board
                tracks total wins across everyone.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="font-semibold">
              <Link to="/play">
                Play today's word <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Inkling — a little daily word game, set in type.
      </footer>
    </div>
  );
}
