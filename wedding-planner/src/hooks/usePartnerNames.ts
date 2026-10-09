import { useWedding } from '../context/wedding'

/** The couple's first names, falling back to "Bride" / "Groom" until they're set. */
export function usePartnerNames() {
  const wedding = useWedding().wedding
  return {
    bride: wedding?.bride_name?.trim() || 'Bride',
    groom: wedding?.groom_name?.trim() || 'Groom',
  }
}
