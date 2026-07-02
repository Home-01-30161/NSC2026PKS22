"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ALL_OPERATOR_IDS, previewOperator, randomTeamIds } from "@/lib/game/cards"
import type { OperatorTemplateId } from "@/lib/game/types"
import { OperatorAvatar } from "./Avatar"
import { PixelPanel } from "./retro/PixelPanel"
import { PixelButton } from "./retro/PixelButton"
import { PixelIcon } from "./retro/PixelIcon"
import { SegmentedBar } from "./retro/SegmentedBar"
import { Scanlines } from "./retro/Scanlines"
import { SoundToggle } from "./retro/SoundToggle"
import { playLandingTrack, playSfx } from "@/lib/sound"
import { cn } from "@/lib/utils"
import { InfoModal } from "./InfoModal"

interface DraftScreenProps {
  onConfirm: (playerIds: OperatorTemplateId[], opponentIds: OperatorTemplateId[]) => void
  onBack: () => void
}

export function DraftScreen({ onConfirm, onBack }: DraftScreenProps) {
  const [picks, setPicks] = useState<OperatorTemplateId[]>([])
  const [focusedId, setFocusedId] = useState<OperatorTemplateId | null>(null)
  const [infoTarget, setInfoTarget] = useState<{
    kind: "operator"
    op: ReturnType<typeof previewOperator>
    side: "player" | "opponent"
    defeated: boolean
  } | null>(null)

  const previews = useMemo(
    () => Object.fromEntries(ALL_OPERATOR_IDS.map((id) => [id, previewOperator(id)])) as Record<
      OperatorTemplateId,
      ReturnType<typeof previewOperator>
    >,
    [],
  )

  const togglePick = (id: OperatorTemplateId) => {
    setPicks((prev) => {
      if (prev.includes(id)) {
        playSfx("swap")
        return prev.filter((p) => p !== id)
      }
      if (prev.length >= 4) return prev
      playSfx("select")
      return [...prev, id]
    })
  }

  const handleRandom = () => {
    playSfx("swap")
    setPicks(randomTeamIds())
  }
  const handleClear = () => setPicks([])
  const handleMutedChange = (muted: boolean) => {
    if (!muted) {
      playLandingTrack().catch(() => {})
    }
  }

  const handleConfirm = () => {
    if (picks.length !== 4) return
    playSfx("start")
    onConfirm(picks, randomTeamIds())
  }

  const focused = focusedId
    ? previews[focusedId]
    : picks.length > 0
      ? previews[picks[picks.length - 1]]
      : previews[ALL_OPERATOR_IDS[0]]

  const maxStat = 12 // rough cap for bar scaling

  return (
    <div className="min-h-dvh flex flex-col p-3 md:p-5 relative">
      <Scanlines />
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onBack}
              className="font-pixel text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground text-left cursor-pointer"
            >
              {"< BACK"}
            </button>
            <h1 className="font-pixel text-base md:text-xl text-balance">
              SELECT YOUR <span className="text-primary">OPERATORS</span>
            </h1>
            <p className="text-base text-muted-foreground">
              Pick 4 operators. Your opponent will draft randomly from the same pool.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SoundToggle onMutedChange={handleMutedChange} />
            <PixelButton variant="ghost" onClick={handleClear} disabled={picks.length === 0}>
              Clear
            </PixelButton>
            <PixelButton onClick={handleRandom} silent>
              <span className="inline-flex items-center gap-1.5">
                <PixelIcon name="swap" className="w-3 h-3" /> Random
              </span>
            </PixelButton>
          </div>
        </div>

        {/* Main: select grid + fighter detail panel */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
          {/* Character grid */}
          <PixelPanel className="flex-1 p-3">
            <div className="font-pixel text-[10px] text-muted-foreground tracking-[0.2em] mb-3">
              OPERATOR POOL
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {ALL_OPERATOR_IDS.map((id) => {
                const op = previews[id]
                const pickedIndex = picks.indexOf(id)
                const isPicked = pickedIndex !== -1
                const isFocused = focused === op
                const disabled = !isPicked && picks.length >= 4
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePick(id)}
                    onMouseEnter={() => setFocusedId(id)}
                    onFocus={() => setFocusedId(id)}
                    disabled={disabled}
                    aria-label={`${isPicked ? "Unpick" : "Pick"} ${op.name}`}
                    className={cn(
                      "relative aspect-square overflow-hidden border-2 bg-secondary/40 cursor-pointer",
                      isPicked
                        ? "border-primary pixel-shadow-sm"
                        : isFocused
                          ? "border-foreground"
                          : "border-border",
                      disabled && "opacity-30 cursor-not-allowed",
                    )}
                  >
                    {op.image ? (
                      <Image
                        src={op.image}
                        alt={op.name}
                        fill
                        sizes="120px"
                        className="object-cover scale-125"
                        style={{ imageRendering: "pixelated", objectPosition: "center 25%" }}
                        unoptimized
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-pixel text-xs">
                        {op.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    {/* thick blinking selection cursor */}
                    {isFocused && !isPicked && (
                      <span
                        aria-hidden
                        className="absolute inset-0 border-4 border-foreground animate-pixel-blink-fast pointer-events-none"
                      />
                    )}
                    {isPicked && (
                      <span className="absolute top-0.5 right-0.5 z-10 w-5 h-5 flex items-center justify-center font-pixel text-[10px] bg-primary text-primary-foreground border border-background">
                        {pickedIndex + 1}
                      </span>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-background/85 font-pixel text-[8px] py-0.5 px-1 truncate text-center">
                      {op.name.toUpperCase()}
                    </span>
                  </button>
                )
              })}
            </div>
          </PixelPanel>

          {/* Fighter detail panel */}
          <PixelPanel variant="player" className="lg:w-[320px] shrink-0 p-3 flex flex-col gap-3">
            <div className="font-pixel text-[10px] text-primary tracking-[0.2em]">FIGHTER DATA</div>
            <div className="flex items-center gap-3">
              <OperatorAvatar op={focused} size="lg" side="player" />
              <div className="min-w-0">
                <div className="font-pixel text-[12px] leading-relaxed text-balance">
                  {focused.name.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">{focused.category}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <StatRow icon="heart" label="HP" value={focused.maxHp} max={Math.max(focused.maxHp, 30)} color="hp" />
              <StatRow icon="sword" label="ATK" value={focused.atk} max={maxStat} color="energy" />
              <StatRow icon="shield" label="DEF" value={focused.def} max={maxStat} color="enemy" />
            </div>

            <div className="border-2 border-border bg-background/50 p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <PixelIcon name="star" className="w-3 h-3 text-primary" />
                <span className="font-pixel text-[10px] text-primary truncate">
                  {focused.specialSkillName.toUpperCase()}
                </span>
                <span className="ml-auto font-pixel text-[10px] text-accent shrink-0">
                  {focused.specialSkillCost}EN
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{focused.specialSkillDescription}</p>
            </div>

            <PixelButton
              variant="ghost"
              className="self-start"
              onClick={() =>
                setInfoTarget({ kind: "operator", op: focused, side: "player", defeated: false })
              }
            >
              Full Info
            </PixelButton>
          </PixelPanel>
        </div>

        {/* Roster strip + confirm */}
        <PixelPanel className="p-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-pixel text-[10px] tracking-[0.2em] text-muted-foreground shrink-0">
                SQUAD {picks.length}/4
              </span>
              <div className="flex gap-2 flex-1">
                {[0, 1, 2, 3].map((slot) => {
                  const id = picks[slot]
                  const op = id ? previews[id] : null
                  return (
                    <div
                      key={slot}
                      className={cn(
                        "flex-1 border-2 p-1.5 flex items-center gap-2 min-h-12",
                        op ? "border-primary/60 bg-primary/5" : "border-dashed border-border/50",
                      )}
                    >
                      {op ? (
                        <>
                          <OperatorAvatar op={op} size="sm" side="player" />
                          <span className="text-sm font-semibold truncate hidden md:inline">{op.name}</span>
                        </>
                      ) : (
                        <span className="font-pixel text-[9px] text-muted-foreground mx-auto">EMPTY</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <PixelButton
              variant="primary"
              disabled={picks.length !== 4}
              onClick={handleConfirm}
              silent
              className="px-6 py-3 text-[12px]"
            >
              {picks.length === 4 ? "FIGHT!" : `PICK ${4 - picks.length} MORE`}
            </PixelButton>
          </div>
        </PixelPanel>
      </div>
      <InfoModal target={infoTarget} onClose={() => setInfoTarget(null)} />
    </div>
  )
}

function StatRow({
  icon,
  label,
  value,
  max,
  color,
}: {
  icon: "heart" | "sword" | "shield"
  label: string
  value: number
  max: number
  color: "hp" | "energy" | "enemy"
}) {
  return (
    <div className="flex items-center gap-2">
      <PixelIcon name={icon} className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="font-pixel text-[10px] w-8">{label}</span>
      <SegmentedBar value={value} max={max} segments={10} color={color} className="flex-1" />
      <span className="font-pixel text-[11px] w-7 text-right tabular-nums">{value}</span>
    </div>
  )
}
