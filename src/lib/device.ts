import { useEffect, useRef, useState } from 'react'

let audio: AudioContext | null = null

// Call from a tap handler so browsers allow sound later (iOS needs this).
export function unlockAudio() {
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()
}

// Three short beeps plus a vibration where supported (Android only).
export function alertDone() {
  navigator.vibrate?.([200, 100, 200, 100, 400])
  if (!audio) return
  const t = audio.currentTime
  for (let i = 0; i < 3; i++) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, t + i * 0.25)
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.25 + 0.18)
    osc.connect(gain).connect(audio.destination)
    osc.start(t + i * 0.25)
    osc.stop(t + i * 0.25 + 0.2)
  }
}

// Seconds left until `endsAt` (epoch ms). Based on the clock, so it stays
// correct when the phone locks or the tab is in the background.
export function useCountdown(endsAt: number | null, onEnd: () => void): number {
  const [now, setNow] = useState(() => Date.now())
  const onEndRef = useRef(onEnd)
  useEffect(() => {
    onEndRef.current = onEnd
  })

  useEffect(() => {
    if (endsAt === null) return
    const tick = () => {
      const t = Date.now()
      setNow(t)
      if (t >= endsAt) {
        clearInterval(id)
        onEndRef.current()
      }
    }
    const id = setInterval(tick, 250)
    const first = setTimeout(tick, 0)
    return () => {
      clearInterval(id)
      clearTimeout(first)
    }
  }, [endsAt])

  return endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000))
}

// Keeps the screen on during a workout where the browser supports it.
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    const request = () => {
      navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {})
    }
    const onVisible = () => document.visibilityState === 'visible' && request()
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [])
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
