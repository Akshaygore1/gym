import { useRef, useState } from 'react'
import { EQUIPMENT_GROUPS, type EquipmentId } from '../data/equipment'
import { DaysPicker, MinutesPicker } from '../components/Pickers'
import { rotationDescription } from '../data/workouts'
import { Stepper } from '../components/Stepper'
import { EXERCISES } from '../data/exercises'
import { setLoad } from '../lib/actions'
import { dateKey } from '../lib/dates'
import { INITIAL_STATE, parseState, type AppState, type Settings } from '../lib/state'

type Props = {
  state: AppState
  settings: Settings
  update: (fn: (s: AppState) => AppState) => void
  onBack: () => void
}

export function SettingsScreen({ state, settings, update, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showEquipment, setShowEquipment] = useState(false)
  const missing = settings.missing ?? []
  const toggleEquipment = (id: EquipmentId) =>
    setSettings({ missing: missing.includes(id) ? missing.filter((m) => m !== id) : [...missing, id] })
  const setSettings = (patch: Partial<Settings>) => update((s) => ({ ...s, settings: { ...settings, ...patch } }))

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gym-backup-${dateKey()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importBackup = async (file: File) => {
    try {
      const next = parseState(await file.text())
      if (confirm('Replace everything in the app with this backup?')) update(() => next)
    } catch (e) {
      alert(`Could not import: ${(e as Error).message}`)
    }
  }

  const weighted = Object.values(EXERCISES).filter(
    (d) => d.kind === 'weighted' && state.loads[d.id]?.weight !== undefined,
  )

  return (
    <main className="screen">
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}>
          ←
        </button>
        <h1>Settings</h1>
        <span className="icon-btn" aria-hidden />
      </header>

      <section className="card">
        <h2>Gym days</h2>
        <DaysPicker days={settings.days} onChange={(days) => days.length > 0 && setSettings({ days })} />
        <p className="hint">{rotationDescription(settings.days.length)}</p>
      </section>

      <section className="card">
        <h2>Session length</h2>
        <MinutesPicker value={settings.minutes} onChange={(minutes) => setSettings({ minutes })} />
      </section>

      <section className="card">
        <h2>Your gym's equipment</h2>
        <p className="muted">
          {missing.length === 0
            ? 'Standard Cult gym: all machines available.'
            : `Standard Cult gym, without ${missing.length} item${missing.length > 1 ? 's' : ''}.`}{' '}
          If something isn't at your center, untick it and the plan picks an alternative.
        </p>
        {showEquipment &&
          EQUIPMENT_GROUPS.map((group) => (
            <div key={group.name} className="equip-group">
              <h3>{group.name}</h3>
              <div className="equip">
                {group.items.map((item) => {
                  const has = !missing.includes(item.id)
                  return (
                    <button key={item.id} type="button" aria-pressed={has} className={has ? 'chip on' : 'chip'}
                      onClick={() => toggleEquipment(item.id)}>
                      {has ? '✓ ' : ''}{item.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        <button type="button" className="btn btn-ghost" onClick={() => setShowEquipment((v) => !v)}>
          {showEquipment ? 'Done' : 'Edit equipment'}
        </button>
      </section>

      <section className="card">
        <h2>Your weights</h2>
        {weighted.length === 0 ? (
          <p className="muted">Weights show up here after you pick them in your first workout.</p>
        ) : (
          <ul className="weights">
            {weighted.map((d) =>
              d.kind === 'weighted' ? (
                <li key={d.id}>
                  <span>
                    {d.name}
                    <span className="muted small">
                      {' '}
                      {state.loads[d.id]?.reps} reps{d.perHand ? ', each hand' : ''}
                    </span>
                  </span>
                  <Stepper value={state.loads[d.id]!.weight!} step={d.step} min={d.min} suffix="kg"
                    onChange={(weight) => update((s) => setLoad(s, d.id, { weight }))} />
                </li>
              ) : null,
            )}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Backup</h2>
        <p className="muted">Everything is stored only on this phone. Save a backup now and then.</p>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={exportBackup}>
            Save backup
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            Restore
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
      </section>

      <section className="card">
        <h2>Start over</h2>
        <p className="muted">Clears your progress, weights and settings.</p>
        <button type="button" className="btn btn-ghost danger"
          onClick={() => confirm('Delete all progress and start over?') && update(() => INITIAL_STATE)}>
          Reset everything
        </button>
      </section>

      <p className="hint center">
        Exercise photos from free-exercise-db (public domain). Sessions completed: {state.sessionsDone}
      </p>
    </main>
  )
}
