# Gym

A personal workout planner for beginner, intermediate, and advanced lifters.
Choose a goal, training days, time, and your gym or home equipment. A two-step
setup creates a routine with a warm-up, strength work, goal-appropriate conditioning,
and a cool-down. Beginners get more guidance; experienced lifters get faster logging
and less interruption. Everyone can adjust session sets, reps, and rest; advanced
users also have optional effort/RPE logging.

Log actual sets, correct or undo them, pause and resume a session, swap supported
movements, and review saved workout history. Body-weight tracking is optional.
Targets are suggestions, not medical advice or guaranteed results.

Everything is stored in the browser's localStorage. There is no backend.
Gym and home equipment/routine progress are kept separately. Weights are stored in
kg and can be displayed in kg or lb without repeatedly converting the stored data.
Version 1 backups and active sessions are migrated; old counts are preserved without
inventing detailed history. Export a backup from Profile before clearing browser data.

## Run

```sh
npm install
npm run dev        # http://localhost:5173, also printed as a Network URL for your phone
npm test           # progression, plan and session logic
npm run build      # production build in dist/ (installable, works offline)
```

## Where things live

- `src/data/exercises.ts` - exercise library: names, cues, equipment needs, rep ranges, and swaps; new plans leave initial lifting weights unset
- `src/data/equipment.ts` - gym/home equipment choices; unavailable equipment is excluded from new plans
- `src/data/workouts.ts` - gym/home templates and experience/schedule-aware rotations
- `src/lib/progression.ts` - how feedback changes weight and reps
- `src/lib/plan.ts` - equipment-compatible, goal-aware sessions within an approximate time budget
- `src/lib/state.ts` - versioned local storage, records, and validated backup migration
- `src/lib/actions.ts` - session/set logging, pause/resume, corrections, timers, and weight entries
- `src/screens/` - onboarding, Today, Workouts/history, Schedule, Profile, and the runner

The app works offline after the production PWA and its assets have been cached.
Local fonts and exercise photos need no third-party connection during a workout.
There are no cloud-sync, wearable, calorie-burn, or readiness-score features.

Per the requested implementation scope, no new tests or test tooling were added.

Adding an exercise: add it to `exercises.ts` with its free-exercise-db id, then run
`npm run fetch-exercises` to download its photos and instructions.

Exercise photos and instructions: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain).
The locally hosted Plus Jakarta Sans font is covered by `public/fonts/OFL.txt`.
