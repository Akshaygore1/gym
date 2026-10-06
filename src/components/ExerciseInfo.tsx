import { exercise } from '../lib/plan'
import { detailsFor, videoSearchUrl } from '../lib/details'
import { ExerciseAnim } from './ExerciseAnim'
import { Sheet } from './Sheet'

export function ExerciseInfo({ id, onClose }: { id: string; onClose: () => void }) {
  const def = exercise(id)
  const d = detailsFor(id)
  return (
    <Sheet title={def.name} onClose={onClose}>
      <ExerciseAnim id={id} />
      <p className="cue">{def.cue}</p>
      {d.primaryMuscles.length > 0 && (
        <p className="muscles">
          <strong>Works:</strong> {[...d.primaryMuscles, ...d.secondaryMuscles].join(', ')}
        </p>
      )}
      <h3>How to do it</h3>
      <ol className="steps-list">
        {d.instructions.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
      <a className="btn btn-ghost" href={videoSearchUrl(def.name)} target="_blank" rel="noreferrer">
        Watch a video ↗
      </a>
    </Sheet>
  )
}
