import { useEffect, useState } from 'react'
import { detailsFor } from '../lib/details'

// Alternates between the start and end photos so the movement reads as an animation.
export function ExerciseAnim({ id, size = 'large' }: { id: string; size?: 'large' | 'thumb' }) {
  const frames = detailsFor(id).frames
  const [tick, setTick] = useState(0)
  const frame = frames > 0 ? tick % frames : 0

  useEffect(() => {
    if (size === 'thumb' || frames < 2) return
    const timer = setInterval(() => setTick((t) => t + 1), 900)
    return () => clearInterval(timer)
  }, [frames, size])

  const src = (i: number) => `${import.meta.env.BASE_URL}exercises/${id}/${i}.jpg`

  return (
    <div className={`anim anim-${size}`}>
      {Array.from({ length: size === 'thumb' ? 1 : frames }, (_, i) => (
        <img key={i} src={src(i)} alt="" className={i === frame ? 'on' : ''} draggable={false} />
      ))}
    </div>
  )
}
