import { activeDuration, stepName } from '../lib/presentation'
import { exercise } from '../lib/plan'
import { formatWeight } from '../lib/progression'
import type { SessionRecord, Unit } from '../lib/state'
import { Icon } from './Icon'

export function SessionDetails({
  record,
  unit,
}: {
  record: SessionRecord
  unit: Unit
}) {
  return (
    <div className="session-details">
      <div className="session-meta">
        <span>{record.mode === 'home' ? 'Home' : 'Gym'}</span>
        <span>
          {record.status === 'complete' ? 'Completed' : 'Finished early'}
        </span>
        {record.durationSeconds !== undefined && (
          <span>{activeDuration(record.durationSeconds)}</span>
        )}
      </div>
      {record.steps.map((step, i) => {
        const log = record.logs[i]
        const def = exercise(step.exerciseId)
        return (
          <section key={i} className="record-exercise">
            <div className="section-heading">
              <h3>{stepName(step)}</h3>
              <span className="muted small">
                {log.skipped ? (
                  'Skipped'
                ) : log.completed ? (
                  <Icon name="check" size={18} />
                ) : (
                  'Not finished'
                )}
              </span>
            </div>
            {log.legacy && (
              <p className="hint">
                Earlier progress carried over; actual values were not recorded.
              </p>
            )}
            {step.type === 'strength' && log.sets.length > 0 && (
              <ul className="record-sets">
                {log.sets.map((set, j) => (
                  <li key={j}>
                    <span>Set {j + 1}</span>
                    <span>
                      {set.weight === undefined
                        ? ''
                        : formatWeight(def, set.weight, unit)}
                      {set.reps === undefined
                        ? ''
                        : `${set.weight === undefined ? '' : ' · '}${set.reps} reps`}
                      {set.seconds === undefined ? '' : `${set.seconds}s hold`}
                      {set.weight === undefined &&
                      set.reps === undefined &&
                      set.seconds === undefined
                        ? 'Values not recorded'
                        : ''}
                    </span>
                    <span>
                      {set.completed ? (
                        <Icon name="check" size={15} />
                      ) : (
                        'Undone'
                      )}
                    </span>
                    {set.effort && (
                      <span className="muted small">RPE {set.effort}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {log.note && <p className="record-note">{log.note}</p>}
          </section>
        )
      })}
    </div>
  )
}
