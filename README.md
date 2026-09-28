https://lovable.dev/projects/1eff179c-d5e6-400b-91a1-7a8bcd4823bc# Inkling — Daily Word Puzzle

A daily five-letter word puzzle, inspired by Wordle. One new word every day (UTC), six guesses, and a global leaderboard to compete on.

## Features

- **Daily puzzle** — a deterministic new five-letter answer every day (UTC-based), the same for every player
- **Wordle-style feedback** — green / yellow / gray tiles after each guess
- **On-screen + physical keyboard** — play on desktop or mobile
- **Global leaderboard** — Today and All-time tabs, with your display name shown
- **Streaks & stats** — track wins, attempts, and your streak over time
- **Share results** — copy an emoji grid of your game (spoiler-free)
- **One game per day** — results are saved per player, no re-rolls
- **Login** — email + password, Google sign-in, and password reset

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, TypeScript, Vite)
- [Tailwind CSS v4](https://tailwindcss.com) with a letterpress-inspired theme (Fraunces + Work Sans)
- [shadcn/ui](https://ui.shadcn.com) components
- Backend: Lovable Cloud (auth, database, server functions) with row-level security

## Getting started

```sh
npm install
npm run dev
```

Then open http://localhost:5173 and sign up to start playing.

> The app expects a Lovable Cloud backend (auth + database). If you fork this repo, you can connect it to your own Lovable project to provision the backend.

## How to play

1. Guess the five-letter word in six tries
2. Each guess must be a real five-letter word
3. After each guess, the tiles show how close you were:
   - 🟩 the letter is in the word and in the right spot
   - 🟨 the letter is in the word but in the wrong spot
   - ⬜ the letter is not in the word
4. A new word arrives every day at midnight UTC

## Project structure

```
src/
├── routes/            # Pages (landing, auth, play, leaderboard, reset password)
├── components/        # Game board, keyboard, header, UI components
├── lib/
│   ├── words.ts       # Game logic: answer selection, guess evaluation, streaks
│   └── game.functions.ts  # Server functions: leaderboard, results, profile
├── data/              # 12,653 five-letter word list
└── integrations/      # Backend client (auto-generated)
```

## License

All rights reserved. Built with [Lovable](https://lovable.dev).
https://lovable.dev/projects/1eff179c-d5e6-400b-91a1-7a8bcd4823bc
