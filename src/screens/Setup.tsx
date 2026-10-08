import { useEffect, useState } from 'react'
import { DaysPicker, MinutesPicker } from '../components/Pickers'
import { Brand } from '../components/Layout'
import {
  EquipmentPicker,
  ExperiencePicker,
  GoalPicker,
  LocationPicker,
  UnitPicker,
  WeightField,
} from '../components/ProfileFields'
import { Icon } from '../components/Icon'
import { programName } from '../data/workouts'
import { freshSettings, goalFor, levelFor } from '../lib/profile'
import { dateKey, DAY_SHORT } from '../lib/dates'
import { estimateMinutes } from '../lib/plan'
import { previewSession } from '../lib/schedule'
import {
  INITIAL_STATE,
  parseState,
  type Settings,
  validDate,
} from '../lib/state'

const DRAFT_KEY = 'gym-onboarding-draft'
function readDraft(): { settings: Settings; weight?: number; stage: number } {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) {
      const value = JSON.parse(raw)
      const emptyDays =
        Array.isArray(value.settings?.days) && value.settings.days.length === 0
      const restored = parseState(
        JSON.stringify({
          ...INITIAL_STATE,
          settings: emptyDays
            ? { ...value.settings, days: [1] }
            : value.settings,
        }),
      )
      if (restored.settings && emptyDays) restored.settings.days = []
      if (restored.settings)
        return {
          settings: restored.settings,
          weight:
            typeof value.weight === 'number' &&
            value.weight >= 20 &&
            value.weight <= 500
              ? value.weight
              : undefined,
          stage: value.stage === 2 ? 2 : 1,
        }
    }
  } catch {
    /* A draft is optional; never affect saved training data. */
  }
  return { settings: freshSettings(), stage: 1 }
}

export function Setup({
  onDone,
}: {
  onDone: (settings: Settings, weight?: number) => void
}) {
  const [draft] = useState(readDraft)
  const [settings, setSettings] = useState(draft.settings)
  const [weight, setWeight] = useState<number | undefined>(draft.weight)
  const [stage, setStage] = useState(draft.stage)
  const [error, setError] = useState('')
  const update = (patch: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...patch }))
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ settings, weight, stage }),
      )
    } catch {
      /* The save warning for the app handles blocked storage. */
    }
  }, [settings, weight, stage])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [stage])
  const level = levelFor(settings)
  const preview = previewSession(INITIAL_STATE, settings, 0)
  const unit = settings.unit ?? 'kg'
  const complete = () => {
    if (!settings.days.length) {
      setError('Choose at least one training day.')
      return
    }
    if (!validDate(settings.startDate ?? '')) {
      setError('Choose a valid start date.')
      return
    }
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      /* Not required to use the app. */
    }
    onDone(settings, weight)
  }
  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <Brand />
        <span className="muted small">No account. Just your plan.</span>
      </header>
      <main id="main-content" className="onboarding-main" tabIndex={-1}>
        <div className="onboarding-intro">
          <div className="setup-progress">
            <span>Step {stage} of 2</span>
            <div
              role="progressbar"
              aria-label="Setup progress"
              aria-valuemin={0}
              aria-valuemax={2}
              aria-valuenow={stage}
            >
              <span style={{ width: `${stage * 50}%` }} />
            </div>
          </div>
          <h1>
            {stage === 1
              ? 'Your training. Your pace.'
              : 'Make room for your routine.'}
          </h1>
          <p>
            {stage === 1
              ? 'Tell us where you’re starting. We’ll help you figure out what comes next.'
              : 'Choose a week you can actually stick to. The plan follows your schedule, not the other way around.'}
          </p>
        </div>
        <div className="onboarding-grid">
          <form
            className="setup-form"
            onSubmit={(e) => {
              e.preventDefault()
              setError('')
              if (stage === 1) setStage(2)
              else complete()
            }}
          >
            {stage === 1 ? (
              <>
                <ExperiencePicker settings={settings} onChange={update} />
                <GoalPicker settings={settings} onChange={update} />
                <details className="disclosure">
                  <summary>
                    Track body weight{' '}
                    <span className="muted small">Optional</span>
                  </summary>
                  <div className="disclosure-body">
                    <div className="section-heading">
                      <p className="field-description">
                        For your own progress tracking. This does not determine
                        your lifting weights.
                      </p>
                      <UnitPicker
                        unit={unit}
                        onChange={(unit) => update({ unit })}
                      />
                    </div>
                    <div className="field-pair">
                      <WeightField
                        label="Current weight"
                        value={weight}
                        unit={unit}
                        onChange={setWeight}
                      />
                      <WeightField
                        label="Target weight"
                        value={settings.targetWeight}
                        unit={unit}
                        onChange={(targetWeight) => update({ targetWeight })}
                      />
                    </div>
                  </div>
                </details>
              </>
            ) : (
              <>
                <fieldset className="field-group">
                  <legend>Where will you train?</legend>
                  <LocationPicker settings={settings} onChange={update} />
                  <details className="disclosure">
                    <summary>
                      {settings.mode === 'home'
                        ? 'Home equipment'
                        : 'Check your gym equipment'}
                      <Icon name="settings" size={17} />
                    </summary>
                    <div className="disclosure-body">
                      <EquipmentPicker settings={settings} onChange={update} />
                    </div>
                  </details>
                </fieldset>
                <fieldset className="field-group">
                  <legend>Your training days</legend>
                  <p className="field-description">
                    Leave space for recovery. Start with a realistic week.
                  </p>
                  <DaysPicker
                    days={settings.days}
                    onChange={(days) => update({ days })}
                  />
                  <p className="hint">
                    {settings.days.length} training{' '}
                    {settings.days.length === 1 ? 'day' : 'days'} ·{' '}
                    {7 - settings.days.length} recovery{' '}
                    {settings.days.length === 6 ? 'day' : 'days'}
                  </p>
                </fieldset>
                <fieldset className="field-group">
                  <legend>Time for each session</legend>
                  <MinutesPicker
                    value={settings.minutes}
                    onChange={(minutes) => update({ minutes })}
                  />
                  <p className="hint">
                    Includes warm-up and rest. Actual time can vary.
                  </p>
                </fieldset>
                <div className="field">
                  <label htmlFor="setup-start">
                    When would you like to start?
                  </label>
                  <input
                    id="setup-start"
                    type="date"
                    min={dateKey()}
                    required
                    value={settings.startDate ?? dateKey()}
                    onChange={(e) => update({ startDate: e.target.value })}
                  />
                </div>
              </>
            )}
            {error && (
              <p role="alert" className="field-error">
                {error}
              </p>
            )}
            <div className="setup-actions">
              {stage === 2 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStage(1)}
                >
                  <Icon name="back" size={18} />
                  Back
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {stage === 1 ? 'Continue to your week' : 'Create my plan'}
                <Icon name="arrow" size={18} />
              </button>
            </div>
            <p className="setup-privacy">
              <Icon name="info" size={14} />
              Your answers stay on this device.
            </p>
          </form>
          <aside className="setup-aside">
            {stage === 1 ? (
              <>
                <span className="quiet-label">A plan that meets you here</span>
                <div className="welcome-preview" aria-live="polite">
                  <span className="level-label">{level.name}</span>
                  <h2>{level.welcome}</h2>
                  <p>{level.detail}</p>
                </div>
                <div className="setup-explainer">
                  <h3>Simple from the first session</h3>
                  <p>
                    Know the movements, see your targets, and record what you
                    actually do.
                  </p>
                  <p>
                    No leaderboards. No catch-up workouts. Help is always one
                    tap away.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="quiet-label">Your week, taking shape</span>
                <h2>{programName(settings)}</h2>
                <p className="muted">
                  {level.name} · {goalFor(settings).name}
                </p>
                <div className="summary-days">
                  {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                    <span
                      key={day}
                      className={settings.days.includes(day) ? 'selected' : ''}
                    >
                      {DAY_SHORT[day].slice(0, 1)}
                    </span>
                  ))}
                </div>
                <dl className="plan-facts">
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {settings.mode === 'home' ? 'At home' : 'At the gym'}
                    </dd>
                  </div>
                  <div>
                    <dt>Training days</dt>
                    <dd>{settings.days.length} / week</dd>
                  </div>
                  <div>
                    <dt>First session</dt>
                    <dd>{preview.workout.name}</dd>
                  </div>
                  <div>
                    <dt>Estimated time</dt>
                    <dd>About {estimateMinutes(preview.steps)} min</dd>
                  </div>
                </dl>
                <p className="hint">
                  You can change your goal, days, or location after setup. New
                  lifter? Start light and ask a qualified trainer when you need
                  help.
                </p>
              </>
            )}
          </aside>
        </div>
      </main>
      <footer className="onboarding-footer">
        Built for the way you train.
      </footer>
    </div>
  )
}
