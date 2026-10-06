// Pure state transitions. The UI calls these through setState(fn).
import { applyFeedback } from './progression'
import { buildSteps, exercise, nextWorkout } from './plan'
import type { AppState, Feedback, Load, Settings } from './state'

export function saveSettings(state: AppState, settings: Settings): AppState {
  return { ...state, settings }
}

export function startSession(state: AppState, today: string): AppState {
  if (!state.settings) return state
  const workout = nextWorkout(state, state.settings)
  return {
    ...state,
    active: {
      date: today,
      workoutKey: workout.key,
      steps: buildSteps(workout, state, state.settings),
      stepIndex: 0,
      setIndex: 0,
    },
  }
}

export function finishSession(state: AppState, today: string): AppState {
  if (!state.active) return state
  return { ...state, active: null, sessionsDone: state.sessionsDone + 1, lastDone: today }
}

export function discardSession(state: AppState): AppState {
  return { ...state, active: null }
}

export function nextStep(state: AppState, today: string): AppState {
  const a = state.active
  if (!a) return state
  if (a.stepIndex + 1 >= a.steps.length) return finishSession(state, today)
  return { ...state, active: { ...a, stepIndex: a.stepIndex + 1, setIndex: 0 } }
}

export function completeSet(state: AppState): AppState {
  const a = state.active
  if (!a) return state
  return { ...state, active: { ...a, setIndex: a.setIndex + 1 } }
}

export function setLoad(state: AppState, id: string, load: Load): AppState {
  return { ...state, loads: { ...state.loads, [id]: { ...state.loads[id], ...load } } }
}

// Saves how the exercise felt, adjusts next time's target, and moves on.
export function giveFeedback(state: AppState, fb: Feedback, today: string): AppState {
  const step = state.active?.steps[state.active.stepIndex]
  if (!step || step.type !== 'strength') return state
  const id = step.exerciseId
  const updated = setLoad(state, id, applyFeedback(exercise(id), state.loads[id], fb))
  return nextStep(updated, today)
}

// Replaces the current exercise. `always` remembers the swap for future sessions.
export function swapCurrent(state: AppState, newId: string, always: boolean): AppState {
  const a = state.active
  const step = a?.steps[a.stepIndex]
  if (!a || !step) return state
  const steps = a.steps.map((s, i) => (i === a.stepIndex ? { ...s, exerciseId: newId, unavailable: undefined } : s))
  let swaps = state.swaps
  if (always && step.type === 'strength') {
    swaps = { ...swaps }
    if (newId === step.baseId) delete swaps[step.baseId]
    else swaps[step.baseId] = newId
  }
  return { ...state, swaps, active: { ...a, steps, setIndex: 0 } }
}
