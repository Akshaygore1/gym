export type Slot = { id: string; optional?: boolean }

import type { Settings } from '../lib/state'

export type Workout = {
  key: string
  name: string
  focus: string
  slots: Slot[]
  stretches: Slot[] // cool-down, matched to the muscles trained
  cardioDay?: boolean
}

const W = (
  key: string,
  name: string,
  focus: string,
  slots: Slot[],
  stretches: Slot[],
  cardioDay = false,
): Workout => ({
  key,
  name,
  focus,
  slots,
  stretches,
  cardioDay,
})

const HIP = { id: 'Kneeling_Hip_Flexor' }
const HAM = { id: 'Seated_Floor_Hamstring_Stretch' }
const QUAD = { id: 'On_Your_Side_Quad_Stretch' }
const GLUTE = { id: 'Ankle_On_The_Knee' }
const CALF = { id: 'Calf_Stretch_Hands_Against_Wall' }
const CHEST = { id: 'Elbows_Back' }
const LAT = { id: 'One_Arm_Against_Wall' }
const SHOULDER = { id: 'Shoulder_Stretch' }
const TRICEPS = { id: 'Triceps_Stretch' }
const BACK = { id: 'Childs_Pose' }
const opt = (slot: Slot): Slot => ({ ...slot, optional: true })

export const WORKOUTS: Record<string, Workout> = {
  A: W(
    'A',
    'Full body A',
    'Legs, chest, back, shoulders',
    [
      { id: 'Leg_Press' },
      { id: 'Leverage_Chest_Press' },
      { id: 'Wide-Grip_Lat_Pulldown' },
      { id: 'Machine_Shoulder_Military_Press' },
      { id: 'Seated_Leg_Curl', optional: true },
      { id: 'Plank' },
    ],
    [HIP, HAM, CHEST, LAT, opt(SHOULDER)],
  ),
  B: W(
    'B',
    'Full body B',
    'Squat, back, upper chest, hamstrings',
    [
      { id: 'Goblet_Squat' },
      { id: 'Seated_Cable_Rows' },
      { id: 'Incline_Dumbbell_Press' },
      { id: 'Stiff-Legged_Dumbbell_Deadlift' },
      { id: 'Side_Lateral_Raise', optional: true },
      { id: 'Dead_Bug' },
    ],
    [QUAD, HAM, CHEST, BACK, opt(SHOULDER)],
  ),
  C: W(
    'C',
    'Full body C',
    'Lunges, chest, back, glutes, arms',
    [
      { id: 'Dumbbell_Lunges' },
      { id: 'Dumbbell_Bench_Press' },
      { id: 'One-Arm_Dumbbell_Row' },
      { id: 'Butt_Lift_Bridge' },
      { id: 'Triceps_Pushdown_-_Rope_Attachment', optional: true },
      { id: 'Cable_Crunch' },
    ],
    [HIP, GLUTE, CHEST, LAT, opt(TRICEPS)],
  ),
  UA: W(
    'UA',
    'Upper body A',
    'Chest, back, shoulders, arms',
    [
      { id: 'Leverage_Chest_Press' },
      { id: 'Wide-Grip_Lat_Pulldown' },
      { id: 'Machine_Shoulder_Military_Press' },
      { id: 'Seated_Cable_Rows' },
      { id: 'Butterfly', optional: true },
      { id: 'Triceps_Pushdown_-_Rope_Attachment', optional: true },
    ],
    [CHEST, LAT, SHOULDER, BACK, opt(TRICEPS)],
  ),
  LA: W(
    'LA',
    'Lower body A',
    'Quads, hamstrings, calves, core',
    [
      { id: 'Leg_Press' },
      { id: 'Stiff-Legged_Dumbbell_Deadlift' },
      { id: 'Seated_Leg_Curl' },
      { id: 'Seated_Calf_Raise', optional: true },
      { id: 'Plank' },
    ],
    [QUAD, HAM, HIP, CALF, opt(BACK)],
  ),
  UB: W(
    'UB',
    'Upper body B',
    'Upper chest, back, shoulders, arms',
    [
      { id: 'Incline_Dumbbell_Press' },
      { id: 'One-Arm_Dumbbell_Row' },
      { id: 'Close-Grip_Front_Lat_Pulldown' },
      { id: 'Side_Lateral_Raise' },
      { id: 'Face_Pull', optional: true },
      { id: 'Hammer_Curls', optional: true },
    ],
    [CHEST, LAT, SHOULDER, BACK, opt(TRICEPS)],
  ),
  LB: W(
    'LB',
    'Lower body B',
    'Squat, lunges, lower back, core',
    [
      { id: 'Goblet_Squat' },
      { id: 'Dumbbell_Lunges' },
      { id: 'Hyperextensions_Back_Extensions' },
      { id: 'Leg_Extensions', optional: true },
      { id: 'Knee_Hip_Raise_On_Parallel_Bars' },
    ],
    [HIP, QUAD, GLUTE, HAM, opt(BACK)],
  ),
  CD: W(
    'CD',
    'Cardio + core',
    'Long cardio for fat loss, then abs',
    [
      { id: 'Knee_Hip_Raise_On_Parallel_Bars' },
      { id: 'Plank' },
      { id: 'Hyperextensions_Back_Extensions', optional: true },
    ],
    [CALF, HAM, HIP, BACK],
    true,
  ),
  I_A: W(
    'I_A',
    'Full body A',
    'Squat, press, pull, and core',
    [
      { id: 'Goblet_Squat' },
      { id: 'Dumbbell_Bench_Press' },
      { id: 'Seated_Cable_Rows' },
      { id: 'Stiff-Legged_Dumbbell_Deadlift' },
      opt({ id: 'Side_Lateral_Raise' }),
      opt({ id: 'Plank' }),
    ],
    [HIP, CHEST, HAM, LAT],
  ),
  I_B: W(
    'I_B',
    'Full body B',
    'Hinge, upper body, and single-leg work',
    [
      { id: 'Stiff-Legged_Dumbbell_Deadlift' },
      { id: 'Wide-Grip_Lat_Pulldown' },
      { id: 'Incline_Dumbbell_Press' },
      { id: 'Dumbbell_Lunges' },
      opt({ id: 'Face_Pull' }),
      opt({ id: 'Dead_Bug' }),
    ],
    [HAM, LAT, CHEST, GLUTE],
  ),
  I_U: W(
    'I_U',
    'Upper body',
    'Pressing, pulling, and shoulders',
    [
      { id: 'Dumbbell_Bench_Press' },
      { id: 'Seated_Cable_Rows' },
      { id: 'Dumbbell_Shoulder_Press' },
      { id: 'Wide-Grip_Lat_Pulldown' },
      opt({ id: 'Side_Lateral_Raise' }),
      opt({ id: 'Hammer_Curls' }),
    ],
    [CHEST, LAT, SHOULDER, TRICEPS],
  ),
  I_L: W(
    'I_L',
    'Lower body',
    'Squat, hinge, and core',
    [
      { id: 'Goblet_Squat' },
      { id: 'Stiff-Legged_Dumbbell_Deadlift' },
      { id: 'Dumbbell_Lunges' },
      { id: 'Seated_Leg_Curl' },
      opt({ id: 'Seated_Calf_Raise' }),
      opt({ id: 'Plank' }),
    ],
    [HIP, HAM, QUAD, CALF],
  ),
  PUSH: W(
    'PUSH',
    'Push',
    'Chest, shoulders, and triceps',
    [
      { id: 'Dumbbell_Bench_Press' },
      { id: 'Dumbbell_Shoulder_Press' },
      { id: 'Incline_Dumbbell_Press' },
      { id: 'Side_Lateral_Raise' },
      opt({ id: 'Triceps_Pushdown_-_Rope_Attachment' }),
    ],
    [CHEST, SHOULDER, TRICEPS],
  ),
  PULL: W(
    'PULL',
    'Pull',
    'Back, rear shoulders, and biceps',
    [
      { id: 'Seated_Cable_Rows' },
      { id: 'Wide-Grip_Lat_Pulldown' },
      { id: 'Face_Pull' },
      { id: 'Hammer_Curls' },
      opt({ id: 'Reverse_Machine_Flyes' }),
    ],
    [LAT, BACK, SHOULDER],
  ),
  H_A: W(
    'H_A',
    'Full body A',
    'Legs, push, and core',
    [
      { id: 'Bodyweight_Squat' },
      { id: 'Pushups' },
      { id: 'Bent_Over_Two-Dumbbell_Row' },
      { id: 'Butt_Lift_Bridge' },
      { id: 'Dead_Bug' },
      opt({ id: 'Plank' }),
    ],
    [HIP, CHEST, HAM, BACK],
  ),
  H_B: W(
    'H_B',
    'Full body B',
    'Single-leg work, push, and core',
    [
      { id: 'Bodyweight_Walking_Lunge' },
      { id: 'Pushups' },
      { id: 'Bent_Over_Two-Dumbbell_Row' },
      { id: 'Butt_Lift_Bridge' },
      { id: 'Reverse_Crunch' },
      opt({ id: 'Side_Bridge' }),
    ],
    [QUAD, CHEST, GLUTE, HAM],
  ),
  H_U: W(
    'H_U',
    'Upper body',
    'Pressing, rowing, and shoulders',
    [
      { id: 'Dumbbell_Floor_Press' },
      { id: 'Bent_Over_Two-Dumbbell_Row' },
      { id: 'Side_Lateral_Raise' },
      { id: 'Pushups' },
      opt({ id: 'Hammer_Curls' }),
      opt({ id: 'Dead_Bug' }),
    ],
    [CHEST, LAT, SHOULDER],
  ),
  H_L: W(
    'H_L',
    'Lower body',
    'Squat, hinge, and core',
    [
      { id: 'Bodyweight_Squat' },
      { id: 'Stiff-Legged_Dumbbell_Deadlift' },
      { id: 'Bodyweight_Walking_Lunge' },
      { id: 'Single_Leg_Glute_Bridge' },
      opt({ id: 'Plank' }),
    ],
    [HIP, HAM, QUAD, GLUTE],
  ),
  H_PUSH: W(
    'H_PUSH',
    'Push',
    'Chest, shoulders, and core',
    [
      { id: 'Dumbbell_Floor_Press' },
      { id: 'Pushups' },
      { id: 'Side_Lateral_Raise' },
      opt({ id: 'Plank' }),
    ],
    [CHEST, SHOULDER, TRICEPS],
  ),
  H_PULL: W(
    'H_PULL',
    'Pull',
    'Rows, rear shoulders, and arms',
    [
      { id: 'Bent_Over_Two-Dumbbell_Row' },
      { id: 'Stiff-Legged_Dumbbell_Deadlift' },
      { id: 'Hammer_Curls' },
      opt({ id: 'Dead_Bug' }),
    ],
    [LAT, HAM, BACK],
  ),
} satisfies Record<string, Workout>

// The rotation depends on how many gym days a week are selected.
export function rotationFor(daysPerWeek: number): Workout[] {
  const w = WORKOUTS
  if (daysPerWeek <= 3) return [w.A, w.B, w.C]
  if (daysPerWeek === 4) return [w.UA, w.LA, w.UB, w.LB]
  if (daysPerWeek === 5) return [w.UA, w.LA, w.CD, w.UB, w.LB]
  return [w.UA, w.LA, w.CD, w.UB, w.LB, w.CD]
}

export function rotationDescription(daysPerWeek: number): string {
  if (daysPerWeek === 0) return 'Pick at least one day.'
  if (daysPerWeek <= 3)
    return 'Full body workouts A, B, C in rotation. Best for starting out.'
  if (daysPerWeek === 4) return 'Upper body and lower body days, twice each.'
  return 'Upper and lower body days, plus long cardio days for fat loss.'
}

export function splitFor(
  settings: Settings,
): Exclude<NonNullable<Settings['split']>, 'auto'> {
  if (
    settings.mode === 'home' &&
    !settings.homeEquipment?.includes('dumbbells')
  )
    return 'full-body'
  if (settings.split && settings.split !== 'auto') return settings.split
  if (settings.experience === 'beginner' || settings.days.length <= 3)
    return 'full-body'
  if (settings.experience === 'advanced' && settings.days.length >= 5)
    return 'push-pull-legs'
  return 'upper-lower'
}

export function rotationForProfile(settings: Settings): Workout[] {
  if (!settings.experience) return rotationFor(settings.days.length)
  const w = WORKOUTS
  const split = splitFor(settings)
  if (settings.mode === 'home') {
    if (split === 'push-pull-legs') return [w.H_PUSH, w.H_PULL, w.H_L]
    if (split === 'upper-lower') return [w.H_U, w.H_L]
    return [w.H_A, w.H_B]
  }
  if (split === 'push-pull-legs') return [w.PUSH, w.PULL, w.I_L]
  if (split === 'upper-lower')
    return settings.experience === 'beginner'
      ? [w.UA, w.LA, w.UB, w.LB]
      : [w.I_U, w.I_L]
  const foundation =
    settings.experience === 'beginner' ? [w.A, w.B, w.C] : [w.I_A, w.I_B]
  if (settings.goal === 'stamina' && settings.days.length >= 3)
    return [...foundation.slice(0, 2), w.CD]
  return foundation
}

export function programName(settings: Settings): string {
  return {
    'full-body': 'Full-body routine',
    'upper-lower': 'Upper / lower routine',
    'push-pull-legs': 'Push / pull / legs',
  }[splitFor(settings)]
}

// After enough sessions some guided machines move to versions that need more balance.
export const UPGRADES: Record<string, string> = {
  Leverage_Chest_Press: 'Smith_Machine_Bench_Press',
  Machine_Shoulder_Military_Press: 'Dumbbell_Shoulder_Press',
}
export const UPGRADE_AFTER_SESSIONS = 18
