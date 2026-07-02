"use client"

import type { OperatorCard } from "@/lib/game/types"
import { cn } from "@/lib/utils"
import { HpBar, RankBadge } from "./Bits"
import { Zap } from "lucide-react"

interface BenchOperatorProps {
  op: OperatorCard
  side: "player" | "opponent"
  defeated?: boolean
  highlight?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function BenchOperator({
  op,
  side,
  defeated,
  highlight,
  onClick,
  disabled,
}: BenchOperatorProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border bg-card px-2.5 py-2 text-left transition-all flex flex-col gap-1.5 min-w-0",
        side === "player" ? "border-border" : "border-border",
        defeated && "opacity-30 grayscale",
        highlight && "ring-2 ring-[var(--player)] ring-offset-2 ring-offset-background cursor-pointer animate-pulse border-[var(--player)]",
        !disabled && onClick && !highlight && "hover:border-foreground/30 cursor-pointer",
        disabled && "cursor-not-allowed",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold truncate">{op.name}</div>
        <RankBadge rank={op.rank} />
      </div>
      <div className="flex items-center justify-between gap-2 text-[12px] font-mono text-muted-foreground">
        <span>{op.category}</span>
        <span className="inline-flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5 text-[var(--energy)]" />
          {op.energy}/{op.maxEnergy}
        </span>
      </div>
      <HpBar hp={op.hp} maxHp={op.maxHp} side={side} size="sm" />
      <div className="text-[12px] font-mono text-muted-foreground">
        {Math.max(0, op.hp)}/{op.maxHp} HP
      </div>
    </button>
  )
}

export function DefeatedSlot({ op }: { op: OperatorCard }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-background/40 px-2.5 py-2 opacity-40">
      <div className="text-xs font-semibold truncate line-through">{op.name}</div>
      <div className="text-[12px] font-mono text-muted-foreground">Defeated</div>
    </div>
  )
}

export function EmptyBenchSlot() {
  return (
    <div className="rounded-lg border border-dashed border-border/40 bg-background/20 px-2.5 py-2 min-h-[68px]" />
  )
}
