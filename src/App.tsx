import { useCallback, useEffect, useState } from 'react'
import { ExerciseInfo } from './components/ExerciseInfo'
import { Icon } from './components/Icon'
import { Layout, type Page } from './components/Layout'
import {
  addWeight,
  discardSession,
  finishSession,
  pauseSession,
  resumeSession,
  saveSettings,
  startSession,
} from './lib/actions'
import { dateKey } from './lib/dates'
import {
  getStorageWarning,
  loadState,
  newId,
  saveState,
  type AppState,
  type Mode,
  type Settings,
} from './lib/state'
import { Done } from './screens/Done'
import { Run } from './screens/Run'
import { SettingsScreen } from './screens/SettingsScreen'
import { Setup } from './screens/Setup'
import { Today } from './screens/Today'
import { Workouts } from './screens/Workouts'
import { Schedule } from './screens/Schedule'
import { StorageRecovery } from './screens/StorageRecovery'

type View = Page | 'run' | 'done'
export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [view, setView] = useState<View>('today')
  const [infoId, setInfoId] = useState<string | null>(null)
  const [storageMessage, setStorageMessage] = useState(getStorageWarning)
  const [notice, setNotice] = useState('')
  const [workoutsTab, setWorkoutsTab] = useState<'plan' | 'history'>('plan')
  const [lastSessionId, setLastSessionId] = useState(state.active?.id)
  const update = useCallback(
    (fn: (s: AppState) => AppState) => setState(fn),
    [],
  )
  const closeInfo = useCallback(() => setInfoId(null), [])
  useEffect(() => {
    saveState(state)
    const frame = requestAnimationFrame(() =>
      setStorageMessage(getStorageWarning()),
    )
    return () => cancelAnimationFrame(frame)
  }, [state])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, state.active?.stepIndex])
  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(''), 6000)
    return () => clearTimeout(timeout)
  }, [notice])
  const navigate = (page: Page, tab: 'plan' | 'history' = 'plan') => {
    if (page === 'workouts') setWorkoutsTab(tab)
    setView(page)
    setInfoId(null)
  }
  const start = () => {
    if (state.active) {
      setLastSessionId(state.active.id)
      update(resumeSession)
      setView('run')
      return
    }
    const id = newId()
    setLastSessionId(id)
    update((s) => startSession(s, dateKey(), id))
    setView('run')
  }
  const resume = () => {
    setLastSessionId(state.active?.id)
    update(resumeSession)
    setView('run')
  }
  const saveProfile = (settings: Settings) =>
    update((s) => saveSettings(s, settings))
  const changeMode = (mode: Mode) => {
    if (state.active) {
      setNotice(
        'Finish or discard your active session before switching between gym and home. Your current session is saved.',
      )
      return
    }
    update((s) =>
      s.settings ? { ...s, settings: { ...s.settings, mode } } : s,
    )
  }
  const settings = state.settings
  let screen
  if (!settings && storageMessage?.includes('not been overwritten')) {
    screen = (
      <StorageRecovery
        onRestore={(next) => {
          update(() => next)
          setStorageMessage(null)
          setView('today')
        }}
      />
    )
  } else if (!settings) {
    screen = (
      <Setup
        onDone={(settings, weight) =>
          update((s) => {
            const next = saveSettings(s, settings)
            return weight === undefined
              ? next
              : addWeight(next, weight, dateKey())
          })
        }
      />
    )
  } else if (view === 'run' && state.active) {
    screen = (
      <Run
        state={state}
        update={update}
        onPause={() => {
          update(pauseSession)
          setView('today')
        }}
        onInfo={setInfoId}
      />
    )
  } else if (view === 'run' || view === 'done') {
    screen = (
      <Done
        state={state}
        settings={settings}
        onHome={() => setView('today')}
        onHistory={() => navigate('workouts', 'history')}
        sessionId={lastSessionId}
      />
    )
  } else {
    const content =
      view === 'profile' ? (
        <SettingsScreen
          state={state}
          settings={settings}
          update={update}
          onSave={saveProfile}
        />
      ) : view === 'workouts' ? (
        <Workouts
          state={state}
          settings={settings}
          onInfo={setInfoId}
          onStart={start}
          onResume={resume}
          tab={workoutsTab}
          onTab={setWorkoutsTab}
        />
      ) : view === 'schedule' ? (
        <Schedule
          state={state}
          settings={settings}
          onSave={saveProfile}
          onInfo={setInfoId}
        />
      ) : (
        <Today
          state={state}
          settings={settings}
          onStart={start}
          onResume={resume}
          onFinishActive={() => {
            setLastSessionId(state.active?.id)
            update((s) => finishSession(s, dateKey()))
            setView('done')
          }}
          onDiscard={() => update(discardSession)}
          onMode={changeMode}
          onNavigate={(page) =>
            navigate(page, page === 'workouts' ? 'history' : 'plan')
          }
          onInfo={setInfoId}
        />
      )
    screen = (
      <Layout page={view} onNavigate={navigate}>
        {content}
      </Layout>
    )
  }
  return (
    <>
      {screen}
      {storageMessage &&
        (settings || !storageMessage.includes('not been overwritten')) && (
          <div className="storage-warning" role="alert">
            <Icon name="info" size={19} />
            <span>{storageMessage}</span>
            {settings && (
              <button
                className="text-button"
                onClick={() => setView('profile')}
              >
                Open Profile
              </button>
            )}
          </div>
        )}
      {notice && (
        <div className="app-notice" role="status">
          <span>{notice}</span>
          <button
            className="icon-btn"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {infoId && <ExerciseInfo key={infoId} id={infoId} onClose={closeInfo} />}
    </>
  )
}
