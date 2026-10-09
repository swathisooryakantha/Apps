import { createContext, useContext } from 'react'
import type { WeddingSettings } from '../lib/types'

export interface WeddingState {
  wedding: WeddingSettings | null
  loading: boolean
  error: string | null
  createWedding: (values: { bride_name: string; groom_name: string; wedding_date: string | null }) => Promise<string | null>
  save: (values: Partial<WeddingSettings>) => Promise<void>
}

export const WeddingContext = createContext<WeddingState>({
  wedding: null,
  loading: true,
  error: null,
  createWedding: async () => null,
  save: async () => {},
})

export function useWedding() {
  return useContext(WeddingContext)
}
