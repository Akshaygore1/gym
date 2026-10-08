import { stepName, stepSummary } from '../lib/presentation'
import type { AppState, Step } from '../lib/state'
import { ExerciseAnim } from './ExerciseAnim'
import { Icon } from './Icon'
import { useState } from 'react'
import { Sheet } from './Sheet'

export function StepList({
  steps,
  state,
  current,
  onInfo,
}: {
  steps: Step[]
  state: AppState
  current?: number
  onInfo: (id: string) => void
}) {
  const [activity, setActivity] = useState<Extract<
    Step,
    { type: 'activity' }
  > | null>(null)
  return (
    <>
      <ol className="step-list">
        {steps.map((step, i) => (
          <li
            key={`${i}-${step.exerciseId}`}
            className={
              current === undefined
                ? ''
                : i < current
                  ? 'past'
                  : i === current
                    ? 'now'
                    : ''
            }
          >
            <button
              type="button"
              onClick={() =>
                step.type === 'activity'
                  ? setActivity(step)
                  : onInfo(step.exerciseId)
              }
            >
              <span className="exercise-index">
                {current !== undefined && i < current ? (
                  <Icon name="check" size={16} />
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>
              {step.type === 'activity' ? (
                <span className="activity-thumb">
                  <Icon name="activity" size={24} />
                </span>
              ) : (
                <ExerciseAnim id={step.exerciseId} size="thumb" />
              )}
              <span className="text">
                <strong>{stepName(step)}</strong>
                <span className="muted">{stepSummary(step, state)}</span>
              </span>
              <Icon name="chevron" size={17} className="list-chevron" />
            </button>
          </li>
        ))}
      </ol>
      {activity && (
        <Sheet title={activity.name} onClose={() => setActivity(null)}>
          <p>{activity.cue}</p>
          <p className="hint">
            {activity.minutes} minutes suggested. Take breaks whenever needed.
          </p>
        </Sheet>
      )}
    </>
  )
}
