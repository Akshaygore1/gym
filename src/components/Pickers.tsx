import { DAY_SHORT, WEEK_ORDER } from '../lib/dates'
import type { Minutes } from '../lib/state'

export function DaysPicker({
  days,
  onChange,
}: {
  days: number[]
  onChange: (days: number[]) => void
}) {
  const toggle = (d: number) =>
    onChange(
      days.includes(d)
        ? days.filter((x) => x !== d)
        : [...days, d].sort((a, b) => a - b),
    )
  return (
    <div className="days">
      {WEEK_ORDER.map((d) => (
        <button
          key={d}
          type="button"
          className={days.includes(d) ? 'chip on' : 'chip'}
          aria-pressed={days.includes(d)}
          onClick={() => toggle(d)}
        >
          {DAY_SHORT[d]}
        </button>
      ))}
    </div>
  )
}

const OPTIONS: Minutes[] = [20, 30, 45, 60, 75]

export function MinutesPicker({
  value,
  onChange,
}: {
  value: Minutes
  onChange: (m: Minutes) => void
}) {
  return (
    <div className="segmented">
      {OPTIONS.map((m) => (
        <button
          key={m}
          type="button"
          className={m === value ? 'on' : ''}
          aria-pressed={m === value}
          onClick={() => onChange(m)}
        >
          {m} min
        </button>
      ))}
    </div>
  )
}
