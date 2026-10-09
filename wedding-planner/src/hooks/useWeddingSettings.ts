import { useWedding } from '../context/wedding'

/** Settings (names, date, budget, theme) of the wedding the signed-in user is planning. */
export function useWeddingSettings() {
  const { wedding, save } = useWedding()
  return { settings: wedding, save }
}
