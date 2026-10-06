import details from '../data/exercise-details.json'

export type ExerciseDetails = {
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  frames: number
}

const all = details as Record<string, ExerciseDetails>

export function detailsFor(id: string): ExerciseDetails {
  return all[id] ?? { primaryMuscles: [], secondaryMuscles: [], instructions: [], frames: 0 }
}

export function videoSearchUrl(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} proper form`)}`
}
