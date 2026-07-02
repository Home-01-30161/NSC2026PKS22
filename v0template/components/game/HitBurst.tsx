"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface HitBurstProps {
  amount: number
  side: "player" | "opponent"
  triggerKey: number
}

// Real pixel-art bursts extracted from the reference sheet.
const BURST_SPRITES = ["/effects/burst-1.png", "/effects/burst-2.png"]

/**
 * Street Fighter-style impact overlay using real pixel-art burst sprites
 * placed in the four corners of the card.
 */
export function HitBurst({ amount, triggerKey }: HitBurstProps) {
  const isCrit = amount >= 30
  const isSmash = amount >= 50
  const label = isSmash ? "SMASH!" : isCrit ? "CRIT!" : "HIT!"

  // Pick a deterministic-but-varying sprite + small rotation per corner.
  const corners = useMemo(() => {
    const k = Math.max(1, Number(triggerKey) || 1)
    const pick = (n: number) => BURST_SPRITES[(k * n) % BURST_SPRITES.length]
    const rot = (n: number) => ((k * n) % 60) - 30 // -30..+30 deg
    return [
      { pos: "top-0 left-0 -translate-x-1/3 -translate-y-1/3", delay: 0, src: pick(7), rotate: rot(11) },
      { pos: "top-0 right-0 translate-x-1/3 -translate-y-1/3", delay: 60, src: pick(13), rotate: rot(17) },
      { pos: "bottom-0 left-0 -translate-x-1/3 translate-y-1/3", delay: 90, src: pick(17), rotate: rot(23) },
      { pos: "bottom-0 right-0 translate-x-1/3 translate-y-1/3", delay: 40, src: pick(23), rotate: rot(29) },
    ]
  }, [triggerKey])

  return (
    <div
      key={triggerKey}
      className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      aria-hidden
    >
      {/* Quick white flash */}
      <div className="absolute inset-0 bg-white/20 mix-blend-screen animate-arena-flash" />

      {/* Corner bursts */}
      {corners.map((c, i) => (
        <div
          key={i}
          className={cn("absolute w-24 h-24 md:w-28 md:h-28 animate-hit-burst", c.pos)}
          style={{ animationDelay: `${c.delay}ms` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.src || "/placeholder.svg"}
            alt=""
            className="w-full h-full"
            style={{
              imageRendering: "pixelated",
              transform: `rotate(${c.rotate}deg)`,
              filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.6))",
            }}
          />
        </div>
      ))}

      {/* Center impact text + damage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 select-none">
        <div
          className={cn(
            "font-pixel tracking-wider leading-none animate-hit-text text-2xl md:text-3xl",
            isSmash ? "text-rose-400" : isCrit ? "text-amber-300" : "text-amber-200",
          )}
          style={{
            textShadow:
              "2px 0 0 #1a1a1a, -2px 0 0 #1a1a1a, 0 2px 0 #1a1a1a, 0 -2px 0 #1a1a1a, 3px 4px 0 rgba(0,0,0,0.55)",
          }}
        >
          {label}
        </div>
        <div
          className="font-pixel leading-none text-white animate-hit-text text-4xl md:text-5xl"
          style={{
            animationDelay: "60ms",
            textShadow:
              "2px 0 0 #1a1a1a, -2px 0 0 #1a1a1a, 0 2px 0 #1a1a1a, 0 -2px 0 #1a1a1a, 4px 5px 0 rgba(0,0,0,0.7)",
          }}
        >
          -{amount}
        </div>
      </div>
    </div>
  )
}
