import { createContext, useContext } from 'react'
import type { WeddingSettings } from '../lib/types'

export interface WeddingState {
  /** The wedding being planned right now. */
  wedding: WeddingSettings | null
  /** Every wedding the signed-in user belongs to. */
  weddings: WeddingSettings[]
  loading: boolean
  error: string | null
  createWedding: (values: { bride_name: string; groom_name: string; wedding_date: string | null; theme?: string }) => Promise<string | null>
  /** Accepts an invite token; resolves to an error message, or null on success. */
  joinWedding: (token: string) => Promise<string | null>
  leaveWedding: () => Promise<string | null>
  deleteWedding: () => Promise<string | null>
  selectWedding: (id: string) => void
  save: (values: Partial<WeddingSettings>) => Promise<void>
}

const notReady = async () => 'Not ready yet.'

export const WeddingContext = createContext<WeddingState>({
  wedding: null,
  weddings: [],
  loading: true,
  error: null,
  createWedding: notReady,
  joinWedding: notReady,
  leaveWedding: notReady,
  deleteWedding: notReady,
  selectWedding: () => {},
  save: async () => {},
})

export function useWedding() {
  return useContext(WeddingContext)
}
