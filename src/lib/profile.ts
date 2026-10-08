import { dateKey } from './dates'
import type { Experience, Goal, Settings } from './state'

export const LEVELS: {
  value: Experience
  name: string
  description: string
  welcome: string
  detail: string
}[] = [
  {
    value: 'beginner',
    name: 'Beginner',
    description: 'New to lifting, returning, or prefer step-by-step help.',
    welcome: 'A good place to start.',
    detail: 'Clear instructions, manageable sessions, and one set at a time.',
  },
  {
    value: 'intermediate',
    name: 'Intermediate',
    description:
      'Train regularly and feel comfortable with familiar exercises.',
    welcome: 'Keep building.',
    detail: 'A routine that fits your week, with your next target in view.',
  },
  {
    value: 'advanced',
    name: 'Advanced',
    description: 'Have an established routine and want more training control.',
    welcome: 'Make it your own.',
    detail:
      'Detailed logging and adjustable targets. More control, not more pressure.',
  },
]
export const GOALS: {
  value: Goal
  name: string
  description: string
  icon: 'muscle' | 'strength' | 'flame' | 'activity'
}[] = [
  {
    value: 'muscle',
    name: 'Build muscle',
    description: 'Focus on resistance work and repeatable progress.',
    icon: 'muscle',
  },
  {
    value: 'strength',
    name: 'Get stronger',
    description: 'Prioritize strength work, with time to recover between sets.',
    icon: 'strength',
  },
  {
    value: 'fat-loss',
    name: 'Lose fat',
    description: 'Combine strength and sustainable conditioning.',
    icon: 'flame',
  },
  {
    value: 'stamina',
    name: 'Improve stamina',
    description: 'Build your capacity for sustained activity.',
    icon: 'activity',
  },
]
export const levelFor = (settings: Settings) =>
  LEVELS.find((x) => x.value === (settings.experience ?? 'beginner'))!
export const goalFor = (settings: Settings) =>
  GOALS.find((x) => x.value === (settings.goal ?? 'fat-loss'))!
export const DEFAULT_SETTINGS: Settings = {
  days: [1, 3, 5],
  minutes: 45,
  experience: 'beginner',
  goal: 'muscle',
  mode: 'gym',
  unit: 'kg',
  missing: ['barbell', 'rack'],
  homeEquipment: [],
  split: 'auto',
}
export const freshSettings = (): Settings => ({
  ...DEFAULT_SETTINGS,
  startDate: dateKey(),
})
