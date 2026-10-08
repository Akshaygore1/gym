import { rotationForProfile, type Workout } from '../data/workouts'
import { dateKey } from './dates'
import { buildSteps, rotationIndex } from './plan'
import type { AppState, Settings, Step } from './state'

export type PlannedDay = {
  date: Date
  status:
    | 'done'
    | 'partial'
    | 'active'
    | 'gym'
    | 'home'
    | 'rest'
    | 'missed'
    | 'before-start'
  offset?: number
}

export function upcomingDays(
  state: AppState,
  settings: Settings,
  from: Date,
  count = 7,
  pivot = from,
): PlannedDay[] {
  let offset = state.active ? 1 : 0
  const today = dateKey(pivot)
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate() + i,
    )
    const key = dateKey(date)
    if (state.active && (key === today || key === state.active.date))
      return { date, status: 'active' }
    const entries = state.history.filter((h) => h.date === key)
    if (entries.some((h) => h.status === 'complete'))
      return { date, status: 'done' }
    if (entries.length) return { date, status: 'partial' }
    if (key === state.lastDone) return { date, status: 'done' }
    if (settings.startDate && key < settings.startDate)
      return { date, status: 'before-start' }
    if (!settings.days.includes(date.getDay())) return { date, status: 'rest' }
    if (key < today) return { date, status: 'missed' }
    return { date, status: settings.mode ?? 'gym', offset: offset++ }
  })
}

export type SessionPreview = { workout: Workout; steps: Step[]; number: number }
export function previewSession(
  state: AppState,
  settings: Settings,
  offset: number,
): SessionPreview {
  const sessionsDone = state.sessionsDone + offset
  const rotation = rotationForProfile(settings)
  const workout =
    rotation[(rotationIndex(state, settings) + offset) % rotation.length]
  return {
    workout,
    steps: buildSteps(workout, { ...state, sessionsDone }, settings),
    number: sessionsDone + 1,
  }
}

export function weekStart(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - ((date.getDay() + 6) % 7),
  )
}

export function nextTrainingDate(
  settings: Settings,
  from = new Date(),
): Date | null {
  if (!settings.days.length) return null
  const start = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + 1,
  )
  if (settings.startDate && dateKey(start) < settings.startDate) {
    const [year, month, day] = settings.startDate.split('-').map(Number)
    start.setFullYear(year, month - 1, day)
  }
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    )
    if (settings.days.includes(candidate.getDay())) return candidate
  }
  return null
}

export function weeklyProgress(
  state: AppState,
  settings: Settings,
  now: Date,
): { done: number; planned: number } {
  const start = weekStart(now)
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 6,
  )
  const done = new Set(
    state.history
      .filter((h) => h.date >= dateKey(start) && h.date <= dateKey(end))
      .map((h) => h.date),
  )
  if (
    state.lastDone &&
    state.lastDone >= dateKey(start) &&
    state.lastDone <= dateKey(end)
  )
    done.add(state.lastDone)
  const planned = Array.from(
    { length: 7 },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  ).filter(
    (date) =>
      settings.days.includes(date.getDay()) &&
      (!settings.startDate || dateKey(date) >= settings.startDate),
  ).length
  return { done: done.size, planned }
}
