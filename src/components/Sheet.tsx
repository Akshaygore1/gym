import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
      else document.getElementById('main-content')?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]',
          ),
        ].filter((el) => el.getClientRects().length > 0)
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault()
          last.focus()
        } else if (
          !event.shiftKey &&
          document.activeElement === last &&
          first
        ) {
          event.preventDefault()
          first.focus()
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="sheet-content">
        <header className="sheet-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </dialog>
  )
}
