"use client"

import type { OperatorCard, SupportCard } from "@/lib/game/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OperatorBattleCard } from "./OperatorBattleCard"
import { Shield, Sword, Sparkles, Zap, Heart, Coins, Wrench, ArrowUp, Activity } from "lucide-react"
import { getEffectiveAtk, getEffectiveDef, rankUpCost, canSpecial } from "@/lib/game/state"
import { cn } from "@/lib/utils"

type InfoTarget =
  | { kind: "operator"; op: OperatorCard; side: "player" | "opponent"; defeated: boolean }
  | { kind: "support"; card: SupportCard }
  | null

export function InfoModal({
  target,
  onClose,
}: {
  target: InfoTarget
  onClose: () => void
}) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card border-border">
        {target?.kind === "operator" && <OperatorDetail target={target} />}
        {target?.kind === "support" && <SupportDetail card={target.card} />}
      </DialogContent>
    </Dialog>
  )
}

function OperatorDetail({
  target,
}: {
  target: { kind: "operator"; op: OperatorCard; side: "player" | "opponent"; defeated: boolean }
}) {
  const { op, side, defeated } = target
  const atk = getEffectiveAtk(op)
  const def = getEffectiveDef(op)
  const cost = rankUpCost(op)
  const special = canSpecial(op)
  const sideTone = side === "player" ? "text-amber-300" : "text-cyan-300"
  const sideAccent = side === "player" ? "from-amber-500/15" : "from-cyan-500/15"

  // Aggregate active status effects into a friendly list
  const statuses: { label: string; tone: "good" | "bad" }[] = []
  if (op.isDefending) statuses.push({ label: "Defending (incoming damage halved)", tone: "good" })
  if (op.shield > 0) statuses.push({ label: `Shield: ${op.shield}`, tone: "good" })
  if (op.nextDamageBonus > 0)
    statuses.push({ label: `+${op.nextDamageBonus} damage on next attack`, tone: "good" })
  if (op.atkPenalty > 0)
    statuses.push({ label: `-${op.atkPenalty} ATK (debuff)`, tone: "bad" })
  if (op.skillBlockedTurns > 0)
    statuses.push({ label: `Special Skill blocked (${op.skillBlockedTurns}t)`, tone: "bad" })
  if (op.bdrAtkBuff > 0)
    statuses.push({ label: `+${op.bdrAtkBuff} ATK from BDR Outbound`, tone: "good" })
  if (op.momentum > 0) statuses.push({ label: `Momentum x${op.momentum}`, tone: "good" })

  return (
    <div className="flex flex-col">
      <div className={cn("p-4 pb-3 bg-gradient-to-b to-transparent border-b border-border", sideAccent)}>
        <div className="w-44 aspect-[3/4] mx-auto mb-3 shrink-0">
          <OperatorBattleCard op={op} side={side} size="md" defeated={defeated} />
        </div>
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <DialogTitle className="text-xl tracking-tight">{op.name}</DialogTitle>
            <span
              className={cn(
                "rounded-md text-[13px] font-mono font-bold px-1.5 py-0.5",
                side === "player" ? "bg-amber-400 text-slate-900" : "bg-cyan-400 text-slate-900",
              )}
            >
              R{op.rank}
            </span>
            {defeated && (
              <span className="rounded-md text-[13px] font-mono font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40">
                KO
              </span>
            )}
          </div>
          <div className={cn("text-[13px] font-mono uppercase tracking-[0.18em] text-center", sideTone)}>
            {op.category} · {side === "player" ? "Your operator" : "Enemy operator"}
          </div>
        </DialogHeader>
        {op.flavor && (
          <p className="font-sans text-base text-muted-foreground italic leading-relaxed mt-3 text-center">{op.flavor}</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatRow icon={Heart} label="HP" value={`${Math.max(0, op.hp)} / ${op.maxHp}`} tone="emerald" />
          <StatRow icon={Zap} label="Energy" value={`${op.energy} / ${op.maxEnergy}`} tone="cyan" />
          <StatRow
            icon={Sword}
            label="ATK"
            value={atk === op.atk ? `${atk}` : `${atk} (base ${op.atk})`}
            tone="rose"
          />
          <StatRow
            icon={Shield}
            label="DEF"
            value={def === op.def ? `${def}` : `${def} (base ${op.def})`}
            tone="cyan"
          />
        </div>

        {/* Basic Attack */}
        <Section title="Basic Attack" icon={Sword}>
          <div className="font-sans text-lg font-semibold">{op.basicAttackName}</div>
          <p className="font-sans text-lg text-foreground leading-relaxed">
            Deals damage equal to ATK ({atk}) minus the target&apos;s DEF, with a minimum of 5.
          </p>
        </Section>

        {/* Special Skill */}
        <Section title="Special Skill" icon={Sparkles}>
          <div className="flex items-center justify-between gap-2">
            <div className="font-sans text-lg font-semibold">{op.specialSkillName}</div>
            <span className="text-[13px] font-mono uppercase tracking-wider rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 px-2 py-0.5">
              {op.specialSkillCost} EN
            </span>
          </div>
          <p className="font-sans text-lg text-foreground leading-relaxed">{op.specialSkillDescription}</p>
          {!special.ok && (
            <div className="text-[13px] text-rose-300 font-mono">{special.reason}</div>
          )}
        </Section>

        {/* Rank up */}
        <Section title="Rank Up" icon={ArrowUp}>
          {op.rank === 3 ? (
            <p className="font-sans text-lg text-foreground leading-relaxed">Already at maximum rank (R3).</p>
          ) : (
            <>
              <p className="font-sans text-lg text-foreground leading-relaxed">
                Spend <span className="text-amber-300 font-semibold">{cost} momentum</span> to advance from
                R{op.rank} to R{op.rank + 1}. Each rank boosts ATK, DEF, and max HP.
              </p>
              <p className="font-sans text-lg text-foreground leading-relaxed">
                Momentum is earned by KOing enemies (+1) and using Special Skills (+1).
              </p>
              <p className="font-sans text-lg text-foreground leading-relaxed">
                Current momentum: {op.momentum} / {cost}
              </p>
            </>
          )}
        </Section>

        {/* Attached features */}
        {op.attachedFeatures.length > 0 && (
          <Section title={`Attached Features (${op.attachedFeatures.length})`} icon={Wrench}>
            <ul className="space-y-1.5">
              {op.attachedFeatures.map((f) => (
                <li key={f.instanceId} className="rounded-md border border-border bg-background/40 p-2">
                  <div className="font-sans text-base font-semibold">{f.name}</div>
                  <div className="font-sans text-lg text-foreground leading-relaxed">{f.description}</div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Status effects */}
        {statuses.length > 0 && (
          <Section title="Active Status Effects" icon={Activity}>
            <ul className="flex flex-wrap gap-1.5">
              {statuses.map((s, i) => (
                <li
                  key={i}
                  className={cn(
                    "text-[13px] font-mono rounded-full px-2 py-0.5 border",
                    s.tone === "good"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/40 text-rose-300",
                  )}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  )
}

function SupportDetail({ card }: { card: SupportCard }) {
  const meta = SUPPORT_META[card.type]
  const Icon = meta.icon
  return (
    <div className="flex flex-col">
      <DialogHeader className={cn("p-4 pb-3 bg-gradient-to-b to-transparent border-b border-border", meta.gradient)}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[12px] font-mono uppercase tracking-wider",
              meta.chip,
            )}
          >
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
        </div>
        <DialogTitle className="text-xl tracking-tight">{card.name}</DialogTitle>
      </DialogHeader>
      <div className="p-4 space-y-4">
        <Section title="Effect" icon={Icon}>
          <p className="font-sans text-lg text-foreground leading-relaxed">{card.description}</p>
        </Section>
        <Section title="How to use" icon={Sparkles}>
          <p className="font-sans text-lg text-foreground leading-relaxed">{meta.usage}</p>
        </Section>
        <Section title="Targeting" icon={Sword}>
          <p className="font-sans text-lg text-foreground leading-relaxed">{targetingHelp(card)}</p>
        </Section>
        <div className="font-sans text-lg text-foreground leading-relaxed border-t border-border pt-3">
          You may play <span className="text-foreground">one</span> support card per turn. After it resolves it goes to your discard pile and is reshuffled when your deck runs out.
        </div>
      </div>
    </div>
  )
}

function targetingHelp(card: SupportCard): string {
  if (card.type === "feature") {
    return "Pick one of your operators (active or bench). The feature stays attached to that operator for the rest of the match and grants its bonus."
  }
  if (card.type === "resource") {
    return "Plays immediately. Affects your active operator (or your team) per the effect text — no target selection needed."
  }
  // event
  if (card.key === "Security Questionnaire") {
    return "Pick the enemy operator whose attached feature you want to remove."
  }
  return "Plays immediately and affects the opponent — no target selection needed."
}

const SUPPORT_META = {
  resource: {
    label: "Resource",
    icon: Coins,
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    gradient: "from-amber-500/15",
    usage:
      "Resources fuel your team — they heal HP, restore energy, or buff your active operator. Use them to recover before a heavy hit or to set up a finisher.",
  },
  feature: {
    label: "Feature",
    icon: Wrench,
    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
    gradient: "from-cyan-500/15",
    usage:
      "Features are permanent attachments. Pick the operator who benefits most from the bonus — once attached they stay until that operator is KO'd.",
  },
  event: {
    label: "Event",
    icon: Zap,
    chip: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    gradient: "from-rose-500/15",
    usage:
      "Events disrupt the enemy. Time them to interrupt their power plays — for example, lock out a Special Skill the turn before they would have used it.",
  },
} as const

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[13px] font-mono uppercase tracking-[0.18em] text-foreground inline-flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

const STAT_TONE: Record<string, string> = {
  emerald: "text-emerald-300 border-emerald-500/30 bg-emerald-500/5",
  cyan: "text-cyan-300 border-cyan-500/30 bg-cyan-500/5",
  rose: "text-rose-300 border-rose-500/30 bg-rose-500/5",
}

function StatRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone: keyof typeof STAT_TONE
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-md border px-2.5 py-1.5", STAT_TONE[tone])}>
      <Icon className="w-4 h-4" />
      <span className="text-[13px] font-mono uppercase tracking-wider">{label}</span>
      <span className="ml-auto text-[15px] font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  )
}
