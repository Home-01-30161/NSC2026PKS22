"use client"

import type { OperatorCard } from "@/lib/game/types"
import { PixelButton } from "./retro/PixelButton"
import { PixelIcon } from "./retro/PixelIcon"
import { canSpecial, rankUpCost } from "@/lib/game/state"
import { playSfx } from "@/lib/sound"
import { cn } from "@/lib/utils"

interface ActionBarProps {
  active: OperatorCard | null
  hasTakenAction: boolean
  isPlayerTurn: boolean
  swapMode: boolean
  onBasicAttack: () => void
  onSpecial: () => void
  onDefend: () => void
  onToggleSwap: () => void
  onRankUp: () => void
  onEndTurn: () => void
}

export function ActionBar({
  active,
  hasTakenAction,
  isPlayerTurn,
  swapMode,
  onBasicAttack,
  onSpecial,
  onDefend,
  onToggleSwap,
  onRankUp,
  onEndTurn,
}: ActionBarProps) {
  const disabled = !isPlayerTurn || hasTakenAction || !active
  const sp = canSpecial(active)
  const ruCost = active ? rankUpCost(active) : null
  const canRankUp = !!active && ruCost !== null && active.momentum >= ruCost

  return (
    <div className="pixel-panel rounded-none p-2 flex flex-wrap gap-2 items-center">
      <div className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground px-2 inline-flex items-center gap-1">
        <span className={cn(!disabled && "animate-pixel-blink text-primary")} aria-hidden>
          {"▶"}
        </span>
        ACTION
      </div>
      <PixelButton
        variant="primary"
        disabled={disabled}
        silent
        onClick={() => {
          playSfx("attack")
          onBasicAttack()
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <PixelIcon name="sword" className="w-3 h-3" /> Attack
        </span>
      </PixelButton>
      <PixelButton
        disabled={disabled || !sp.ok}
        title={sp.reason}
        silent
        onClick={() => {
          playSfx("attack")
          onSpecial()
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <PixelIcon name="star" className="w-3 h-3" />
          {active?.specialSkillName ?? "Special"}
          {!sp.ok && active && sp.reason ? ` · ${sp.reason}` : ""}
        </span>
      </PixelButton>
      <PixelButton disabled={disabled} onClick={onDefend}>
        <span className="inline-flex items-center gap-1.5">
          <PixelIcon name="shield" className="w-3 h-3" /> Defend
        </span>
      </PixelButton>
      <PixelButton
        disabled={disabled}
        silent
        className={cn(swapMode && "bg-primary text-primary-foreground")}
        onClick={() => {
          playSfx("swap")
          onToggleSwap()
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <PixelIcon name="swap" className="w-3 h-3" /> {swapMode ? "Pick bench…" : "Swap"}
        </span>
      </PixelButton>
      {ruCost !== null && (
        <PixelButton
          disabled={!isPlayerTurn || !canRankUp}
          silent
          className={cn(canRankUp && "bg-primary text-primary-foreground animate-pixel-blink")}
          onClick={() => {
            playSfx("rankUp")
            onRankUp()
          }}
          title={
            canRankUp
              ? `Spend ${ruCost} momentum to rank up`
              : `Needs ${ruCost} momentum (have ${active?.momentum ?? 0})`
          }
        >
          <span className="inline-flex items-center gap-1.5">
            <PixelIcon name="star" className="w-3 h-3" /> Rank Up ({active?.momentum ?? 0}/{ruCost})
          </span>
        </PixelButton>
      )}
      <div className="ml-auto">
        <PixelButton variant="ghost" onClick={onEndTurn} disabled={!isPlayerTurn}>
          {"End turn >"}
        </PixelButton>
      </div>
    </div>
  )
}
