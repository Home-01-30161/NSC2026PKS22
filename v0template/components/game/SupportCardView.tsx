"use client"

import type { SupportCard } from "@/lib/game/types"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"
import { PixelIcon, type PixelIconName } from "./retro/PixelIcon"

interface SupportCardViewProps {
  card: SupportCard
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  onInfo?: () => void
}

const TYPE_META: Record<
  SupportCard["type"],
  { label: string; icon: PixelIconName; panel: string; chip: string }
> = {
  resource: {
    label: "Resource",
    icon: "coin",
    panel: "pixel-panel-player",
    chip: "bg-[var(--player)]/15 text-[var(--player)] border-[var(--player)]/30",
  },
  feature: {
    label: "Feature",
    icon: "star",
    panel: "pixel-panel-teal",
    chip: "bg-[var(--opponent)]/15 text-[var(--opponent)] border-[var(--opponent)]/30",
  },
  event: {
    label: "Event",
    icon: "bolt",
    panel: "pixel-panel-danger",
    chip: "bg-destructive/15 text-destructive border-destructive/30",
  },
}

export function SupportCardView({ card, selected, disabled, onClick, onInfo }: SupportCardViewProps) {
  const meta = TYPE_META[card.type]
  return (
    <div
      className={cn(
        "relative w-56 shrink-0 pixel-panel rounded-none text-left p-3 flex flex-col gap-2",
        meta.panel,
        selected && "-translate-y-1 ring-2 ring-[var(--player)]",
        !disabled && !selected && "hover:-translate-y-0.5",
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        aria-label={`Select ${card.name}`}
        className={cn(
          "absolute inset-0",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      />

      {/* Info button */}
      {onInfo && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onInfo()
          }}
          aria-label={`Info: ${card.name}`}
          className="absolute top-2 right-2 z-20 p-1 bg-background/70 hover:bg-background border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="w-3 h-3" />
        </button>
      )}

      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <span
          className={cn(
            "inline-flex items-center gap-1 border px-1.5 py-0.5 font-pixel text-[12px] uppercase tracking-wider",
            meta.chip,
          )}
        >
          <PixelIcon name={meta.icon} className="w-3 h-3" />
          {meta.label}
        </span>
      </div>
      <div className="relative z-10 font-sans text-xl font-semibold leading-snug text-balance pointer-events-none">
        {card.name}
      </div>
      <div className="relative z-10 font-sans text-base text-foreground leading-relaxed line-clamp-4 flex-1 pointer-events-none">
        {card.description}
      </div>
    </div>
  )
}
