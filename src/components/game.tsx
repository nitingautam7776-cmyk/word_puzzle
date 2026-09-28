import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { evaluateGuess, type TileState } from "@/lib/words";

const TILE_BASE =
  "flex h-12 w-12 md:h-14 md:w-14 items-center justify-center border-2 text-xl md:text-2xl font-semibold uppercase select-none transition-colors";

function Tile({
  letter,
  state,
  flip,
  delay,
  pop,
}: {
  letter: string;
  state: TileState | null;
  flip: boolean;
  delay: number;
  pop: boolean;
}) {
  const stateClass = state
    ? state === "correct"
      ? "border-tile-correct bg-tile-correct text-primary-foreground"
      : state === "present"
        ? "border-tile-present bg-tile-present text-primary-foreground"
        : "border-tile-absent bg-tile-absent text-primary-foreground"
    : letter
      ? "border-foreground/70"
      : "border-border";

  return (
    <div
      className={cn(
        TILE_BASE,
        stateClass,
        flip && "animate-tile-flip",
        pop && "animate-tile-pop",
      )}
      style={flip ? { animationDelay: `${delay}ms` } : undefined}
    >
      {letter}
    </div>
  );
}

export function Board({
  guesses,
  current,
  answer,
  shakeRow,
  lastRevealedRow,
  rowCount = 6,
}: {
  guesses: string[];
  current: string;
  answer: string;
  shakeRow: number | null;
  lastRevealedRow: number | null;
  rowCount?: number;
}) {
  const evaluations = useMemo(
    () => guesses.map((g) => evaluateGuess(g, answer)),
    [guesses, answer],
  );

  return (
    <div className="flex flex-col items-center gap-1.5">
      {Array.from({ length: rowCount }, (_, row) => {
        const submitted = row < guesses.length;
        const word: string = submitted
          ? (guesses[row] ?? "")
          : row === guesses.length
            ? current
            : "";
        const isActive = row === guesses.length && !submitted;
        return (
          <div
            key={row}
            className={cn(
              "flex gap-1.5",
              shakeRow === row && "animate-row-shake",
            )}
          >
            {Array.from({ length: 5 }, (_, col) => {
              const letter = word[col] ?? "";
              return (
                <Tile
                  key={col}
                  letter={letter}
                  state={submitted ? (evaluations[row]?.[col] ?? null) : null}
                  flip={lastRevealedRow === row}
                  delay={col * 120}
                  pop={isActive && !!letter}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export function letterStatesFromGuesses(
  guesses: string[],
  answer: string,
): Record<string, TileState> {
  const states: Record<string, TileState> = {};
  const rank: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };
  for (const guess of guesses) {
    const row = evaluateGuess(guess, answer);
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const state = row[i];
      if (!letter || !state) continue;
      if (rank[state] > rank[(states[letter] ?? "absent") as TileState]) {
        states[letter] = state;
      }
    }
  }
  return states;
}

export function Keyboard({
  letterStates,
  onKey,
  disabled,
}: {
  letterStates: Record<string, TileState>;
  onKey: (key: string) => void;
  disabled: boolean;
}) {
  const keyClass = (letter: string) =>
    cn(
      "h-12 min-w-9 flex-1 rounded-sm text-sm font-medium uppercase transition-colors",
      letterStates[letter] === "correct" &&
        "bg-tile-correct text-primary-foreground",
      letterStates[letter] === "present" &&
        "bg-tile-present text-primary-foreground",
      letterStates[letter] === "absent" &&
        "bg-tile-absent text-primary-foreground/80",
      !letterStates[letter] && "bg-secondary text-secondary-foreground",
    );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-1.5 px-1 select-none">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={row} className="flex justify-center gap-1">
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("Enter")}
              className="h-12 flex-[1.6] rounded-sm bg-foreground text-sm font-semibold uppercase text-background disabled:opacity-40"
            >
              Enter
            </button>
          )}
          {row.split("").map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={disabled}
              onClick={() => onKey(letter)}
              className={keyClass(letter)}
            >
              {letter}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("Backspace")}
              className="h-12 flex-[1.6] rounded-sm bg-secondary text-lg font-semibold"
              aria-label="Backspace"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
