"use client"

import { useEffect, useState } from "react"
import { isMuted, setMuted, playSfx } from "@/lib/sound"
import { PixelIcon } from "./PixelIcon"
import { cn } from "@/lib/utils"

export function SoundToggle({
  className,
  onMutedChange,
}: {
  className?: string
  onMutedChange?: (muted: boolean) => void
}) {
  const [muted, setMutedState] = useState(false)

  useEffect(() => {
    setMutedState(isMuted())
  }, [])

  const toggle = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
    onMutedChange?.(next)
    if (!next) playSfx("select")
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      className={cn(
        "pixel-btn rounded-none p-1.5 bg-secondary text-secondary-foreground cursor-pointer",
        muted && "opacity-60",
        className,
      )}
    >
      <PixelIcon name={muted ? "speaker-off" : "speaker"} className="w-3.5 h-3.5" />
    </button>
  )
}
