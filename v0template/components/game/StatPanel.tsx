"use client"

import type { OperatorCard } from "@/lib/game/types"
import { cn } from "@/lib/utils"
import { getEffectiveAtk, getEffectiveDef } from "@/lib/game/state"
import { SegmentedBar } from "./retro/SegmentedBar"
import { PixelIcon } from "./retro/PixelIcon"

export function StatPanel({
  op,
  side,
  align = "left",
}: {
  op: OperatorCard | null
  side: "player" | "opponent"
  align?: "left" | "right"
}) {
  if (!op) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 p-3",
          align === "right" && "items-end text-right",
        )}
      >
        <div className="text-base text-muted-foreground italic">No active operator</div>
      </div>
    )
  }
  const atk = getEffectiveAtk(op)
  const def = getEffectiveDef(op)

  const stats = (
    <div className={cn("flex items-center gap-2", align === "right" && "flex-row-reverse")}>
      <span className="inline-flex items-center gap-1 border-2 border-border bg-card px-1.5 py-0.5 font-pixel text-[12px]">
        <PixelIcon name="shield" className="w-3 h-3 text-cyan-400" />
        <span>{def}</span>
      </span>
      <span className="inline-flex items-center gap-1 border-2 border-border bg-card px-1.5 py-0.5 font-pixel text-[12px]">
        <PixelIcon name="sword" className="w-3 h-3 text-rose-400" />
        <span>{atk}</span>
        {op.nextDamageBonus > 0 && <span className="text-amber-400">+{op.nextDamageBonus}</span>}
      </span>
    </div>
  )

  return (
    <div className={cn("flex flex-col gap-2 p-3 min-w-0", align === "right" && "items-end")}>
      {/* Name + rank */}
      <div className={cn("flex items-baseline gap-2", align === "right" && "flex-row-reverse")}>
        <h3 className="font-pixel text-[12px] md:text-sm leading-relaxed truncate">{op.name}</h3>
        <span
          className={cn(
            "font-pixel text-[12px] px-1 py-0.5 text-slate-900",
            side === "player" ? "bg-primary" : "bg-accent",
          )}
        >
          R{op.rank}
        </span>
      </div>
      {/* Category */}
      <div className={cn("text-sm uppercase tracking-[0.15em] text-muted-foreground", align === "right" && "text-right")}>
        {op.category}
      </div>
      {/* Stat chips */}
      {stats}
      {/* HP bar */}
      <div className={cn("w-full flex items-center gap-2", align === "right" && "flex-row-reverse")}>
        <span className="font-pixel text-[12px] bg-heal text-slate-900 px-1.5 py-0.5">HP</span>
        <SegmentedBar value={Math.max(0, op.hp)} max={op.maxHp} segments={12} color="hp" className="flex-1" />
        <span className="font-pixel text-[12px] tabular-nums w-14 text-right">
          {Math.max(0, op.hp)}/{op.maxHp}
        </span>
      </div>
      {/* Energy bar */}
      <div className={cn("w-full flex items-center gap-2", align === "right" && "flex-row-reverse")}>
        <span className="font-pixel text-[12px] bg-accent text-slate-900 px-1.5 py-0.5 inline-flex items-center gap-0.5">
          <PixelIcon name="bolt" className="w-3 h-3" /> EN
        </span>
        <SegmentedBar value={op.energy} max={op.maxEnergy} segments={op.maxEnergy} color="energy" className="flex-1" />
        <span className="font-pixel text-[12px] tabular-nums w-14 text-right">
          {op.energy}/{op.maxEnergy}
        </span>
      </div>
      {/* Skill hint */}
      <div className={cn("font-sans text-base text-foreground leading-relaxed", align === "right" && "text-right")}>
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <PixelIcon name="star" className="w-3 h-3 text-amber-400" />
          <span className="font-semibold text-foreground">{op.specialSkillName}</span>
          <span className="text-muted-foreground">· {op.specialSkillCost} EN</span>
        </span>
        <div className="mt-1 text-[17px] leading-relaxed text-foreground">{op.specialSkillDescription}</div>
      </div>
    </div>
  )
}
