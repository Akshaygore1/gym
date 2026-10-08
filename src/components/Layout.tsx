import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export type Page = 'today' | 'workouts' | 'schedule' | 'profile'
const NAV: { page: Page; name: string; icon: IconName }[] = [
  { page: 'today', name: 'Today', icon: 'today' },
  { page: 'workouts', name: 'Workouts', icon: 'strength' },
  { page: 'schedule', name: 'Schedule', icon: 'calendar' },
  { page: 'profile', name: 'Profile', icon: 'user' },
]
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol">
        <Icon name="strength" size={23} />
      </span>
      <span>
        gym<span className="brand-dot">.</span>
      </span>
    </div>
  )
}
export function Layout({
  page,
  onNavigate,
  children,
}: {
  page: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV.map((item) => (
            <button
              key={item.page}
              className={page === item.page ? 'nav-link active' : 'nav-link'}
              aria-current={page === item.page ? 'page' : undefined}
              onClick={() => onNavigate(item.page)}
            >
              <Icon name={item.icon} size={18} />
              {item.name}
            </button>
          ))}
        </nav>
        <span className="device-note">
          <span className="status-dot" /> On this device
        </span>
      </header>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {children}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV.map((item) => (
          <button
            key={item.page}
            className={page === item.page ? 'nav-link active' : 'nav-link'}
            aria-current={page === item.page ? 'page' : undefined}
            onClick={() => onNavigate(item.page)}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </header>
  )
}
