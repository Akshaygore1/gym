import { useEffect, useState } from 'react'
import { detailsFor } from '../lib/details'
import { Icon } from './Icon'

export function ExerciseAnim({
  id,
  size = 'large',
}: {
  id: string
  size?: 'large' | 'thumb'
}) {
  const frames = detailsFor(id).frames
  const [tick, setTick] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!playing || size === 'thumb' || frames < 2) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (query.matches) return
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    const stop = () => {
      if (query.matches) setPlaying(false)
    }
    query.addEventListener('change', stop)
    return () => {
      clearInterval(timer)
      query.removeEventListener('change', stop)
    }
  }, [frames, size, playing])
  const src = (i: number) =>
    `${import.meta.env.BASE_URL}exercises/${id}/${i}.jpg`
  return (
    <div className={`exercise-media anim-${size}`}>
      <div className="anim">
        {frames > 0 && !failed ? (
          <img
            src={src(size === 'thumb' ? 0 : tick % frames)}
            alt={size === 'thumb' ? '' : 'Exercise position reference'}
            draggable={false}
            loading={size === 'thumb' ? 'lazy' : 'eager'}
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="media-fallback">
            <Icon name="strength" size={28} />
            {size === 'large' && (
              <span>Photo unavailable. Follow the written instructions.</span>
            )}
          </span>
        )}
      </div>
      {size === 'large' && frames > 1 && !failed && (
        <div className="media-controls">
          <button
            type="button"
            className="text-button"
            onClick={() => setTick((t) => t + 1)}
          >
            Next position
          </button>
          <button
            type="button"
            className="text-button"
            aria-pressed={playing}
            onClick={() => {
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
                setTick((t) => t + 1)
              else setPlaying((v) => !v)
            }}
          >
            <Icon name={playing ? 'pause' : 'play'} size={14} />
            {playing ? 'Pause movement' : 'Show movement'}
          </button>
        </div>
      )}
    </div>
  )
}
