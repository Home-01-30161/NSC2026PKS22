"use client"

import { useEffect, useMemo } from "react"
import { PixelButton } from "@/components/game/retro/PixelButton"
import { PixelIcon } from "@/components/game/retro/PixelIcon"
import { playSfx } from "@/lib/sound"
import { cn } from "@/lib/utils"

interface WinLoseOverlayProps {
  winner: "player" | "opponent"
  reason: string | null
  turnNumber: number
  onPlayAgain: () => void
}

const CONFETTI_COLORS = ["#fbbf24", "#22d3ee", "#34d399", "#f87171", "#e2e8f0"]

function PixelConfetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: `${(i * 53) % 100}%`,
        delay: `${(i % 10) * 0.3}s`,
        duration: `${2.4 + (i % 5) * 0.5}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + (i % 3) * 3,
      })),
    [],
  )
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti-fall"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDelay: p.delay,
              "--fall-duration": p.duration,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function WinLoseOverlay({ winner, reason, turnNumber, onPlayAgain }: WinLoseOverlayProps) {
  const isWin = winner === "player"

  useEffect(() => {
    playSfx(isWin ? "victory" : "defeat")
  }, [isWin])

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-6">
      {isWin && <PixelConfetti />}
      <div
        className={cn(
          "max-w-md w-full pixel-panel bg-card p-8 text-center flex flex-col gap-5 relative",
          isWin ? "pixel-panel-gold" : "pixel-panel-danger",
        )}
      >
        <div
          className={cn(
            "mx-auto w-14 h-14 flex items-center justify-center border-2",
            isWin
              ? "bg-amber-400/15 border-amber-400/50 text-amber-300"
              : "bg-destructive/15 border-destructive/50 text-destructive",
          )}
        >
          <PixelIcon name={isWin ? "trophy" : "skull"} className="w-8 h-8" />
        </div>
        <div
          className={cn(
            "font-pixel text-[10px] uppercase tracking-[0.3em]",
            isWin ? "text-amber-300" : "text-destructive",
          )}
        >
          {isWin ? "Contract Won" : "Contract Lost"}
        </div>
        <h1
          className={cn(
            "font-pixel text-2xl md:text-3xl leading-relaxed text-balance",
            isWin ? "text-amber-300" : "text-destructive",
          )}
          style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.6)" }}
        >
          {isWin ? "CONTRACT SECURED" : "GAME OVER"}
        </h1>
        <p className="text-muted-foreground text-pretty leading-relaxed">
          {reason ?? "All Operators on the opposing side were defeated."}
        </p>
        <div className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">
          Turn {turnNumber}
        </div>
        <PixelButton
          variant={isWin ? "primary" : "danger"}
          className="w-full py-3 text-[12px]"
          onClick={onPlayAgain}
        >
          {isWin ? "PLAY AGAIN" : "CONTINUE?"}
        </PixelButton>
        {!isWin && (
          <div className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground animate-pixel-blink">
            Insert coin to retry
          </div>
        )}
      </div>
    </div>
  )
}
