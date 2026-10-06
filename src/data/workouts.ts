export type Slot = { id: string; optional?: boolean }

export type Workout = {
  key: string
  name: string
  focus: string
  slots: Slot[]
  stretches: Slot[] // cool-down, matched to the muscles trained
  cardioDay?: boolean
}

const W = (key: string, name: string, focus: string, slots: Slot[], stretches: Slot[], cardioDay = false): Workout => ({
  key, name, focus, slots, stretches, cardioDay,
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

export const WORKOUTS = {
  A: W('A', 'Full body A', 'Legs, chest, back, shoulders', [
    { id: 'Leg_Press' },
    { id: 'Leverage_Chest_Press' },
    { id: 'Wide-Grip_Lat_Pulldown' },
    { id: 'Machine_Shoulder_Military_Press' },
    { id: 'Seated_Leg_Curl', optional: true },
    { id: 'Plank' },
  ], [HIP, HAM, CHEST, LAT, opt(SHOULDER)]),
  B: W('B', 'Full body B', 'Squat, back, upper chest, hamstrings', [
    { id: 'Goblet_Squat' },
    { id: 'Seated_Cable_Rows' },
    { id: 'Incline_Dumbbell_Press' },
    { id: 'Stiff-Legged_Dumbbell_Deadlift' },
    { id: 'Side_Lateral_Raise', optional: true },
    { id: 'Dead_Bug' },
  ], [QUAD, HAM, CHEST, BACK, opt(SHOULDER)]),
  C: W('C', 'Full body C', 'Lunges, chest, back, glutes, arms', [
    { id: 'Dumbbell_Lunges' },
    { id: 'Dumbbell_Bench_Press' },
    { id: 'One-Arm_Dumbbell_Row' },
    { id: 'Butt_Lift_Bridge' },
    { id: 'Triceps_Pushdown_-_Rope_Attachment', optional: true },
    { id: 'Cable_Crunch' },
  ], [HIP, GLUTE, CHEST, LAT, opt(TRICEPS)]),
  UA: W('UA', 'Upper body A', 'Chest, back, shoulders, arms', [
    { id: 'Leverage_Chest_Press' },
    { id: 'Wide-Grip_Lat_Pulldown' },
    { id: 'Machine_Shoulder_Military_Press' },
    { id: 'Seated_Cable_Rows' },
    { id: 'Butterfly', optional: true },
    { id: 'Triceps_Pushdown_-_Rope_Attachment', optional: true },
  ], [CHEST, LAT, SHOULDER, BACK, opt(TRICEPS)]),
  LA: W('LA', 'Lower body A', 'Quads, hamstrings, calves, core', [
    { id: 'Leg_Press' },
    { id: 'Stiff-Legged_Dumbbell_Deadlift' },
    { id: 'Seated_Leg_Curl' },
    { id: 'Seated_Calf_Raise', optional: true },
    { id: 'Plank' },
  ], [QUAD, HAM, HIP, CALF, opt(BACK)]),
  UB: W('UB', 'Upper body B', 'Upper chest, back, shoulders, arms', [
    { id: 'Incline_Dumbbell_Press' },
    { id: 'One-Arm_Dumbbell_Row' },
    { id: 'Close-Grip_Front_Lat_Pulldown' },
    { id: 'Side_Lateral_Raise' },
    { id: 'Face_Pull', optional: true },
    { id: 'Hammer_Curls', optional: true },
  ], [CHEST, LAT, SHOULDER, BACK, opt(TRICEPS)]),
  LB: W('LB', 'Lower body B', 'Squat, lunges, lower back, core', [
    { id: 'Goblet_Squat' },
    { id: 'Dumbbell_Lunges' },
    { id: 'Hyperextensions_Back_Extensions' },
    { id: 'Leg_Extensions', optional: true },
    { id: 'Knee_Hip_Raise_On_Parallel_Bars' },
  ], [HIP, QUAD, GLUTE, HAM, opt(BACK)]),
  CD: W('CD', 'Cardio + core', 'Long cardio for fat loss, then abs', [
    { id: 'Knee_Hip_Raise_On_Parallel_Bars' },
    { id: 'Plank' },
    { id: 'Hyperextensions_Back_Extensions', optional: true },
  ], [CALF, HAM, HIP, BACK], true),
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
  if (daysPerWeek <= 3) return 'Full body workouts A, B, C in rotation. Best for starting out.'
  if (daysPerWeek === 4) return 'Upper body and lower body days, twice each.'
  return 'Upper and lower body days, plus long cardio days for fat loss.'
}

// After enough sessions some guided machines move to versions that need more balance.
export const UPGRADES: Record<string, string> = {
  Leverage_Chest_Press: 'Smith_Machine_Bench_Press',
  Machine_Shoulder_Military_Press: 'Dumbbell_Shoulder_Press',
}
export const UPGRADE_AFTER_SESSIONS = 18
