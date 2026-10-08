import { EQUIPMENT_NAMES, type EquipmentId } from '../data/equipment'
import { EXERCISES } from '../data/exercises'

export type Minutes = 20 | 30 | 45 | 60 | 75
export type Feedback = 'hard' | 'right' | 'easy' | 'keep'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type Goal = 'muscle' | 'strength' | 'fat-loss' | 'stamina'
export type Mode = 'gym' | 'home'
export type Unit = 'kg' | 'lb'
export type Split = 'auto' | 'full-body' | 'upper-lower' | 'push-pull-legs'

export type Settings = {
  days: number[]
  minutes: Minutes
  missing?: EquipmentId[]
  experience?: Experience
  goal?: Goal
  mode?: Mode
  unit?: Unit
  startDate?: string
  homeEquipment?: EquipmentId[]
  split?: Split
  lighter?: boolean
  targetWeight?: number // All weights are stored in kg; units only affect display.
}

export type Load = { weight?: number; reps?: number; seconds?: number }

export type Step =
  | {
      type: 'cardio'
      exerciseId: string
      role: 'warmup' | 'main' | 'finisher'
      minutes: number
      unavailable?: string
    }
  | {
      type: 'strength'
      exerciseId: string
      baseId: string
      sets: number
      reps?: [number, number]
      rest?: number
      unavailable?: string
    }
  | { type: 'stretch'; exerciseId: string }
  | {
      type: 'activity'
      exerciseId: string
      role: 'warmup' | 'finisher'
      minutes: number
      name: string
      cue: string
    }

export type SetLog = Load & {
  completed: boolean
  effort?: number
  recordedAt?: number
}
export type StepLog = {
  sets: SetLog[]
  completed?: boolean
  skipped?: boolean
  note?: string
  feedback?: Feedback
  legacy?: boolean
}
export type SessionTimer = {
  endsAt: number
  duration: number
  label: string
  stepIndex: number
  kind: 'rest' | 'activity' | 'hold'
  pausedRemaining?: number
}

export type ActiveSession = {
  date: string
  workoutKey: string
  steps: Step[]
  stepIndex: number
  setIndex: number
  id?: string
  mode?: Mode
  startedAt?: number
  pausedAt?: number
  pausedMs?: number
  timer?: SessionTimer
  logs?: StepLog[]
}

export type SessionRecord = {
  id: string
  date: string
  workoutKey: string
  mode: Mode
  status: 'complete' | 'partial'
  steps: Step[]
  logs: StepLog[]
  durationSeconds?: number
}
export type WeightEntry = { id: string; date: string; kg: number }

export type AppState = {
  version: 2
  settings: Settings | null
  sessionsDone: number
  lastDone: string | null
  loads: Record<string, Load>
  swaps: Record<string, string>
  active: ActiveSession | null
  history: SessionRecord[]
  weights: WeightEntry[]
  modeSessionsDone: Record<Mode, number>
}

export const INITIAL_STATE: AppState = {
  version: 2,
  settings: null,
  sessionsDone: 0,
  lastDone: null,
  loads: {},
  swaps: {},
  active: null,
  history: [],
  weights: [],
  modeSessionsDone: { gym: 0, home: 0 },
}

const KEY = 'gym-app-state'
let storageWarning: string | null = null

export function getStorageWarning() {
  return storageWarning
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseState(raw) : INITIAL_STATE
  } catch {
    storageWarning =
      'Your saved data could not be read. It has not been overwritten. Restore a backup or reset from Profile.'
    return INITIAL_STATE
  }
}

export function saveState(state: AppState): boolean {
  // A damaged backup must not be silently replaced by the initial screen.
  if (storageWarning?.includes('not been overwritten')) return false
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    storageWarning = null
    return true
  } catch {
    storageWarning =
      'Changes are not being saved on this device. Storage may be full or blocked. Download a backup from Profile.'
    return false
  }
}

export function allowStorageReplacement() {
  storageWarning = null
}

export function newId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

type ObjectValue = Record<string, unknown>
const object = (value: unknown): ObjectValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid backup data')
  return value as ObjectValue
}
const number = (
  value: unknown,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    throw new Error('Invalid number in backup')
  return value
}
const integer = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const n = number(value, min, max)
  if (!Number.isInteger(n)) throw new Error('Invalid count in backup')
  return n
}
const choice = <const T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T => {
  if (value === undefined) return fallback
  if (!options.includes(value as T)) throw new Error('Invalid option in backup')
  return value as T
}
const text = (value: unknown, max = 500): string => {
  if (typeof value !== 'string' || value.length > max)
    throw new Error('Invalid text in backup')
  return value
}
const list = (value: unknown, max = 20000): unknown[] => {
  if (!Array.isArray(value) || value.length > max)
    throw new Error('Invalid list in backup')
  return value
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T12:00:00`)
  return (
    !Number.isNaN(d.getTime()) &&
    d.getFullYear() === +value.slice(0, 4) &&
    d.getMonth() + 1 === +value.slice(5, 7) &&
    d.getDate() === +value.slice(8)
  )
}
const date = (value: unknown): string => {
  const result = text(value, 10)
  if (!validDate(result)) throw new Error('Invalid date in backup')
  return result
}
const exerciseId = (value: unknown): string => {
  const id = text(value, 150)
  if (!Object.hasOwn(EXERCISES, id))
    throw new Error(`Unknown exercise in backup: ${id}`)
  return id
}
const equipment = (value: unknown): EquipmentId[] => [
  ...new Set(
    list(value, 100).map((item) => {
      const id = text(item, 50) as EquipmentId
      if (!Object.hasOwn(EQUIPMENT_NAMES, id))
        throw new Error('Unknown equipment in backup')
      return id
    }),
  ),
]

function parseLoad(value: unknown): Load {
  const v = object(value)
  return {
    ...(v.weight === undefined ? {} : { weight: number(v.weight, 0, 2000) }),
    ...(v.reps === undefined ? {} : { reps: integer(v.reps, 1, 1000) }),
    ...(v.seconds === undefined ? {} : { seconds: number(v.seconds, 0, 3600) }),
  }
}

function parseSettings(value: unknown, legacy: boolean): Settings {
  const v = object(value)
  const days = [...new Set(list(v.days, 7).map((d) => integer(d, 0, 6)))].sort(
    (a, b) => a - b,
  )
  if (!days.length) throw new Error('The plan needs at least one training day')
  if (![20, 30, 45, 60, 75].includes(v.minutes as number))
    throw new Error('Invalid session length')
  const missing = v.missing === undefined ? [] : equipment(v.missing)
  if (legacy)
    missing.push(
      ...(['barbell', 'rack'] as const).filter((id) => !missing.includes(id)),
    )
  const homeEquipment =
    v.homeEquipment === undefined ? [] : equipment(v.homeEquipment)
  if (homeEquipment.some((id) => !['dumbbells', 'bench'].includes(id)))
    throw new Error('Invalid home equipment')
  return {
    days,
    minutes: v.minutes as Minutes,
    missing,
    homeEquipment,
    experience: choice(
      v.experience,
      ['beginner', 'intermediate', 'advanced'],
      'beginner',
    ),
    goal: choice(
      v.goal,
      ['muscle', 'strength', 'fat-loss', 'stamina'],
      'fat-loss',
    ),
    mode: choice(v.mode, ['gym', 'home'], 'gym'),
    unit: choice(v.unit, ['kg', 'lb'], 'kg'),
    split: choice(
      v.split,
      ['auto', 'full-body', 'upper-lower', 'push-pull-legs'],
      'auto',
    ),
    lighter: v.lighter === true,
    ...(v.startDate === undefined ? {} : { startDate: date(v.startDate) }),
    ...(v.targetWeight === undefined
      ? {}
      : { targetWeight: number(v.targetWeight, 20, 500) }),
  }
}

function parseStep(value: unknown): Step {
  const v = object(value)
  const id = exerciseId(v.exerciseId)
  const unavailable =
    v.unavailable === undefined
      ? {}
      : { unavailable: exerciseId(v.unavailable) }
  const def = EXERCISES[id]
  if (
    v.type === 'strength' &&
    ['weighted', 'bodyweight', 'hold'].includes(def.kind)
  ) {
    let reps: [number, number] | undefined
    if (v.reps !== undefined) {
      const range = list(v.reps, 2)
      if (range.length !== 2) throw new Error('Invalid rep range')
      reps = [integer(range[0], 1, 1000), integer(range[1], 1, 1000)]
      if (reps[0] > reps[1]) throw new Error('Invalid rep range')
    }
    return {
      type: 'strength',
      exerciseId: id,
      baseId: exerciseId(v.baseId),
      sets: integer(v.sets, 1, 10),
      reps,
      ...(v.rest === undefined ? {} : { rest: integer(v.rest, 15, 600) }),
      ...unavailable,
    }
  }
  if (v.type === 'stretch' && def.kind === 'stretch')
    return { type: 'stretch', exerciseId: id }
  if (v.type === 'cardio' && def.kind === 'cardio')
    return {
      type: 'cardio',
      exerciseId: id,
      role: choice(v.role, ['warmup', 'main', 'finisher'], 'main'),
      minutes: number(v.minutes, 1, 120),
      ...unavailable,
    }
  if (v.type === 'activity')
    return {
      type: 'activity',
      exerciseId: id,
      role: choice(v.role, ['warmup', 'finisher'], 'warmup'),
      minutes: number(v.minutes, 1, 120),
      name: text(v.name, 100),
      cue: text(v.cue),
    }
  throw new Error('Invalid exercise step in backup')
}

function parseLogs(value: unknown, steps: Step[]): StepLog[] {
  const entries = list(value, 100)
  if (entries.length !== steps.length)
    throw new Error('Workout records do not match its exercises')
  return entries.map((entry, i) => {
    const v = object(entry)
    const step = steps[i]
    const sets = list(v.sets, step.type === 'strength' ? step.sets : 0).map(
      (set) => {
        const s = object(set)
        if (typeof s.completed !== 'boolean')
          throw new Error('Invalid set completion')
        return {
          ...parseLoad(s),
          completed: s.completed,
          ...(s.effort === undefined
            ? {}
            : { effort: number(s.effort, 1, 10) }),
          ...(s.recordedAt === undefined
            ? {}
            : { recordedAt: number(s.recordedAt) }),
        }
      },
    )
    return {
      sets,
      completed: v.completed === true,
      skipped: v.skipped === true,
      legacy: v.legacy === true,
      ...(v.note === undefined ? {} : { note: text(v.note) }),
      ...(v.feedback === undefined
        ? {}
        : {
            feedback: choice(
              v.feedback,
              ['hard', 'right', 'easy', 'keep'],
              'keep',
            ),
          }),
    }
  })
}

export function parseState(raw: string): AppState {
  if (raw.length > 20 * 1024 * 1024) throw new Error('This backup is too large')
  const data = object(JSON.parse(raw))
  if (data.version !== 1 && data.version !== 2)
    throw new Error('Not a supported backup from this app')
  const legacy = data.version === 1
  const loads: Record<string, Load> = {}
  for (const [id, load] of Object.entries(object(data.loads ?? {})))
    loads[exerciseId(id)] = parseLoad(load)
  const swaps: Record<string, string> = {}
  for (const [id, swap] of Object.entries(object(data.swaps ?? {})))
    swaps[exerciseId(id)] = exerciseId(swap)
  let active: ActiveSession | null = null
  if (data.active) {
    const a = object(data.active)
    const steps = list(a.steps, 100).map(parseStep)
    if (!steps.length) throw new Error('An active workout cannot be empty')
    const stepIndex = integer(a.stepIndex, 0, steps.length - 1)
    const current = steps[stepIndex]
    active = {
      date: date(a.date),
      workoutKey: text(a.workoutKey, 100),
      steps,
      stepIndex,
      setIndex: integer(
        a.setIndex,
        0,
        current.type === 'strength' ? current.sets : 0,
      ),
      id: a.id === undefined ? newId() : text(a.id, 100),
      mode: choice(a.mode, ['gym', 'home'], 'gym'),
      ...(a.startedAt === undefined ? {} : { startedAt: number(a.startedAt) }),
      ...(a.pausedAt === undefined ? {} : { pausedAt: number(a.pausedAt) }),
      pausedMs: number(a.pausedMs ?? 0),
      logs:
        a.logs === undefined
          ? steps.map((step, i) => ({
              sets:
                step.type === 'strength'
                  ? Array.from(
                      {
                        length:
                          i < stepIndex
                            ? step.sets
                            : i === stepIndex
                              ? integer(a.setIndex, 0, step.sets)
                              : 0,
                      },
                      () => ({ completed: true }),
                    )
                  : [],
              completed: i < stepIndex,
              legacy: true,
            }))
          : parseLogs(a.logs, steps),
    }
    // The logs, not an imported cursor, decide which set is still unrecorded.
    if (current.type === 'strength') {
      const missing = Array.from({ length: current.sets }).findIndex(
        (_, i) => !active!.logs![stepIndex].sets[i]?.completed,
      )
      active.setIndex = missing === -1 ? current.sets : missing
    }
    if (a.timer && active) {
      const t = object(a.timer)
      active.timer = {
        endsAt: number(t.endsAt),
        duration: number(t.duration, 1, 7200),
        label: text(t.label, 100),
        stepIndex: integer(t.stepIndex, 0, steps.length - 1),
        kind: choice(t.kind, ['rest', 'activity', 'hold'], 'rest'),
        ...(t.pausedRemaining === undefined
          ? {}
          : { pausedRemaining: number(t.pausedRemaining, 0, 7200) }),
      }
    }
  }
  const history: SessionRecord[] = legacy
    ? []
    : list(data.history ?? []).map((entry) => {
        const h = object(entry)
        const steps = list(h.steps, 100).map(parseStep)
        if (!steps.length) throw new Error('Invalid workout record')
        return {
          id: text(h.id, 100),
          date: date(h.date),
          workoutKey: text(h.workoutKey, 100),
          mode: choice(h.mode, ['gym', 'home'], 'gym'),
          status: choice(h.status, ['complete', 'partial'], 'partial'),
          steps,
          logs: parseLogs(h.logs, steps),
          ...(h.durationSeconds === undefined
            ? {}
            : { durationSeconds: number(h.durationSeconds) }),
        }
      })
  const weights: WeightEntry[] = legacy
    ? []
    : list(data.weights ?? [], 10000).map((entry) => {
        const w = object(entry)
        return {
          id: text(w.id, 100),
          date: date(w.date),
          kg: number(w.kg, 20, 500),
        }
      })
  const sessionsDone = integer(data.sessionsDone ?? 0)
  const counters = legacy
    ? { gym: sessionsDone, home: 0 }
    : object(data.modeSessionsDone ?? { gym: sessionsDone, home: 0 })
  return {
    version: 2,
    settings: data.settings ? parseSettings(data.settings, legacy) : null,
    sessionsDone,
    lastDone: data.lastDone ? date(data.lastDone) : null,
    loads,
    swaps,
    active,
    history,
    weights,
    modeSessionsDone: {
      gym: integer(counters.gym),
      home: integer(counters.home),
    },
  }
}
