// Wedding themes ("vibes"). A theme sets the page background, accent color, heading
// font and an optional braid-kolam decoration down the side of the screen. The accent can still
// be fine-tuned per wedding with the color swatches in Edit details.

export type ThemeId = 'blush' | 'temple' | 'sage' | 'navy' | 'ivory' | 'midnight'

export interface Theme {
  id: ThemeId
  name: string
  tagline: string
  accent: string
  /** Solid page color under the gradient (also used for previews). */
  base: string
  background: string
  displayFont: string
  /** Color the side kolam is drawn in, or null for no decoration. */
  motifColor: string | null
  motif: 'kolam' | 'floral' | 'vine' | 'deco' | 'stars' | null
  dark?: boolean
}

export const THEMES: Theme[] = [
  {
    id: 'blush',
    name: 'Blush Romance',
    tagline: 'Soft pinks and florals',
    accent: '#e11d48',
    base: '#fff4f2',
    background: 'linear-gradient(180deg, #fff7f5 0%, #fff1ee 100%)',
    displayFont: "'Playfair Display', Georgia, serif",
    motifColor: '#f9a8b8',
    motif: 'floral',
  },
  {
    id: 'temple',
    name: 'Temple Gold',
    tagline: 'Maroon, gold and kolam',
    accent: '#9f1239',
    base: '#fdf6e7',
    background: 'linear-gradient(180deg, #fffaf0 0%, #fbf0d9 100%)',
    displayFont: "'Cormorant Garamond', Georgia, serif",
    motifColor: '#d4a24c',
    motif: 'kolam',
  },
  {
    id: 'sage',
    name: 'Sage Garden',
    tagline: 'Muted greens, outdoorsy',
    accent: '#4d7c5a',
    base: '#f3f6f0',
    background: 'linear-gradient(180deg, #f7faf4 0%, #edf2e8 100%)',
    displayFont: "'Lora', Georgia, serif",
    motifColor: '#a9c4a8',
    motif: 'vine',
  },
  {
    id: 'navy',
    name: 'Royal Navy',
    tagline: 'Navy and champagne, formal',
    accent: '#1e3a8a',
    base: '#f6f3ec',
    background: 'linear-gradient(180deg, #faf8f3 0%, #f1ece1 100%)',
    displayFont: "'Cinzel', Georgia, serif",
    motifColor: '#d8c9a3',
    motif: 'deco',
  },
  {
    id: 'ivory',
    name: 'Minimal Ivory',
    tagline: 'Clean, calm, no frills',
    accent: '#44403c',
    base: '#fbfaf7',
    background: 'linear-gradient(180deg, #fdfcfa 0%, #f7f5f0 100%)',
    displayFont: "'Cormorant Garamond', Georgia, serif",
    motifColor: null,
    motif: null,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Dark mode for late-night planning',
    accent: '#8b5cf6',
    base: '#15121f',
    background: 'linear-gradient(180deg, #17142a 0%, #110e1a 100%)',
    displayFont: "'Playfair Display', Georgia, serif",
    motifColor: '#5b4d8f',
    motif: 'stars',
    dark: true,
  },
]

export function themeFor(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

/**
 * One repeating (vertical) tile of a braid / sikku kolam: two strands weaving around a
 * column of dots. Drawn down one side of the screen as the theme's decoration.
 */
export function braidTile(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="36" viewBox="0 0 20 36" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round">
    <path d="M4 0 C4 9 16 9 16 18 C16 27 4 27 4 36"/><path d="M16 0 C16 9 4 9 4 18 C4 27 16 27 16 36"/>
    <g fill="${color}" stroke="none"><circle cx="10" cy="18" r="1.7"/><circle cx="10" cy="0" r="1.7"/><circle cx="10" cy="36" r="1.7"/>
    <circle cx="1.2" cy="9" r="1"/><circle cx="18.8" cy="9" r="1"/><circle cx="1.2" cy="27" r="1"/><circle cx="18.8" cy="27" r="1"/></g>
  </svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' '))}")`
}

/** Applies a theme to the whole page (CSS variables on <html>). */
export function applyTheme(theme: Theme, accent: string | null | undefined, showDecor: boolean) {
  const root = document.documentElement
  root.dataset.theme = theme.id
  root.style.setProperty('--accent', accent || theme.accent)
  root.style.setProperty('--page-base', theme.base)
  root.style.setProperty('--page-bg', theme.background)
  root.style.setProperty('--side-braid', showDecor && theme.motifColor ? braidTile(theme.motifColor) : 'none')
  root.style.setProperty('--font-display', theme.displayFont)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.dark ? theme.base : accent || theme.accent)
}
