import type { CSSProperties } from 'react'

export type IconName =
  | 'today'
  | 'strength'
  | 'muscle'
  | 'activity'
  | 'home'
  | 'calendar'
  | 'user'
  | 'arrow'
  | 'back'
  | 'check'
  | 'close'
  | 'timer'
  | 'play'
  | 'pause'
  | 'settings'
  | 'flame'
  | 'info'
  | 'swap'
  | 'plus'
  | 'download'
  | 'upload'
  | 'chevron'
  | 'moon'
  | 'edit'
const paths: Record<IconName, string[]> = {
  today: ['M13 2 4 14h7l-1 8 10-13h-7l1-7Z'],
  strength: ['M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12'],
  muscle: [
    'M5 17c-2-3-1-7 1-10l3 1 1 3',
    'M6 7 8 3l4 1v3l-3 1',
    'M10 11c3-3 7-2 9 1 3 6-4 9-9 8l-5-3',
    'M13 13c2-1 4 0 4 2',
  ],
  activity: ['M2 12h5l3-8 4 16 3-8h5'],
  home: ['m3 10 9-7 9 7', 'M5 9v11h5v-6h4v6h5V9'],
  calendar: [
    'M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z',
    'M3 10h18M8 3v4m8-4v4M7 14h3m4 0h3m-10 3h3',
  ],
  user: ['M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', 'M4 21v-2a8 8 0 0 1 16 0v2'],
  arrow: ['M4 12h16m-6-6 6 6-6 6'],
  back: ['M20 12H4m6-6-6 6 6 6'],
  check: ['m5 12 4 4L19 6'],
  close: ['m6 6 12 12M6 18 18 6'],
  timer: [
    'M15 3H9m3 0v3m6 1 2-2',
    'M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    'M12 10v4l3 2',
  ],
  play: ['m8 4 12 8-12 8V4Z'],
  pause: ['M8 5v14m8-14v14'],
  settings: ['M4 7h16M4 17h16', 'M9 4v6m6 4v6'],
  flame: [
    'M12 3c1 5 6 5 6 11a6 6 0 0 1-12 0c0-3 2-5 3-6 0 3 2 3 3 1V3Z',
    'M12 14c-3 3-2 6 0 6s3-3 0-6Z',
  ],
  info: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', 'M12 11v6m0-10v.1'],
  swap: ['M4 7h16l-4-4m4 14H4l4 4'],
  plus: ['M12 5v14M5 12h14'],
  download: ['M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'],
  upload: ['M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5'],
  chevron: ['m9 5 7 7-7 7'],
  moon: ['M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z'],
  edit: ['m14 4 6 6M4 20l1-6L16 3l5 5-11 11-6 1Z'],
}

export function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: IconName
  size?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {paths[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
