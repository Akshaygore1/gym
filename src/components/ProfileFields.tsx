import { useId, useState } from 'react'
import { EQUIPMENT_GROUPS, type EquipmentId } from '../data/equipment'
import { GOALS, LEVELS } from '../lib/profile'
import type { Settings, Unit } from '../lib/state'
import { displayWeight, toKg } from '../lib/units'
import { Icon } from './Icon'

type SettingsFields = {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

export function ExperiencePicker({ settings, onChange }: SettingsFields) {
  const name = useId()
  return (
    <fieldset className="field-group">
      <legend>Training experience</legend>
      <p className="field-description">
        Choose the guidance that feels right. You can change this anytime.
      </p>
      <div className="experience-options">
        {LEVELS.map((level, i) => (
          <label
            key={level.value}
            className={`experience-option ${settings.experience === level.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={level.value}
              checked={settings.experience === level.value}
              onChange={() =>
                onChange({ experience: level.value, split: 'auto' })
              }
            />
            <span className="level-glyph" aria-hidden>
              {Array.from({ length: 3 }, (_, j) => (
                <span key={j} className={j <= i ? 'filled' : ''} />
              ))}
            </span>
            <span className="choice-text">
              <strong>{level.name}</strong>
              <span>{level.description}</span>
            </span>
            <span className="radio-mark" aria-hidden>
              {settings.experience === level.value && <span />}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function GoalPicker({ settings, onChange }: SettingsFields) {
  const name = useId()
  return (
    <fieldset className="field-group">
      <legend>What are you working toward?</legend>
      <div className="goal-options">
        {GOALS.map((goal) => (
          <label
            key={goal.value}
            className={`goal-option ${settings.goal === goal.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={name}
              checked={settings.goal === goal.value}
              onChange={() => onChange({ goal: goal.value })}
            />
            <Icon name={goal.icon} size={23} />
            <span className="choice-text">
              <strong>{goal.name}</strong>
              <span>{goal.description}</span>
            </span>
            <span className="goal-check" aria-hidden>
              {settings.goal === goal.value && <Icon name="check" size={16} />}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function UnitPicker({
  unit,
  onChange,
}: {
  unit: Unit
  onChange: (unit: Unit) => void
}) {
  return (
    <div className="unit-picker" role="group" aria-label="Weight unit">
      {(['kg', 'lb'] as const).map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={unit === u}
          className={unit === u ? 'selected' : ''}
          onClick={() => onChange(u)}
        >
          {u}
        </button>
      ))}
    </div>
  )
}

export function WeightField({
  label,
  value,
  unit,
  onChange,
  required = false,
}: {
  label: string
  value?: number
  unit: Unit
  onChange: (kg?: number) => void
  required?: boolean
}) {
  const id = useId()
  const format = () =>
    value === undefined ? '' : String(displayWeight(value, unit))
  const [entry, setEntry] = useState({ raw: format(), canonical: value, unit })
  const [touched, setTouched] = useState(false)
  const changed = value !== entry.canonical || unit !== entry.unit
  const raw = changed ? format() : entry.raw
  if (changed) setEntry({ raw, canonical: value, unit })
  const kg = raw === '' ? undefined : toKg(Number(raw), unit)
  const invalid = raw !== '' && (!Number.isFinite(kg) || kg! < 20 || kg! > 500)
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-unit">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={displayWeight(20, unit)}
          max={displayWeight(500, unit)}
          step="any"
          value={raw}
          required={required}
          aria-invalid={touched && invalid}
          aria-describedby={touched && invalid ? `${id}-error` : undefined}
          placeholder="Not set"
          onBlur={() => setTouched(true)}
          onChange={(e) => {
            const next =
              e.target.value === '' ? undefined : toKg(+e.target.value, unit)
            const valid =
              next === undefined ||
              (Number.isFinite(next) && next >= 20 && next <= 500)
            setEntry({
              raw: e.target.value,
              canonical: valid ? next : value,
              unit,
            })
            if (valid) onChange(next)
          }}
        />
        <span>{unit}</span>
      </div>
      {touched && invalid && (
        <p id={`${id}-error`} className="field-error">
          Enter a weight between {displayWeight(20, unit)} and{' '}
          {displayWeight(500, unit)} {unit}.
        </p>
      )}
    </div>
  )
}

export function LocationPicker({ settings, onChange }: SettingsFields) {
  return (
    <div className="mode-picker" role="group" aria-label="Training location">
      {(['gym', 'home'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className={settings.mode === mode ? 'selected' : ''}
          aria-pressed={settings.mode === mode}
          onClick={() => onChange({ mode })}
        >
          <Icon name={mode === 'gym' ? 'strength' : 'home'} />
          {mode === 'gym' ? 'Gym workout' : 'Home workout'}
        </button>
      ))}
    </div>
  )
}

export function EquipmentPicker({ settings, onChange }: SettingsFields) {
  const home = settings.mode === 'home'
  const toggle = (id: EquipmentId) => {
    if (home) {
      const selected = settings.homeEquipment ?? []
      onChange({
        homeEquipment: selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id],
      })
    } else {
      const missing = settings.missing ?? []
      onChange({
        missing: missing.includes(id)
          ? missing.filter((x) => x !== id)
          : [...missing, id],
      })
    }
  }
  return (
    <div className="equipment-picker">
      {home ? (
        <>
          <p className="field-description">
            No equipment is a valid starting point. Select only what you have.
          </p>
          <div className="equipment-options">
            {[
              { id: 'dumbbells' as const, name: 'Dumbbells' },
              { id: 'bench' as const, name: 'Stable bench / support' },
            ].map((item) => (
              <label key={item.id} className="equipment-check">
                <input
                  type="checkbox"
                  checked={settings.homeEquipment?.includes(item.id) ?? false}
                  onChange={() => toggle(item.id)}
                />
                <span>{item.name}</span>
              </label>
            ))}
          </div>
          {!settings.homeEquipment?.includes('dumbbells') && (
            <p className="hint">
              Your plan will use full-body bodyweight routines. Loaded pulling
              work needs suitable equipment.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="field-description">
            Select the equipment available at your gym. Your plan will find
            suitable alternatives.
          </p>
          {EQUIPMENT_GROUPS.map((group) => (
            <fieldset key={group.name} className="equipment-group">
              <legend>{group.name}</legend>
              <div className="equipment-options">
                {group.items.map((item) => (
                  <label key={item.id} className="equipment-check">
                    <input
                      type="checkbox"
                      checked={!settings.missing?.includes(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </>
      )}
    </div>
  )
}
