"use client"

import { PixelButton } from "@/components/game/retro/PixelButton"
import { PixelIcon } from "@/components/game/retro/PixelIcon"
import type { GameState } from "@/lib/game/types"
import { cn } from "@/lib/utils"

interface TutorialCoachProps {
  state: GameState
  step: number
  onNext: () => void
  onSkip: () => void
}

const stepCopy = [
  {
    title: "Learn Mode",
    body: "This is a short guided match. You will play a support card, use one battle action, end your turn, then take one more turn.",
    cta: "Start",
  },
  {
    title: "Play One Support",
    body: "Support cards are your hand at the bottom. Select a card, then press Play if it appears. If the game asks for a target, choose a highlighted operator.",
  },
  {
    title: "Take A Battle Action",
    body: "Each turn, your active operator gets one battle action. Use Attack for steady damage, Special when you have enough Energy, or Defend if you need protection.",
  },
  {
    title: "End Your Turn",
    body: "After your support card and battle action, end the turn. The opponent will take a quick automated turn, then you will get control again.",
  },
  {
    title: "Second Turn",
    body: "Now repeat the rhythm: optional support card, one battle action, then end turn. Watch HP, Energy, and Momentum as you choose.",
  },
  {
    title: "You Have The Loop",
    body: "That is the core flow. Keep playing this match, or reset whenever you want to draft your own squad.",
    cta: "Keep Playing",
  },
]

export function TutorialCoach({ state, step, onNext, onSkip }: TutorialCoachProps) {
  const copy = stepCopy[Math.min(step, stepCopy.length - 1)]
  const waitingForOpponent = state.currentPlayer === "opponent"
  const canAdvance = step === 0 || step >= stepCopy.length - 1

  return (
    <div className="fixed left-1/2 bottom-4 z-50 w-[min(820px,calc(100vw-24px))] -translate-x-1/2">
      <div className="pixel-panel bg-card/95 border-primary/60 p-5 md:p-6 shadow-[0_0_32px_rgba(250,204,21,0.16)]">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-primary bg-primary/15 text-primary">
            <PixelIcon name="scroll" className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="font-sans text-2xl font-semibold leading-tight text-primary">{copy.title}</div>
              <div className="font-sans text-base text-muted-foreground">Step {Math.min(step + 1, stepCopy.length)} / {stepCopy.length}</div>
            </div>
            <p className="mt-3 font-sans text-xl leading-relaxed text-foreground">{copy.body}</p>
            {waitingForOpponent && step === 3 && (
              <p className="mt-3 font-sans text-lg text-cyan-200">Opponent is taking its turn...</p>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="font-sans text-base text-muted-foreground">
            Learn mode ends after the second player turn.
          </div>
          <div className="flex items-center gap-2">
            <PixelButton variant="ghost" className="px-4 py-2 text-[13px]" onClick={onSkip}>
              Skip
            </PixelButton>
            <PixelButton
              variant="primary"
              className={cn("px-5 py-2 text-[13px]", !canAdvance && "hidden")}
              onClick={onNext}
            >
              {copy.cta ?? "Next"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  )
}
