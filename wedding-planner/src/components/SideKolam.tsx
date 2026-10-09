/** Braid kolam running down the right edge of the screen (the theme's decoration). */
export default function SideKolam() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0.5 z-30 w-3.5 bg-repeat-y opacity-80 md:right-2 md:w-5"
      style={{ backgroundImage: 'var(--side-braid)', backgroundSize: '100% auto' }}
    />
  )
}
