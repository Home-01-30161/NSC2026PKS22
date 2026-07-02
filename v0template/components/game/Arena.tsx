"use client"

import { useEffect, useState } from "react"
import type { OperatorCard } from "@/lib/game/types"
import { OperatorBattleCard } from "./OperatorBattleCard"
import { HitBurst } from "./HitBurst"
import { playSfx } from "@/lib/sound"
import { cn } from "@/lib/utils"

interface ArenaProps {
  player: OperatorCard | null
  opponent: OperatorCard | null
  message?: string
  isPlayerTurn: boolean
  damageFlash?: { side: "player" | "opponent"; amount: number; key: number } | null
  highlightOpponent?: boolean
  onOpponentClick?: () => void
}

export function Arena({
  player,
  opponent,
  message,
  isPlayerTurn,
  damageFlash,
  highlightOpponent,
  onOpponentClick,
}: ArenaProps) {
  // VS splash on battle start
  const [showSplash, setShowSplash] = useState(true)
  useEffect(() => {
    playSfx("start")
    const t = setTimeout(() => setShowSplash(false), 1600)
    return () => clearTimeout(t)
  }, [])

  // Hit SFX + attacker lunge when damage lands
  useEffect(() => {
    if (!damageFlash) return
    playSfx("hit")
  }, [damageFlash?.key])

  const playerLunges = damageFlash?.side === "opponent"
  const opponentLunges = damageFlash?.side === "player"

  return (
    <section className="relative w-full overflow-hidden rounded-none border-2 border-border pixel-shadow">
      {/* Pixel-art arena background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/retro/arena-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-background/35" />
      <div aria-hidden className="absolute inset-0 scanlines" />
      <div aria-hidden className="absolute inset-0 crt-vignette" />

      {/* VS divider */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="font-pixel text-2xl md:text-3xl text-foreground/15 select-none">VS</div>
      </div>

      <div className="relative grid grid-cols-2 gap-3 md:gap-6 items-stretch p-4 md:p-6">
        {/* Player (left) */}
        <div className="relative flex flex-col items-center justify-end gap-2 max-w-sm justify-self-end w-full">
          {player && (
            <div
              key={playerLunges ? `lunge-${damageFlash?.key}` : undefined}
              className={cn(
                "w-full",
                damageFlash?.side === "player" && "animate-shake",
                playerLunges && "animate-lunge-right",
              )}
            >
              <OperatorBattleCard
                op={player}
                side="player"
                size="lg"
                active={isPlayerTurn}
                damageFlashKey={damageFlash?.side === "player" ? damageFlash.key : undefined}
                damageFlashAmount={damageFlash?.side === "player" ? damageFlash.amount : undefined}
              />
            </div>
          )}
          {damageFlash?.side === "player" && (
            <HitBurst amount={damageFlash.amount} side="player" triggerKey={damageFlash.key} />
          )}
        </div>

        {/* Opponent (right) */}
        <div className="relative flex flex-col items-center justify-end gap-2 max-w-sm justify-self-start w-full">
          {opponent && (
            <button
              type="button"
              onClick={onOpponentClick}
              disabled={!onOpponentClick}
              key={opponentLunges ? `lunge-${damageFlash?.key}` : undefined}
              className={cn(
                "w-full rounded-none",
                damageFlash?.side === "opponent" && "animate-shake",
                opponentLunges && "animate-lunge-left",
                highlightOpponent && "ring-4 ring-primary/80 animate-pixel-blink-fast cursor-pointer",
                onOpponentClick && !highlightOpponent && "cursor-pointer",
                !onOpponentClick && "cursor-default",
              )}
            >
              <OperatorBattleCard
                op={opponent}
                side="opponent"
                size="lg"
                active={!isPlayerTurn}
                damageFlashKey={damageFlash?.side === "opponent" ? damageFlash.key : undefined}
                damageFlashAmount={damageFlash?.side === "opponent" ? damageFlash.amount : undefined}
              />
            </button>
          )}
          {damageFlash?.side === "opponent" && (
            <HitBurst amount={damageFlash.amount} side="opponent" triggerKey={damageFlash.key} />
          )}
        </div>
      </div>

      {/* Floating message bubble — JRPG dialogue style */}
      {message && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 max-w-[92%] border-2 border-foreground/60 bg-background/95 px-4 py-1.5 z-20 pixel-shadow-sm">
          <p className="text-base text-center text-foreground whitespace-nowrap overflow-hidden text-ellipsis leading-snug">
            {message}
          </p>
        </div>
      )}

      {/* VS splash intro */}
      {showSplash && player && opponent && (
        <div className="absolute inset-0 z-40 bg-background/90 flex items-center justify-center overflow-hidden">
          <div className="flex items-center gap-4 md:gap-10 w-full justify-center px-4">
            <div className="w-32 md:w-48 animate-slam-in-left">
              <OperatorBattleCard op={player} side="player" size="md" />
            </div>
            <div className="font-pixel text-3xl md:text-5xl text-primary animate-vs-flash drop-shadow-[4px_4px_0_oklch(0.08_0.01_250)]">
              VS
            </div>
            <div className="w-32 md:w-48 animate-slam-in-right">
              <OperatorBattleCard op={opponent} side="opponent" size="md" flip />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
