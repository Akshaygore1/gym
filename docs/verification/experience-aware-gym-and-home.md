# Experience-aware Gym + Home: implementation and verification

Completed 2026-10-08 against the approved plan. **No test files or test dependencies
were added or modified.** Browser interaction was inspected with an isolated Chrome
profile and native DevTools commands; no automation package was installed.

## Delivered

- Two-step onboarding with retained drafts, optional body-weight fields, and real
  experience/goal choices. Beginners get a guided runner; intermediate and advanced
  users get more compact logging. Help and target editing remain available to all.
- Equipment-, time-, experience-, and goal-aware gym/home plans, separate mode
  rotation counters, explicit equipment limitations, and no assumed starting load.
- Connected Today, Workouts/history, Schedule, and Profile screens; responsive
  dark/light layouts, keyboard-operable dialogs, focus return, reduced motion, and
  locally hosted fonts and exercise references.
- Actual per-set records, optional RPE/notes, correction/undo, skipped work,
  full/partial completion, explicit discard, and persisted advisory timers.
- Optional body-weight trends, kg/lb display, validated backups, version-1
  migration, visible storage failures, and a non-destructive damaged-data screen.

## Verification performed

- TypeScript/production build and lint passed. All **25 existing** checks passed.
  `git diff --check` was clean.
- Visually inspected onboarding, Today, Schedule, Profile, history, completion,
  and guided/detailed runner layouts in Chrome. Checked 320px/390px and desktop
  layouts, both themes, and 200% text sizing on Today/Profile/Schedule/the runner.
- Used the real UI to record sets, undo and correct a set, add notes/RPE, complete
  a session, finish early, discard, pause/resume, and reload persisted sessions.
  Duplicate finish did not add another record. Switching modes retained counters
  and was blocked while a session was active.
- Restored a version-1 backup with an in-progress session. Existing counts,
  weights, swaps, and equipment choices survived; previously completed sets kept
  their count but no invented actual values. New logging and reload remained valid.
- Invalid backups were rejected. Damaged saved bytes remained untouched until an
  explicit recovery action. Restoring a valid backup worked. A simulated quota
  failure produced a visible storage warning.
- Checked draft reload/back behavior, including an empty weekday selection and
  validation. A future start date produced the correct before-start screen.
  kg/lb display round-tripped 72.5 kg without changing the canonical stored weight.
- Inspected local dates and schedule previews in Los Angeles, Kolkata, and
  Auckland, including a UTC instant that falls on different local calendar dates.
- Sampled 72 planning combinations across levels, modes, goals, and time budgets:
  none prescribed unavailable equipment or exceeded its approximate selected time.
- Verified keyboard Tab containment, Escape dismissal, and focus return in dialogs.
  Under reduced motion, the movement control advanced a still frame without playback.
- Checked core palette contrast: secondary text exceeded 6:1, light primary-button
  text exceeded 6:1, and form-control boundaries exceeded 3:1 in both themes.
- Used the production service worker with the browser **offline**: reload,
  onboarding, workout logging, pause/reload/resume, new exercise images, and the
  local font continued to work. The production precache contains 158 assets,
  approximately 9.4 MB.

## Data-safety corrections found during review

- Reducing planned sets after undoing an earlier set could invalidate later logged
  sets. The minimum now preserves completed logs; trailing uncompleted logs are
  trimmed safely. An imported set cursor is normalized from its logs.
- A damaged save previously led to setup with no usable restore/reset route. A
  dedicated recovery screen now offers original-data download and explicit recovery.
- Native-dialog unmount did not reliably return focus. The sheet now restores its
  invoking control and explicitly handles Tab endpoints.
- Enlarged text exposed navigation, calendar, and runner-header overflow. Controls
  now wrap without horizontal page overflow at the checked widths.
- A bodyweight warm-up shared an exercise ID with a logged strength movement.
  Previous-performance lookup now selects strength records rather than the warm-up;
  actual values from partial sessions can inform the next suggested target.

## Limits

This is general adult training guidance, not a medical prescription or a guarantee
of results. Session durations are estimates. Bodyweight-only plans explicitly lack
loaded pulling options. Historical version-1 counts cannot become detailed history.

Browser checks were performed in desktop Chrome with mobile viewport emulation;
physical-device Safari/Android installation, screen-reader behavior, OS audio,
vibration, and wake-lock behavior still warrant device-specific checks. Offline use
requires an initial successful asset cache; clearing browser storage removes data
and cached assets. No account, cloud sync, wearable, calorie, or readiness service
was introduced.
