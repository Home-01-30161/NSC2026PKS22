"use client"

import type { OperatorCard } from "@/lib/game/types"
import { OperatorAvatar } from "./Avatar"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"

interface TeamTileProps {
  op: OperatorCard
  side: "player" | "opponent"
  active?: boolean
  defeated?: boolean
  selectable?: boolean
  onClick?: () => void
  onInfo?: () => void
}

export function TeamTile({ op, side, active, defeated, selectable, onClick, onInfo }: TeamTileProps) {
  const interactive = !defeated && !!onClick
  const hpSegments = 6
  const filled = Math.ceil((Math.max(0, op.hp) / op.maxHp) * hpSegments)
  const lowHp = op.hp / op.maxHp < 0.33
  return (
    <div
      className={cn(
        "relative h-full border-2 bg-card p-2 flex flex-col items-center justify-between min-w-0 pixel-shadow-sm",
        active && (side === "player" ? "border-primary" : "border-accent"),
        !active && "border-border",
        selectable && !active && !defeated && "hover:border-foreground/60",
        defeated && "opacity-40",
      )}
    >
      {/* Click body */}
      <button
        type="button"
        onClick={interactive ? onClick : undefined}
        disabled={!interactive}
        aria-label={interactive ? `Select ${op.name}` : op.name}
        className={cn(
          "absolute inset-0",
          interactive ? "cursor-pointer" : "cursor-default",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      />

      {/* swap target cursor */}
      {selectable && !active && !defeated && (
        <span
          aria-hidden
          className="absolute inset-0 border-2 border-primary animate-pixel-blink-fast pointer-events-none z-10"
        />
      )}

      {/* Rank badge */}
      <span
        className={cn(
          "absolute top-1 left-1 z-10 font-pixel text-[10px] px-1 py-0.5 text-slate-900",
          side === "player" ? "bg-primary" : "bg-accent",
        )}
      >
        {op.rank}
      </span>

      {/* Info button */}
      {onInfo && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onInfo()
          }}
          aria-label={`Info: ${op.name}`}
          className="absolute top-1 right-1 z-20 p-1 bg-background/70 hover:bg-background border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="w-3 h-3" />
        </button>
      )}

      <div className="relative z-10 pointer-events-none flex-1 flex items-center justify-center">
        <OperatorAvatar op={op} size="md" flip={side === "opponent"} defeated={defeated} side={side} />
      </div>
      {/* Segmented mini HP bar */}
      <div className="relative z-10 w-full pointer-events-none flex gap-px border border-border bg-background/60 p-px">
        {Array.from({ length: hpSegments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1",
              defeated
                ? "bg-destructive/60"
                : i < filled
                  ? lowHp
                    ? "bg-destructive"
                    : "bg-heal"
                  : "bg-muted/40",
            )}
          />
        ))}
      </div>
      {defeated ? (
        <span className="relative z-10 font-pixel text-[9px] uppercase tracking-wider text-destructive pointer-events-none">
          KO
        </span>
      ) : (
        <span className="relative z-10 font-pixel text-[9px] text-muted-foreground tabular-nums pointer-events-none">
          {Math.max(0, op.hp)}/{op.maxHp}
        </span>
      )}
    </div>
  )
}

export function EmptyTeamTile() {
  return (
    <div className="h-full border-2 border-dashed border-border/40 bg-background/20 min-h-[88px]" />
  )
}

interface RosterSlot {
  op: OperatorCard
  isActive: boolean
  isDefeated: boolean
}

interface TeamRailProps {
  label: string
  side: "player" | "opponent"
  roster: RosterSlot[]
  renderSlot: (slot: RosterSlot) => React.ReactNode
}

export function TeamRail({ label, side, roster, renderSlot }: TeamRailProps) {
  return (
    <div
      className={cn(
        "shrink-0 w-[112px] md:w-[124px] flex flex-col gap-1.5 border-2 bg-card/40 p-1.5",
        side === "player" ? "border-primary/30" : "border-accent/30",
      )}
      aria-label={label}
    >
      <div
        className={cn(
          "font-pixel text-[9px] uppercase tracking-[0.15em] text-center py-1",
          side === "player" ? "text-primary bg-primary/10" : "text-accent bg-accent/10",
        )}
      >
        {label}
      </div>
      <div className="flex-1 grid grid-rows-4 gap-1.5 min-h-0">
        {Array.from({ length: 4 }).map((_, i) => {
          const slot = roster[i]
          if (!slot) return <EmptyTeamTile key={i} />
          return <div key={slot.op.id} className="min-h-0">{renderSlot(slot)}</div>
        })}
      </div>
    </div>
  )
}
