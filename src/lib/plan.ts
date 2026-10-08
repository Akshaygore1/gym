import { EXERCISES } from '../data/exercises'
import { EQUIPMENT_NAMES, type EquipmentId } from '../data/equipment'
import {
  UPGRADE_AFTER_SESSIONS,
  UPGRADES,
  rotationForProfile,
  type Workout,
} from '../data/workouts'
import type { AppState, Experience, Minutes, Settings, Step } from './state'

const WARMUP: Record<Minutes, number> = { 20: 3, 30: 5, 45: 8, 60: 10, 75: 10 }
const FINISHER: Record<Minutes, number> = {
  20: 3,
  30: 5,
  45: 8,
  60: 12,
  75: 20,
}
const CARDIO_DAY: Record<Minutes, number> = {
  20: 8,
  30: 15,
  45: 25,
  60: 35,
  75: 45,
}
const FINISHER_ROTATION = [
  'Bicycling_Stationary',
  'Elliptical_Trainer',
  'Walking_Treadmill',
]
const STAIRMILL_AFTER_SESSIONS = 12

// The optional argument keeps old session snapshots and backups understandable.
export const setsFor = (sessionsDone: number, experience?: Experience) =>
  experience ? (experience === 'beginner' ? 2 : 3) : sessionsDone < 6 ? 2 : 3
export const cardioStage = (sessionsDone: number) =>
  Math.floor(sessionsDone / 6)

export function rotationIndex(state: AppState, settings: Settings): number {
  return settings.experience
    ? state.modeSessionsDone[settings.mode ?? 'gym']
    : state.sessionsDone
}

export function nextWorkout(state: AppState, settings: Settings): Workout {
  const rotation = rotationForProfile(settings)
  return rotation[rotationIndex(state, settings) % rotation.length]
}

export function plannedId(slotId: string, sessionsDone: number): string {
  return sessionsDone >= UPGRADE_AFTER_SESSIONS && UPGRADES[slotId]
    ? UPGRADES[slotId]
    : slotId
}

export function missingFor(settings: Settings): EquipmentId[] {
  if (settings.mode !== 'home') return settings.missing ?? []
  return (Object.keys(EQUIPMENT_NAMES) as EquipmentId[]).filter(
    (id) => !settings.homeEquipment?.includes(id),
  )
}

const BARBELL_ALTERNATIVES: Record<string, string> = {
  Goblet_Squat: 'Barbell_Full_Squat',
  Dumbbell_Bench_Press: 'Barbell_Bench_Press_-_Medium_Grip',
  'Stiff-Legged_Dumbbell_Deadlift': 'Barbell_Deadlift',
  Dumbbell_Shoulder_Press: 'Standing_Military_Press',
  Seated_Cable_Rows: 'Bent_Over_Barbell_Row',
}

function preferredId(
  id: string,
  settings: Settings,
  missing: EquipmentId[],
): string {
  if (settings.mode === 'home') {
    const hasDumbbells = settings.homeEquipment?.includes('dumbbells')
    if (hasDumbbells && id === 'Bodyweight_Squat') return 'Goblet_Squat'
    if (hasDumbbells && id === 'Pushups' && settings.experience !== 'beginner')
      return 'Dumbbell_Floor_Press'
    if (
      hasDumbbells &&
      id === 'Butt_Lift_Bridge' &&
      settings.experience !== 'beginner'
    )
      return 'Stiff-Legged_Dumbbell_Deadlift'
    if (id === 'Bodyweight_Walking_Lunge' && settings.experience === 'beginner')
      return 'Bodyweight_Squat'
    return id
  }
  const barbell = BARBELL_ALTERNATIVES[id]
  return settings.experience === 'advanced' &&
    barbell &&
    isAvailable(barbell, missing)
    ? barbell
    : id
}

export function buildSteps(
  workout: Workout,
  state: AppState,
  settings: Settings,
): Step[] {
  if (!settings.experience) return legacySteps(workout, state, settings)
  const missing = missingFor(settings)
  const home = settings.mode === 'home'
  const goal = settings.goal ?? 'muscle'
  const minutes = settings.minutes
  const warmupMinutes = minutes <= 20 ? 3 : minutes <= 45 ? 5 : 7
  const warmupId = resolveCompatible('Walking_Treadmill', missing)
  const warmup: Step =
    !home && warmupId
      ? {
          type: 'cardio',
          exerciseId: warmupId,
          role: 'warmup',
          minutes: warmupMinutes,
        }
      : {
          type: 'activity',
          exerciseId: 'Bodyweight_Squat',
          role: 'warmup',
          minutes: warmupMinutes,
          name: 'Easy warm-up',
          cue: 'Start with comfortable walking or marching, then try gentle squats and arm circles. Stay at an easy pace.',
        }
  const stretches: Step[] = workout.stretches
    .slice(0, minutes <= 30 ? 2 : 3)
    .map((slot) => ({ type: 'stretch', exerciseId: slot.id }))
  const budget = minutes - estimateExact([warmup, ...stretches])
  const slots = workout.slots
    .map((slot) => {
      const baseId = preferredId(slot.id, settings, missing)
      const replacement = state.swaps[baseId]
      const chosen =
        replacement && isAvailable(replacement, missing) ? replacement : baseId
      const id = resolveCompatible(chosen, missing)
      if (!id) return null
      const def = exercise(id)
      if (def.kind === 'cardio' || def.kind === 'stretch') return null
      let reps: [number, number] | undefined =
        'reps' in def ? [...def.reps] : undefined
      const compound = def.kind === 'weighted' && def.rest >= 90
      if (def.kind === 'weighted' && goal === 'strength' && compound)
        reps = settings.experience === 'beginner' ? [6, 10] : [5, 8]
      else if (def.kind === 'weighted' && goal === 'stamina') reps = [10, 15]
      else if (def.kind === 'bodyweight' && settings.experience === 'beginner')
        reps = id === 'Pushups' ? [4, 8] : [6, 10]
      const rest = compound && goal === 'strength' ? 180 : def.rest
      const sets = settings.lighter
        ? Math.max(1, setsFor(0, settings.experience) - 1)
        : setsFor(0, settings.experience)
      const step: Step = {
        type: 'strength',
        baseId,
        exerciseId: id,
        sets,
        reps,
        rest,
        ...(id === baseId ? {} : { unavailable: baseId }),
      }
      return { step, optional: slot.optional }
    })
    .filter((entry) => entry !== null)
  // Prevent duplicate movements after equipment substitutions.
  const seen = new Set<string>()
  const candidates = slots.filter(({ step }) => {
    if (seen.has(step.exerciseId)) return false
    seen.add(step.exerciseId)
    return true
  })
  let mainCardio: Step | undefined
  if (workout.cardioDay && warmupId && !home) {
    mainCardio = {
      type: 'cardio',
      exerciseId: warmupId,
      role: 'main',
      minutes: Math.min(
        CARDIO_DAY[minutes],
        Math.max(5, Math.floor(budget * 0.55)),
      ),
    }
  }
  const conditioningReserve =
    goal === 'stamina'
      ? minutes <= 30
        ? 5
        : 10
      : goal === 'fat-loss'
        ? minutes <= 30
          ? 3
          : 6
        : 0
  const reserved = mainCardio
    ? estimateExact([mainCardio])
    : conditioningReserve
  const strength: Step[] = []
  for (const { step, optional } of candidates) {
    if (step.type !== 'strength') continue
    const minimum = Math.min(3, candidates.length)
    // Save enough room for the first three patterns rather than spending the
    // entire short-session budget on the first lift. Never shorten rest to fit.
    const laterMinimum =
      strength.length < minimum - 1 ? (minimum - strength.length - 1) * 2 : 0
    let candidate = step
    while (
      candidate.sets > 1 &&
      estimateExact([...strength, candidate]) + reserved + laterMinimum > budget
    )
      candidate = { ...candidate, sets: candidate.sets - 1 }
    if (estimateExact([...strength, candidate]) + reserved > budget) continue
    if (optional && minutes <= 30 && strength.length >= minimum) continue
    strength.push(candidate)
  }
  // Equipment that cannot cover a pattern is a visible limitation, not an
  // excuse to prescribe an unavailable machine or an unrelated movement.
  const steps: Step[] = [
    warmup,
    ...(mainCardio ? [mainCardio] : []),
    ...strength,
  ]
  if (!mainCardio && (goal === 'fat-loss' || goal === 'stamina')) {
    const remaining = Math.floor(
      minutes - estimateExact([...steps, ...stretches]),
    )
    const duration = Math.min(goal === 'stamina' ? 15 : 8, remaining)
    if (duration >= 3) {
      const cardioId = home
        ? null
        : resolveCompatible(
            FINISHER_ROTATION[state.sessionsDone % FINISHER_ROTATION.length],
            missing,
          )
      steps.push(
        cardioId
          ? {
              type: 'cardio',
              exerciseId: cardioId,
              role: 'finisher',
              minutes: duration,
            }
          : {
              type: 'activity',
              exerciseId: 'Bodyweight_Squat',
              role: 'finisher',
              minutes: duration,
              name: 'Comfortable conditioning',
              cue: 'Walk or march at a pace that feels sustainable. You can take breaks or finish early. No jumping required.',
            },
      )
    }
  }
  return [...steps, ...stretches]
}

function legacySteps(
  workout: Workout,
  state: AppState,
  settings: Settings,
): Step[] {
  const { minutes } = settings
  const n = state.sessionsDone
  const sets = setsFor(n)
  const missing = settings.missing ?? []
  const pick = (id: string) => {
    const exerciseId = resolveAvailable(id, missing)
    return exerciseId === id ? { exerciseId } : { exerciseId, unavailable: id }
  }
  const cardio = (
    id: string,
    role: 'warmup' | 'main' | 'finisher',
    mins: number,
  ): Step => ({ type: 'cardio', role, minutes: mins, ...pick(id) })
  const strength: Step[] = workout.slots
    .filter((slot) => minutes > 45 || !slot.optional)
    .map((slot) => {
      const baseId = plannedId(slot.id, n)
      return {
        type: 'strength',
        baseId,
        sets,
        ...pick(state.swaps[baseId] ?? baseId),
      }
    })
  const stretches: Step[] = workout.stretches
    .filter((slot) => minutes > 45 || !slot.optional)
    .map((slot) => ({ type: 'stretch', exerciseId: slot.id }))
  if (workout.cardioDay)
    return [
      cardio('Walking_Treadmill', 'main', CARDIO_DAY[minutes]),
      ...strength,
      ...stretches,
    ]
  const finishers =
    n >= STAIRMILL_AFTER_SESSIONS
      ? [...FINISHER_ROTATION, 'Step_Mill']
      : FINISHER_ROTATION
  return [
    cardio('Walking_Treadmill', 'warmup', WARMUP[minutes]),
    ...strength,
    cardio(finishers[n % finishers.length], 'finisher', FINISHER[minutes]),
    ...stretches,
  ]
}

export function estimateExact(steps: Step[]): number {
  return steps.reduce((sum, step) => {
    if (step.type === 'cardio' || step.type === 'activity')
      return sum + step.minutes
    const def = exercise(step.exerciseId)
    if (step.type === 'strength') {
      if (step.rest === undefined) return sum + step.sets * 2.5
      const sides =
        /lunge|one-arm|single-leg/i.test(def.name) || def.id === 'Side_Bridge'
          ? 2
          : 1
      const work =
        def.kind === 'hold'
          ? def.seconds[0] * sides
          : (step.reps?.[1] ?? 12) * 3 * sides
      return (
        sum +
        (step.sets * work + Math.max(0, step.sets - 1) * step.rest + 45) / 60
      )
    }
    return (
      sum +
      (def.kind === 'stretch'
        ? (def.seconds * (def.perSide ? 2 : 1)) / 60 + 0.25
        : 1)
    )
  }, 0)
}

export function estimateMinutes(steps: Step[]): number {
  const exact = estimateExact(steps)
  return steps.some(
    (s) =>
      s.type === 'activity' || (s.type === 'strength' && s.rest !== undefined),
  )
    ? Math.ceil(exact)
    : Math.round(exact / 5) * 5
}
export function isAvailable(
  id: string,
  missing: readonly EquipmentId[],
): boolean {
  return exercise(id).needs.every((n) => !missing.includes(n))
}

export function resolveCompatible(
  id: string,
  missing: readonly EquipmentId[],
): string | null {
  const seen = new Set<string>()
  const queue = [id]
  const original = exercise(id)
  while (queue.length) {
    const next = queue.shift()!
    if (seen.has(next)) continue
    seen.add(next)
    const def = exercise(next)
    if (
      isAvailable(next, missing) &&
      (original.kind === 'cardio') === (def.kind === 'cardio')
    )
      return next
    queue.push(...def.swaps)
  }
  return null
}
export function resolveAvailable(
  id: string,
  missing: readonly EquipmentId[],
): string {
  return resolveCompatible(id, missing) ?? id
}
export function exercise(id: string) {
  const def = EXERCISES[id]
  if (!def) throw new Error(`Unknown exercise ${id}`)
  return def
}

export function planLimitations(
  workout: Workout,
  steps: Step[],
  settings: Settings,
): string[] {
  const notes: string[] = []
  if (
    settings.mode === 'home' &&
    !settings.homeEquipment?.includes('dumbbells')
  )
    notes.push(
      'Without pulling equipment, this plan focuses on legs, pushing, and core. Add dumbbells for loaded back work and split routines.',
    )
  if (!steps.some((s) => s.type === 'strength'))
    notes.push(
      'Your equipment cannot support these strength movements. Edit equipment or switch location to get a suitable routine.',
    )
  const count = steps.filter((s) => s.type === 'strength').length
  const supported = workout.slots.filter((slot) =>
    resolveCompatible(
      preferredId(slot.id, settings, missingFor(settings)),
      missingFor(settings),
    ),
  ).length
  if (count > 0 && count < supported)
    notes.push(
      'A focused session to fit your time: some accessory exercises are left out.',
    )
  if (settings.days.length === 1)
    notes.push(
      'One day is a starting point. If it fits your recovery and schedule, consider adding a second strength day.',
    )
  if (settings.days.length >= 6)
    notes.push(
      'A busy training week. Keep recovery in view and use lighter sessions or adjust your days when needed.',
    )
  return notes
}
