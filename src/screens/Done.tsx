import { nextGymDay, relativeDayName } from '../lib/dates'
import { nextWorkout } from '../lib/plan'
import type { AppState, Settings } from '../lib/state'

export function Done({ state, settings, onHome }: { state: AppState; settings: Settings; onHome: () => void }) {
  const next = nextWorkout(state, settings)
  const day = nextGymDay(settings.days)
  return (
    <main className="screen done">
      <div className="done-mark" aria-hidden>
        ✓
      </div>
      <h1>Workout done</h1>
      <p className="muted">That's session {state.sessionsDone}. Your weights for next time are already updated.</p>
      <section className="card">
        <span className="tag">Next</span>
        <h2>{next.name}</h2>
        {day !== null && <p className="muted">{relativeDayName(day)}</p>}
      </section>
      <button type="button" className="btn btn-primary btn-block" onClick={onHome}>
        Back to home
      </button>
    </main>
  )
}
