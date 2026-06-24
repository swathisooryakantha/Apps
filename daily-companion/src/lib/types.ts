export type Mood = 'drained' | 'anxious' | 'flat' | 'frustrated' | 'good' | 'great'

export type Personality =
  | 'cozy_grandma'
  | 'proud_father'
  | 'deadpan_coach'
  | 'drill_sergeant'
  | 'enthusiastic_friend'
  | 'dramatic_narrator'

export type Mode = 'hard' | 'soft'

export type DayStep = 'mood' | 'mode' | 'routines' | 'grounding' | 'curiosity' | 'done'

export type ChallengeLength = 30 | 75

export interface AppSettings {
  id: string
  challenge_length: ChallengeLength
  start_date: string
  created_at: string
}

export interface Routine {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface DailyEntry {
  id: string
  entry_date: string
  day_number: number | null
  mood: Mood | null
  personality: Personality
  mode: Mode | null
  current_step: DayStep
  grounding_exercise_id: string | null
  grounding_done: boolean
  curiosity_id: string | null
  curiosity_viewed_count: number
  completed: boolean
  created_at: string
}

export interface RoutineCompletion {
  id: string
  daily_entry_id: string
  routine_id: string
  done: boolean
  created_at: string
}
