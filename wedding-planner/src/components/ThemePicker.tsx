import { THEMES, braidTile, type ThemeId } from '../lib/themes'

/** Grid of theme preview cards ("Pick your vibe"). */
export default function ThemePicker({
  value,
  onChange,
  compact = false,
}: {
  value: string
  onChange: (id: ThemeId) => void
  compact?: boolean
}) {
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'}`}>
      {THEMES.map((t) => {
        const selected = t.id === value
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`overflow-hidden rounded-xl border-2 text-left transition ${selected ? 'border-[var(--accent-600)] shadow-md' : 'border-transparent'}`}
          >
            <div
              className={`relative ${compact ? 'h-14' : 'h-20'} p-2`}
              style={{
                backgroundColor: t.base,
                backgroundImage: [t.motifColor && braidTile(t.motifColor), t.background].filter(Boolean).join(', '),
                backgroundRepeat: 'repeat-y, no-repeat',
                backgroundPosition: 'right 2px top, center',
                backgroundSize: '10px auto, cover',
              }}
            >
              <div className="mr-3 flex h-full flex-col justify-end rounded-md p-1.5" style={{ backgroundColor: t.dark ? '#221d35' : 'rgba(255,255,255,0.85)' }}>
                <span className="text-sm font-semibold leading-none" style={{ fontFamily: t.displayFont, color: t.dark ? '#eeeaf7' : t.accent }}>
                  Aa
                </span>
                <span className="mt-1 h-1.5 w-8 rounded-full" style={{ backgroundColor: t.accent }} />
              </div>
              {selected && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-600)] text-[10px] text-white">
                  ✓
                </span>
              )}
            </div>
            <div className="bg-white px-2 py-1.5">
              <p className="truncate text-xs font-semibold text-stone-700">{t.name}</p>
              {!compact && <p className="truncate text-[11px] text-stone-400">{t.tagline}</p>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
