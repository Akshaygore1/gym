# Gym interface

Gym is a focused workout tool, used on a phone between sets or at home. The visual
system follows the supplied dark-slate/lime references without their decorative
glows, glass containers, tiny labels, fabricated metrics, or promotional banners.

- **Tokens:** semantic light/dark colors in `src/index.css`; lime is for actions,
  selection, and recorded progress. Cyan supports real secondary data. Respect the
  user's system theme; check both palettes. Form-control boundaries use a stronger
  contrast token than decorative dividers.
- **Typography:** locally hosted Plus Jakarta Sans, with a system fallback and
  tabular workout numbers. Fixed, readable heading sizes and restrained hierarchy.
- **Structure:** functional Today / Workouts / Schedule / Profile navigation;
  desktop columns become a single mobile flow. One main workout surface, simple
  exercise lists, plain set rows, and secondary information separated by spacing.
- **Onboarding:** two steps, retained draft answers, optional body-weight fields,
  and level-specific welcome copy. Useful previews, not artificial loading delays.
- **Experience:** guided beginner defaults, quicker intermediate logging, and
  advanced target controls. All levels retain help, substitutions, and editing.
- **Controls:** keyboard-operable native choices, visible focus, 44–48px primary
  touch targets, textual errors, and native dialogs with focus containment.
- **Motion:** brief state transitions only. Exercise frame playback is opt-in;
  reduced-motion users can move between still frames. No constant pulses.
- **Honesty:** progress and trends come from actual local records. Earlier backup
  counts are labeled; absent data stays absent. No pretend AI, cloud, calorie,
  wearable, or readiness features.

Exercise images are locally cached references from free-exercise-db. Plus Jakarta
Sans is distributed with its SIL Open Font License in `public/fonts/OFL.txt`.
