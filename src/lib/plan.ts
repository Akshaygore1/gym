import { EXERCISES } from '../data/exercises'
import { UPGRADE_AFTER_SESSIONS, UPGRADES, rotationFor, type Workout } from '../data/workouts'
import type { EquipmentId } from '../data/equipment'
import type { AppState, Minutes, Settings, Step } from './state'

const WARMUP: Record<Minutes, number> = { 45: 8, 60: 10, 75: 10 }
const FINISHER: Record<Minutes, number> = { 45: 8, 60: 12, 75: 20 }
const CARDIO_DAY: Record<Minutes, number> = { 45: 25, 60: 35, 75: 45 }
const FINISHER_ROTATION = ['Bicycling_Stationary', 'Elliptical_Trainer', 'Walking_Treadmill']
// The stairmill is hard for beginners, so it joins the rotation after a few weeks.
const STAIRMILL_AFTER_SESSIONS = 12

// First sessions use 2 sets while the movements are new.
export const setsFor = (sessionsDone: number) => (sessionsDone < 6 ? 2 : 3)

// Cardio gets a notch harder every 6 sessions.
export const cardioStage = (sessionsDone: number) => Math.floor(sessionsDone / 6)

export function nextWorkout(state: AppState, settings: Settings): Workout {
  const rotation = rotationFor(settings.days.length)
  return rotation[state.sessionsDone % rotation.length]
}

// The planned exercise for a slot, before any user swap.
export function plannedId(slotId: string, sessionsDone: number): string {
  return sessionsDone >= UPGRADE_AFTER_SESSIONS && UPGRADES[slotId] ? UPGRADES[slotId] : slotId
}

export function buildSteps(workout: Workout, state: AppState, settings: Settings): Step[] {
  const { minutes } = settings
  const n = state.sessionsDone
  const sets = setsFor(n)

  const missing = settings.missing ?? []
  const pick = (id: string) => {
    const exerciseId = resolveAvailable(id, missing)
    return exerciseId === id ? { exerciseId } : { exerciseId, unavailable: id }
  }
  const cardio = (id: string, role: 'warmup' | 'main' | 'finisher', mins: number): Step => ({
    type: 'cardio', role, minutes: mins, ...pick(id),
  })

  const strength: Step[] = workout.slots
    .filter((slot) => minutes > 45 || !slot.optional)
    .map((slot) => {
      const baseId = plannedId(slot.id, n)
      return { type: 'strength', baseId, sets, ...pick(state.swaps[baseId] ?? baseId) }
    })

  const stretches: Step[] = workout.stretches
    .filter((slot) => minutes > 45 || !slot.optional)
    .map((slot) => ({ type: 'stretch', exerciseId: slot.id }))

  if (workout.cardioDay) {
    return [cardio('Walking_Treadmill', 'main', CARDIO_DAY[minutes]), ...strength, ...stretches]
  }
  const finishers = n >= STAIRMILL_AFTER_SESSIONS ? [...FINISHER_ROTATION, 'Step_Mill'] : FINISHER_ROTATION
  return [
    cardio('Walking_Treadmill', 'warmup', WARMUP[minutes]),
    ...strength,
    cardio(finishers[n % finishers.length], 'finisher', FINISHER[minutes]),
    ...stretches,
  ]
}

// Rough duration: cardio time, about 2.5 minutes per strength set including rest,
// and each stretch hold plus a little time to get into position.
export function estimateMinutes(steps: Step[]): number {
  const minutesFor = (s: Step) => {
    if (s.type === 'cardio') return s.minutes
    if (s.type === 'strength') return s.sets * 2.5
    const def = exercise(s.exerciseId)
    return def.kind === 'stretch' ? ((def.perSide ? 2 : 1) * def.seconds) / 60 + 0.25 : 1
  }
  return Math.round(steps.reduce((sum, s) => sum + minutesFor(s), 0) / 5) * 5
}

export function isAvailable(id: string, missing: readonly EquipmentId[]): boolean {
  return exercise(id).needs.every((n) => !missing.includes(n))
}

// The exercise itself if the gym has what it needs, otherwise the closest swap
// that works (searching swaps, then their swaps). Keeps the original if nothing fits.
export function resolveAvailable(id: string, missing: readonly EquipmentId[]): string {
  const seen = new Set<string>()
  const queue = [id]
  while (queue.length > 0) {
    const next = queue.shift()!
    if (seen.has(next)) continue
    seen.add(next)
    if (isAvailable(next, missing)) return next
    queue.push(...exercise(next).swaps)
  }
  return id
}

export function exercise(id: string) {
  const def = EXERCISES[id]
  if (!def) throw new Error(`Unknown exercise ${id}`)
  return def
}
