# Gym / Stitch screen gap analysis

Research date: 2026-10-08. Application source inspected at commit `d62e4be`.
This is research documentation, not an approved implementation specification.

## Request and confirmed interpretation

- Adapt the existing app to the supplied Stitch screens rather than build an unrelated site.
- Give beginners, intermediate users, and advanced users meaningfully different welcomes, guidance, and workout plans.
- Make onboarding smooth and remove generic visual/copy clutter.
- The user confirmed that “homework” means **Home Workout mode**, not between-session assignments.
- Research first, propose a plan second, and do not change application code until the user approves that plan.

## Reference material

Directory: `/Users/akshay/Downloads/stitch_personalized_gym_workout_planner`.

| Export | Intended content | Evidence |
| --- | --- | --- |
| `profile_goals_setup/code.html` | Profile; current/target weight; kg/lb switch; three experience levels; muscle, fat-loss, strength, endurance goals | Experience selector at lines 84–148; goals at 149–213 |
| `schedule_days_setup/code.html` | Second onboarding step; frequency/day picker; start date; week preview; summary | Day picker at 74–150; date/preview at 151–216 |
| `today_s_dashboard/code.html` | Gym/home toggle; weekly completion; session preview; body-weight trend; readiness widget | Mode switch at 5–17; body-weight widget at 246–301; readiness at 302–319 |
| `workout_detail_routine/code.html` | Exercise overview; editable set weights/reps; completion controls; adjustable rest; finish/log | Set rows at 85–170; timer/finish at 261–400 |
| `ironcore/DESIGN.md` | Dark slate, lime primary action, cyan secondary data, Sora/Plus Jakarta Sans, large touch targets | Tokens and brand/layout sections |

**Asset limitation:** all four `screen.png` files are ASCII export-error text (`<FIFE Image failed to fetch>`), not PNG images. Layout observations come from the HTML and design document, not viewed screenshots.

The exports are isolated interaction demos, not a connected application. Examples:

- Profile/schedule buttons change labels with timeouts; they do not save settings or navigate to a generated plan.
- Schedule frequency selection does not update the selected weekdays.
- The workout-detail home switch changes its label, not its exercises.
- Progress is derived from the first exercise's visible set rows while the heading claims six exercises.
- Body-weight history, energy deficit, calories, readiness, sleep, HRV, cloud sync, and the header streak are sample content.
- The design document names IronCore, while the HTML names PulseFit. A consistent product name is needed; no rebrand is assumed.

## Current application

Stack: React 19, TypeScript, Vite, plain CSS, Vitest, offline PWA; no backend. See `package.json`, `README.md`, and `vite.config.ts`.

| Area | What exists | Gap |
| --- | --- | --- |
| Onboarding | Single screen with weekdays and 45/60/75-minute choices | No experience, chosen goal, home setup, start date, or optional body-weight profile (`src/screens/Setup.tsx`) |
| Navigation | Today, active run, settings held in React view state | No dedicated Workouts, Schedule, or Profile surfaces (`src/App.tsx`) |
| Programming | Full-body/upper-lower rotations chosen by days per week | Same goal and progression rules for everyone (`src/data/workouts.ts`, `src/lib/plan.ts`) |
| Guidance | Exercise cues, local photos/instructions, swaps, simple difficulty feedback | Useful foundation to preserve, with level-appropriate explanation/detail (`src/screens/Run.tsx`, `src/components/ExerciseInfo.tsx`) |
| Active session | Step/set counters; resumable steps | Does not save actual per-set weight/reps, exercise notes, completed/skipped status, or elapsed/rest timestamps (`src/lib/state.ts`, `src/lib/actions.ts`) |
| History | Total sessions and last completed date | Cannot support real historical trends or week-by-week adherence; prior set histories cannot be recovered |
| Equipment | Missing items relative to a full Cult gym; swap graph | No independent home equipment profile; no barbell/rack equipment entries (`src/data/equipment.ts`) |
| Body weight | None | Optional logs, target, units, and a trend need real stored records |
| Appearance | Dark/lime tokens plus system light-theme alternative; 560px column | Identity is already close to references; improve hierarchy, desktop structure, navigation, and interaction consistency rather than add decoration (`src/index.css`) |
| Storage | Version-1 localStorage, JSON backup/restore | Requires validated migration and backup compatibility before introducing new fields/history |

### Important implementation constraints discovered

1. `setsFor`, `cardioStage`, and exercise upgrades depend only on total session count. A label-only experience selector would not provide real personalization.
2. `buildSteps` drops some optional content for 45 minutes but does not enforce a complete duration budget. More sets/longer rests must not silently produce a session longer than selected.
3. `resolveAvailable` returns the original unavailable exercise if no swap exists. That fallback is unsuitable for an equipment-aware home plan: missing equipment must yield a supported alternative or an explicit limitation, not an impossible prescription.
4. The same rotation is consulted in planning, scheduling, starting sessions, and next-session summaries. A new plan policy must be shared by all of them.
5. `finishSession` records only a count/date. A history model must distinguish full completion, partial completion, skipped work, and discard; it must not mark every planned set as performed.
6. Existing users' weights, equipment selections, swaps, completion counts, and active sessions must survive migration. Old records provide no exact past set/time history, so a new chart must not fabricate it.
7. Current rest/cardio timers use wall-clock deadlines, which is useful for background tabs; those deadlines currently live only in component state. Persist them if pause/reload resilience is promised.
8. Body mass and lifting load are different concepts. Both may display kg/lb, but body mass must not become a universal lifting-weight formula. Canonical kg storage avoids repeated conversion drift.
9. The reference disables browser zoom and uses tiny labels, non-semantic clickable experience cards, constant pulses, and glow-heavy nested cards. Those are not features to copy.
10. The PWA currently precaches local exercise photos. Keep new assets local; self-host any added fonts and update font cache patterns, or retain the system-font fallback.

Technical primary sources checked on 2026-10-08:

- [Vite PWA static-assets documentation](https://vite-pwa-org.netlify.app/guide/static-assets.html): additional public assets/fonts can be precached using `includeAssets`; custom `globPatterns` must retain all required asset types.
- [Playwright emulation documentation](https://playwright.dev/docs/emulation): supports mobile/desktop viewports, touch, color-scheme, timezone/locale, and offline emulation. These are proposed implementation checks, not tests already performed.

## Exercise-data feasibility

Primary sources:

- [Dataset owner README](https://github.com/yuhonas/free-exercise-db/blob/main/README.md): public-domain JSON exercise records and image paths; some equipment/mechanic fields are incomplete.
- [Owner's combined exercise catalog](https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json): accessed 2026-10-08, 876 records at access time.
- Existing integration: `scripts/fetch-exercises.ts`, `src/data/exercises.ts`, `src/data/exercise-details.json`, `public/exercises/`.

Verified candidate IDs with instructions and two photo frames include `Bodyweight_Squat`, `Pushups`, `Push-Ups_-_Close_Triceps_Position`, `Decline_Push-Up`, `Dumbbell_Floor_Press`, `Dumbbell_Squat`, `Barbell_Full_Squat`, `Barbell_Bench_Press_-_Medium_Grip`, `Barbell_Deadlift`, `Standing_Military_Press`, and `Bent_Over_Barbell_Row`.

These are asset candidates, not an approved routine or clinical recommendation. Equipment must be reviewed from actual instructions: for example, `Decline_Push-Up` has a null equipment field but requires an elevated support. Dataset difficulty labels must not drive plan policy uncritically.

Home routines need purpose-built exercise choices, warm-ups, and duration targets. They cannot be made by changing the gym label or hiding all machines. Lack of suitable pulling equipment should be disclosed rather than presented as an equivalent back-strength prescription.

## Baseline checks

- `npm test`: 25 tests passed (one file).
- `npm run lint`: passed.
- Git working tree was clean before research documentation.
- No application source/configuration changed during this investigation.
- Browser automation is not installed in project dependencies; browser interaction and screenshot checks should be arranged during the approved implementation, not claimed as already completed.

## Proposed boundaries to carry into the approval plan

- Keep the existing client-only/offline architecture and backup feature.
- Add only real, locally supported features from the screens: meaningful level/goal personalization, gym/home routines, two-step setup, scheduling, actual set/session records, optional weight tracking.
- Do not imply cloud accounts, wearables, calendar reminders, measured readiness, calories, nutrition prescriptions, or an AI service without implementing and separately agreeing to those capabilities.
- Keep `Gym` as the working name unless the user requests a rebrand.
- Treat “website” as the existing responsive application. A separate marketing landing page is not implied.
