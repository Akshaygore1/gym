type Props = {
  value: number
  step: number
  min: number
  suffix?: string
  onChange: (value: number) => void
}

export function Stepper({ value, step, min, suffix, onChange }: Props) {
  const set = (v: number) => onChange(Math.max(min, Math.round(v * 100) / 100))
  return (
    <div className="stepper">
      <button type="button" aria-label="Less" onClick={() => set(value - step)} disabled={value <= min}>
        −
      </button>
      <output>
        {value}
        {suffix && <small> {suffix}</small>}
      </output>
      <button type="button" aria-label="More" onClick={() => set(value + step)}>
        +
      </button>
    </div>
  )
}
