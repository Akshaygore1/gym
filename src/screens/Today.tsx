import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHeader, type Page } from '../components/Layout'
import { LocationPicker } from '../components/ProfileFields'
import { StepList } from '../components/StepList'
import { WeightTrend } from '../components/WeightTrend'
import { recordedSets } from '../lib/presentation'
import { WORKOUTS, programName } from '../data/workouts'
import { DAY_SHORT, dateKey } from '../lib/dates'
import { estimateMinutes, planLimitations } from '../lib/plan'
import { goalFor, levelFor } from '../lib/profile'
import {
  previewSession,
  upcomingDays,
  weeklyProgress,
  type PlannedDay,
} from '../lib/schedule'
import type { AppState, Mode, Settings } from '../lib/state'
import { useToday } from '../lib/useToday'

type Props = {
  state: AppState
  settings: Settings
  onStart: () => void
  onResume: () => void
  onFinishActive: () => void
  onDiscard: () => void
  onMode: (mode: Mode) => void
  onNavigate: (page: Page) => void
  onInfo: (id: string) => void
}

export function WeekStrip({
  week,
  selected,
  onSelect,
}: {
  week: PlannedDay[]
  selected: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="week-strip" role="group" aria-label="Week preview">
      {week.map((day, i) => (
        <button
          key={dateKey(day.date)}
          type="button"
          aria-pressed={selected === i}
          aria-label={`${day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}, ${day.status === 'gym' || day.status === 'home' ? 'training day' : day.status.replace('-', ' ')}`}
          className={`week-day ${selected === i ? 'selected' : ''} is-${day.status}`}
          onClick={() => onSelect(i)}
        >
          <span>{DAY_SHORT[day.date.getDay()]}</span>
          <strong>{day.date.getDate()}</strong>
          <span className="day-mark" aria-hidden>
            {day.status === 'done' ? (
              <Icon name="check" size={14} />
            ) : day.status === 'active' ? (
              <Icon name="play" size={12} />
            ) : day.status === 'partial' ? (
              '–'
            ) : day.status === 'gym' || day.status === 'home' ? (
              <span />
            ) : (
              ''
            )}
          </span>
        </button>
      ))}
    </div>
  )
}

export function Today({
  state,
  settings,
  onStart,
  onResume,
  onFinishActive,
  onDiscard,
  onMode,
  onNavigate,
  onInfo,
}: Props) {
  const now = useToday()
  const today = dateKey(now)
  const [selected, setSelected] = useState(0)
  const week = upcomingDays(state, settings, now)
  const day = week[selected]
  const preview = previewSession(state, settings, day.offset ?? 0)
  const { done, planned } = weeklyProgress(state, settings, now)
  const level = levelFor(settings)
  const records = state.history.filter((h) => h.date === today)
  const isDone = state.lastDone === today || records.length > 0
  const beforeStart = !!settings.startDate && today < settings.startDate
  const trainingToday = settings.days.includes(now.getDay()) && !beforeStart
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const active = state.active
  const steps = selected === 0 && active ? active.steps : preview.steps
  const canStart = steps.some((s) => s.type === 'strength')
  const heading = active
    ? 'Ready to pick up where you left off?'
    : isDone
      ? 'Good work. Take your recovery.'
      : beforeStart
        ? 'Your next chapter is on the calendar.'
        : !trainingToday
          ? 'A little room to recover.'
          : state.sessionsDone === 0
            ? level.welcome
            : settings.experience === 'advanced'
              ? 'Your training, your call.'
              : settings.experience === 'intermediate'
                ? 'Keep the progress going.'
                : 'One session at a time.'
  const notes = planLimitations(preview.workout, preview.steps, settings)
  return (
    <main id="main-content" className="screen" tabIndex={-1}>
      <PageHeader
        title="Today"
        description={dateLabel}
        action={
          <LocationPicker
            settings={settings}
            onChange={(patch) => patch.mode && onMode(patch.mode)}
          />
        }
      />
      <div className="today-greeting">
        <span className="level-label">
          {level.name} · {goalFor(settings).name}
        </span>
        <h2>{heading}</h2>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <WeekStrip week={week} selected={selected} onSelect={setSelected} />
          {selected === 0 && active ? (
            <section className="workout-hero">
              <div className="session-kicker">
                <Icon
                  name={active.mode === 'home' ? 'home' : 'strength'}
                  size={17}
                />
                {active.pausedAt ? 'Paused session' : 'Session in progress'}
              </div>
              <h2>{WORKOUTS[active.workoutKey]?.name ?? 'Your workout'}</h2>
              <p className="muted">
                Step {active.stepIndex + 1} of {active.steps.length} · Your
                logged sets are saved.
              </p>
              <button className="btn btn-primary" onClick={onResume}>
                <Icon name="play" size={18} />
                Resume workout
              </button>
              <div className="inline-actions">
                <button
                  className="text-button"
                  onClick={() =>
                    confirm(
                      'Finish early? Only the work you actually logged will be saved.',
                    ) && onFinishActive()
                  }
                >
                  Finish early
                </button>
                <button
                  className="text-button danger"
                  onClick={() =>
                    confirm(
                      'Discard this session? Its set records will not be saved to history.',
                    ) && onDiscard()
                  }
                >
                  Discard session
                </button>
              </div>
            </section>
          ) : selected === 0 && isDone ? (
            <section className="workout-hero completed-hero">
              <span className="completion-icon">
                <Icon name="check" size={26} />
              </span>
              <h2>Training logged.</h2>
              <p className="muted">
                {records.length
                  ? `${recordedSets(records[0])} sets recorded${records[0].status === 'partial' ? ' · Finished early' : ''}.`
                  : 'Your completed session is saved.'}{' '}
                Rest is part of the routine.
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => onNavigate('workouts')}
              >
                View your history
                <Icon name="arrow" size={17} />
              </button>
            </section>
          ) : day.offset === undefined ? (
            <section className="rest-panel">
              <Icon
                name={day.status === 'before-start' ? 'calendar' : 'moon'}
                size={28}
              />
              <h2>
                {day.status === 'before-start'
                  ? 'Your plan starts soon.'
                  : 'Recovery day'}
              </h2>
              <p>
                {day.status === 'before-start'
                  ? `Your routine begins ${new Date(`${settings.startDate}T12:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}.`
                  : 'No workout scheduled. Take an easy walk if you like, or simply rest.'}
              </p>
              <button
                className="text-button"
                onClick={() => onNavigate('schedule')}
              >
                See your schedule
                <Icon name="arrow" size={16} />
              </button>
            </section>
          ) : (
            <section className="workout-hero">
              <div className="session-kicker">
                <Icon
                  name={settings.mode === 'home' ? 'home' : 'strength'}
                  size={17}
                />
                {selected === 0 ? 'Your session' : 'Planned session'}
                <span className="session-divider" />
                {programName(settings)}
              </div>
              <h2>{preview.workout.name}</h2>
              <p className="muted">{preview.workout.focus}</p>
              <div className="workout-facts">
                <span>
                  <Icon name="timer" size={17} />
                  About {estimateMinutes(preview.steps)} min
                </span>
                <span>
                  <Icon name="strength" size={17} />
                  {
                    preview.steps.filter((s) => s.type === 'strength').length
                  }{' '}
                  strength movements
                </span>
              </div>
              {selected === 0 && (
                <button
                  className="btn btn-primary"
                  onClick={onStart}
                  disabled={!canStart}
                >
                  <Icon name="play" size={18} />
                  Start workout
                </button>
              )}
              {selected > 0 && (
                <p className="hint">
                  A preview using your current targets. They may change as you
                  log sessions.
                </p>
              )}
            </section>
          )}
          {(day.offset !== undefined || (selected === 0 && active)) && (
            <section className="routine-section">
              <div className="section-heading">
                <h2>
                  {active && selected === 0
                    ? 'Your session, in order'
                    : 'What you’ll do'}
                </h2>
                <span className="muted small">Warm-up to cool-down</span>
              </div>
              <StepList
                steps={steps}
                state={state}
                current={
                  active && selected === 0 ? active.stepIndex : undefined
                }
                onInfo={onInfo}
              />
            </section>
          )}
        </div>
        <aside className="dashboard-aside">
          <section className="aside-section">
            <div className="section-heading">
              <h2>Your week</h2>
              <Icon name="calendar" size={19} />
            </div>
            <p className="weekly-count">
              <strong>{done}</strong>
              <span>days trained this week</span>
            </p>
            <div
              className="weekly-track"
              role="progressbar"
              aria-label="Training days this week"
              aria-valuemin={0}
              aria-valuemax={Math.max(planned, done, 1)}
              aria-valuenow={done}
            >
              <span
                style={{
                  width: `${planned ? Math.min(100, (done / planned) * 100) : done ? 100 : 0}%`,
                }}
              />
            </div>
            <p className="hint">
              {planned} days on your current schedule. Sessions count once per
              day. Recovery days don’t break your progress.
            </p>
            <button
              className="text-button"
              onClick={() => onNavigate('schedule')}
            >
              Adjust your week
              <Icon name="arrow" size={15} />
            </button>
          </section>
          <section className="aside-section guidance-section">
            <h2>
              {settings.experience === 'beginner'
                ? 'Start with good form.'
                : settings.experience === 'advanced'
                  ? 'Keep your targets honest.'
                  : 'Build on your last session.'}
            </h2>
            <p>
              {settings.experience === 'beginner'
                ? 'Choose a weight you can control. Tap any movement for instructions, and record how each exercise feels.'
                : settings.experience === 'advanced'
                  ? 'Adjust sets, reps, or rest in your session. Effort logging is optional. More control never means you have to push harder.'
                  : 'Your previous targets are a starting point, not a demand. Log your actual reps and adjust when needed.'}
            </p>
            {notes.map((note) => (
              <p className="hint" key={note}>
                {note}
              </p>
            ))}
          </section>
          <section className="aside-section">
            <div className="section-heading">
              <h2>Body weight</h2>
              <button
                className="text-button"
                onClick={() => onNavigate('profile')}
              >
                {state.weights.length ? 'Log' : 'Optional'}
              </button>
            </div>
            <WeightTrend entries={state.weights} unit={settings.unit} />
          </section>
        </aside>
      </div>
    </main>
  )
}
