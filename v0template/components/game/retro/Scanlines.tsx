/** Full-screen CRT overlay: scanlines + vignette + subtle flicker. Mount once per screen. */
export function Scanlines() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div className="absolute inset-0 scanlines crt-flicker" />
      <div className="absolute inset-0 crt-vignette" />
    </div>
  )
}
