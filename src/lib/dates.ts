export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Monday first, as weeks are usually shown in India.
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export function dateKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Weekday of the next gym day strictly after `from`.
export function nextGymDay(days: number[], from: Date = new Date()): number | null {
  for (let i = 1; i <= 7; i++) {
    const day = (from.getDay() + i) % 7
    if (days.includes(day)) return day
  }
  return null
}

export function relativeDayName(day: number, from: Date = new Date()): string {
  const diff = (day - from.getDay() + 7) % 7
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return DAY_LONG[day]
}
