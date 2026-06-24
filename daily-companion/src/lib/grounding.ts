export interface GroundingExercise {
  id: string
  title: string
  kind: 'breathing' | 'sensory'
  steps: string[]
}

/** A finite, fixed set — not a library to browse, just whatever today's turn lands on. */
export const GROUNDING_EXERCISES: GroundingExercise[] = [
  {
    id: 'box-breathing',
    title: 'Box breathing',
    kind: 'breathing',
    steps: ['Breathe in for 4 counts.', 'Hold for 4 counts.', 'Breathe out for 4 counts.', 'Hold for 4 counts. Repeat three times.'],
  },
  {
    id: 'five-senses',
    title: '5-4-3-2-1',
    kind: 'sensory',
    steps: [
      'Name 5 things you can see.',
      'Name 4 things you can touch.',
      'Name 3 things you can hear.',
      'Name 2 things you can smell.',
      'Name 1 thing you can taste.',
    ],
  },
  {
    id: 'hand-on-chest',
    title: 'Hand on chest',
    kind: 'breathing',
    steps: ['Place a hand flat on your chest.', 'Feel it rise and fall for 6 slow breaths.', 'Notice the warmth of your own hand.'],
  },
  {
    id: 'cool-water',
    title: 'Cool water',
    kind: 'sensory',
    steps: ['Run cool water over your wrists for 20 seconds.', 'Notice the temperature change.', 'Let your shoulders drop.'],
  },
  {
    id: 'count-backward',
    title: 'Count backward',
    kind: 'sensory',
    steps: ['Count slowly backward from 20 to 1.', 'If you lose count, just start again from 20. No pressure.'],
  },
  {
    id: 'feet-on-floor',
    title: 'Feet on the floor',
    kind: 'sensory',
    steps: ['Press both feet flat on the floor.', 'Notice four points of contact under each foot.', 'Take one slow breath here.'],
  },
  {
    id: 'long-exhale',
    title: 'Long exhale',
    kind: 'breathing',
    steps: ['Breathe in normally through your nose.', 'Exhale slowly through your mouth, twice as long as the inhale.', 'Repeat four times.'],
  },
]

export function groundingExerciseForIndex(index: number): GroundingExercise {
  return GROUNDING_EXERCISES[index % GROUNDING_EXERCISES.length]
}

export function groundingExerciseById(id: string | null): GroundingExercise | null {
  return GROUNDING_EXERCISES.find((g) => g.id === id) ?? null
}
