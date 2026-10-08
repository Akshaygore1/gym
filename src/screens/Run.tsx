import { useState } from 'react'
import { ExerciseAnim } from '../components/ExerciseAnim'
import { Icon } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { stepName } from '../lib/presentation'
import { WORKOUTS } from '../data/workouts'
import {
  completeSet,
  correctSet,
  editStrengthStep,
  giveFeedback,
  nextStep,
  noteForStep,
  setTimer,
  swapCurrent,
} from '../lib/actions'
import { dateKey } from '../lib/dates'
import {
  alertDone,
  formatClock,
  unlockAudio,
  useCountdown,
  useWakeLock,
} from '../lib/device'
import { exercise, isAvailable, missingFor } from '../lib/plan'
import { formatWeight, loadForStep } from '../lib/progression'
import type { AppState, Feedback, Load, SetLog, Step } from '../lib/state'
import { displayWeight, toKg } from '../lib/units'

type Update = (fn: (s: AppState) => AppState) => void
type Props = {
  state: AppState
  update: Update
  onPause: () => void
  onInfo: (id: string) => void
}

export function Run({ state, update, onPause, onInfo }: Props) {
  useWakeLock()
  const a = state.active!
  const step = a.steps[a.stepIndex]
  const [detailed, setDetailed] = useState(
    state.settings?.experience !== 'beginner',
  )
  const totalSets = a.steps.reduce(
    (sum, s) => sum + (s.type === 'strength' ? s.sets : 0),
    0,
  )
  const completed =
    a.logs?.reduce(
      (sum, log) => sum + log.sets.filter((set) => set.completed).length,
      0,
    ) ?? 0
  const completedSteps =
    a.logs?.filter((log) => log.completed && !log.skipped).length ?? 0
  return (
    <main id="main-content" className="run-screen" tabIndex={-1}>
      <header className="run-header">
        <button className="btn btn-ghost" onClick={onPause}>
          <Icon name="pause" size={17} />
          Pause
        </button>
        <div className="run-identity">
          <span>{a.mode === 'home' ? 'Home workout' : 'Gym workout'}</span>
          <h1>{WORKOUTS[a.workoutKey]?.name ?? 'Your session'}</h1>
        </div>
        <span className="run-set-count">
          {completed} / {totalSets}
          <span>sets logged</span>
        </span>
      </header>
      <div
        className="run-progress"
        role="progressbar"
        aria-label="Completed workout steps"
        aria-valuemin={0}
        aria-valuemax={a.steps.length}
        aria-valuenow={completedSteps}
      >
        <span
          style={{ width: `${(completedSteps / a.steps.length) * 100}%` }}
        />
      </div>
      <div className="run-layout">
        <section className="run-main">
          <div className="run-current-label">
            <span>
              Movement {a.stepIndex + 1} of {a.steps.length}
            </span>
            <button
              className="text-button"
              aria-pressed={detailed}
              onClick={() => setDetailed((v) => !v)}
            >
              {detailed ? 'Guided view' : 'Detailed view'}
            </button>
          </div>
          <div className="run-exercise-heading">
            <h2>{stepName(step)}</h2>
            <p>
              {step.type === 'activity'
                ? step.cue
                : exercise(step.exerciseId).cue}
            </p>
          </div>
          {step.type === 'activity' ? (
            <div className="activity-reference">
              <Icon name="activity" size={38} />
              <p>Walk or march at your own pace. No equipment needed.</p>
            </div>
          ) : detailed ? (
            <details className="disclosure run-media">
              <summary>
                Movement reference
                <Icon name="info" size={16} />
              </summary>
              <div className="disclosure-body">
                <ExerciseAnim key={step.exerciseId} id={step.exerciseId} />
              </div>
            </details>
          ) : (
            <ExerciseAnim key={step.exerciseId} id={step.exerciseId} />
          )}
          <TimerBanner state={state} update={update} />
          <StepView
            key={`${a.stepIndex}-${step.exerciseId}`}
            state={state}
            step={step}
            update={update}
            detailed={detailed}
            onInfo={onInfo}
          />
        </section>
        <aside className="run-aside">
          <h2>Your session</h2>
          <p className="muted small">
            Go at your own pace. Your work is saved as you log it.
          </p>
          <ol className="run-outline">
            {a.steps.map((s, i) => (
              <li key={i} className={i === a.stepIndex ? 'current' : ''}>
                <span className="outline-mark">
                  {a.logs?.[i]?.skipped ? (
                    '–'
                  ) : a.logs?.[i]?.completed ? (
                    <Icon name="check" size={15} />
                  ) : (
                    i + 1
                  )}
                </span>
                {s.type === 'activity' ? (
                  <span className="outline-activity">{s.name}</span>
                ) : (
                  <button
                    className="text-button"
                    onClick={() => onInfo(s.exerciseId)}
                  >
                    {stepName(s)}
                  </button>
                )}
                {i === a.stepIndex && (
                  <span className="sr-only">Current movement</span>
                )}
              </li>
            ))}
          </ol>
          <p className="hint">
            Sharp pain, dizziness, or something that feels wrong? Stop the
            activity. Seek appropriate professional help rather than trying to
            push through.
          </p>
        </aside>
      </div>
    </main>
  )
}

function TimerBanner({ state, update }: { state: AppState; update: Update }) {
  const timer = state.active?.timer
  const left = useCountdown(timer?.endsAt ?? null, alertDone)
  if (!timer) return null
  return (
    <div className={`timer-banner ${left === 0 ? 'timer-finished' : ''}`}>
      <div>
        <span role="status">
          {left === 0 ? `${timer.label} finished` : timer.label}
        </span>
        <strong aria-live="off">{formatClock(left)}</strong>
      </div>
      <div className="timer-actions">
        <button
          className="icon-btn"
          aria-label="Subtract 15 seconds"
          disabled={left === 0}
          onClick={() =>
            update((s) => {
              const t = s.active?.timer
              return t
                ? setTimer(s, {
                    ...t,
                    endsAt: Math.max(Date.now(), t.endsAt - 15000),
                    duration: Math.max(1, t.duration - 15),
                  })
                : s
            })
          }
        >
          −15
        </button>
        <button
          className="icon-btn"
          aria-label="Add 15 seconds"
          onClick={() =>
            update((s) => {
              const t = s.active?.timer
              return t
                ? setTimer(s, {
                    ...t,
                    endsAt: Math.max(Date.now(), t.endsAt) + 15000,
                    duration: t.duration + 15,
                  })
                : s
            })
          }
        >
          +15
        </button>
        <button
          className="text-button"
          onClick={() => update((s) => setTimer(s))}
        >
          {left === 0
            ? 'Dismiss'
            : timer.kind === 'rest'
              ? 'Skip rest'
              : 'Stop timer'}
        </button>
      </div>
    </div>
  )
}

function StepView({
  step,
  state,
  update,
  detailed,
  onInfo,
}: {
  step: Step
  state: AppState
  update: Update
  detailed: boolean
  onInfo: (id: string) => void
}) {
  const [swapOpen, setSwapOpen] = useState(false)
  const [alwaysSwap, setAlwaysSwap] = useState(false)
  const [activityHelp, setActivityHelp] = useState(false)
  const a = state.active!
  const def = exercise(step.exerciseId)
  const base = step.type === 'strength' ? step.baseId : step.exerciseId
  const missing = missingFor({ ...state.settings!, mode: a.mode ?? 'gym' })
  const options = [base, ...exercise(base).swaps, ...def.swaps].filter(
    (id, i, all) =>
      id !== def.id &&
      all.indexOf(id) === i &&
      isAvailable(id, missing) &&
      (step.type !== 'strength' ||
        !['stretch', 'cardio'].includes(exercise(id).kind)),
  )
  const done = () =>
    update((s) =>
      s.active?.stepIndex === a.stepIndex ? nextStep(s, dateKey()) : s,
    )
  const note = a.logs?.[a.stepIndex]?.note ?? ''
  const startTimer = (seconds: number) => {
    unlockAudio()
    update((s) =>
      setTimer(s, {
        endsAt: Date.now() + seconds * 1000,
        duration: seconds,
        label: step.type === 'stretch' ? 'Stretch hold' : 'Movement timer',
        kind: 'activity',
        stepIndex: a.stepIndex,
      }),
    )
  }
  const stretchSides = def.kind === 'stretch' && def.perSide ? 2 : 1
  return (
    <>
      <div className="exercise-actions">
        <button
          className="text-button"
          onClick={() =>
            step.type === 'activity' ? setActivityHelp(true) : onInfo(def.id)
          }
        >
          <Icon name="info" size={16} />
          How to do it
        </button>
        {options.length > 0 && step.type !== 'activity' && (
          <button className="text-button" onClick={() => setSwapOpen(true)}>
            <Icon name="swap" size={16} />
            Swap movement
          </button>
        )}
        <button
          className="text-button muted"
          onClick={() => {
            if (
              step.type !== 'strength' ||
              !a.logs?.[a.stepIndex]?.sets.some((s) => s.completed) ||
              confirm(
                'Skip the remaining sets? Your completed sets stay in the record.',
              )
            )
              update((s) => nextStep(s, dateKey(), true))
          }}
        >
          Skip
        </button>
      </div>
      {step.type === 'strength' ? (
        <StrengthStep
          state={state}
          step={step}
          update={update}
          detailed={detailed}
        />
      ) : (
        <div className="timed-movement">
          <div className="timed-target">
            <strong>
              {step.type === 'stretch'
                ? def.kind === 'stretch'
                  ? def.seconds
                  : 30
                : step.minutes}
            </strong>
            <span>
              {step.type === 'stretch'
                ? stretchSides === 2
                  ? 'seconds each side'
                  : 'seconds'
                : 'minutes planned'}
            </span>
          </div>
          {step.type === 'stretch' && stretchSides === 2 && (
            <p className="hint">
              Do both sides. Switch halfway through the timer.
            </p>
          )}
          <div className="timed-actions">
            <button
              className="btn btn-ghost"
              onClick={() =>
                startTimer(
                  step.type === 'stretch'
                    ? (def.kind === 'stretch' ? def.seconds : 30) * stretchSides
                    : step.minutes * 60,
                )
              }
            >
              <Icon name="timer" size={18} />
              {a.timer?.kind === 'activity' ? 'Restart timer' : 'Start timer'}
            </button>
            <button className="btn btn-primary" onClick={done}>
              Done, next movement
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <p className="hint">
            The timer is optional. You decide when you’re ready to move on.
          </p>
        </div>
      )}
      <details className="disclosure exercise-note">
        <summary>
          Notes for this movement
          <Icon name="edit" size={16} />
        </summary>
        <div className="disclosure-body">
          <label className="sr-only" htmlFor="exercise-note">
            Exercise notes
          </label>
          <textarea
            id="exercise-note"
            value={note}
            maxLength={500}
            placeholder="A form cue, a variation, or something to remember…"
            onChange={(e) => update((s) => noteForStep(s, e.target.value))}
          />
          <p className="hint">Saved with this session. {note.length}/500</p>
        </div>
      </details>
      {activityHelp && step.type === 'activity' && (
        <Sheet title={step.name} onClose={() => setActivityHelp(false)}>
          <p>{step.cue}</p>
          <p className="hint">
            The timer is optional. Take breaks or finish early whenever needed.
          </p>
        </Sheet>
      )}
      {swapOpen && (
        <Sheet
          title="Choose another movement"
          onClose={() => setSwapOpen(false)}
        >
          <p className="muted">
            Only options supported by your {a.mode === 'home' ? 'home' : 'gym'}{' '}
            equipment are shown.
          </p>
          <ul className="swap-list">
            {options.map((id) => (
              <li key={id}>
                <button
                  onClick={() => {
                    if (
                      a.logs?.[a.stepIndex]?.sets.some((s) => s.completed) &&
                      !confirm(
                        'Changing this movement clears its current set records. Keep the existing movement if you want those sets in this session.',
                      )
                    )
                      return
                    update((s) => swapCurrent(s, id, alwaysSwap))
                    setSwapOpen(false)
                  }}
                >
                  <ExerciseAnim id={id} size="thumb" />
                  <span>
                    <strong>{exercise(id).name}</strong>
                    <span className="muted small">
                      {id === base
                        ? 'Original movement'
                        : exercise(id).kind === 'weighted'
                          ? 'Choose your own load'
                          : 'Bodyweight / timed'}
                    </span>
                  </span>
                  <Icon name="chevron" size={17} />
                </button>
              </li>
            ))}
          </ul>
          {step.type === 'strength' && (
            <label className="equipment-check">
              <input
                type="checkbox"
                checked={alwaysSwap}
                onChange={(e) => setAlwaysSwap(e.target.checked)}
              />
              Use this alternative in future sessions
            </label>
          )}
        </Sheet>
      )}
    </>
  )
}

function StrengthStep({
  state,
  step,
  update,
  detailed,
}: {
  state: AppState
  step: Extract<Step, { type: 'strength' }>
  update: Update
  detailed: boolean
}) {
  const a = state.active!
  const def = exercise(step.exerciseId)
  const log = a.logs?.[a.stepIndex]
  const rest = step.rest ?? ('rest' in def ? def.rest : 60)
  const previous = state.history.find(
    (record) =>
      record.mode === a.mode &&
      record.steps.some(
        (s, i) =>
          s.type === 'strength' &&
          s.exerciseId === def.id &&
          record.logs[i].sets.some(
            (set) =>
              set.completed &&
              (set.reps !== undefined || set.seconds !== undefined),
          ),
      ),
  )
  const previousSets = previous?.logs[
    previous.steps.findIndex(
      (s) => s.type === 'strength' && s.exerciseId === def.id,
    )
  ]?.sets.filter((s) => s.completed)
  const previousSet = previousSets?.at(-1)
  const target = loadForStep(def, state.loads[def.id] ?? previousSet, step)
  const lastSet = log?.sets[a.setIndex - 1]
  const initial = {
    ...target,
    ...(lastSet
      ? {
          weight: lastSet.weight ?? target.weight,
          reps: lastSet.reps ?? target.reps,
          seconds: lastSet.seconds ?? target.seconds,
        }
      : {}),
  }
  const unit = state.settings?.unit ?? 'kg'
  const setIndex = a.setIndex
  const stepIndex = a.stepIndex
  const minimumSets = Math.max(
    setIndex + 1,
    ...(log?.sets.map((set, i) => (set.completed ? i + 1 : 0)) ?? []),
  )
  const onRecord = (actual: Load & { effort?: number }) => {
    unlockAudio()
    update((s) => {
      if (s.active?.stepIndex !== stepIndex || s.active.setIndex !== setIndex)
        return s
      const lastRecorded = s.active.logs?.[stepIndex]?.sets
        .filter((set) => set.completed)
        .at(-1)?.recordedAt
      if (lastRecorded && Date.now() - lastRecorded < 600) return s
      let next = completeSet(s, actual)
      if (next.active && next.active.setIndex < step.sets)
        next = setTimer(next, {
          endsAt: Date.now() + rest * 1000,
          duration: rest,
          label: 'Rest between sets',
          stepIndex,
          kind: 'rest',
        })
      return next
    })
  }
  return (
    <section className="strength-logger">
      <div className="target-overview">
        <div>
          <span className="quiet-label">Suggested target</span>
          <strong>
            {def.kind === 'hold'
              ? `${target.seconds}s${def.id === 'Side_Bridge' ? ' each side' : ''}`
              : `${step.reps ? `${step.reps[0]}–${step.reps[1]}` : target.reps} reps`}
          </strong>
        </div>
        <div>
          <span className="quiet-label">Rest between sets</span>
          <strong>{formatClock(rest)}</strong>
        </div>
        <span className="set-label">
          {Math.min(setIndex + 1, step.sets)} / {step.sets} sets
        </span>
      </div>
      {previousSet && (
        <p className="previous-performance">
          Last logged:{' '}
          {previousSet.weight === undefined
            ? ''
            : `${formatWeight(def, previousSet.weight, unit)} · `}
          {previousSet.reps === undefined
            ? `${previousSet.seconds ?? '—'}s hold`
            : `${previousSet.reps} reps`}
        </p>
      )}
      {def.kind === 'weighted' &&
        target.weight === undefined &&
        !log?.sets.some((set) => set.completed && set.weight !== undefined) && (
          <div className="first-load-note">
            <Icon name="info" size={19} />
            <p>
              Choose a light weight you can control. Ask a qualified trainer if
              you need help with the movement or equipment.
            </p>
          </div>
        )}
      {def.id === 'Pushups' && state.settings?.experience === 'beginner' && (
        <p className="hint">
          Too difficult on the floor? Use a wall or a suitable stable counter.
          Record your variation in Notes.
        </p>
      )}
      {(detailed || setIndex > 0) && (
        <div className="logged-sets">
          <div className="log-table-heading">
            <span>Set</span>
            <span>Actual work</span>
            <span>Status</span>
          </div>
          {Array.from({ length: step.sets }, (_, i) => {
            const set = log?.sets[i]
            return (
              <div
                key={i}
                className={`logged-set-row ${i === setIndex ? 'current' : ''}`}
              >
                <span className="set-number">{i + 1}</span>
                <span>
                  {set?.completed ? (
                    <>
                      {set.weight === undefined
                        ? ''
                        : `${formatWeight(def, set.weight, unit)} · `}
                      {set.reps !== undefined
                        ? `${set.reps} reps`
                        : set.seconds !== undefined
                          ? `${set.seconds}s hold`
                          : 'Values not recorded'}
                      {set.effort && <small> · RPE {set.effort}</small>}
                    </>
                  ) : i === setIndex ? (
                    'Current set'
                  ) : (
                    'Not logged'
                  )}
                </span>
                <span className="logged-set-actions">
                  {set?.completed ? (
                    <>
                      <Icon name="check" size={17} />
                      <button
                        className="text-button"
                        onClick={() =>
                          update((s) =>
                            correctSet(s, stepIndex, i, { completed: false }),
                          )
                        }
                      >
                        Undo
                      </button>
                      {detailed && (
                        <CorrectSet
                          set={set}
                          defId={def.id}
                          onSave={(patch) =>
                            update((s) => correctSet(s, stepIndex, i, patch))
                          }
                          unit={unit}
                        />
                      )}
                    </>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {setIndex >= step.sets ? (
        <FeedbackPicker
          onPick={(feedback) =>
            update((s) => giveFeedback(s, feedback, dateKey()))
          }
        />
      ) : (
        <>
          <SetInput
            key={setIndex}
            defId={def.id}
            initial={initial}
            unit={unit}
            advanced={state.settings?.experience === 'advanced'}
            setIndex={setIndex}
            onRecord={onRecord}
          />
          {def.kind === 'hold' && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                unlockAudio()
                const duration =
                  (target.seconds ?? 20) * (def.id === 'Side_Bridge' ? 2 : 1)
                update((s) =>
                  setTimer(s, {
                    duration,
                    endsAt: Date.now() + duration * 1000,
                    kind: 'hold',
                    stepIndex,
                    label:
                      def.id === 'Side_Bridge'
                        ? 'Hold · switch sides halfway'
                        : 'Hold timer',
                  }),
                )
              }}
            >
              <Icon name="timer" size={17} />
              Start hold timer
            </button>
          )}
        </>
      )}
      {setIndex < step.sets && (
        <details className="disclosure target-editor">
          <summary>
            Adjust this session’s targets
            <Icon name="settings" size={17} />
          </summary>
          <div className="disclosure-body">
            <div className="target-editor-fields">
              <label>
                Working sets
                <input
                  type="number"
                  defaultValue={step.sets}
                  min={minimumSets}
                  max={10}
                  step={1}
                  onBlur={(e) => {
                    const value = +e.target.value
                    if (
                      Number.isInteger(value) &&
                      value >= minimumSets &&
                      value <= 10
                    )
                      update((s) => editStrengthStep(s, { sets: value }))
                    else e.target.value = String(step.sets)
                  }}
                />
              </label>
              {def.kind !== 'hold' && (
                <label>
                  Rep target
                  <input
                    type="number"
                    defaultValue={target.reps}
                    min={1}
                    max={100}
                    step={1}
                    onBlur={(e) => {
                      const value = +e.target.value
                      if (Number.isInteger(value) && value > 0 && value <= 100)
                        update((s) =>
                          editStrengthStep(s, { reps: [value, value] }),
                        )
                      else e.target.value = String(target.reps)
                    }}
                  />
                </label>
              )}
              <label>
                Rest (seconds)
                <input
                  type="number"
                  defaultValue={rest}
                  min={15}
                  max={600}
                  step={15}
                  onBlur={(e) => {
                    const value = +e.target.value
                    if (Number.isInteger(value) && value >= 15 && value <= 600)
                      update((s) => editStrengthStep(s, { rest: value }))
                    else e.target.value = String(rest)
                  }}
                />
              </label>
            </div>
            <p className="hint">
              These changes apply to this session. Adding sets or rest can make
              it longer than your original time budget.
            </p>
          </div>
        </details>
      )}
    </section>
  )
}

function SetInput({
  defId,
  initial,
  unit,
  advanced,
  setIndex,
  onRecord,
}: {
  defId: string
  initial: Load
  unit: 'kg' | 'lb'
  advanced: boolean
  setIndex: number
  onRecord: (load: Load & { effort?: number }) => void
}) {
  const def = exercise(defId)
  const [weight, setWeight] = useState(
    initial.weight === undefined
      ? ''
      : String(displayWeight(initial.weight, unit)),
  )
  const [reps, setReps] = useState(String(initial.reps ?? 8))
  const [seconds, setSeconds] = useState(String(initial.seconds ?? 20))
  const [effort, setEffort] = useState('')
  const [error, setError] = useState('')
  const submit = () => {
    const actual: Load & { effort?: number } = {}
    if (def.kind === 'weighted') {
      const kg = toKg(+weight, unit)
      if (weight === '' || !Number.isFinite(kg) || kg < 0 || kg > 2000) {
        setError(
          'Enter a valid, non-negative weight for the work you performed.',
        )
        return
      }
      actual.weight = kg
    }
    if (def.kind === 'hold') {
      if (!Number.isInteger(+seconds) || +seconds < 1 || +seconds > 3600) {
        setError('Enter a hold time from 1 to 3,600 seconds.')
        return
      }
      actual.seconds = +seconds
    } else {
      if (!Number.isInteger(+reps) || +reps < 1 || +reps > 1000) {
        setError('Enter the number of repetitions you completed (1–1,000).')
        return
      }
      actual.reps = +reps
    }
    if (effort) actual.effort = +effort
    onRecord(actual)
  }
  return (
    <form
      className="set-input-form"
      onSubmit={(e) => {
        e.preventDefault()
        setError('')
        submit()
      }}
    >
      <div className="section-heading">
        <h3>Log set {setIndex + 1}</h3>
        <span className="muted small">Actual work, not just the target</span>
      </div>
      <div className="set-inputs">
        {def.kind === 'weighted' && (
          <label>
            Weight {def.perHand ? '(each hand)' : ''}
            <div className="input-unit">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={displayWeight(2000, unit)}
                step="any"
                required
                placeholder="Choose a load"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span>{unit}</span>
            </div>
          </label>
        )}
        {def.kind === 'hold' ? (
          <label>
            Hold time {def.id === 'Side_Bridge' ? '(each side)' : ''}
            <div className="input-unit">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={3600}
                required
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              />
              <span>sec</span>
            </div>
          </label>
        ) : (
          <label>
            Reps completed
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={1000}
              required
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </label>
        )}
        {advanced && (
          <label>
            Effort (optional)
            <select
              value={effort}
              onChange={(e) => setEffort(e.target.value)}
              aria-describedby="effort-help"
            >
              <option value="">Skip RPE</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                  {i === 0 ? ' · easy' : i === 9 ? ' · maximal' : ''}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {advanced && (
        <p id="effort-help" className="hint">
          RPE: effort from 1 (easy) to 10 (maximal). Training at 10 isn’t
          required.
        </p>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary btn-block log-set-button"
      >
        <Icon name="check" size={19} />
        Log set
      </button>
    </form>
  )
}

function CorrectSet({
  set,
  defId,
  onSave,
  unit,
}: {
  set: SetLog
  defId: string
  onSave: (patch: Partial<SetLog>) => void
  unit: 'kg' | 'lb'
}) {
  const [open, setOpen] = useState(false)
  const def = exercise(defId)
  return (
    <>
      <button
        className="icon-btn"
        aria-label="Correct recorded set"
        onClick={() => setOpen(true)}
      >
        <Icon name="edit" size={15} />
      </button>
      {open && (
        <Sheet title="Correct recorded values" onClose={() => setOpen(false)}>
          <SetInput
            defId={defId}
            initial={set}
            unit={unit}
            advanced={false}
            setIndex={0}
            onRecord={(actual) => {
              onSave(actual)
              setOpen(false)
            }}
          />
          <p className="hint">
            This updates the set already recorded. It doesn’t add another set.
            {def.kind === 'weighted' && def.perHand
              ? ' Weight is per hand.'
              : ''}
          </p>
        </Sheet>
      )}
    </>
  )
}

const FEEDBACK: { fb: Feedback; label: string; hint: string }[] = [
  {
    fb: 'keep',
    label: 'Keep this target',
    hint: 'Use the work I just logged as my next target.',
  },
  {
    fb: 'right',
    label: 'About right',
    hint: 'Controlled reps. Suggest a small next step.',
  },
  {
    fb: 'hard',
    label: 'Too hard',
    hint: 'I couldn’t finish, or my form broke down.',
  },
  {
    fb: 'easy',
    label: 'Too easy',
    hint: 'I could do more while keeping good form.',
  },
]
function FeedbackPicker({ onPick }: { onPick: (feedback: Feedback) => void }) {
  return (
    <div className="feedback-picker">
      <h3>What should we aim for next time?</h3>
      <p className="muted small">
        Suggestions are editable. Your feedback isn’t a form or readiness
        assessment.
      </p>
      <div className="feedback-options">
        {FEEDBACK.map(({ fb, label, hint }) => (
          <button
            key={fb}
            className={`feedback-option feedback-${fb}`}
            onClick={() => onPick(fb)}
          >
            <strong>{label}</strong>
            <span>{hint}</span>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </div>
    </div>
  )
}
