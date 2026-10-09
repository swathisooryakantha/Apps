/** A row of kolam-style dots and loops, used as a decorative divider. */
export default function KolamDivider() {
  const loops = Array.from({ length: 7 }, (_, i) => 20 + i * 40)
  return (
    <svg viewBox="0 0 300 24" className="mx-auto mb-5 h-5 w-64 max-w-full" aria-hidden>
      <g fill="none" strokeWidth="1.3" style={{ stroke: 'var(--accent-400)' }}>
        {loops.map((x) => (
          <path key={x} d={`M${x} 2 C${x + 10} 6 ${x + 10} 6 ${x + 10} 12 C${x + 10} 18 ${x + 10} 18 ${x} 22 C${x - 10} 18 ${x - 10} 18 ${x - 10} 12 C${x - 10} 6 ${x - 10} 6 ${x} 2Z`} />
        ))}
        <path d="M0 12 H300" strokeDasharray="2 6" />
      </g>
      <g style={{ fill: 'var(--accent-600)' }}>
        {loops.map((x) => (
          <circle key={x} cx={x} cy="12" r="1.8" />
        ))}
      </g>
    </svg>
  )
}
