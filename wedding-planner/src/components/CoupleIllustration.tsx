// A drawn couple under a floral arch, used in place of personal photos.
// Colors come from the theme's accent variables so it matches the chosen theme.

const accent = (shade: number) => ({ fill: `var(--accent-${shade})` })
const SKIN = '#e0a983'
const SKIN_SHADE = '#c98d68'
const HAIR = '#2b1d16'
const GOLD = '#d4a24c'

export default function CoupleIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} role="img" aria-label="Illustration of a couple under a floral arch">
      {/* Arch */}
      <path d="M70 210 V110 a90 90 0 0 1 180 0 V210" fill="none" strokeWidth="10" style={{ stroke: 'var(--accent-100)' }} />
      {Array.from({ length: 13 }, (_, i) => {
        const angle = Math.PI - (i * Math.PI) / 12
        return (
          <circle key={i} cx={160 + 90 * Math.cos(angle)} cy={110 - 90 * Math.sin(angle)} r={i % 2 ? 5 : 7} style={accent(i % 2 ? 400 : 500)} />
        )
      })}
      <circle cx="70" cy="150" r="5" style={accent(400)} />
      <circle cx="250" cy="150" r="5" style={accent(400)} />

      {/* Ground */}
      <ellipse cx="160" cy="208" rx="80" ry="7" style={accent(100)} />

      {/* Heart */}
      <path d="M160 62 c-6 -10 -20 -4 -14 6 l14 13 l14 -13 c6 -10 -8 -16 -14 -6z" style={accent(600)} />

      {/* Partner one: sherwani */}
      <rect x="111" y="166" width="11" height="40" rx="4" fill={HAIR} />
      <rect x="126" y="166" width="11" height="40" rx="4" fill={HAIR} />
      <path d="M104 118 q20 -12 40 0 l4 56 h-48z" style={accent(700)} />
      <path d="M124 112 v62" stroke={GOLD} strokeWidth="2" strokeDasharray="3 5" />
      <path d="M143 124 q10 16 20 26" strokeWidth="9" strokeLinecap="round" fill="none" style={{ stroke: 'var(--accent-700)' }} />
      <rect x="117" y="98" width="13" height="14" rx="5" fill={SKIN_SHADE} />
      <circle cx="124" cy="88" r="16" fill={SKIN} />
      <path d="M108 86 q0 -20 16 -20 q16 0 16 20 q-4 -10 -16 -10 q-12 0 -16 10z" fill={HAIR} />
      <circle cx="119" cy="90" r="1.6" fill={HAIR} />
      <circle cx="129" cy="90" r="1.6" fill={HAIR} />
      <path d="M120 96 q4 3 8 0" stroke={HAIR} strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Partner two: saree */}
      <path d="M176 118 q20 -12 40 0 l14 88 h-68z" style={accent(500)} />
      <path d="M210 116 q-30 30 -46 90" strokeWidth="9" fill="none" style={{ stroke: 'var(--accent-400)' }} />
      <path d="M163 202 h66" stroke={GOLD} strokeWidth="4" />
      <path d="M177 124 q-10 16 -20 26" strokeWidth="9" strokeLinecap="round" fill="none" style={{ stroke: 'var(--accent-500)' }} />
      <circle cx="160" cy="151" r="5" fill={SKIN} />
      <rect x="189" y="98" width="13" height="14" rx="5" fill={SKIN_SHADE} />
      <circle cx="196" cy="88" r="16" fill={SKIN} />
      <path d="M180 90 q-2 -24 16 -24 q18 0 16 24 q-2 -14 -16 -14 q-14 0 -16 14z" fill={HAIR} />
      <circle cx="214" cy="80" r="8" fill={HAIR} />
      <circle cx="218" cy="74" r="3" fill="#ffffff" />
      <circle cx="221" cy="79" r="3" fill="#ffffff" />
      <circle cx="196" cy="83" r="1.6" style={accent(700)} />
      <circle cx="191" cy="90" r="1.6" fill={HAIR} />
      <circle cx="201" cy="90" r="1.6" fill={HAIR} />
      <path d="M192 96 q4 3 8 0" stroke={HAIR} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="181" cy="96" r="2" fill={GOLD} />
      <circle cx="211" cy="96" r="2" fill={GOLD} />
    </svg>
  )
}
