"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SegmentedBarProps {
  value: number
  max: number
  segments?: number
  color?: "hp" | "energy" | "enemy"
  className?: string
}

const colorClass = {
  hp: "bg-heal",
  energy: "bg-energy",
  enemy: "bg-opponent",
}

/** Mega Man style segmented bar. Cells flash white when lost. */
export function SegmentedBar({ value, max, segments = 10, color = "hp", className }: SegmentedBarProps) {
  const filled = max > 0 ? Math.ceil((Math.max(0, value) / max) * segments) : 0
  const prevFilledRef = useRef(filled)
  const [tickKey, setTickKey] = useState(0)
  const [lostFrom, setLostFrom] = useState<number | null>(null)

  useEffect(() => {
    if (filled < prevFilledRef.current) {
      setLostFrom(filled)
      setTickKey((k) => k + 1)
    }
    prevFilledRef.current = filled
  }, [filled])

  const lowHp = color === "hp" && max > 0 && value / max <= 0.3

  return (
    <div
      className={cn("flex gap-px border-2 border-border bg-background/80 p-px", className)}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const isFilled = i < filled
        const justLost = lostFrom !== null && i >= filled && i < prevFilledRef.current + 1
        return (
          <div
            key={`${i}-${justLost ? tickKey : 0}`}
            className={cn(
              "h-2 flex-1 min-w-1",
              isFilled
                ? lowHp
                  ? "bg-destructive animate-pixel-blink-fast"
                  : colorClass[color]
                : justLost
                  ? "animate-seg-tick"
                  : "bg-muted/40",
            )}
          />
        )
      })}
    </div>
  )
}
