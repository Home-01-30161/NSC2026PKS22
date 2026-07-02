"use client"

import type { OperatorCard } from "@/lib/game/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const SIDE_RING: Record<string, string> = {
  player: "ring-amber-400/60",
  opponent: "ring-cyan-400/60",
  none: "ring-border",
}

export function OperatorAvatar({
  op,
  size = "md",
  flip = false,
  defeated = false,
  side,
}: {
  op: OperatorCard
  size?: "sm" | "md" | "lg" | "xl"
  flip?: boolean
  defeated?: boolean
  side?: "player" | "opponent"
}) {
  const dim = {
    sm: "w-10 h-10 text-[11px]",
    md: "w-14 h-14 text-[12px]",
    lg: "w-20 h-20 text-xs",
    xl: "w-32 h-32 md:w-40 md:h-40 text-sm",
  }[size]
  const ring = SIDE_RING[side ?? "none"]
  const pixelSize = size === "xl" ? 160 : size === "lg" ? 80 : size === "md" ? 56 : 40
  return (
    <div
      className={cn(
        "relative rounded-none overflow-hidden ring-2 bg-secondary/60 shrink-0",
        dim,
        ring,
        defeated && "grayscale opacity-40",
      )}
      aria-label={op.name}
    >
      {op.image ? (
        <Image
          src={op.image}
          alt=""
          width={pixelSize}
          height={pixelSize}
          className={cn(
            "w-full h-full object-cover scale-[1.35]",
            flip && "-scale-x-[1.35]",
          )}
          style={{ imageRendering: "pixelated", objectPosition: "center 28%" }}
          unoptimized
          priority={size === "xl"}
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center font-bold text-foreground",
            flip && "scale-x-[-1]",
          )}
        >
          <span className={cn(flip && "scale-x-[-1]")}>{initialsOf(op.name)}</span>
        </div>
      )}
      {/* Initials chip in corner so the muscle-memory abbreviation stays visible */}
      <span
        className={cn(
          "absolute bottom-0 right-0 px-1 py-0.5 font-pixel text-[9px] leading-none bg-background/80 text-foreground border-t border-l border-border",
          size === "xl" && "text-[11px] px-1.5 py-1",
        )}
      >
        {initialsOf(op.name)}
      </span>
    </div>
  )
}
