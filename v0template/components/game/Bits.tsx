"use client"

import { cn } from "@/lib/utils"

export function HpBar({
  hp,
  maxHp,
  side,
  size = "md",
}: {
  hp: number
  maxHp: number
  side: "player" | "opponent"
  size?: "sm" | "md" | "lg"
}) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  const low = pct < 33
  return (
    <div
      className={cn(
        "w-full rounded-full bg-secondary overflow-hidden border border-border/60",
        size === "sm" && "h-1.5",
        size === "md" && "h-2",
        size === "lg" && "h-3",
      )}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 rounded-full",
          low
            ? "bg-destructive"
            : side === "player"
            ? "bg-[var(--player)]"
            : "bg-[var(--opponent)]",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function EnergyPips({
  energy,
  maxEnergy,
  side,
}: {
  energy: number
  maxEnergy: number
  side: "player" | "opponent"
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxEnergy }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-2 h-2 rounded-full border",
            i < energy
              ? side === "player"
                ? "bg-[var(--player)] border-[var(--player)]"
                : "bg-[var(--opponent)] border-[var(--opponent)]"
              : "bg-transparent border-border",
          )}
        />
      ))}
    </div>
  )
}

export function StatChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string | number
  tone?: "neutral" | "atk" | "def" | "energy"
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-mono",
        tone === "neutral" && "border-border bg-secondary/60",
        tone === "atk" && "border-destructive/40 bg-destructive/10 text-destructive",
        tone === "def" && "border-border bg-secondary/60",
        tone === "energy" && "border-[var(--energy)]/40 bg-[var(--energy)]/10 text-[var(--energy)]",
      )}
    >
      <span className="uppercase tracking-wider text-[12px] text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

export function RankBadge({ rank }: { rank: 1 | 2 | 3 }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider border",
        rank === 1 && "border-border bg-secondary/60 text-muted-foreground",
        rank === 2 && "border-[var(--player)]/40 bg-[var(--player)]/10 text-[var(--player)]",
        rank === 3 && "border-[var(--player)] bg-[var(--player)] text-[var(--player-foreground)]",
      )}
    >
      R{rank}
    </div>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background/40 px-1.5 py-0.5 text-[12px] font-mono uppercase tracking-wider text-muted-foreground">
      {category}
    </span>
  )
}
