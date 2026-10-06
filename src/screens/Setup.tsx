import { useState } from 'react'
import { DaysPicker, MinutesPicker } from '../components/Pickers'
import { rotationDescription } from '../data/workouts'
import type { Minutes, Settings } from '../lib/state'

export function Setup({ onDone }: { onDone: (s: Settings) => void }) {
  const [days, setDays] = useState<number[]>([1, 3, 5])
  const [minutes, setMinutes] = useState<Minutes>(60)

  return (
    <main className="screen setup">
      <h1>Let's set up your plan</h1>
      <p className="muted">
        Goal: lose fat and get stronger. The app tells you exactly what to do each gym day, in order.
      </p>

      <section className="card">
        <h2>Which days will you go?</h2>
        <DaysPicker days={days} onChange={setDays} />
        <p className="hint">{rotationDescription(days.length)}</p>
      </section>

      <section className="card">
        <h2>How long can you stay?</h2>
        <MinutesPicker value={minutes} onChange={setMinutes} />
      </section>

      <p className="hint">
        The plan uses the machines at a standard Cult gym. If your center is missing any, untick them in Settings.
      </p>

      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={days.length === 0}
        onClick={() => onDone({ days, minutes })}
      >
        Create my plan
      </button>
    </main>
  )
}
