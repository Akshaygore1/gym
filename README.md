# Gym

A no-nonsense gym trainer for beginners. Pick your gym days and it tells you exactly
what to do each visit, in order: warm-up cardio, strength exercises with sets, reps and
weight, a fat-burn finisher, then cool-down stretches for the muscles you trained. One tap after each exercise (too hard / about right /
too easy) adjusts next time's target.

Everything is stored in the browser's localStorage. There is no backend.

## Run

```sh
npm install
npm run dev        # http://localhost:5173, also printed as a Network URL for your phone
npm test           # progression, plan and session logic
npm run build      # production build in dist/ (installable, works offline)
```

## Where things live

- `src/data/exercises.ts` - exercise library: names, cues, starting weights, rep ranges, swaps
- `src/data/equipment.ts` - machines at a standard Cult gym; unticked ones in Settings get swapped out
- `src/data/workouts.ts` - workout templates and which rotation each days-per-week count uses
- `src/lib/progression.ts` - how feedback changes weight and reps
- `src/lib/plan.ts` - builds a session: sets, cardio times, upgrades, swaps

Adding an exercise: add it to `exercises.ts` with its free-exercise-db id, then run
`npm run fetch-exercises` to download its photos and instructions.

Exercise photos and instructions: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain).
