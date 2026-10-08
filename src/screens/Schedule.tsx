import { useState } from 'react'
import { DaysPicker, MinutesPicker } from '../components/Pickers'
import { PageHeader } from '../components/Layout'
import { Icon } from '../components/Icon'
import { WeekStrip } from './Today'
import { StepList } from '../components/StepList'
import { dateKey, DAY_LONG } from '../lib/dates'
import { estimateMinutes } from '../lib/plan'
import { previewSession, upcomingDays, weekStart } from '../lib/schedule'
import type { AppState, Settings } from '../lib/state'
import { useToday } from '../lib/useToday'

export function Schedule({
  state,
  settings,
  onSave,
  onInfo,
}: {
  state: AppState
  settings: Settings
  onSave: (settings: Settings) => void
  onInfo: (id: string) => void
}) {
  const now = useToday()
  const [draft, setDraft] = useState(settings)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selected, setSelected] = useState((now.getDay() + 6) % 7)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const start = weekStart(now)
  start.setDate(start.getDate() + weekOffset * 7)
  // Derive future rotation offsets from all planned days between now and the
  // viewed week, rather than restarting the routine at every Monday.
  const daysAhead = Math.max(
    0,
    Math.round(
      (start.getTime() -
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
        86400000,
    ),
  )
  const ahead = upcomingDays(
    state,
    settings,
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    daysAhead,
    now,
  )
  const earlier = ahead.filter((day) => day.offset !== undefined).length
  const week = upcomingDays(state, settings, start, 7, now).map((day) =>
    day.offset === undefined ? day : { ...day, offset: day.offset + earlier },
  )
  const day = week[selected]
  const preview =
    day.offset === undefined
      ? null
      : previewSession(state, settings, day.offset)
  const patch = (value: Partial<Settings>) => {
    setDraft((s) => ({ ...s, ...value }))
    setSaved(false)
    setError('')
  }
  return (
    <main id="main-content" className="screen" tabIndex={-1}>
      <PageHeader
        title="Schedule"
        description="A realistic week leaves room for recovery."
      />
      <div className="schedule-grid">
        <section className="schedule-calendar">
          <div className="section-heading">
            <div>
              <h2>
                {start.toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <p className="muted small">
                {weekOffset === 0
                  ? 'This week'
                  : weekOffset === 1
                    ? 'Next week'
                    : `In ${weekOffset} weeks`}
              </p>
            </div>
            <div className="calendar-actions">
              <button
                className="icon-btn"
                aria-label="Previous week"
                disabled={weekOffset === 0}
                onClick={() => setWeekOffset((n) => n - 1)}
              >
                <Icon name="back" size={18} />
              </button>
              <button
                className="icon-btn"
                aria-label="Next week"
                disabled={weekOffset >= 8}
                onClick={() => setWeekOffset((n) => n + 1)}
              >
                <Icon name="arrow" size={18} />
              </button>
            </div>
          </div>
          <WeekStrip week={week} selected={selected} onSelect={setSelected} />
          <div className="schedule-legend">
            <span>
              <i className="train-dot" />
              Training
            </span>
            <span>
              <i className="rest-dot" />
              Recovery
            </span>
            <span>
              <Icon name="check" size={13} />
              Logged
            </span>
          </div>
          <div className="scheduled-detail">
            <p className="quiet-label">
              {DAY_LONG[day.date.getDay()]} ·{' '}
              {day.date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <h2>
              {preview
                ? preview.workout.name
                : day.status === 'active'
                  ? 'Session in progress'
                  : day.status === 'done'
                    ? 'Training completed'
                    : day.status === 'partial'
                      ? 'Session logged'
                      : day.status === 'missed'
                        ? 'No session logged'
                        : day.status === 'before-start'
                          ? 'Before your start date'
                          : 'Recovery day'}
            </h2>
            {preview ? (
              <>
                <p className="muted">
                  About {estimateMinutes(preview.steps)} min ·{' '}
                  {settings.mode === 'home' ? 'Home' : 'Gym'} · Preview with
                  your current targets
                </p>
                <StepList steps={preview.steps} state={state} onInfo={onInfo} />
              </>
            ) : (
              <p className="muted">
                {day.status === 'missed'
                  ? 'Life happens. Your next routine continues where you left off—no catch-up workout required.'
                  : day.status === 'rest'
                    ? 'Nothing to make up. Give yourself room to recover.'
                    : 'Your saved records and upcoming plan remain unchanged.'}
              </p>
            )}
          </div>
        </section>
        <form
          className="schedule-editor"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.days.length) {
              setError('Choose at least one training day.')
              return
            }
            onSave(draft)
            setSaved(true)
          }}
        >
          <h2>Edit your week</h2>
          <fieldset className="field-group">
            <legend>Training days</legend>
            <DaysPicker
              days={draft.days}
              onChange={(days) => patch({ days })}
            />
            <p className="hint">
              {draft.days.length} training · {7 - draft.days.length} recovery
            </p>
          </fieldset>
          <fieldset className="field-group">
            <legend>Session length</legend>
            <MinutesPicker
              value={draft.minutes}
              onChange={(minutes) => patch({ minutes })}
            />
          </fieldset>
          <div className="field">
            <label htmlFor="schedule-start">Program start date</label>
            <input
              id="schedule-start"
              type="date"
              required
              value={draft.startDate ?? dateKey(now)}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </div>
          <p className="hint">
            Changes apply to upcoming sessions. A workout in progress keeps its
            original plan.
          </p>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-primary" type="submit">
            Save schedule
            <Icon name="check" size={18} />
          </button>
          {saved && (
            <p className="save-confirmation" role="status">
              Schedule updated.
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
