"use client"

import { useEffect } from "react"
import { PixelPanel } from "@/components/game/retro/PixelPanel"
import { PixelButton } from "@/components/game/retro/PixelButton"
import { PixelIcon, type PixelIconName } from "@/components/game/retro/PixelIcon"
import { Scanlines } from "@/components/game/retro/Scanlines"
import { playSfx } from "@/lib/sound"

interface StartScreenProps {
  onStart: () => void
  onLearn: () => void
}

export function StartScreen({ onStart, onLearn }: StartScreenProps) {
  const handleStart = () => {
    playSfx("start")
    onStart()
  }
  const handleLearn = () => {
    playSfx("start")
    onLearn()
  }

  // Press Enter / Space to start, like a real arcade cabinet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleStart()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-dvh relative flex items-center justify-center p-6 overflow-hidden">
      {/* Slow-panning pixel cityscape */}
      <div
        aria-hidden
        className="absolute inset-0 animate-bg-pan"
        style={{
          backgroundImage: "url(/retro/title-bg.png)",
          backgroundSize: "auto 100%",
          backgroundRepeat: "repeat-x",
          imageRendering: "pixelated",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-background/55" />
      <Scanlines />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-center">
          <div className="font-pixel text-[11px] tracking-[0.3em] text-accent mb-5 uppercase">
            Tactical SaaS Squad Battler
          </div>
          <h1 className="font-pixel text-3xl md:text-5xl leading-tight text-balance">
            <span className="text-primary drop-shadow-[4px_4px_0_oklch(0.3_0.08_70)]">STACK</span>{" "}
            <span className="text-foreground drop-shadow-[4px_4px_0_oklch(0.08_0.01_250)]">ATTACK</span>
          </h1>
          <div className="font-pixel text-sm md:text-lg mt-3 text-accent drop-shadow-[3px_3px_0_oklch(0.25_0.06_220)]">
            MARKET CLASH
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <PixelButton variant="primary" className="px-6 py-3 text-[13px]" onClick={handleStart} silent>
            Play
          </PixelButton>
          <PixelButton className="px-6 py-3 text-[13px]" onClick={handleLearn} silent>
            Learn
          </PixelButton>
        </div>

        {/* HOW TO PLAY panel */}
        <PixelPanel className="w-full p-5">
          <div className="font-pixel text-[12px] text-primary mb-4 text-center tracking-widest">
            — HOW TO PLAY —
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <RuleRow icon="heart" title="4-OPERATOR SQUADS">
              One Active fights at a time; three Operators wait on the Bench.
            </RuleRow>
            <RuleRow icon="sword" title="PICK ONE BATTLE ACTION">
              Basic Attack, Special Skill, Defend, or Swap — every turn.
            </RuleRow>
            <RuleRow icon="scroll" title="PLAY ONE SUPPORT">
              Resources, Features, and Events from a 20-card support deck.
            </RuleRow>
            <RuleRow icon="star" title="EARN MOMENTUM">
              Defeat opposing Operators to rank up and gain stat boosts.
            </RuleRow>
          </div>
        </PixelPanel>

        {/* Arcade footer */}
        <div className="text-center flex flex-col gap-1">
          <div className="font-pixel text-[10px] text-muted-foreground tracking-wider">
            FIRST TO DEFEAT ALL 4 OPPOSING OPERATORS WINS THE CONTRACT
          </div>
          <div className="font-pixel text-[10px] text-muted-foreground tracking-wider">
            {"© 2026 STACK ATTACK CO. · INSERT COIN"}
          </div>
        </div>
      </div>
    </div>
  )
}

function RuleRow({
  icon,
  title,
  children,
}: {
  icon: PixelIconName
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-9 h-9 border-2 border-border bg-secondary/60 flex items-center justify-center shrink-0 pixel-shadow-sm">
        <PixelIcon name={icon} className="w-4 h-4 text-primary" />
      </div>
      <div>
        <div className="font-pixel text-[11px] leading-relaxed">{title}</div>
        <div className="text-base text-muted-foreground leading-snug mt-1">{children}</div>
      </div>
    </div>
  )
}
