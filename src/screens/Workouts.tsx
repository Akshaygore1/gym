import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/Layout'
import { Sheet } from '../components/Sheet'
import { SessionDetails } from '../components/SessionDetails'
import { activeDuration, recordedSets } from '../lib/presentation'
import { StepList } from '../components/StepList'
import { WORKOUTS, programName, rotationForProfile } from '../data/workouts'
import { estimateMinutes, planLimitations } from '../lib/plan'
import { goalFor, levelFor } from '../lib/profile'
import { previewSession } from '../lib/schedule'
import type { AppState, SessionRecord, Settings } from '../lib/state'
import { dateKey } from '../lib/dates'
import { useToday } from '../lib/useToday'

export function Workouts({
  state,
  settings,
  onInfo,
  onStart,
  onResume,
  tab,
  onTab: setTab,
}: {
  state: AppState
  settings: Settings
  onInfo: (id: string) => void
  onStart: () => void
  onResume: () => void
  tab: 'plan' | 'history'
  onTab: (tab: 'plan' | 'history') => void
}) {
  const [offset, setOffset] = useState(0)
  const [record, setRecord] = useState<SessionRecord | null>(null)
  const now = useToday()
  const rotation = rotationForProfile(settings)
  const preview = previewSession(
    state,
    settings,
    Math.min(offset, rotation.length - 1),
  )
  const strengthCount = preview.steps.filter(
    (step) => step.type === 'strength',
  ).length
  const limitations = planLimitations(preview.workout, preview.steps, settings)
  const legacyCount = Math.max(0, state.sessionsDone - state.history.length)
  const manualStart = () => {
    if (state.active) {
      onResume()
      return
    }
    const today = dateKey(now)
    const offSchedule =
      state.lastDone === today ||
      !settings.days.includes(now.getDay()) ||
      (!!settings.startDate && today < settings.startDate)
    if (
      !offSchedule ||
      confirm(
        'This is outside your current schedule. Start an optional session? Your recovery days and earlier records will stay unchanged.',
      )
    )
      onStart()
  }
  return (
    <main id="main-content" className="screen" tabIndex={-1}>
      <PageHeader
        title="Workouts"
        description="Your routine, and the work you’ve put into it."
      />
      <div className="view-switch" role="group" aria-label="Workout view">
        <button
          aria-pressed={tab === 'plan'}
          className={tab === 'plan' ? 'selected' : ''}
          onClick={() => setTab('plan')}
        >
          Your plan
        </button>
        <button
          aria-pressed={tab === 'history'}
          className={tab === 'history' ? 'selected' : ''}
          onClick={() => setTab('history')}
        >
          History<span className="count-badge">{state.history.length}</span>
        </button>
      </div>
      {tab === 'plan' ? (
        <div className="workouts-grid">
          <aside className="program-outline">
            <span className="level-label">
              {levelFor(settings).name} ·{' '}
              {settings.mode === 'home' ? 'Home' : 'Gym'}
            </span>
            <h2>{programName(settings)}</h2>
            <p className="muted">{goalFor(settings).name}</p>
            <p className="hint">
              The routine continues where you left off, even if your week
              changes.
            </p>
            <div
              className="routine-tabs"
              role="group"
              aria-label="Upcoming routines"
            >
              {rotation.map((_, i) => {
                const p = previewSession(state, settings, i)
                return (
                  <button
                    key={i}
                    className={offset === i ? 'selected' : ''}
                    aria-pressed={offset === i}
                    onClick={() => setOffset(i)}
                  >
                    <span>
                      {i === 0 ? 'Next session' : `Then · session ${i + 1}`}
                    </span>
                    <strong>{p.workout.name}</strong>
                    <Icon name="chevron" size={17} />
                  </button>
                )
              })}
            </div>
            <p className="hint">
              These are suggested targets, not a guarantee. Change them to suit
              your actual performance.
            </p>
          </aside>
          <section className="program-detail">
            <div className="section-heading">
              <div>
                <h2>{preview.workout.name}</h2>
                <p className="muted">{preview.workout.focus}</p>
              </div>
              <span className="session-duration">
                <Icon name="timer" size={17} />~{estimateMinutes(preview.steps)}{' '}
                min
              </span>
            </div>
            <StepList steps={preview.steps} state={state} onInfo={onInfo} />
            {limitations.map((note) => (
              <p className="hint" key={note}>
                {note}
              </p>
            ))}
            {offset === 0 && (
              <button
                className="btn btn-primary"
                disabled={!strengthCount && !state.active}
                onClick={manualStart}
              >
                <Icon name="play" size={18} />
                {state.active ? 'Resume your session' : 'Start this session'}
              </button>
            )}
          </section>
        </div>
      ) : (
        <section className="history-section">
          <div className="section-heading">
            <h2>Recorded sessions</h2>
            <span className="muted small">
              {state.history.reduce((sum, h) => sum + recordedSets(h), 0)} sets
              logged
            </span>
          </div>
          {legacyCount > 0 && (
            <p className="history-legacy">
              {legacyCount} earlier{' '}
              {legacyCount === 1 ? 'session was' : 'sessions were'} counted
              without detailed logs. Your weights and total progress are still
              here.
            </p>
          )}
          {!state.history.length ? (
            <div className="empty-state">
              <Icon name="strength" size={32} />
              <h3>Your first session belongs here.</h3>
              <p>
                Log a workout to see the actual sets, reps, weights, and notes
                you recorded.
              </p>
              <button className="btn btn-ghost" onClick={() => setTab('plan')}>
                See your plan
                <Icon name="arrow" size={17} />
              </button>
            </div>
          ) : (
            <div className="history-list">
              {state.history.map((entry) => (
                <button
                  className="history-row"
                  key={entry.id}
                  onClick={() => setRecord(entry)}
                >
                  <span className="history-date">
                    <strong>
                      {new Date(`${entry.date}T12:00`).toLocaleDateString(
                        undefined,
                        { day: 'numeric', month: 'short' },
                      )}
                    </strong>
                    <span>
                      {new Date(`${entry.date}T12:00`).toLocaleDateString(
                        undefined,
                        { weekday: 'short', year: 'numeric' },
                      )}
                    </span>
                  </span>
                  <span className="history-info">
                    <strong>
                      {WORKOUTS[entry.workoutKey]?.name ?? 'Workout'}
                    </strong>
                    <span>
                      {entry.mode === 'home' ? 'Home' : 'Gym'} ·{' '}
                      {recordedSets(entry)} sets logged
                      {entry.durationSeconds === undefined
                        ? ''
                        : ` · ${activeDuration(entry.durationSeconds)}`}
                    </span>
                  </span>
                  <span className={`session-status ${entry.status}`}>
                    {entry.status === 'complete'
                      ? 'Completed'
                      : 'Finished early'}
                  </span>
                  <Icon name="chevron" size={18} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      {record && (
        <Sheet
          title={WORKOUTS[record.workoutKey]?.name ?? 'Workout record'}
          onClose={() => setRecord(null)}
        >
          <p className="muted">
            {new Date(`${record.date}T12:00`).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <SessionDetails record={record} unit={settings.unit ?? 'kg'} />
        </Sheet>
      )}
    </main>
  )
}
