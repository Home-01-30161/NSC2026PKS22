"use client"

import type { OperatorCard } from "@/lib/game/types"
import { cn } from "@/lib/utils"
import { HpBar, EnergyPips, StatChip, RankBadge, CategoryBadge } from "./Bits"
import { getEffectiveAtk, getEffectiveDef } from "@/lib/game/state"
import { Shield, Sword, Zap, Sparkles, Ban, ShieldCheck } from "lucide-react"

interface ActiveOperatorProps {
  op: OperatorCard
  side: "player" | "opponent"
  isCurrent: boolean
  highlightTarget?: boolean
  onClick?: () => void
  productLaunchActive?: boolean
}

export function ActiveOperator({
  op,
  side,
  isCurrent,
  highlightTarget,
  onClick,
  productLaunchActive,
}: ActiveOperatorProps) {
  const atk = getEffectiveAtk(op)
  const def = getEffectiveDef(op)
  const atkBoosted = atk !== op.atk || op.nextDamageBonus > 0
  const sideClass = side === "player" ? "border-[var(--player)]/50" : "border-[var(--opponent)]/50"
  const glow = isCurrent
    ? side === "player"
      ? "shadow-[0_0_0_2px_var(--player-soft),0_8px_32px_-12px_var(--player)]"
      : "shadow-[0_0_0_2px_var(--opponent-soft),0_8px_32px_-12px_var(--opponent)]"
    : ""

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group w-full text-left rounded-2xl border bg-card p-4 md:p-5 transition-all relative",
        sideClass,
        glow,
        highlightTarget &&
          "ring-2 ring-[var(--player)] ring-offset-2 ring-offset-background cursor-pointer animate-pulse",
        onClick && !highlightTarget && "hover:border-foreground/30 cursor-pointer",
        !onClick && "cursor-default",
      )}
    >
      {/* Top row: name + rank + category */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <RankBadge rank={op.rank} />
            <CategoryBadge category={op.category} />
            {op.shield > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--opponent)]/40 bg-[var(--opponent)]/10 px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider text-[var(--opponent)]">
                <ShieldCheck className="w-3 h-3" /> {op.shield}
              </span>
            )}
            {op.skillBlockedTurns > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider text-destructive">
                <Ban className="w-3 h-3" /> Skill blocked
              </span>
            )}
            {op.isDefending && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--opponent)]/40 bg-[var(--opponent)]/10 px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider text-[var(--opponent)]">
                <Shield className="w-3 h-3" /> Defending
              </span>
            )}
            {productLaunchActive && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--player)]/40 bg-[var(--player)]/10 px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider text-[var(--player)]">
                <Sparkles className="w-3 h-3" /> Launch
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight truncate">{op.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[12px] font-mono uppercase tracking-wider text-muted-foreground">
            {side === "player" ? "Your Active" : "Enemy Active"}
          </div>
          {op.momentum > 0 && (
            <div className="inline-flex items-center gap-1 rounded-md border border-[var(--player)]/40 bg-[var(--player)]/10 px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider text-[var(--player)]">
              <Sparkles className="w-3 h-3" /> {op.momentum} Momentum
            </div>
          )}
        </div>
      </div>

      {/* HP */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-mono uppercase tracking-wider text-muted-foreground">HP</span>
          <span className="text-sm font-mono">
            {Math.max(0, op.hp)}
            <span className="text-muted-foreground">/{op.maxHp}</span>
          </span>
        </div>
        <HpBar hp={op.hp} maxHp={op.maxHp} side={side} size="lg" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatChip
          label="ATK"
          value={atkBoosted ? `${atk}${op.nextDamageBonus > 0 ? `+${op.nextDamageBonus}` : ""}` : atk}
          tone="atk"
        />
        <StatChip label="DEF" value={def} tone="def" />
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--energy)]/40 bg-[var(--energy)]/10 px-2 py-1">
          <Zap className="w-3 h-3 text-[var(--energy)]" />
          <span className="text-[12px] font-mono uppercase tracking-wider text-[var(--energy)]">
            EN
          </span>
          <span className="text-xs font-mono text-[var(--energy)] font-semibold">
            {op.energy}/{op.maxEnergy}
          </span>
          <EnergyPips energy={op.energy} maxEnergy={op.maxEnergy} side={side} />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2 font-sans text-sm">
          <Sword className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <span className="font-medium">{op.basicAttackName}</span>
            <span className="text-muted-foreground"> — Basic attack</span>
          </div>
        </div>
        <div className="flex items-start gap-2 font-sans text-sm">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 text-[var(--player)] shrink-0" />
          <div className="min-w-0">
            <span className="font-medium">{op.specialSkillName}</span>
            <span className="text-muted-foreground"> · {op.specialSkillCost} EN</span>
            <div className="text-foreground text-base leading-relaxed">
              {op.specialSkillDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Attached features */}
      {op.attachedFeatures.length > 0 && (
        <div className="border-t border-border pt-2 flex flex-wrap gap-1.5">
          {op.attachedFeatures.map((f) => (
            <span
              key={f.instanceId}
              className="inline-flex items-center rounded-md border border-[var(--player)]/40 bg-[var(--player)]/10 px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider text-[var(--player)]"
            >
              {f.name}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
