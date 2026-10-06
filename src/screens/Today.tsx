import { useState } from 'react'
import { StepList } from '../components/StepList'
import { DAY_LONG, DAY_SHORT, dateKey, nextGymDay, relativeDayName } from '../lib/dates'
import { estimateMinutes, setsFor } from '../lib/plan'
import { previewSession, upcomingDays, type PlannedDay } from '../lib/schedule'
import type { AppState, Settings } from '../lib/state'
import { WORKOUTS } from '../data/workouts'

type Props = {
  state: AppState
  settings: Settings
  onStart: () => void
  onResume: () => void
  onFinishActive: () => void
  onDiscard: () => void
  onSettings: () => void
  onInfo: (id: string) => void
}

export function Today({ state, settings, onStart, onResume, onFinishActive, onDiscard, onSettings, onInfo }: Props) {
  const [now] = useState(() => new Date())
  const today = dateKey(now)
  const isGymDay = settings.days.includes(now.getDay())
  const doneToday = state.lastDone === today
  const [selected, setSelected] = useState(0)
  const week = upcomingDays(state, settings, now)
  const { workout, steps } = previewSession(state, settings, 0)
  const nextDay = nextGymDay(settings.days, now)
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <main className="screen">
      <header className="topbar">
        <div>
          <p className="muted small">{dateLabel}</p>
          <h1>{state.active ? 'Workout in progress' : doneToday ? 'Done for today' : isGymDay ? 'Gym day' : 'Rest day'}</h1>
        </div>
        <button type="button" className="icon-btn" aria-label="Settings" onClick={onSettings}>
          ⚙
        </button>
      </header>

      <WeekStrip week={week} selected={selected} onSelect={setSelected} />

      {selected > 0 ? (
        <DayPlan day={week[selected]} state={state} settings={settings} now={now} onInfo={onInfo} />
      ) : state.active ? (
        <ActiveCard state={state} onResume={onResume} onFinish={onFinishActive} onDiscard={onDiscard} />
      ) : (
        <section className="card hero">
          {doneToday ? (
            <p>
              Nice work. Rest, eat protein, sleep well.
              {nextDay !== null && <> Next session is <strong>{relativeDayName(nextDay, now)}</strong>.</>}
            </p>
          ) : !isGymDay ? (
            <p>
              Recover today. A walk is a good idea.
              {nextDay !== null && <> Next gym day is <strong>{relativeDayName(nextDay, now)}</strong>.</>}
            </p>
          ) : null}

          <div className="hero-title">
            <span className="tag">{doneToday || !isGymDay ? 'Next up' : 'Today'}</span>
            <h2>{workout.name}</h2>
            <p className="muted">
              {workout.focus} · about {estimateMinutes(steps)} min
            </p>
          </div>

          {isGymDay && !doneToday ? (
            <button type="button" className="btn btn-primary btn-block" onClick={onStart}>
              Start workout
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-block" onClick={onStart}>
              Train anyway
            </button>
          )}
        </section>
      )}

      {selected === 0 && state.active && (
        <>
          <h3 className="section-title">Where you are</h3>
          <StepList steps={state.active.steps} state={state} current={state.active.stepIndex} onInfo={onInfo} />
        </>
      )}

      {selected === 0 && !state.active && (
        <>
          <h3 className="section-title">The plan, in order</h3>
          <StepList steps={steps} state={state} onInfo={onInfo} />
          <p className="hint center">
            Session {state.sessionsDone + 1} · {setsFor(state.sessionsDone)} sets per exercise
            {state.sessionsDone < 6 && ' while you learn the moves'}
          </p>
        </>
      )}
    </main>
  )
}

function WeekStrip({ week, selected, onSelect }: {
  week: PlannedDay[]
  selected: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="week" role="tablist" aria-label="This week">
      {week.map((day, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === selected}
          className={`week-day ${i === selected ? 'on' : ''} is-${day.status}`}
          onClick={() => onSelect(i)}
        >
          <span className="small">{i === 0 ? 'Today' : DAY_SHORT[day.date.getDay()]}</span>
          <strong>{day.date.getDate()}</strong>
          <span className="mark" aria-hidden>
            {day.status === 'done' ? '✓' : day.status === 'rest' ? '' : '•'}
          </span>
        </button>
      ))}
    </div>
  )
}

// Read-only preview of a future day.
function DayPlan({ day, state, settings, now, onInfo }: {
  day: PlannedDay
  state: AppState
  settings: Settings
  now: Date
  onInfo: (id: string) => void
}) {
  const label = `${relativeDayName(day.date.getDay(), now)}, ${day.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`

  if (day.offset === undefined) {
    return (
      <section className="card hero">
        <div className="hero-title">
          <span className="tag">{label}</span>
          <h2>Rest day</h2>
          <p className="muted">No gym planned. Recover, take a walk, sleep well. You can change gym days in settings.</p>
        </div>
      </section>
    )
  }

  const { workout, steps, number } = previewSession(state, settings, day.offset)
  return (
    <>
      <section className="card hero">
        <div className="hero-title">
          <span className="tag">{label} · planned</span>
          <h2>{workout.name}</h2>
          <p className="muted">
            {workout.focus} · about {estimateMinutes(steps)} min
          </p>
        </div>
      </section>
      <h3 className="section-title">The plan, in order</h3>
      <StepList steps={steps} state={state} onInfo={onInfo} />
      <p className="hint center">
        Session {number} · weights shown are your current ones and may go up before then
      </p>
    </>
  )
}

function ActiveCard({ state, onResume, onFinish, onDiscard }: {
  state: AppState
  onResume: () => void
  onFinish: () => void
  onDiscard: () => void
}) {
  const a = state.active!
  const workout = WORKOUTS[a.workoutKey as keyof typeof WORKOUTS]
  const startedToday = a.date === dateKey()
  const startedDay = DAY_LONG[new Date(`${a.date}T00:00`).getDay()]
  return (
    <section className="card hero">
      <div className="hero-title">
        <span className="tag">{startedToday ? 'Paused' : `Unfinished from ${startedDay}`}</span>
        <h2>{workout?.name ?? 'Workout'}</h2>
        <p className="muted">
          Step {a.stepIndex + 1} of {a.steps.length}
        </p>
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={onResume}>
        Resume
      </button>
      <div className="row">
        <button type="button" className="btn btn-ghost" onClick={onFinish}>
          Mark as done
        </button>
        <button
          type="button"
          className="btn btn-ghost danger"
          onClick={() => confirm('Discard this workout? It will not count.') && onDiscard()}
        >
          Discard
        </button>
      </div>
    </section>
  )
}
