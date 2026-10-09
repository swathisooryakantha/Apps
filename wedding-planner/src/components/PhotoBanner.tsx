import CoupleIllustration from './CoupleIllustration'

/** Dashboard header art. Shows an illustration until couples can upload their own photos. */
export default function PhotoBanner() {
  return (
    <div className="mb-5 flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--accent-50)] to-[var(--accent-100)] md:h-64">
      <CoupleIllustration className="h-full max-w-full py-3" />
    </div>
  )
}
