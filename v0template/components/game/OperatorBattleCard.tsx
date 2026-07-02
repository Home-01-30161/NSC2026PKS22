"use client"

import { useEffect, useRef, useState } from "react"
import type { OperatorCard } from "@/lib/game/types"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { getEffectiveAtk, getEffectiveDef } from "@/lib/game/state"
import { SegmentedBar } from "./retro/SegmentedBar"
import { PixelIcon } from "./retro/PixelIcon"

type Size = "sm" | "md" | "lg"

const SIZE_CLASSES: Record<Size, string> = {
  sm: "w-full aspect-[3/4] text-[12px]",
  md: "w-full aspect-[3/4] text-xs",
  lg: "w-full aspect-[3/4] text-sm",
}

/** Rank-based pixel frame colors: R1 bronze, R2 silver, R3 gold */
const RANK_FRAME: Record<number, { border: string; inner: string }> = {
  1: { border: "oklch(0.55 0.09 55)", inner: "oklch(0.35 0.06 55)" },
  2: { border: "oklch(0.75 0.01 250)", inner: "oklch(0.5 0.01 250)" },
  3: { border: "oklch(0.8 0.15 85)", inner: "oklch(0.55 0.12 85)" },
}

interface OperatorBattleCardProps {
  op: OperatorCard
  side: "player" | "opponent"
  size?: Size
  defeated?: boolean
  active?: boolean
  damageFlashKey?: number
  damageFlashAmount?: number
  flip?: boolean
  className?: string
}

export function OperatorBattleCard({
  op,
  side,
  size = "md",
  defeated = false,
  active = false,
  damageFlashKey,
  damageFlashAmount,
  flip = false,
  className,
}: OperatorBattleCardProps) {
  const atk = getEffectiveAtk(op)
  const def = getEffectiveDef(op)
  const isPlayer = side === "player"
  const frame = RANK_FRAME[Math.min(3, Math.max(1, op.rank))]

  // Rank-up gold palette flash
  const prevRankRef = useRef(op.rank)
  const [rankFlashKey, setRankFlashKey] = useState(0)
  useEffect(() => {
    if (op.rank > prevRankRef.current) {
      setRankFlashKey(Date.now())
    }
    prevRankRef.current = op.rank
  }, [op.rank])

  // KO flicker on transition to defeated
  const prevDefeatedRef = useRef(defeated)
  const [justKoed, setJustKoed] = useState(false)
  useEffect(() => {
    if (defeated && !prevDefeatedRef.current) {
      setJustKoed(true)
      const t = setTimeout(() => setJustKoed(false), 900)
      return () => clearTimeout(t)
    }
    prevDefeatedRef.current = defeated
  }, [defeated])

  // Transient white hit flash + damage popup — unmount after each damage event
  const [showFlash, setShowFlash] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  useEffect(() => {
    if (damageFlashKey === undefined) return
    setShowFlash(true)
    setShowPopup(true)
    const t1 = setTimeout(() => setShowFlash(false), 400)
    const t2 = setTimeout(() => setShowPopup(false), 1300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [damageFlashKey])

  return (
    <div
      key={rankFlashKey || undefined}
      className={cn(
        "relative overflow-hidden bg-slate-900 select-none rounded-none",
        SIZE_CLASSES[size],
        rankFlashKey > 0 && "animate-palette-flash-gold",
        justKoed && "animate-ko-flicker",
        defeated && !justKoed && "grayscale opacity-50",
        className,
      )}
      style={{
        border: `3px solid ${frame.border}`,
        boxShadow: `inset 0 0 0 2px ${frame.inner}, 4px 4px 0 0 oklch(0.08 0.01 250)${
          active
            ? isPlayer
              ? ", 0 0 18px oklch(0.78 0.16 70 / 0.5)"
              : ", 0 0 18px oklch(0.7 0.13 220 / 0.5)"
            : ""
        }`,
      }}
      aria-label={op.name}
    >
      {/* Portrait */}
      {op.image ? (
        <Image
          src={op.image}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className={cn("object-cover", flip && "-scale-x-100")}
          style={{ imageRendering: "pixelated", objectPosition: "center top" }}
          unoptimized
          priority={size === "lg"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-pixel text-2xl text-foreground">
          {op.name.charAt(0)}
        </div>
      )}

      {/* 1-frame white hit flash */}
      {showFlash && (
        <div
          key={`flash-${damageFlashKey}`}
          className="absolute inset-0 bg-white z-30 pointer-events-none animate-hit-flash opacity-0"
        />
      )}

      {/* Top gradient + HP */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none" />
      <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className="font-pixel text-[12px] px-1 py-0.5 leading-none text-slate-900"
            style={{ backgroundColor: frame.border }}
          >
            R{op.rank}
          </span>
          <div className="flex items-center gap-1 font-pixel text-[12px] text-foreground">
            <PixelIcon name="heart" className="w-3 h-3 text-heal" />
            <span className="tabular-nums">
              {Math.max(0, op.hp)}
              <span className="text-foreground/50">/{op.maxHp}</span>
            </span>
          </div>
        </div>
        <SegmentedBar value={Math.max(0, op.hp)} max={op.maxHp} segments={12} color="hp" />
        <RankGauge rank={op.rank} momentum={op.momentum} />
      </div>

      {/* Status chips */}
      <div className="absolute top-14 right-1.5 z-10 flex flex-col items-end gap-1 max-w-[60%]">
        {op.shield > 0 && (
          <Chip tone="cyan">
            <PixelIcon name="shield" className="w-2.5 h-2.5" /> {op.shield}
          </Chip>
        )}
        {op.isDefending && (
          <Chip tone="cyan">
            <PixelIcon name="shield" className="w-2.5 h-2.5" /> DEF
          </Chip>
        )}
        {op.skillBlockedTurns > 0 && (
          <Chip tone="rose">
            <PixelIcon name="skull" className="w-2.5 h-2.5" /> BLK
          </Chip>
        )}
        {op.nextDamageBonus > 0 && (
          <Chip tone="amber">
            <PixelIcon name="star" className="w-2.5 h-2.5" /> +{op.nextDamageBonus}
          </Chip>
        )}
      </div>

      {/* Damage popup */}
      {showPopup && typeof damageFlashAmount === "number" && damageFlashKey !== undefined && (
        <span
          key={damageFlashKey}
          className="absolute top-1/3 left-1/2 font-pixel text-xl text-destructive drop-shadow-[2px_2px_0_oklch(0.08_0.01_250)] animate-damage-pop z-20 pointer-events-none"
        >
          -{damageFlashAmount}
        </span>
      )}

      {/* KO stamp + pixel shatter */}
      {defeated && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <span className="font-pixel text-lg px-3 py-1.5 bg-destructive/30 border-2 border-destructive text-destructive-foreground rotate-[-8deg]">
            K.O.
          </span>
        </div>
      )}
      {justKoed && <PixelShatter />}

      {/* Bottom info strip */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-slate-950/85 border-t-2 px-2 pt-1.5 pb-1.5" style={{ borderColor: frame.inner }}>
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className="font-pixel text-[12px] leading-relaxed truncate text-foreground">{op.name}</h3>
          <span
            className={cn(
              "text-[12px] uppercase tracking-wider shrink-0",
              isPlayer ? "text-primary" : "text-accent",
            )}
          >
            {op.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-pixel text-[12px]">
          <span className="inline-flex items-center gap-1 border border-rose-400/40 bg-rose-500/10 text-rose-200 px-1 py-0.5">
            <PixelIcon name="sword" className="w-3 h-3" />
            <span className="text-foreground tabular-nums">{atk}</span>
          </span>
          <span className="inline-flex items-center gap-1 border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 px-1 py-0.5">
            <PixelIcon name="shield" className="w-3 h-3" />
            <span className="text-foreground tabular-nums">{def}</span>
          </span>
          <span className="inline-flex items-center gap-1 border border-amber-400/40 bg-amber-500/10 text-amber-200 px-1 py-0.5">
            <PixelIcon name="bolt" className="w-3 h-3" />
            <span className="text-foreground tabular-nums">
              {op.energy}/{op.maxEnergy}
            </span>
          </span>
        </div>
        {op.attachedFeatures.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {op.attachedFeatures.map((f) => (
              <span
                key={f.instanceId}
                title={f.description}
                className="text-[12px] uppercase tracking-wider border border-violet-400/40 bg-violet-500/15 text-violet-200 px-1 py-0.5"
              >
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Small pixel squares scattering outward on KO */
function PixelShatter() {
  const particles = Array.from({ length: 14 })
  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2
        const dist = 50 + (i % 4) * 18
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 w-2 h-2 bg-destructive animate-pixel-scatter"
            style={
              {
                "--scatter-x": `${Math.cos(angle) * dist}px`,
                "--scatter-y": `${Math.sin(angle) * dist}px`,
                animationDelay: `${(i % 5) * 40}ms`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: "cyan" | "rose" | "amber"
}) {
  const cls = {
    cyan: "border-cyan-400/40 bg-cyan-500/20 text-cyan-100",
    rose: "border-rose-400/40 bg-rose-500/20 text-rose-100",
    amber: "border-amber-400/40 bg-amber-500/20 text-amber-100",
  }[tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1 py-0.5 font-pixel text-[12px] uppercase tracking-wider",
        cls,
      )}
    >
      {children}
    </span>
  )
}

function RankGauge({ rank, momentum }: { rank: number; momentum: number }) {
  if (rank >= 3) {
    return (
      <div title="Rank maxed" className="flex items-center gap-1">
        <span className="font-pixel text-[12px] uppercase tracking-wider text-amber-200">RANK</span>
        <div className="flex-1 h-1.5 border border-amber-300/60 bg-amber-300" />
        <span className="font-pixel text-[12px] uppercase text-amber-300">MAX</span>
      </div>
    )
  }
  const cost = rank === 1 ? 2 : 3
  const ready = momentum >= cost
  return (
    <div
      title={`Rank up gauge ${Math.min(momentum, cost)}/${cost} — ${ready ? "Ready! Spend on Rank Up." : "Land basic attacks to fill."}`}
      className="flex items-center gap-1"
    >
      <span className="font-pixel text-[12px] uppercase tracking-wider text-amber-200">RANK</span>
      <div className="flex-1 flex gap-px border border-amber-400/40 bg-slate-900/80 p-px">
        {Array.from({ length: cost }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1",
              i < momentum ? (ready ? "bg-amber-300 animate-pixel-blink-fast" : "bg-amber-400") : "bg-muted/40",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "font-pixel text-[12px] tabular-nums",
          ready ? "text-amber-300 animate-pixel-blink" : "text-amber-200",
        )}
      >
        {ready ? "RDY" : `${Math.min(momentum, cost)}/${cost}`}
      </span>
    </div>
  )
}
