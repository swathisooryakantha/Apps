// Wedding themes ("vibes"). A theme sets the page background, accent color, heading
// font and an optional decorative pattern (kolam, floral, vine…). The accent can still
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
  /** Color the decorative pattern is drawn in, or null for no pattern. */
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
    motifColor: '#3b3260',
    motif: 'stars',
    dark: true,
  },
]

export function themeFor(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

/** One repeating tile of a theme's background pattern, as an SVG data URI. */
export function motifTile(theme: Theme): string | null {
  if (!theme.motif || !theme.motifColor) return null
  const c = theme.motifColor
  const tiles: Record<NonNullable<Theme['motif']>, string> = {
    // Pulli kolam: a dot grid with loops drawn around the dots.
    kolam: `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.3">
      <circle cx="36" cy="36" r="2" fill="${c}" stroke="none"/><circle cx="18" cy="18" r="1.6" fill="${c}" stroke="none"/>
      <circle cx="54" cy="18" r="1.6" fill="${c}" stroke="none"/><circle cx="18" cy="54" r="1.6" fill="${c}" stroke="none"/>
      <circle cx="54" cy="54" r="1.6" fill="${c}" stroke="none"/>
      <path d="M36 22 C46 26 46 26 50 36 C46 46 46 46 36 50 C26 46 26 46 22 36 C26 26 26 26 36 22Z"/>
      <path d="M18 8 C26 12 26 24 18 28 C10 24 10 12 18 8Z M54 8 C62 12 62 24 54 28 C46 24 46 12 54 8Z M18 44 C26 48 26 60 18 64 C10 60 10 48 18 44Z M54 44 C62 48 62 60 54 64 C46 60 46 48 54 44Z"/>
    </svg>`,
    floral: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="${c}" opacity="0.35">
      <g transform="translate(20 20)"><circle r="2.5"/><ellipse cy="-6" rx="3" ry="4.5"/><ellipse cy="6" rx="3" ry="4.5"/><ellipse cx="-6" rx="4.5" ry="3"/><ellipse cx="6" rx="4.5" ry="3"/></g>
      <circle cx="60" cy="58" r="2"/><circle cx="66" cy="50" r="1.4"/><circle cx="52" cy="66" r="1.4"/>
    </svg>`,
    vine: `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="60" viewBox="0 0 90 60" fill="none" stroke="${c}" stroke-width="1.3" opacity="0.6">
      <path d="M0 30 C15 15 30 45 45 30 S75 15 90 30"/>
      <path d="M22 26 c4 -8 12 -8 12 -8 c0 0 -2 8 -12 8z M58 34 c4 8 12 8 12 8 c0 0 -2 -8 -12 -8z" fill="${c}" stroke="none"/>
    </svg>`,
    deco: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="${c}" stroke-width="1" opacity="0.6">
      <path d="M28 4 L52 28 L28 52 L4 28Z"/><path d="M28 14 L42 28 L28 42 L14 28Z"/><circle cx="28" cy="28" r="1.6" fill="${c}"/>
    </svg>`,
    stars: `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90" fill="${c}">
      <circle cx="12" cy="18" r="1.2"/><circle cx="60" cy="10" r="0.9"/><circle cx="40" cy="48" r="1.4"/>
      <circle cx="78" cy="62" r="1"/><circle cx="20" cy="76" r="0.8"/>
      <path d="M70 30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z"/>
    </svg>`,
  }
  return `url("data:image/svg+xml,${encodeURIComponent(tiles[theme.motif].replace(/\s+/g, ' '))}")`
}

/** Applies a theme to the whole page (CSS variables on <html>). */
export function applyTheme(theme: Theme, accent: string | null | undefined, showDecor: boolean) {
  const root = document.documentElement
  root.dataset.theme = theme.id
  root.style.setProperty('--accent', accent || theme.accent)
  root.style.setProperty('--page-base', theme.base)
  root.style.setProperty('--page-bg', theme.background)
  root.style.setProperty('--page-pattern', (showDecor && motifTile(theme)) || 'none')
  root.style.setProperty('--font-display', theme.displayFont)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.dark ? theme.base : accent || theme.accent)
}
