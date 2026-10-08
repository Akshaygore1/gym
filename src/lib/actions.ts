import { applyFeedback, loadForStep } from './progression'
import {
  buildSteps,
  exercise,
  isAvailable,
  missingFor,
  nextWorkout,
} from './plan'
import {
  newId,
  type AppState,
  type Feedback,
  type Load,
  type SessionTimer,
  type Settings,
  type SetLog,
  type StepLog,
} from './state'

export function saveSettings(state: AppState, settings: Settings): AppState {
  return { ...state, settings }
}

export function startSession(
  state: AppState,
  today: string,
  id = newId(),
): AppState {
  if (!state.settings || state.active) return state
  const workout = nextWorkout(state, state.settings)
  const steps = buildSteps(workout, state, state.settings)
  return {
    ...state,
    active: {
      id,
      date: today,
      mode: state.settings.mode ?? 'gym',
      workoutKey: workout.key,
      steps,
      stepIndex: 0,
      setIndex: 0,
      startedAt: Date.now(),
      pausedMs: 0,
      logs: steps.map(() => ({ sets: [] })),
    },
  }
}

const logsFor = (state: AppState): StepLog[] =>
  state.active?.logs ?? state.active?.steps.map(() => ({ sets: [] })) ?? []

export function finishSession(state: AppState, today: string): AppState {
  const a = state.active
  if (!a) return state
  const logs = logsFor(state)
  const complete = logs.every(
    (log, i) =>
      !log.skipped &&
      (a.steps[i].type === 'strength'
        ? log.sets.filter((set) => set.completed).length ===
            (
              a.steps[i] as Extract<
                (typeof a.steps)[number],
                { type: 'strength' }
              >
            ).sets ||
          (log.legacy && log.completed)
        : log.completed),
  )
  const id = a.id ?? newId()
  const mode = a.mode ?? 'gym'
  const end = a.pausedAt ?? Date.now()
  const record = {
    id,
    date: today,
    mode,
    workoutKey: a.workoutKey,
    steps: a.steps,
    logs,
    status: complete ? ('complete' as const) : ('partial' as const),
    ...(a.startedAt === undefined
      ? {}
      : {
          durationSeconds: Math.max(
            0,
            Math.round((end - a.startedAt - (a.pausedMs ?? 0)) / 1000),
          ),
        }),
  }
  if (state.history.some((h) => h.id === id)) return { ...state, active: null }
  const performed = logs.some(
    (log) => log.completed || log.sets.some((s) => s.completed),
  )
  // Finishing a completely untouched session is equivalent to discard.
  if (!performed) return { ...state, active: null }
  return {
    ...state,
    active: null,
    sessionsDone: state.sessionsDone + 1,
    lastDone: today,
    modeSessionsDone: {
      ...state.modeSessionsDone,
      [mode]: state.modeSessionsDone[mode] + 1,
    },
    history: [record, ...state.history],
  }
}

export function discardSession(state: AppState): AppState {
  return { ...state, active: null }
}

export function pauseSession(state: AppState): AppState {
  const a = state.active
  if (!a || a.pausedAt) return state
  const now = Date.now()
  return {
    ...state,
    active: {
      ...a,
      pausedAt: now,
      timer: a.timer
        ? {
            ...a.timer,
            pausedRemaining: Math.max(
              0,
              Math.ceil((a.timer.endsAt - now) / 1000),
            ),
          }
        : undefined,
    },
  }
}
export function resumeSession(state: AppState): AppState {
  const a = state.active
  if (!a?.pausedAt) return state
  const now = Date.now()
  return {
    ...state,
    active: {
      ...a,
      pausedAt: undefined,
      pausedMs: (a.pausedMs ?? 0) + now - a.pausedAt,
      timer: a.timer
        ? {
            ...a.timer,
            endsAt: now + (a.timer.pausedRemaining ?? 0) * 1000,
            pausedRemaining: undefined,
          }
        : undefined,
    },
  }
}

export function nextStep(
  state: AppState,
  today: string,
  skipped = false,
): AppState {
  const a = state.active
  if (!a) return state
  const logs = logsFor(state).map((log, i) =>
    i === a.stepIndex ? { ...log, skipped, completed: !skipped } : log,
  )
  const updated = { ...state, active: { ...a, logs, timer: undefined } }
  if (a.stepIndex + 1 >= a.steps.length) return finishSession(updated, today)
  let nextIndex = a.stepIndex + 1
  while (
    nextIndex < a.steps.length &&
    logs[nextIndex].completed &&
    !logs[nextIndex].skipped
  )
    nextIndex++
  if (nextIndex >= a.steps.length) return finishSession(updated, today)
  const nextLog = logs[nextIndex]
  const next = a.steps[nextIndex]
  const missingSet =
    next.type === 'strength'
      ? Array.from({ length: next.sets }).findIndex(
          (_, i) => !nextLog.sets[i]?.completed,
        )
      : 0
  const setIndex =
    missingSet === -1 && next.type === 'strength' ? next.sets : missingSet
  return {
    ...updated,
    active: { ...updated.active, stepIndex: nextIndex, setIndex },
  }
}

export function completeSet(
  state: AppState,
  actual?: Load & { effort?: number },
): AppState {
  const a = state.active
  const step = a?.steps[a.stepIndex]
  if (!a || !step || step.type !== 'strength' || a.setIndex >= step.sets)
    return state
  const logs = logsFor(state).map((log, i) => {
    if (i !== a.stepIndex) return log
    const sets = [...log.sets]
    sets[a.setIndex] = { ...actual, completed: true, recordedAt: Date.now() }
    return { ...log, sets }
  })
  const nextIndex = Array.from({ length: step.sets }).findIndex(
    (_, i) => !logs[a.stepIndex].sets[i]?.completed,
  )
  return {
    ...state,
    active: {
      ...a,
      logs,
      setIndex: nextIndex === -1 ? step.sets : nextIndex,
      timer: undefined,
    },
  }
}

export function correctSet(
  state: AppState,
  stepIndex: number,
  setIndex: number,
  patch: Partial<SetLog>,
): AppState {
  const a = state.active
  if (!a || !a.steps[stepIndex] || a.steps[stepIndex].type !== 'strength')
    return state
  const logs = logsFor(state).map((log, i) =>
    i === stepIndex
      ? {
          ...log,
          completed: patch.completed === false ? false : log.completed,
          sets: log.sets.map((set, j) =>
            j === setIndex ? { ...set, ...patch } : set,
          ),
        }
      : log,
  )
  let active = { ...a, logs }
  if (patch.completed === false)
    active = { ...active, stepIndex, setIndex, timer: undefined }
  return { ...state, active }
}

export function editStrengthStep(
  state: AppState,
  patch: { sets?: number; reps?: [number, number]; rest?: number },
): AppState {
  const a = state.active
  const step = a?.steps[a.stepIndex]
  if (!a || !step || step.type !== 'strength') return state
  const logs = logsFor(state)
  const recordedMinimum = logs[a.stepIndex].sets.reduce(
    (minimum, set, i) => (set.completed ? i + 1 : minimum),
    0,
  )
  const adjusted = {
    ...step,
    ...patch,
    sets: Math.max(
      recordedMinimum,
      a.setIndex + 1,
      Math.min(10, patch.sets ?? step.sets),
    ),
  }
  return {
    ...state,
    active: {
      ...a,
      steps: a.steps.map((s, i) => (i === a.stepIndex ? adjusted : s)),
      logs: logs.map((log, i) =>
        i === a.stepIndex
          ? { ...log, sets: log.sets.slice(0, adjusted.sets) }
          : log,
      ),
    },
  }
}

export function noteForStep(state: AppState, note: string): AppState {
  const a = state.active
  if (!a) return state
  return {
    ...state,
    active: {
      ...a,
      logs: logsFor(state).map((log, i) =>
        i === a.stepIndex ? { ...log, note: note.slice(0, 500) } : log,
      ),
    },
  }
}

export function setLoad(state: AppState, id: string, load: Load): AppState {
  if (
    load.weight !== undefined &&
    (!Number.isFinite(load.weight) || load.weight < 0 || load.weight > 2000)
  )
    return state
  return {
    ...state,
    loads: { ...state.loads, [id]: { ...state.loads[id], ...load } },
  }
}

export function giveFeedback(
  state: AppState,
  fb: Feedback,
  today: string,
): AppState {
  const a = state.active
  const step = a?.steps[a.stepIndex]
  if (!a || !step || step.type !== 'strength') return state
  if (a.logs && a.setIndex < step.sets) return state
  const id = step.exerciseId
  const def = exercise(id)
  const last = logsFor(state)
    [a.stepIndex].sets.filter((set) => set.completed)
    .at(-1)
  const current = {
    ...loadForStep(def, state.loads[id], step),
    ...(last
      ? { weight: last.weight, reps: last.reps, seconds: last.seconds }
      : {}),
  }
  // Legacy callers have no actual-value log; preserve their previous targets.
  const saved =
    last && (last.reps !== undefined || last.seconds !== undefined)
      ? current
      : state.loads[id]
  const prescribed =
    step.reps && (def.kind === 'weighted' || def.kind === 'bodyweight')
      ? { ...def, reps: step.reps }
      : def
  const load =
    fb === 'keep'
      ? (saved ?? current)
      : def.kind === 'weighted' && saved?.weight === undefined
        ? { reps: current.reps }
        : applyFeedback(prescribed, saved, fb)
  const updated = setLoad(state, id, load)
  const logs = logsFor(updated).map((log, i) =>
    i === a.stepIndex ? { ...log, feedback: fb } : log,
  )
  return nextStep({ ...updated, active: { ...updated.active!, logs } }, today)
}

export function swapCurrent(
  state: AppState,
  newId: string,
  always: boolean,
): AppState {
  const a = state.active
  const step = a?.steps[a.stepIndex]
  if (
    !a ||
    !step ||
    !state.settings ||
    !isAvailable(
      newId,
      missingFor({ ...state.settings, mode: a.mode ?? 'gym' }),
    )
  )
    return state
  const steps = a.steps.map((s, i) =>
    i === a.stepIndex ? { ...s, exerciseId: newId, unavailable: undefined } : s,
  )
  let swaps = state.swaps
  if (always && step.type === 'strength') {
    swaps = { ...swaps }
    if (newId === step.baseId) delete swaps[step.baseId]
    else swaps[step.baseId] = newId
  }
  const logs = logsFor(state).map((log, i) =>
    i === a.stepIndex ? { sets: [] } : log,
  )
  return {
    ...state,
    swaps,
    active: { ...a, steps, logs, setIndex: 0, timer: undefined },
  }
}

export function setTimer(state: AppState, timer?: SessionTimer): AppState {
  if (!state.active) return state
  return {
    ...state,
    active: {
      ...state.active,
      timer: timer
        ? {
            ...timer,
            duration: Math.max(1, Math.min(7200, timer.duration)),
            endsAt: Math.min(timer.endsAt, Date.now() + 7200000),
          }
        : undefined,
    },
  }
}

export function addWeight(state: AppState, kg: number, date: string): AppState {
  if (!Number.isFinite(kg) || kg < 20 || kg > 500) return state
  // One body-weight entry per day; another entry corrects that day's value.
  return {
    ...state,
    weights: [
      { id: newId(), date, kg },
      ...state.weights.filter((w) => w.date !== date),
    ].sort((a, b) => b.date.localeCompare(a.date)),
  }
}
