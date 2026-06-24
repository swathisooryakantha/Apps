/** Deterministic variant picker — same (seed, slot) always resolves to the same pick,
 *  so a day's voice doesn't change on re-render, but the next day reads differently. */
function hash(seed: number, slot: string): number {
  let h = seed * 2654435761
  for (let i = 0; i < slot.length; i++) {
    h = (h ^ slot.charCodeAt(i)) * 16777619
    h = h >>> 0
  }
  return h >>> 0
}

export function pick<T>(seed: number, slot: string, options: readonly T[]): T {
  const index = hash(seed, slot) % options.length
  return options[index]
}

export function pickIndex(seed: number, slot: string, length: number): number {
  return hash(seed, slot) % length
}
