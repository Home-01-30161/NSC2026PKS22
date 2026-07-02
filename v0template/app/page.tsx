"use client"

import { useEffect, useMemo, useReducer, useRef, useState } from "react"
import { createInitialState, reduce } from "@/lib/game/state"
import { Arena } from "@/components/game/Arena"
import { StatPanel } from "@/components/game/StatPanel"
import { TeamTile, TeamRail } from "@/components/game/TeamTile"
import { SupportCardView } from "@/components/game/SupportCardView"
import { ActionBar } from "@/components/game/ActionBar"
import { GameLog } from "@/components/game/GameLog"
import { WinLoseOverlay } from "@/components/game/WinLoseOverlay"
import { StartScreen } from "@/components/game/StartScreen"
import { DraftScreen } from "@/components/game/DraftScreen"
import { InfoModal } from "@/components/game/InfoModal"
import { TutorialCoach } from "@/components/game/TutorialCoach"
import { PixelButton } from "@/components/game/retro/PixelButton"
import { PixelIcon } from "@/components/game/retro/PixelIcon"
import { SoundToggle } from "@/components/game/retro/SoundToggle"
import { Scanlines } from "@/components/game/retro/Scanlines"
import { playBattleTrack, playLandingTrack, playSfx, stopBattleTrack, stopLandingTrack } from "@/lib/sound"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OperatorCard, OperatorTemplateId, SupportCard } from "@/lib/game/types"

type InfoTarget =
  | { kind: "operator"; op: OperatorCard; side: "player" | "opponent"; defeated: boolean }
  | { kind: "support"; card: SupportCard }
  | null

const TUTORIAL_PLAYER_IDS: OperatorTemplateId[] = [
  "support-engineer",
  "product-manager",
  "platform-engineer",
  "csm",
]

const TUTORIAL_OPPONENT_IDS: OperatorTemplateId[] = [
  "bdr",
  "sales-engineer",
  "bim-consultant",
  "head-of-ux",
]

export default function Page() {
  const [state, dispatch] = useReducer(reduce, undefined, createInitialState)
  const [phase, setPhase] = useState<"start" | "draft">("start")
  const [tutorialMode, setTutorialMode] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [swapMode, setSwapMode] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [info, setInfo] = useState<InfoTarget>(null)
  const [damageFlash, setDamageFlash] = useState<{ side: "player" | "opponent"; amount: number; key: number } | null>(null)
  const [rankUpBanner, setRankUpBanner] = useState<{ side: "player" | "opponent"; name: string; rank: number; key: number } | null>(null)
  const prevHpRef = useRef<{
    player: { id: string; hp: number } | null
    opponent: { id: string; hp: number } | null
  }>({ player: null, opponent: null })
  const prevRankRef = useRef<{
    player: { id: string; rank: number } | null
    opponent: { id: string; rank: number } | null
  }>({ player: null, opponent: null })

  // Menu music continues across the start screen and draft, then stops when the fight begins.
  useEffect(() => {
    if (state.hasStarted) {
      stopLandingTrack()
      return
    }

    let needsGesture = false

    const play = () => {
      playLandingTrack().catch(() => {
        needsGesture = true
      })
    }
    const playAfterGesture = () => {
      if (!needsGesture) return
      needsGesture = false
      play()
    }

    play()
    window.addEventListener("pointerdown", playAfterGesture)
    window.addEventListener("keydown", playAfterGesture)

    return () => {
      window.removeEventListener("pointerdown", playAfterGesture)
      window.removeEventListener("keydown", playAfterGesture)
    }
  }, [state.hasStarted])

  // Battle music loops through the fight and stops once the match has a winner.
  useEffect(() => {
    if (!state.hasStarted || state.winner) {
      stopBattleTrack()
      return
    }

    playBattleTrack().catch(() => {})

    return () => {
      stopBattleTrack()
    }
  }, [state.hasStarted, state.winner])

  // AI turn
  useEffect(() => {
    if (state.currentPlayer === "opponent" && !state.winner && state.hasStarted) {
      const t = setTimeout(() => dispatch({ type: "AI_STEP" }), 900)
      return () => clearTimeout(t)
    }
  }, [state.currentPlayer, state.winner, state.hasStarted, state.log.length])

  // Reset swap mode when turn changes / action taken
  useEffect(() => {
    if (state.currentPlayer !== "player" || state.player.hasTakenBattleActionThisTurn) {
      setSwapMode(false)
    }
  }, [state.currentPlayer, state.player.hasTakenBattleActionThisTurn])

  // Track HP changes to trigger damage flash on the side that lost HP.
  // Only flash when the SAME operator's HP decreases. Active swaps, KOs, and
  // game restarts (where the active operator's id changes) just refresh the
  // ref without firing a phantom damage indicator.
  useEffect(() => {
    const pActive = state.player.active
    const oActive = state.opponent.active
    const prev = prevHpRef.current

    if (pActive && prev.player && prev.player.id === pActive.id && pActive.hp < prev.player.hp) {
      setDamageFlash({ side: "player", amount: prev.player.hp - pActive.hp, key: Date.now() })
    } else if (oActive && prev.opponent && prev.opponent.id === oActive.id && oActive.hp < prev.opponent.hp) {
      setDamageFlash({ side: "opponent", amount: prev.opponent.hp - oActive.hp, key: Date.now() })
    }

    prevHpRef.current = {
      player: pActive ? { id: pActive.id, hp: pActive.hp } : null,
      opponent: oActive ? { id: oActive.id, hp: oActive.hp } : null,
    }
  }, [state.player.active?.hp, state.opponent.active?.hp, state.player.active?.id, state.opponent.active?.id])

  // Track rank changes to fire a "RANK UP!" banner
  useEffect(() => {
    const pActive = state.player.active
    const oActive = state.opponent.active
    const prev = prevRankRef.current

    if (pActive && prev.player && prev.player.id === pActive.id && pActive.rank > prev.player.rank) {
      setRankUpBanner({ side: "player", name: pActive.name, rank: pActive.rank, key: Date.now() })
      playSfx("rankUp")
    } else if (oActive && prev.opponent && prev.opponent.id === oActive.id && oActive.rank > prev.opponent.rank) {
      setRankUpBanner({ side: "opponent", name: oActive.name, rank: oActive.rank, key: Date.now() })
      playSfx("rankUp")
    }

    prevRankRef.current = {
      player: pActive ? { id: pActive.id, rank: pActive.rank } : null,
      opponent: oActive ? { id: oActive.id, rank: oActive.rank } : null,
    }
  }, [state.player.active?.rank, state.opponent.active?.rank, state.player.active?.id, state.opponent.active?.id])

  // Auto-clear rank up banner
  useEffect(() => {
    if (!rankUpBanner) return
    const t = setTimeout(() => setRankUpBanner(null), 1800)
    return () => clearTimeout(t)
  }, [rankUpBanner?.key])

  useEffect(() => {
    if (!tutorialMode || !state.hasStarted) return

    if (tutorialStep === 1 && state.player.hasPlayedSupportThisTurn) {
      setTutorialStep(2)
    } else if (tutorialStep === 2 && state.player.hasTakenBattleActionThisTurn) {
      setTutorialStep(3)
    } else if (tutorialStep === 3 && state.currentPlayer === "player" && state.turnNumber >= 3) {
      setTutorialStep(4)
    } else if (tutorialStep === 4 && state.turnNumber >= 3 && state.player.hasTakenBattleActionThisTurn) {
      setTutorialStep(5)
    }
  }, [
    state.currentPlayer,
    state.hasStarted,
    state.player.hasPlayedSupportThisTurn,
    state.player.hasTakenBattleActionThisTurn,
    state.turnNumber,
    tutorialMode,
    tutorialStep,
  ])

  const latestMessage = useMemo(() => {
    if (state.log.length === 0) return undefined
    return state.log[state.log.length - 1].text
  }, [state.log])

  const handleReset = () => {
    setTutorialMode(false)
    setTutorialStep(0)
    dispatch({ type: "RESET" })
    setPhase("draft")
  }

  const handleStartDraft = () => {
    setTutorialMode(false)
    setTutorialStep(0)
    setPhase("draft")
  }

  const handleLearn = () => {
    setTutorialMode(true)
    setTutorialStep(0)
    setSwapMode(false)
    setLogOpen(false)
    setInfo(null)
    dispatch({
      type: "INIT_MATCH",
      playerIds: TUTORIAL_PLAYER_IDS,
      opponentIds: TUTORIAL_OPPONENT_IDS,
    })
  }

  if (!state.hasStarted) {
    if (phase === "draft") {
      return (
        <DraftScreen
          onBack={() => setPhase("start")}
          onConfirm={(playerIds, opponentIds) => {
            setTutorialMode(false)
            setTutorialStep(0)
            dispatch({ type: "INIT_MATCH", playerIds, opponentIds })
          }}
        />
      )
    }
    return <StartScreen onStart={handleStartDraft} onLearn={handleLearn} />
  }

  const player = state.player
  const opp = state.opponent
  const isPlayerTurn = state.currentPlayer === "player"
  const selectedCard =
    state.selectedHandIndex !== null ? player.hand[state.selectedHandIndex] : null

  const friendlyTargetMode = state.targetMode === "friendly"
  const opponentFeatureTargetMode = state.targetMode === "opponent-feature"

  const handleHandClick = (i: number) => {
    if (state.selectedHandIndex === i) {
      dispatch({ type: "CLEAR_SELECTION" })
      return
    }
    dispatch({ type: "SELECT_HAND", index: i })
  }

  const handlePlayNoTarget = () => dispatch({ type: "PLAY_SELECTED_NO_TARGET" })

  const handleOpFriendlyClick = (id: string) => {
    if (friendlyTargetMode) {
      dispatch({ type: "PLAY_SELECTED_ON_TARGET", targetId: id })
    }
  }
  const handleOpOpponentClick = () => {
    if (opponentFeatureTargetMode && opp.active) {
      dispatch({ type: "PLAY_SELECTED_ON_TARGET", targetId: opp.active.id })
    }
  }

  const handleSwapBench = (i: number) => {
    if (!swapMode) return
    dispatch({ type: "SWAP", benchIndex: i })
    setSwapMode(false)
  }

  // Build full team rosters (active + bench + defeated, in their original team order via id)
  const buildTeamRoster = (p: typeof player) => {
    const all: { op: import("@/lib/game/types").OperatorCard; isActive: boolean; isDefeated: boolean }[] = []
    if (p.active) all.push({ op: p.active, isActive: true, isDefeated: false })
    p.bench.forEach((b) => all.push({ op: b, isActive: false, isDefeated: false }))
    p.defeated.forEach((d) => all.push({ op: d, isActive: false, isDefeated: true }))
    return all
  }
  const playerRoster = buildTeamRoster(player)
  const oppRoster = buildTeamRoster(opp)

  const showPlayCardButton =
    selectedCard &&
    (selectedCard.type === "resource" ||
      (selectedCard.type === "event" && selectedCard.key !== "Security Questionnaire"))

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden crt-flicker">
      <Scanlines />
      {/* Compact top bar */}
      <header className="border-b-2 border-border bg-card/60 z-30 shrink-0">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between gap-3">
          <h1 className="font-pixel text-[12px] leading-relaxed">
            STACK <span className="text-primary">ATTACK</span>
            <span className="hidden sm:inline text-muted-foreground text-[10px] ml-2 uppercase tracking-wider">
              Market Clash
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">
              T<span className="text-foreground">{state.turnNumber}</span>
            </div>
            <div
              className={cn(
                "px-2 py-1 font-pixel text-[9px] uppercase tracking-wider border-2",
                isPlayerTurn
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                  : "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
              )}
            >
              {isPlayerTurn ? "Your turn" : "Enemy turn"}
            </div>
            <SoundToggle />
            <PixelButton variant="ghost" className="p-1.5" onClick={() => setLogOpen((v) => !v)} aria-label="Toggle log">
              <PixelIcon name="scroll" className="w-3.5 h-3.5" />
            </PixelButton>
            <PixelButton variant="ghost" className="p-1.5" onClick={handleReset} aria-label="Reset">
              <PixelIcon name="reset" className="w-3.5 h-3.5" />
            </PixelButton>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-2 flex flex-col gap-2 min-h-0">
        {/* Battle row: team rail | arena+stats | team rail */}
        <section className="flex-1 min-h-0 flex gap-2 items-stretch">
          {/* Player team rail */}
          <TeamRail
            label="Your Team"
            side="player"
            roster={playerRoster}
            renderSlot={(slot) => {
              const targetable = friendlyTargetMode && !slot.isDefeated && slot.op.hp > 0
              const swapTarget =
                swapMode &&
                !slot.isActive &&
                !slot.isDefeated &&
                slot.op.hp > 0 &&
                isPlayerTurn &&
                !player.hasTakenBattleActionThisTurn
              const onClick = targetable
                ? () => handleOpFriendlyClick(slot.op.id)
                : swapTarget
                ? () => {
                    const benchIdx = player.bench.findIndex((b) => b.id === slot.op.id)
                    if (benchIdx >= 0) handleSwapBench(benchIdx)
                  }
                : undefined
              return (
                <TeamTile
                  key={slot.op.id}
                  op={slot.op}
                  side="player"
                  active={slot.isActive}
                  defeated={slot.isDefeated}
                  selectable={!!onClick}
                  onClick={onClick}
                  onInfo={() =>
                    setInfo({ kind: "operator", op: slot.op, side: "player", defeated: slot.isDefeated })
                  }
                />
              )
            }}
          />

          {/* Center: arena + stat panels */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <Arena
              player={player.active}
              opponent={opp.active}
              message={latestMessage}
              isPlayerTurn={isPlayerTurn}
              damageFlash={damageFlash}
              highlightOpponent={opponentFeatureTargetMode}
              onOpponentClick={opponentFeatureTargetMode ? handleOpOpponentClick : undefined}
            />
            <section className="grid grid-cols-2 gap-2 pixel-panel bg-card shrink-0">
              <StatPanel op={player.active} side="player" align="left" />
              <div className="border-l-2 border-border">
                <StatPanel op={opp.active} side="opponent" align="right" />
              </div>
            </section>
          </div>

          {/* Enemy team rail */}
          <TeamRail
            label="Enemy Team"
            side="opponent"
            roster={oppRoster}
            renderSlot={(slot) => (
              <TeamTile
                key={slot.op.id}
                op={slot.op}
                side="opponent"
                active={slot.isActive}
                defeated={slot.isDefeated}
                onInfo={() =>
                  setInfo({ kind: "operator", op: slot.op, side: "opponent", defeated: slot.isDefeated })
                }
              />
            )}
          />
        </section>

        {/* Action Bar */}
        <ActionBar
          active={player.active}
          hasTakenAction={player.hasTakenBattleActionThisTurn}
          isPlayerTurn={isPlayerTurn}
          swapMode={swapMode}
          onBasicAttack={() => dispatch({ type: "BASIC_ATTACK" })}
          onSpecial={() => dispatch({ type: "SPECIAL_SKILL" })}
          onDefend={() => dispatch({ type: "DEFEND" })}
          onToggleSwap={() => setSwapMode((v) => !v)}
          onRankUp={() => dispatch({ type: "RANK_UP" })}
          onEndTurn={() => dispatch({ type: "END_TURN" })}
        />

        {/* Hand */}
        <section className="pixel-panel bg-card p-2 shrink-0">
          <div className="flex items-center mb-1.5 gap-2">
            {/* Player side (left) */}
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Hand · {player.hand.length}
              </div>
              <span
                className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1 border-2 border-border px-2 py-0.5"
                title="Your draw pile. You draw 1 per turn."
              >
                <Layers className="w-3 h-3" /> Deck {player.deck.length}
              </span>
              {player.discard.length > 0 && (
                <span className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">
                  Discard {player.discard.length}
                </span>
              )}
              {player.hasPlayedSupportThisTurn && (
                <span className="font-pixel text-[10px] uppercase tracking-wider text-muted-foreground">
                  Support played
                </span>
              )}
              {state.targetMode && (
                <span className="font-pixel text-[10px] uppercase tracking-wider text-amber-300 animate-pixel-blink">
                  Pick a target…
                </span>
              )}
              {showPlayCardButton && (
                <PixelButton
                  variant="primary"
                  className="px-3 py-1.5 text-[10px]"
                  onClick={handlePlayNoTarget}
                  disabled={!isPlayerTurn || player.hasPlayedSupportThisTurn}
                >
                  Play {selectedCard!.name}
                </PixelButton>
              )}
            </div>

            {/* Center divider */}
            <span className="w-px h-4 bg-border shrink-0" aria-hidden />

            {/* Enemy side (right) */}
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
              <span
                className="font-pixel text-[10px] uppercase tracking-wider text-cyan-300 inline-flex items-center gap-1.5 border-2 border-cyan-400/30 px-2 py-0.5"
                title="The enemy's hand and deck are face-down. Counts are public; identities are hidden."
              >
                Enemy
                <span className="text-cyan-200">H {opp.hand.length}</span>
                <span className="text-cyan-200/80">·</span>
                <span className="text-cyan-200 inline-flex items-center gap-0.5">
                  <Layers className="w-3 h-3" /> {opp.deck.length}
                </span>
                <span className="text-cyan-200/60">·</span>
                <span className="text-cyan-200">D {opp.discard.length}</span>
                {opp.hasPlayedSupportThisTurn && (
                  <span className="ml-1 text-cyan-200 border-l-2 border-cyan-400/30 pl-1.5">played</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {player.hand.length === 0 && (
              <div className="text-xs text-muted-foreground italic py-6 px-2">No cards in hand.</div>
            )}
            {player.hand.map((c, i) => (
              <SupportCardView
                key={c.id}
                card={c}
                selected={state.selectedHandIndex === i}
                disabled={!isPlayerTurn || player.hasPlayedSupportThisTurn}
                onClick={() => handleHandClick(i)}
                onInfo={() => setInfo({ kind: "support", card: c })}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Slide-over log */}
      {logOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setLogOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-[320px] max-w-[88vw] bg-card border-l-2 border-border z-50 transition-transform duration-300 flex flex-col",
          logOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-3 border-b-2 border-border">
          <span className="font-pixel text-[11px] uppercase tracking-wider">Battle Log</span>
          <PixelButton variant="ghost" className="px-2 py-1 text-[10px]" onClick={() => setLogOpen(false)}>
            Close
          </PixelButton>
        </div>
        <div className="flex-1 overflow-hidden p-2">
          <GameLog logs={state.log} />
        </div>
      </aside>

      <InfoModal target={info} onClose={() => setInfo(null)} />

      {rankUpBanner && (
        <div
          key={rankUpBanner.key}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div
            className={cn(
              "relative px-8 py-5 border-4 animate-rank-up pixel-shadow",
              rankUpBanner.side === "player"
                ? "bg-amber-950 border-amber-300"
                : "bg-cyan-950 border-cyan-300",
            )}
          >
            <div className="text-center">
              <div className="font-pixel text-[10px] uppercase tracking-[0.4em] text-foreground mb-2">
                {rankUpBanner.side === "player" ? "Your Operator" : "Enemy Operator"}
              </div>
              <div
                className={cn(
                  "font-pixel text-2xl md:text-3xl tracking-wider",
                  rankUpBanner.side === "player" ? "text-amber-300" : "text-cyan-300",
                )}
                style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.7)" }}
              >
                RANK UP!
              </div>
              <div className="mt-2 font-pixel text-[11px] text-foreground">
                {rankUpBanner.name} <span className="text-foreground/60">→</span>{" "}
                <span
                  className={cn(
                    rankUpBanner.side === "player" ? "text-amber-200" : "text-cyan-200",
                  )}
                >
                  R{rankUpBanner.rank}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {state.winner && (
        <WinLoseOverlay
          winner={state.winner}
          reason={state.winReason}
          turnNumber={state.turnNumber}
            onPlayAgain={handleReset}
        />
      )}

      {tutorialMode && !state.winner && (
        <TutorialCoach
          state={state}
          step={tutorialStep}
          onNext={() => setTutorialStep((step) => Math.min(step + 1, 5))}
          onSkip={() => setTutorialMode(false)}
        />
      )}
    </div>
  )
}
