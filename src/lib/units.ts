import type { Unit } from './state'

const LB_PER_KG = 2.2046226218
export const displayWeight = (kg: number, unit: Unit = 'kg') =>
  Math.round(kg * (unit === 'lb' ? LB_PER_KG : 1) * 100) / 100
export const toKg = (value: number, unit: Unit = 'kg') =>
  value / (unit === 'lb' ? LB_PER_KG : 1)
export const weightLabel = (kg: number, unit: Unit = 'kg') =>
  `${displayWeight(kg, unit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`
