import { Brand } from '../components/Layout'
import { Icon } from '../components/Icon'
import { activeDuration, recordedSets } from '../lib/presentation'
import { nextWorkout } from '../lib/plan'
import { nextTrainingDate } from '../lib/schedule'
import type { AppState, Settings } from '../lib/state'

export function Done({
  state,
  settings,
  onHome,
  onHistory,
  sessionId,
}: {
  state: AppState
  settings: Settings
  onHome: () => void
  onHistory: () => void
  sessionId?: string
}) {
  const record = state.history.find((h) => h.id === sessionId)
  const next = nextWorkout(state, settings)
  const day = nextTrainingDate(settings)
  const sets = record ? recordedSets(record) : 0
  return (
    <div className="done-shell">
      <header>
        <Brand />
      </header>
      <main id="main-content" className="done-screen" tabIndex={-1}>
        <span className="done-mark">
          <Icon name={record ? 'check' : 'pause'} size={34} />
        </span>
        <h1>
          {!record
            ? 'Nothing logged. No pressure.'
            : record.status === 'partial'
              ? 'Your work is saved.'
              : 'Session complete.'}
        </h1>
        <p className="done-description">
          {record
            ? `You recorded ${sets} ${sets === 1 ? 'set' : 'sets'}. ${record.durationSeconds === undefined ? '' : `${activeDuration(record.durationSeconds)}. `}${record.status === 'partial' ? 'Only the work you performed has been saved.' : 'Give yourself time to recover.'}`
            : 'An unlogged session doesn’t add to your history. Your previous progress is unchanged.'}
        </p>
        {record && (
          <button className="text-button" onClick={onHistory}>
            View session history
            <Icon name="arrow" size={16} />
          </button>
        )}
        <section className="next-session">
          <span className="quiet-label">When you’re ready</span>
          <h2>{next.name}</h2>
          {day !== null && (
            <p className="muted">
              Next scheduled day:{' '}
              {day.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
          <p className="hint">
            Your suggested targets are saved and always editable.
          </p>
        </section>
        <button className="btn btn-primary btn-block" onClick={onHome}>
          Back to today
          <Icon name="arrow" size={18} />
        </button>
      </main>
    </div>
  )
}
