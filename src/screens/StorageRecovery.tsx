import { useRef, useState } from 'react'
import { Brand } from '../components/Layout'
import { Icon } from '../components/Icon'
import {
  allowStorageReplacement,
  INITIAL_STATE,
  parseState,
  type AppState,
} from '../lib/state'

export function StorageRecovery({
  onRestore,
}: {
  onRestore: (state: AppState) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const restore = async (file: File) => {
    try {
      if (file.size > 20 * 1024 * 1024)
        throw new Error('The backup is too large.')
      const next = parseState(await file.text())
      allowStorageReplacement()
      onRestore(next)
    } catch (error) {
      setError(
        `Could not restore: ${error instanceof Error ? error.message : 'Invalid backup.'}`,
      )
    }
    if (fileRef.current) fileRef.current.value = ''
  }
  const download = () => {
    try {
      const raw = localStorage.getItem('gym-app-state')
      if (!raw) throw new Error('No readable saved data was found.')
      const url = URL.createObjectURL(
        new Blob([raw], { type: 'application/json' }),
      )
      const link = document.createElement('a')
      link.href = url
      link.download = 'gym-unreadable-data.json'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Saved data is unavailable.',
      )
    }
  }
  return (
    <div className="done-shell">
      <Brand />
      <main className="done-screen">
        <Icon name="info" size={36} />
        <h1>Keep your saved data safe.</h1>
        <p className="done-description">
          Gym couldn’t read the saved data on this device. Nothing has been
          overwritten. Download the original data before restoring a backup or
          starting over.
        </p>
        <div className="backup-actions">
          <button className="btn btn-ghost" onClick={download}>
            <Icon name="download" size={18} />
            Download original data
          </button>
          <button
            className="btn btn-primary"
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="upload" size={18} />
            Restore a backup
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept="application/json,.json"
          aria-label="Restore backup file"
          onChange={(e) =>
            e.target.files?.[0] && void restore(e.target.files[0])
          }
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="text-button danger"
          onClick={() => {
            if (
              confirm(
                'Replace the unreadable saved data and start over? Download the original data first if you want to keep it.',
              )
            ) {
              allowStorageReplacement()
              try {
                localStorage.removeItem('gym-onboarding-draft')
              } catch {
                /* Setup remains available for this visit. */
              }
              onRestore({ ...INITIAL_STATE })
            }
          }}
        >
          Start over
        </button>
      </main>
    </div>
  )
}
