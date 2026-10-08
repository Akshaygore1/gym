# Experience-aware Gym + Home redesign

**Status: implemented and verified, 2026-10-08.** The user approved this plan and explicitly requested **no new tests**. No test files or test dependencies were added or modified; verification used the existing checks, production build, and manual browser review. See [implementation and verification notes](../verification/experience-aware-gym-and-home.md).

Prepared 2026-10-08 after reviewing the current app, all four Stitch HTML exports, their design document, the exercise-data source, and primary training/accessibility guidance.

## Outcome

One clear, responsive workout planner that welcomes beginners, intermediate users, and advanced users differently and actually changes its plans and level of guidance accordingly. Support both gym and home sessions without losing the existing offline, account-free experience.

“Homework” is confirmed to mean **Home Workout mode**. Separate between-session assignments are not included.

## Research informing the plan

- [Current app / screen comparison](../research/screen-gap-analysis.md): the app is beginner-only; the exports contain new interactions but also placeholder data and unsupported product claims. The exported PNGs are error text; the HTML/design document remain usable.
- [Training and accessibility findings](../research/experience-personalization.md): ACSM 2026 supports individualization by goals, needs, experience, adherence, and equipment. NSCA supports considering schedule, recovery, and workload. Neither justifies turning an advanced badge into mandatory higher frequency, maximal testing, or a universal load formula.
- Baseline: all 25 existing Vitest tests pass; lint passes.
- Existing exercise photos, cues, swap logic, timers, backup/restore, and offline caching are useful foundations to retain and improve.

The tier definitions, exact UI, and programming defaults below are **product proposals**, not scientifically validated user classifications. Exact exercise prescriptions should be explicit and tested; do not market them as medical clearance or guaranteed outcomes.

## 1. Two-step onboarding, matching the reference flow

### Step 1 — Your starting point

- Brief welcoming introduction with plain-language value: a plan that fits your training, equipment, and time.
- Select Beginner, Intermediate, or Advanced using descriptions of confidence and training familiarity, not arbitrary months, strength thresholds, or a preselected “recommended intermediate” badge.
- Change welcome/help copy immediately with the selection.
- Choose one primary goal: Build muscle, Get stronger, Lose fat, or Improve stamina.
- Optional expandable body-weight section: current weight, target weight, kg/lb display. Leave unknown values blank rather than insert sample numbers. Explain that these are for tracking, not calculating a starting lifting load.
- Back/Continue controls, real progress indication, accessible selection states, and concise validation.

### Step 2 — Fit training into your week

- Choose preferred training location: Gym or Home. Both remain available later.
- Pick actual weekdays; any frequency shortcut updates those same weekdays. There is one source of truth, not separate conflicting frequency/day state.
- Pick available time. Add short options suitable for home/quick sessions alongside the existing 45/60/75-minute choices.
- Pick a start date with a correct local-date week preview.
- Set location-specific equipment: gym availability; home bodyweight/no equipment, dumbbells, and an optional suitable bench/support. Do not assume home has gym machines or safe improvised equipment.
- Keep detailed equipment settings collapsed until needed. Provide an inline, editable plan summary with workout/rest days and approximate session duration.
- Create the real plan immediately; no fake AI-calculation delay or cloud-sync message.
- Preserve answers when going Back or reloading an unfinished setup. Returning users are not forced through initial onboarding again.

**First-value moment:** the user sees a usable first session with understandable targets and can start it immediately—or see the correct first scheduled date if starting later.

## 2. Meaningfully different experiences

All levels retain access to instructions, swaps, target editing, pause/stop, and history. Level changes alter defaults and guidance, not lock users out of useful features.

| | Beginner | Intermediate | Advanced |
| --- | --- | --- | --- |
| Welcome | Reassuring, explain the next step | Acknowledge familiarity, minimize setup ceremony | Emphasize control and continuity with existing training |
| Plan default | Straightforward full-body foundation where appropriate; conservative workload and technique-focused choices | Schedule-appropriate full-body or upper/lower structure with clearer progression | Configurable schedule-appropriate split, including PPL where suitable; more control over workload |
| Runner | Guided exercise order, visible form cues, explained sets/reps, simple difficulty feedback | Faster set logging, previous-session context, help on demand | Compact detailed set logging; editable sets, rep targets, rest, and optional effort/RPE |
| Progress | Completed work and learning consistency | Actual repetition/load trends and next-session targets | Logged weekly workload and exercise-level history; optional manual adjustments |

- Keep experience editable; no automatic promotion after a fixed number of sessions.
- Personalization considers **experience + goal + schedule + time + location/equipment**, not just a tier badge.
- Goal changes actual session priorities: resistance volume for muscle, strength-oriented work/rest for strength, sustainable resistance/aerobic balance for fat loss, and conditioning emphasis for stamina.
- No goal promises a calorie deficit, a body-weight result, or a one-rep-max outcome.
- Advanced does not mean every workout must be longer, heavier, or taken to failure.
- Do not implement speculative automatic wave periodization, peaking, or fixed deload schedules in this version. Provide editable targets/rest rather than pretend such algorithms are established by the research.
- Remove automatic machine-to-free-weight “upgrades” based solely on attendance; present suitable alternatives as choices.
- Progression uses actual logged performance and effort, with editable next targets. Never infer lifting weights from body mass or prescribe mockup weights such as 185 lb to all users.

## 3. Real Home Workout mode

- Functional Gym / Home switch on Today and workout previews.
- Purpose-built bodyweight and dumbbell home routines, with easier/harder variations appropriate to the chosen support level and actual ability.
- Home-appropriate warm-ups and conditioning: no required treadmill, stairmill, cables, or commercial machines.
- Verify all exercise requirements from instructions, not only the upstream equipment label; fetch real local photos/instructions for added movements.
- Include balanced lower-body, pushing, core, and pulling work where equipment permits. Explain missing pulling/load options rather than call an unrelated movement an equivalent substitute.
- Add the limited gym equipment/exercise entries needed for optional barbell work; keep machines/free weights available across levels rather than enforce a badge hierarchy.
- Use separate mode-aware routine progress and equipment preferences while preserving movement-specific targets/history. Changing mode must not reset training data or advance a session by itself.
- Switching a planned session to home is a substitution, not an automatic extra workout. Do not rewrite a workout already in progress; prompt to resume or explicitly change/discard first.
- If no supported equipment-compatible alternative exists, show an honest limitation or omit/replace the slot appropriately—never silently keep the unavailable exercise.

## 4. Connected screens and real records

### Today

- Today's training/rest state, compact week strip, gym/home choice, clear session title/focus, approximate duration, exercise count, and one primary Start/Resume action.
- Real completed/planned state based on saved records; count a scheduled day once even if multiple sessions are logged.
- Exercise preview and optional recent progress/weight data below the primary task.
- Respect rest and future start dates. Avoid a prominent “Train anyway” competing with recovery guidance.

### Workouts

- View the current program, upcoming routines, and completed sessions.
- Readable detail view for exercises, targets, rest, photos/instructions, and substitutions.
- Keep previewing distinct from starting a session or changing its schedule.

### Workout runner and completion

- Preserve the existing guided runner; show more compact/detailed logging according to experience and user preference.
- Save actual weight/reps or hold duration per set, completed/skipped status, optional exercise notes/effort, session location, dates, and clearly labeled duration.
- Support corrected/undone completion and validation of numeric inputs; completed planned targets are not automatically treated as actual results.
- Adjustable advisory rest timer, pause/resume, deadline-based timing, and persistence through reload. A timer never forces a user to lift or expires the logging task.
- Actual completed-work progress, not sample percentages.
- Full completion, finishing early/partial, and discard are separate outcomes. Finishing early never fabricates completed sets.
- Completion summary shows performed work and a useful next step; history drives subsequent targets.

### Schedule

- Dedicated weekly view with workout/recovery days, start date, future previews, and editable weekdays/time.
- Same planning policy as Today, workout start, and completion summaries, so those views cannot disagree.
- Keep rest/recovery in the recommendation; remove the reference's seven-day “Extreme” promotion and blanket “five days is optimal” claim.

### Profile

- Edit experience, goal, preferred location, unit display, and equipment preferences.
- Optional manual body-weight logging and a trend based only on actual logs. A first log gets an honest empty/initial state, not a fake month of history.
- Keep backup/restore, locally stored targets, source attribution, and explicit destructive reset controls.
- Clearly state “Stored on this device”; no cloud/account implication.

### Navigation

- Working Today / Workouts / Schedule / Profile navigation after onboarding.
- Mobile bottom navigation; suitable desktop navigation and wider structured layouts instead of stretching a narrow mobile column.
- Focused active-workout layout and safe-area spacing. Sticky actions/navigation must not cover content, fields, or keyboard focus.

## 5. Remove visual and copy “slop”

- Keep the reference-inspired dark slate/lime identity; use cyan sparingly for meaningful secondary data. Retain a tested accessible light alternative rather than accidentally degrade it.
- Clear sans-serif hierarchy, tabular workout numbers, one consistent icon style, and real exercise imagery.
- Prefer simple sections, lists, and set rows. Avoid nested cards, repetitive metric tiles, giant rounded containers, fake coach portraits, ambient neon glows, decorative glass, and constant pulse animations.
- Replace jargon such as “Primary Directive,” “Biometric Baseline,” and “Engine Calibration” with Goal, Body weight, and Your plan.
- Remove fabricated calories, deficit pacing, readiness percentages, HRV, sleep metrics, streaks, AI personalization claims, auto-sync, and reminder claims.
- No dead navigation, placeholder buttons, artificial saving spinners, or promotional banners inside setup.
- Short state transitions only, honor reduced motion, keep help/context useful rather than decorative.
- Keyboard access, visible focus, semantic radio/checkbox choices, clear input labels/errors, and correct dialog focus handling.
- Target WCAG 2.2 A/AA checks; prefer 44–48px touch areas for workout actions. Day controls must wrap/adapt at narrow widths rather than shrink into unusable targets.
- Support 320px-wide screens, landscape, 200% text size/zoom, tablet, and desktop without lost controls or horizontal page overflow.

## 6. Build order after approval

1. **State and compatibility foundation:** validated next-version state, onboarding draft, profile fields, canonical kg conversions, session/set records, mode-aware planning state, optional weight logs, timer persistence; manually verify migration and backup import before adopting the new model.
2. **Shared plan engine and data:** explicit goal/level policies, equipment-compatible gym/home templates, exercise-specific targets/rest, time-budget selection including warm-up/rest/transitions, and common schedule/preview/start behavior. Add locally cached exercise assets through the existing integration.
3. **UI foundation and onboarding:** documented design choices/tokens, shared controls and navigation, two-step setup, level-aware welcomes, and settings/profile editing.
4. **Daily use:** connected Today/Workouts/Schedule, guided/detailed runner, completion summaries, honest session history, and optional weight tracking.
5. **Polish and regression checks:** responsive layouts, accessibility, error/empty/storage states, offline asset behavior, local-data safety, and manual browser interaction/screenshot review. Do not write tests.

Existing files affected: `src/lib/state.ts`, `src/lib/actions.ts`, `src/lib/plan.ts`, `src/lib/progression.ts`, `src/lib/schedule.ts`, `src/lib/device.ts`, `src/data/{equipment,exercises,workouts}.ts`, `src/screens/`, `src/components/`, `src/App.tsx`, `src/index.css`, `vite.config.ts`, and `README.md`. Focused modules/screens handle new concerns. Existing tests are unchanged.

Keep React/Vite/plain CSS and the current dependency footprint. No new test tooling, backend, routing framework rewrite, or UI-library migration is proposed.

## 7. Approval acceptance checklist

- [x] Each experience level changes both welcome/guidance and actual plan/control defaults, while keeping help available.
- [x] Each supported goal/location/day/time combination yields a valid equipment-compatible plan or explains its constraint. No universal starting loads or attendance-only difficulty promotion.
- [x] Generated sessions respect the selected approximate time budget without silently shortening necessary rest. Estimates are labeled, not promises.
- [x] Back/refresh preserves onboarding answers; optional weight inputs can be skipped; existing users are not forced through setup again.
- [x] Gym/home switching works, preserves progress, and cannot silently replace an active workout.
- [x] Set logs, partial completion, skipped work, corrections, notes, timers, and history persist correctly. Completion is counted once, not on duplicate taps.
- [x] Version-1 data/backups preserve weights, swaps, equipment choices, counts, and active workouts. Migration does not invent historical sets, weights, or times that were never stored.
- [x] Invalid backup data is rejected with a clear error; storage failures are surfaced instead of falsely claiming a successful save.
- [x] Unit toggling round-trips without accumulating weight drift; per-hand load labeling stays correct.
- [x] Manually review start dates, week boundaries, local dates/timezones, missed visits, rest days, and mode substitutions without adding tests.
- [x] Every navigation item and action performs its intended task; there are no unsupported mock metrics or service claims.
- [x] Browser checks cover mobile/desktop, both themes, keyboard/focus, reduced motion, enlarged text, no-data states, and offline use after assets are cached.
- [x] Existing unit checks, manual browser review, lint, and production build pass before handoff. Final screenshots are checked at representative widths. No test files or test dependencies are added or modified.

Checks reflect implementation plus representative Chrome review, not an exhaustive
combination matrix or a cross-device accessibility certification. Device-specific
limitations are recorded in the verification notes.

## Explicitly not included

Cloud accounts/sync, wearables/HRV/readiness, calorie or diet calculations, notification/calendar integration, an AI service, athlete peaking algorithms, a separate marketing site, a rebrand, and between-session homework assignments. Any of these can be planned separately if requested.

Working product name remains **Gym**; the inconsistent IronCore/PulseFit mockup naming is not adopted without a decision.

Optional later: `$impeccable init` can capture broader product/design context; it is not required to approve or carry out this scoped redesign.

**Approved scope amendment:** implementation may proceed; do not write tests.
