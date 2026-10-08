import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/Layout'
import {
  EquipmentPicker,
  ExperiencePicker,
  GoalPicker,
  LocationPicker,
  UnitPicker,
  WeightField,
} from '../components/ProfileFields'
import { WeightTrend } from '../components/WeightTrend'
import { addWeight, setLoad } from '../lib/actions'
import { dateKey } from '../lib/dates'
import { EXERCISES } from '../data/exercises'
import {
  allowStorageReplacement,
  INITIAL_STATE,
  parseState,
  type AppState,
  type Settings,
} from '../lib/state'
import { displayWeight, toKg } from '../lib/units'
import { Stepper } from '../components/Stepper'
import { useToday } from '../lib/useToday'

type Props = {
  state: AppState
  settings: Settings
  update: (fn: (s: AppState) => AppState) => void
  onSave: (settings: Settings) => void
}
export function SettingsScreen({ state, settings, update, onSave }: Props) {
  const now = useToday()
  const fileRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')
  const [weight, setWeight] = useState<number | undefined>()
  const [weightDate, setWeightDate] = useState(dateKey(now))
  const patch = (value: Partial<Settings>) => {
    if (
      value.mode &&
      state.active &&
      value.mode !== (state.active.mode ?? 'gym')
    ) {
      setMessage(
        'Finish or discard your active session before changing location.',
      )
      return
    }
    setDraft((s) => ({ ...s, ...value }))
    setSaved(false)
  }
  const unit = draft.unit ?? 'kg'
  const exportBackup = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-backup-${dateKey(now)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importBackup = async (file: File) => {
    try {
      if (file.size > 20 * 1024 * 1024)
        throw new Error('The backup is too large.')
      const next = parseState(await file.text())
      if (
        confirm(
          'Replace your current plan and records with this backup? Download your current backup first if you want to keep it.',
        )
      ) {
        allowStorageReplacement()
        update(() => next)
        if (next.settings) setDraft(next.settings)
        setSaved(false)
        setMessage('Backup restored.')
      }
    } catch (error) {
      setMessage(
        `Could not restore: ${error instanceof Error ? error.message : 'Invalid backup.'}`,
      )
    }
    if (fileRef.current) fileRef.current.value = ''
  }
  const weighted = Object.values(EXERCISES).filter(
    (d) => d.kind === 'weighted' && state.loads[d.id]?.weight !== undefined,
  )
  return (
    <main id="main-content" className="screen" tabIndex={-1}>
      <PageHeader
        title="Profile"
        description="Your goals can change. Your plan can, too."
      />
      <div className="profile-grid">
        <form
          className="profile-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSave(draft)
            setSaved(true)
          }}
        >
          <ExperiencePicker settings={draft} onChange={patch} />
          <GoalPicker settings={draft} onChange={patch} />
          <fieldset className="field-group">
            <legend>Preferred location</legend>
            <LocationPicker settings={draft} onChange={patch} />
            <details className="disclosure">
              <summary>
                {draft.mode === 'home' ? 'Home equipment' : 'Gym equipment'}
                <Icon name="settings" size={18} />
              </summary>
              <div className="disclosure-body">
                <EquipmentPicker settings={draft} onChange={patch} />
              </div>
            </details>
          </fieldset>
          {draft.experience !== 'beginner' && (
            <fieldset className="field-group">
              <legend>Routine structure</legend>
              <label className="sr-only" htmlFor="profile-split">
                Workout split
              </label>
              <select
                id="profile-split"
                value={draft.split ?? 'auto'}
                onChange={(e) =>
                  patch({ split: e.target.value as Settings['split'] })
                }
              >
                <option value="auto">Match my schedule</option>
                <option value="full-body">Full body</option>
                <option value="upper-lower">Upper / lower</option>
                {draft.experience === 'advanced' && (
                  <option value="push-pull-legs">Push / pull / legs</option>
                )}
              </select>
              <p className="hint">
                Bodyweight-only home plans use full-body routines. Help and
                substitutions stay available with every split.
              </p>
            </fieldset>
          )}
          <label className="preference-check">
            <input
              type="checkbox"
              checked={draft.lighter ?? false}
              onChange={(e) => patch({ lighter: e.target.checked })}
            />
            <span>
              <strong>Lighter sessions</strong>
              <span className="muted small">
                Fewer working sets. No change to your saved progress.
              </span>
            </span>
          </label>
          <div className="section-heading">
            <h3>Weight display</h3>
            <UnitPicker unit={unit} onChange={(unit) => patch({ unit })} />
          </div>
          <WeightField
            label="Target body weight (optional)"
            value={draft.targetWeight}
            unit={unit}
            onChange={(targetWeight) => patch({ targetWeight })}
          />
          <div className="profile-save">
            <button type="submit" className="btn btn-primary">
              Save profile
              <Icon name="check" size={18} />
            </button>
            {saved && (
              <span className="save-confirmation" role="status">
                Profile updated.
              </span>
            )}
          </div>
          <p className="hint">
            Profile changes affect the next session, not the workout already in
            progress.
          </p>
        </form>
        <aside className="profile-aside">
          <section className="aside-section">
            <div className="section-heading">
              <h2>Body-weight log</h2>
              <span className="muted small">Optional</span>
            </div>
            <WeightTrend entries={state.weights} unit={unit} />
            <form
              className="weight-log-form"
              onSubmit={(e) => {
                e.preventDefault()
                if (weight !== undefined) {
                  update((s) => addWeight(s, weight, weightDate))
                  setWeight(undefined)
                  setMessage(
                    'Body weight saved. A second entry on the same day updates that day’s log.',
                  )
                }
              }}
            >
              <WeightField
                label="Body weight"
                value={weight}
                unit={unit}
                required
                onChange={setWeight}
              />
              <div className="field">
                <label htmlFor="weight-date">Date</label>
                <input
                  id="weight-date"
                  type="date"
                  max={dateKey(now)}
                  required
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-ghost"
                disabled={weight === undefined}
              >
                <Icon name="plus" size={17} />
                Save weight
              </button>
            </form>
            {state.weights.length > 0 && (
              <details className="disclosure">
                <summary>
                  View weight logs
                  <span className="muted small">{state.weights.length}</span>
                </summary>
                <div className="weight-entries">
                  {state.weights.map((entry) => (
                    <div key={entry.id}>
                      <span>{entry.date}</span>
                      <strong>
                        {displayWeight(entry.kg, unit)} {unit}
                      </strong>
                      <button
                        className="icon-btn danger"
                        aria-label={`Delete weight log for ${entry.date}`}
                        onClick={() =>
                          confirm(
                            `Delete the body-weight log for ${entry.date}?`,
                          ) &&
                          update((s) => ({
                            ...s,
                            weights: s.weights.filter((w) => w.id !== entry.id),
                          }))
                        }
                      >
                        <Icon name="close" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>
          <section className="aside-section">
            <h2>Your data, on your device.</h2>
            <p className="muted small">
              No account or cloud sync. Keep a backup before clearing your
              browser or switching devices.
            </p>
            <div className="backup-actions">
              <button className="btn btn-ghost" onClick={exportBackup}>
                <Icon name="download" size={17} />
                Download backup
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="upload" size={17} />
                Restore backup
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              aria-label="Restore backup file"
              onChange={(e) =>
                e.target.files?.[0] && void importBackup(e.target.files[0])
              }
            />
            <p className="hint">
              Version 1 backups are supported. Earlier session counts are
              preserved without inventing set history.
            </p>
          </section>
          <section className="aside-section">
            <details className="disclosure">
              <summary>
                Working weight targets
                <span className="muted small">{weighted.length}</span>
              </summary>
              <div className="working-weights">
                {weighted.length ? (
                  weighted.map(
                    (def) =>
                      def.kind === 'weighted' && (
                        <div key={def.id}>
                          <strong>{def.name}</strong>
                          <span className="muted small">
                            {def.perHand ? 'Per hand' : 'Exercise load'} ·
                            suggested next target
                          </span>
                          <Stepper
                            value={displayWeight(
                              state.loads[def.id].weight!,
                              unit,
                            )}
                            step={displayWeight(def.step, unit)}
                            min={displayWeight(def.min, unit)}
                            suffix={unit}
                            onChange={(value) =>
                              update((s) =>
                                setLoad(s, def.id, {
                                  weight: toKg(value, unit),
                                }),
                              )
                            }
                          />
                        </div>
                      ),
                  )
                ) : (
                  <p className="hint">
                    Targets appear after you log weighted exercises.
                  </p>
                )}
              </div>
            </details>
          </section>
          <section className="aside-section reset-section">
            <h2>Start over</h2>
            <p className="hint">
              Clears your plan, records, and weight logs. Download a backup
              first.
            </p>
            <button
              className="text-button danger"
              onClick={() => {
                if (
                  confirm(
                    'Delete all workout progress, settings, and body-weight logs on this device?',
                  )
                ) {
                  allowStorageReplacement()
                  try {
                    localStorage.removeItem('gym-onboarding-draft')
                  } catch {
                    /* Reset still works for this visit. */
                  }
                  update(() => INITIAL_STATE)
                }
              }}
            >
              Reset all data
            </button>
          </section>
        </aside>
      </div>
      {message && (
        <div className="inline-notice" role="status">
          <Icon name="info" size={18} />
          <span>{message}</span>
          <button
            className="icon-btn"
            aria-label="Dismiss message"
            onClick={() => setMessage('')}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      <footer className="app-attribution">
        Exercise reference photos and instructions from{' '}
        <a
          href="https://github.com/yuhonas/free-exercise-db"
          target="_blank"
          rel="noreferrer"
        >
          free-exercise-db
        </a>{' '}
        (public domain). General adult training guidance, not medical advice.
      </footer>
    </main>
  )
}
