import { exercise } from './plan'
import { loadForStep, targetSummary } from './progression'
import type { AppState, SessionRecord, Step } from './state'

const ROLE = {
  warmup: 'Warm-up',
  main: 'Conditioning',
  finisher: 'Conditioning',
}
export function stepName(step: Step) {
  return step.type === 'activity' ? step.name : exercise(step.exerciseId).name
}
export function stepSummary(step: Step, state: AppState): string {
  if (step.type === 'cardio' || step.type === 'activity')
    return `${ROLE[step.role]} · ${step.minutes} min`
  const def = exercise(step.exerciseId)
  return targetSummary(
    def,
    loadForStep(def, state.loads[step.exerciseId], step),
    step.type === 'strength' ? step.sets : 1,
    state.settings?.unit,
  )
}
export function recordedSets(record: SessionRecord) {
  return record.logs.reduce(
    (sum, log) => sum + log.sets.filter((s) => s.completed).length,
    0,
  )
}

export function activeDuration(seconds: number): string {
  if (seconds < 60) return 'Less than 1 min active time'
  const minutes = Math.round(seconds / 60)
  return `${minutes} min active time`
}
