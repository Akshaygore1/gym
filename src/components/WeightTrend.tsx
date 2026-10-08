import type { Unit, WeightEntry } from '../lib/state'
import { displayWeight, weightLabel } from '../lib/units'

export function WeightTrend({
  entries,
  unit = 'kg',
}: {
  entries: WeightEntry[]
  unit?: Unit
}) {
  const points = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
  const latest = points.at(-1)
  if (!latest)
    return (
      <div className="empty-inline">
        <p>No weight logs yet.</p>
        <p className="muted small">
          Track body weight if it’s useful to you. It’s optional.
        </p>
      </div>
    )
  const first = points[0]
  const values = points.map((p) => displayWeight(p.kg, unit))
  const low = Math.min(...values) - 0.5
  const high = Math.max(...values) + 0.5
  const time = (value: string) => Date.parse(`${value}T12:00:00Z`)
  const span = Math.max(1, time(latest.date) - time(first.date))
  const coords = points
    .map(
      (p, i) =>
        `${10 + ((time(p.date) - time(first.date)) / span) * 300},${85 - ((values[i] - low) / (high - low)) * 70}`,
    )
    .join(' ')
  const delta = displayWeight(latest.kg - first.kg, unit)
  return (
    <div className="weight-trend">
      <div className="weight-reading">
        <strong>{weightLabel(latest.kg, unit)}</strong>
        <span className="muted small">
          Latest ·{' '}
          {new Date(`${latest.date}T12:00`).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      {points.length > 1 ? (
        <>
          <svg
            viewBox="0 0 320 100"
            role="img"
            aria-label={`Body weight from ${weightLabel(first.kg, unit)} to ${weightLabel(latest.kg, unit)} across ${points.length} recorded days`}
          >
            <path d="M10 88h300" className="chart-baseline" />
            <polyline points={coords} className="chart-line" />
            {points.map((p, i) => (
              <circle
                key={p.id}
                cx={10 + ((time(p.date) - time(first.date)) / span) * 300}
                cy={85 - ((values[i] - low) / (high - low)) * 70}
                r={i === points.length - 1 ? 4 : 2.5}
                className="chart-point"
              />
            ))}
          </svg>
          <div className="chart-caption">
            <span>{first.date}</span>
            <span>
              {delta > 0 ? '+' : ''}
              {delta} {unit} across {points.length} logs
            </span>
          </div>
        </>
      ) : (
        <p className="hint">Your trend will appear after a second log.</p>
      )}
    </div>
  )
}
