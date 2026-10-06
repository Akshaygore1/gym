// Downloads images and details for the exercises in src/data/exercises.ts
// from free-exercise-db (public domain): https://github.com/yuhonas/free-exercise-db
// Run: npm run fetch-exercises

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXERCISE_IDS } from '../src/data/exercises.ts'

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

type DbExercise = {
  id: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  images: string[]
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

const all: DbExercise[] = JSON.parse((await download(`${BASE}/dist/exercises.json`)).toString())
const byId = new Map(all.map((e) => [e.id, e]))

const details: Record<string, Omit<DbExercise, 'id' | 'images'> & { frames: number }> = {}

for (const id of EXERCISE_IDS) {
  const ex = byId.get(id)
  if (!ex) throw new Error(`Exercise not found in free-exercise-db: ${id}`)
  const dir = join(root, 'public', 'exercises', id)
  await mkdir(dir, { recursive: true })
  for (const [i, img] of ex.images.entries()) {
    await writeFile(join(dir, `${i}.jpg`), await download(`${BASE}/exercises/${img}`))
  }
  details[id] = {
    primaryMuscles: ex.primaryMuscles,
    secondaryMuscles: ex.secondaryMuscles,
    instructions: ex.instructions,
    frames: ex.images.length,
  }
  console.log(`ok ${id} (${ex.images.length} frames)`)
}

await writeFile(
  join(root, 'src', 'data', 'exercise-details.json'),
  JSON.stringify(details, null, 2) + '\n',
)
