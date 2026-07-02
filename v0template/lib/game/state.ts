import type {
  AttachedFeature,
  EventCard,
  FeatureCard,
  GameState,
  LogEntry,
  LogTone,
  OperatorCard,
  OperatorTemplateId,
  PlayerState,
  ResourceCard,
  Side,
  SupportCard,
} from "./types"
import { makePlayerTeam, makeOpponentTeam, makeTeam, randomTeamIds } from "./cards"
import { buildSupportDeck } from "./deck"
import { HAND_SIZE_START, MIN_DAMAGE } from "./config"

// =============== utility ===============

let _logId = 0
const nlog = (text: string, tone: LogTone, turn: number): LogEntry => ({
  id: `l-${++_logId}-${Math.random().toString(36).slice(2, 6)}`,
  text,
  tone,
  turn,
})

let _instId = 0
const ninst = () => `inst-${++_instId}`

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

function pushLog(state: GameState, text: string, tone: LogTone = "info") {
  state.log = [...state.log, nlog(text, tone, state.turnNumber)].slice(-200)
}

function makePlayer(side: Side, team: OperatorCard[]): PlayerState {
  return {
    side,
    active: team[0],
    bench: team.slice(1),
    defeated: [],
    deck: buildSupportDeck(),
    hand: [],
    discard: [],
    hasPlayedSupportThisTurn: false,
    hasTakenBattleActionThisTurn: false,
  }
}

// =============== init ===============

export interface TeamSelection {
  player?: OperatorTemplateId[]
  opponent?: OperatorTemplateId[]
}

export function createInitialState(selection?: TeamSelection): GameState {
  const playerIds = selection?.player
  const opponentIds = selection?.opponent
  const playerTeam = playerIds && playerIds.length === 4 ? makeTeam(playerIds) : makePlayerTeam()
  const opponentTeam = opponentIds && opponentIds.length === 4 ? makeTeam(opponentIds) : makeOpponentTeam()
  const player = makePlayer("player", playerTeam)
  const opponent = makePlayer("opponent", opponentTeam)
  for (let i = 0; i < HAND_SIZE_START; i++) {
    if (player.deck.length > 0) player.hand.push(player.deck.pop()!)
    if (opponent.deck.length > 0) opponent.hand.push(opponent.deck.pop()!)
  }
  return {
    player,
    opponent,
    currentPlayer: "player",
    turnNumber: 1,
    log: [
      nlog("Match ready — defeat all 4 opposing Operators to win the Contract.", "system", 1),
    ],
    selectedHandIndex: null,
    targetMode: null,
    winner: null,
    winReason: null,
    hasStarted: false,
  }
}

export { randomTeamIds }

// =============== helpers on operators ===============

function effectiveAtk(op: OperatorCard): number {
  let atk = op.atk
  if (op.attachedFeatures.some((f) => f.name === "API v2")) atk += 10
  if (op.attachedFeatures.some((f) => f.name === "IFC Export")) atk += 5
  atk += op.bdrAtkBuff
  atk -= op.atkPenalty
  return Math.max(0, atk)
}

function effectiveDef(op: OperatorCard): number {
  let def = op.def
  if (op.attachedFeatures.some((f) => f.name === "SSO/SAML")) def += 5
  if (op.attachedFeatures.some((f) => f.name === "Design System")) def += 5
  return def
}

function hasFeature(op: OperatorCard, name: AttachedFeature["name"]): boolean {
  return op.attachedFeatures.some((f) => f.name === name)
}

function meSide(state: GameState, side: Side): PlayerState {
  return side === "player" ? state.player : state.opponent
}

function setSide(state: GameState, side: Side, p: PlayerState): GameState {
  return side === "player" ? { ...state, player: p } : { ...state, opponent: p }
}

function lowestHpFriendly(p: PlayerState): OperatorCard | null {
  const all = [p.active, ...p.bench].filter(Boolean) as OperatorCard[]
  if (all.length === 0) return null
  return all.reduce((m, o) => (o.hp < m.hp ? o : m), all[0])
}

function healOperator(op: OperatorCard, amount: number): { op: OperatorCard; healed: number } {
  if (op.hp <= 0) return { op, healed: 0 }
  const newHp = Math.min(op.maxHp, op.hp + amount)
  const healed = newHp - op.hp
  return { op: { ...op, hp: newHp }, healed }
}

function applyToFriendly(
  p: PlayerState,
  targetId: string,
  fn: (op: OperatorCard) => OperatorCard,
): PlayerState {
  if (p.active && p.active.id === targetId) return { ...p, active: fn(p.active) }
  const idx = p.bench.findIndex((o) => o.id === targetId)
  if (idx >= 0) {
    const bench = [...p.bench]
    bench[idx] = fn(bench[idx])
    return { ...p, bench }
  }
  return p
}

// =============== draw / discard ===============

function drawCards(p: PlayerState, n: number): { p: PlayerState; drawn: SupportCard[] } {
  const drawn: SupportCard[] = []
  const deck = [...p.deck]
  const hand = [...p.hand]
  for (let i = 0; i < n; i++) {
    if (deck.length === 0) break
    const c = deck.pop()!
    drawn.push(c)
    hand.push(c)
  }
  return { p: { ...p, deck, hand }, drawn }
}

// =============== damage ===============

interface DamageOpts {
  source: "basic" | "skill" | "self"
}

function dealDamageToActive(
  state: GameState,
  defenderSide: Side,
  rawDamage: number,
  opts: DamageOpts,
): GameState {
  const def = meSide(state, defenderSide)
  if (!def.active) return state
  let dmg = rawDamage

  if (opts.source !== "self" && hasFeature(def.active, "Document Management")) dmg -= 10
  if (opts.source !== "self" && def.active.isDefending) dmg = Math.floor(dmg * 0.5)
  if (dmg < MIN_DAMAGE && opts.source !== "self") dmg = MIN_DAMAGE
  if (dmg < 0) dmg = 0

  const active = { ...def.active }
  if (opts.source !== "self" && active.shield > 0) {
    const absorbed = Math.min(active.shield, dmg)
    active.shield -= absorbed
    dmg -= absorbed
    if (absorbed > 0) {
      pushLog(state, `${active.name}'s shield absorbed ${absorbed} damage.`, "info")
    }
  }
  active.hp -= dmg
  pushLog(
    state,
    `${active.name} took ${dmg} damage${opts.source === "self" ? " (self)" : ""}. (${Math.max(0, active.hp)}/${active.maxHp})`,
    "damage",
  )

  state = setSide(state, defenderSide, { ...def, active })

  if (active.hp <= 0) {
    state = handleDefeat(state, defenderSide)
  }
  return state
}

function handleDefeat(state: GameState, defeatedSide: Side): GameState {
  const me = meSide(state, defeatedSide)
  if (!me.active || me.active.hp > 0) return state
  const fallen = me.active
  pushLog(state, `${fallen.name} was defeated.`, "system")

  const attackerSide: Side = defeatedSide === "player" ? "opponent" : "player"
  const att = meSide(state, attackerSide)
  if (att.active) {
    const newAtt = { ...att.active, momentum: att.active.momentum + 1 }
    state = setSide(state, attackerSide, { ...att, active: newAtt })
    pushLog(state, `${newAtt.name} gained 1 Momentum.`, attackerSide)
  }

  let updated: PlayerState = {
    ...meSide(state, defeatedSide),
    active: null,
    defeated: [...meSide(state, defeatedSide).defeated, fallen],
  }
  if (updated.bench.length > 0) {
    const [next, ...rest] = updated.bench
    const incoming = { ...next, energy: clamp(next.energy + 1, 0, next.maxEnergy) }
    updated = { ...updated, active: incoming, bench: rest }
    pushLog(
      state,
      `${defeatedSide === "player" ? "Player" : "Opponent"} promoted ${incoming.name}.`,
      defeatedSide,
    )
    state = setSide(state, defeatedSide, updated)
  } else {
    state = setSide(state, defeatedSide, updated)
    return endMatch(state, attackerSide, "Defeated all opposing Operators.")
  }
  return state
}

function endMatch(state: GameState, winner: Side, reason: string): GameState {
  pushLog(
    state,
    `${winner === "player" ? "Player" : "Opponent"} wins the Contract — ${reason}`,
    "system",
  )
  return { ...state, winner, winReason: reason }
}

// =============== card play ===============

function playResource(state: GameState, side: Side, card: ResourceCard): GameState {
  const me = meSide(state, side)
  if (!me.active) return state
  let active = { ...me.active }

  switch (card.key) {
    case "ARR":
      active.energy = clamp(active.energy + 2, 0, active.maxEnergy)
      pushLog(state, `${active.name} gained 2 Energy from ARR.`, side)
      break
    case "Runway":
      active.shield += 20
      pushLog(state, `${active.name} gained a 20-damage shield from Runway.`, side)
      break
    case "Consulting Revenue": {
      const r = healOperator(active, 25)
      active = r.op
      pushLog(state, `${active.name} healed ${r.healed} HP from Consulting Revenue.`, "heal")
      break
    }
    case "Tech Debt":
      active.nextDamageBonus += 25
      if (!active.ignoreTechDebtSelfDamage) active.selfDamageEndTurn += 10
      pushLog(state, `${active.name} fueled by Tech Debt: +25 next damage.`, side)
      break
    case "MRR Growth": {
      active.maxHp += 5
      const r = healOperator(active, 15)
      active = r.op
      pushLog(state, `${active.name} grew via MRR Growth: +5 max HP, healed ${r.healed}.`, "heal")
      break
    }
    case "Investor Capital": {
      active.energy = active.maxEnergy
      pushLog(state, `${active.name} re-energized by Investor Capital.`, side)
      const oppSide: Side = side === "player" ? "opponent" : "player"
      state = setSide(state, side, { ...meSide(state, side), active })
      const opp = meSide(state, oppSide)
      const { p: nopp, drawn } = drawCards(opp, 1)
      state = setSide(state, oppSide, nopp)
      if (drawn.length > 0) pushLog(state, `${oppSide === "player" ? "Player" : "Opponent"} drew 1.`, oppSide)
      return state
    }
  }
  return setSide(state, side, { ...meSide(state, side), active })
}

function playFeature(state: GameState, side: Side, card: FeatureCard, targetId: string): GameState {
  const me = meSide(state, side)
  const attachment: AttachedFeature = {
    instanceId: ninst(),
    name: card.key,
    description: card.description,
  }
  const updated = applyToFriendly(me, targetId, (op) => ({
    ...op,
    attachedFeatures: [...op.attachedFeatures, attachment],
  }))
  state = setSide(state, side, updated)
  pushLog(state, `${side === "player" ? "Player" : "Opponent"} attached ${card.key}.`, side)
  return state
}

function playEvent(state: GameState, side: Side, card: EventCard): GameState {
  const oppSide: Side = side === "player" ? "opponent" : "player"
  switch (card.key) {
    case "Server Outage": {
      const opp = meSide(state, oppSide)
      if (opp.active) {
        const a = { ...opp.active, skillBlockedTurns: Math.max(opp.active.skillBlockedTurns, 1) }
        state = setSide(state, oppSide, { ...opp, active: a })
        pushLog(state, `Server Outage: ${a.name} can't use a Special Skill next turn.`, side)
      }
      break
    }
    case "All-Hands Meeting": {
      const me = meSide(state, side)
      if (me.active) {
        const a = { ...me.active, energy: clamp(me.active.energy + 1, 0, me.active.maxEnergy) }
        state = setSide(state, side, { ...me, active: a })
      }
      const opp = meSide(state, oppSide)
      if (opp.active) {
        const a = {
          ...opp.active,
          energy: clamp(opp.active.energy + 1, 0, opp.active.maxEnergy),
          atkPenalty: opp.active.atkPenalty + 10,
          atkPenaltyExpiresAtTurn: state.turnNumber + 2,
        }
        state = setSide(state, oppSide, { ...opp, active: a })
      }
      pushLog(state, `All-Hands Meeting: both Actives +1 Energy; opponent -10 ATK.`, side)
      break
    }
    case "Security Questionnaire": {
      const opp = meSide(state, oppSide)
      if (opp.active && opp.active.attachedFeatures.length > 0) {
        const removed = opp.active.attachedFeatures[0]
        const a = { ...opp.active, attachedFeatures: opp.active.attachedFeatures.slice(1) }
        state = setSide(state, oppSide, { ...opp, active: a })
        pushLog(state, `Security Questionnaire: discarded ${removed.name} from ${a.name}.`, side)
      } else {
        pushLog(state, `Security Questionnaire fizzled — no Features attached.`, "info")
      }
      break
    }
    case "Product Launch": {
      const me = meSide(state, side)
      if (me.active) {
        const a = { ...me.active, nextDamageBonus: me.active.nextDamageBonus + 30 }
        state = setSide(state, side, { ...me, active: a })
        pushLog(state, `Product Launch: ${a.name}'s next attack/skill +30 damage.`, side)
      }
      break
    }
    case "Competitor Enters Market": {
      const opp = meSide(state, oppSide)
      if (opp.active) {
        const a = { ...opp.active, energy: clamp(opp.active.energy - 1, 0, opp.active.maxEnergy) }
        state = setSide(state, oppSide, { ...opp, active: a })
        pushLog(state, `Competitor Enters Market: ${a.name} loses 1 Energy.`, side)
      }
      break
    }
    case "GDPR Audit":
      pushLog(state, `GDPR Audit triggered.`, side)
      break
    case "Conference Season": {
      const me = meSide(state, side)
      const { p: np, drawn } = drawCards(me, 2)
      state = setSide(state, side, np)
      pushLog(
        state,
        `${side === "player" ? "Player" : "Opponent"} drew ${drawn.length} via Conference Season.`,
        side,
      )
      const after = meSide(state, side)
      if (after.hand.length > 0) {
        const idx = Math.floor(Math.random() * after.hand.length)
        const removed = after.hand[idx]
        const newHand = [...after.hand.slice(0, idx), ...after.hand.slice(idx + 1)]
        state = setSide(state, side, {
          ...after,
          hand: newHand,
          discard: [...after.discard, removed],
        })
        pushLog(state, `Discarded ${removed.name}.`, side)
      }
      break
    }
    case "Reorg":
      pushLog(state, `Reorg played.`, side)
      break
  }
  return state
}

// =============== battle actions ===============

function basicAttack(state: GameState, attackerSide: Side): GameState {
  const att = meSide(state, attackerSide)
  const defSide: Side = attackerSide === "player" ? "opponent" : "player"
  const def = meSide(state, defSide)
  if (!att.active || !def.active) return state
  const baseAtk = effectiveAtk(att.active)
  const totalAtk = baseAtk + att.active.nextDamageBonus
  const defenderDef = effectiveDef(def.active)
  const dmg = Math.max(MIN_DAMAGE, totalAtk - defenderDef)
  const bonusNote = att.active.nextDamageBonus > 0 ? ` (+${att.active.nextDamageBonus} bonus)` : ""
  pushLog(
    state,
    `${att.active.name} used ${att.active.basicAttackName}: ${totalAtk} ATK − ${defenderDef} DEF = ${dmg} dmg${bonusNote}.`,
    attackerSide,
  )
  const a2 = {
    ...att.active,
    nextDamageBonus: 0,
  }
  state = setSide(state, attackerSide, {
    ...att,
    active: a2,
    hasTakenBattleActionThisTurn: true,
  })
  return dealDamageToActive(state, defSide, dmg, { source: "basic" })
}

function specialSkill(state: GameState, attackerSide: Side): GameState {
  const att = meSide(state, attackerSide)
  const defSide: Side = attackerSide === "player" ? "opponent" : "player"
  if (!att.active) return state
  const op = att.active
  if (op.skillBlockedTurns > 0) {
    pushLog(state, `${op.name} couldn't use a Special Skill (blocked).`, "info")
    return state
  }
  if (op.energy < op.specialSkillCost) return state

  let dmg = 0
  let healSelf = 0
  const aiBonus = hasFeature(op, "AI Integration") ? 20 : 0

  switch (op.name) {
    case "Support Engineer":
      healSelf = 25
      break
    case "BDR":
      dmg = 20 + aiBonus
      break
    case "Customer Success Manager":
      dmg = 15 + aiBonus
      break
    case "Sales Engineer":
      dmg = 35 + (hasFeature(op, "SSO/SAML") ? 15 : 0) + aiBonus
      break
    case "Product Manager":
      dmg = 30 + aiBonus
      break
    case "Platform Engineer":
      dmg = 35 + aiBonus
      break
    case "BIM Consultant":
      dmg = 35 + (hasFeature(op, "IFC Export") ? 15 : 0) + aiBonus
      break
    case "Head of UX":
      dmg = 30 + aiBonus
      break
  }

  const totalDmg = dmg > 0 ? dmg + op.nextDamageBonus : 0

  const me0 = meSide(state, attackerSide)
  const active: OperatorCard = {
    ...op,
    energy: clamp(op.energy - op.specialSkillCost, 0, op.maxEnergy),
    nextDamageBonus: 0,
    momentum: op.rank < 3 ? op.momentum + 1 : op.momentum,
  }
  state = setSide(state, attackerSide, {
    ...me0,
    active,
    hasTakenBattleActionThisTurn: true,
  })

  pushLog(state, `${op.name} used ${op.specialSkillName}.`, attackerSide)
  if (op.rank < 3) {
    pushLog(state, `${op.name} gained 1 Momentum.`, attackerSide)
  }

  if (totalDmg > 0) {
    const def = meSide(state, defSide)
    if (def.active) {
      const defenderDef = effectiveDef(def.active)
      const finalDmg = Math.max(MIN_DAMAGE, totalDmg - defenderDef)
      state = dealDamageToActive(state, defSide, finalDmg, { source: "skill" })
    }
  }

  if (op.name === "Support Engineer" && healSelf > 0) {
    const me = meSide(state, attackerSide)
    if (me.active && me.active.id === active.id) {
      const r = healOperator(me.active, healSelf)
      pushLog(state, `${r.op.name} healed ${r.healed} HP.`, "heal")
      state = setSide(state, attackerSide, { ...me, active: r.op })
    }
  }

  if (op.name === "BDR") {
    const me = meSide(state, attackerSide)
    if (me.active) {
      const a = {
        ...me.active,
        bdrAtkBuff: me.active.bdrAtkBuff + 10,
        bdrAtkBuffExpiresAtTurn: state.turnNumber + 2,
      }
      state = setSide(state, attackerSide, { ...me, active: a })
      pushLog(state, `${a.name} gained +10 ATK until end of next turn.`, attackerSide)
    }
  }

  if (op.name === "Customer Success Manager") {
    const me = meSide(state, attackerSide)
    const target = lowestHpFriendly(me)
    if (target) {
      const updated = applyToFriendly(me, target.id, (o) => healOperator(o, 20).op)
      state = setSide(state, attackerSide, updated)
      pushLog(state, `Save the Account healed ${target.name} for up to 20 HP.`, "heal")
    }
  }

  if (op.name === "Platform Engineer") {
    const me = meSide(state, attackerSide)
    if (me.active) {
      state = setSide(state, attackerSide, {
        ...me,
        active: { ...me.active, ignoreTechDebtSelfDamage: true },
      })
    }
  }

  if (op.name === "Product Manager" && hasFeature(op, "Project Dashboard")) {
    const me = meSide(state, attackerSide)
    const { p: np, drawn } = drawCards(me, 1)
    state = setSide(state, attackerSide, np)
    if (drawn.length > 0) pushLog(state, `Project Dashboard → drew 1.`, attackerSide)
  }

  if (op.name === "Head of UX" && hasFeature(op, "Design System")) {
    const me = meSide(state, attackerSide)
    const heal = (o: OperatorCard) => healOperator(o, 10).op
    let np = me
    if (np.active) np = { ...np, active: heal(np.active) }
    np = { ...np, bench: np.bench.map(heal) }
    state = setSide(state, attackerSide, np)
    pushLog(state, `Design Alignment healed all friendly Operators 10 HP.`, "heal")
  }

  if (hasFeature(op, "AI Integration")) {
    if (Math.random() < 0.5) {
      pushLog(state, `AI Integration misfired — 10 self-damage.`, "damage")
      state = dealDamageToActive(state, attackerSide, 10, { source: "self" })
    } else {
      pushLog(state, `AI Integration boost held steady.`, "info")
    }
  }

  return state
}

function defendAction(state: GameState, side: Side): GameState {
  const me = meSide(state, side)
  if (!me.active) return state
  const a = {
    ...me.active,
    isDefending: true,
    energy: clamp(me.active.energy + 1, 0, me.active.maxEnergy),
  }
  state = setSide(state, side, { ...me, active: a, hasTakenBattleActionThisTurn: true })
  pushLog(state, `${a.name} is Defending — incoming damage halved.`, side)
  return state
}

function swapAction(state: GameState, side: Side, benchIndex: number, free = false): GameState {
  const me = meSide(state, side)
  if (!me.active) return state
  const target = me.bench[benchIndex]
  if (!target || target.hp <= 0) return state
  const newBench = me.bench.filter((_, i) => i !== benchIndex)
  const incoming = { ...target, energy: clamp(target.energy + 1, 0, target.maxEnergy) }
  const updated: PlayerState = {
    ...me,
    active: incoming,
    bench: [...newBench, me.active],
    hasTakenBattleActionThisTurn: free ? me.hasTakenBattleActionThisTurn : true,
  }
  state = setSide(state, side, updated)
  pushLog(state, `${side === "player" ? "Player" : "Opponent"} swapped in ${incoming.name}.`, side)
  return state
}

// =============== turn lifecycle ===============

function startTurn(state: GameState, side: Side): GameState {
  let me = meSide(state, side)
  if (me.active) {
    const a = {
      ...me.active,
      energy: clamp(me.active.energy + 1, 0, me.active.maxEnergy),
      isDefending: false,
    }
    me = { ...me, active: a }
  }
  me = { ...me, hasPlayedSupportThisTurn: false, hasTakenBattleActionThisTurn: false }
  state = setSide(state, side, me)

  const { p: np, drawn } = drawCards(meSide(state, side), 1)
  state = setSide(state, side, np)
  if (drawn.length > 0) {
    pushLog(state, `${side === "player" ? "Player" : "Opponent"} drew 1 support card.`, side)
  } else {
    pushLog(state, `${side === "player" ? "Player" : "Opponent"} has an empty deck.`, "info")
  }
  return state
}

function endTurn(state: GameState): GameState {
  const side = state.currentPlayer
  let me = meSide(state, side)
  if (me.active) {
    let a = { ...me.active }
    if (a.selfDamageEndTurn > 0) {
      const dmg = a.selfDamageEndTurn
      a.selfDamageEndTurn = 0
      state = setSide(state, side, { ...me, active: a })
      pushLog(state, `${a.name} took ${dmg} self-damage from Tech Debt.`, "damage")
      state = dealDamageToActive(state, side, dmg, { source: "self" })
      me = meSide(state, side)
    }
    if (me.active && me.active.skillBlockedTurns > 0) {
      me = {
        ...me,
        active: { ...me.active, skillBlockedTurns: me.active.skillBlockedTurns - 1 },
      }
    }
    if (
      me.active &&
      me.active.atkPenaltyExpiresAtTurn !== null &&
      state.turnNumber >= me.active.atkPenaltyExpiresAtTurn
    ) {
      me = { ...me, active: { ...me.active, atkPenalty: 0, atkPenaltyExpiresAtTurn: null } }
    }
    if (
      me.active &&
      me.active.bdrAtkBuffExpiresAtTurn !== null &&
      state.turnNumber >= me.active.bdrAtkBuffExpiresAtTurn
    ) {
      me = { ...me, active: { ...me.active, bdrAtkBuff: 0, bdrAtkBuffExpiresAtTurn: null } }
    }
    state = setSide(state, side, me)
  }

  if (state.winner) return state

  const next: Side = side === "player" ? "opponent" : "player"
  state = {
    ...state,
    currentPlayer: next,
    turnNumber: state.turnNumber + 1,
    selectedHandIndex: null,
    targetMode: null,
  }
  state = startTurn(state, next)
  return state
}

// =============== rank up ===============

function rankUp(state: GameState, side: Side): GameState {
  const me = meSide(state, side)
  if (!me.active) return state
  const op = me.active
  if (op.rank === 3) return state
  const cost = op.rank === 1 ? 2 : 3
  if (op.momentum < cost) return state
  const next: 2 | 3 = (op.rank + 1) as 2 | 3
  const bonus =
    next === 2
      ? { mhp: 15, heal: 15, atk: 5, def: 0 }
      : { mhp: 25, heal: 25, atk: 10, def: 5 }
  const updated: OperatorCard = {
    ...op,
    rank: next,
    momentum: op.momentum - cost,
    maxHp: op.maxHp + bonus.mhp,
    hp: Math.min(op.maxHp + bonus.mhp, op.hp + bonus.heal),
    atk: op.atk + bonus.atk,
    def: op.def + bonus.def,
  }
  state = setSide(state, side, { ...me, active: updated })
  pushLog(state, `${updated.name} ranked up to Rank ${next}!`, side)
  return state
}

// =============== AI ===============

function aiTakeTurn(state: GameState): GameState {
  state = aiPlaySupport(state)
  state = aiBattleAction(state)
  state = endTurn(state)
  return state
}

function aiPlaySupport(state: GameState): GameState {
  const me = state.opponent
  if (!me.active || me.hasPlayedSupportThisTurn) return state
  const opp = state.player

  if (me.active.hp <= me.active.maxHp * 0.5) {
    const f = me.hand.findIndex((c) => c.type === "resource" && c.key === "Consulting Revenue")
    if (f !== -1) return aiPlayCardAt(state, f)
  }
  if (me.active.energy < me.active.specialSkillCost) {
    const f = me.hand.findIndex((c) => c.type === "resource" && c.key === "ARR")
    if (f !== -1) return aiPlayCardAt(state, f)
  }
  if (me.active.attachedFeatures.length === 0) {
    const f = me.hand.findIndex((c) => c.type === "feature")
    if (f !== -1) return aiPlayCardAt(state, f, me.active.id)
  }
  if (opp.active && opp.active.attachedFeatures.length > 0) {
    const f = me.hand.findIndex((c) => c.type === "event" && c.key === "Security Questionnaire")
    if (f !== -1) return aiPlayCardAt(state, f)
  }
  {
    const f = me.hand.findIndex((c) => c.type === "event" && c.key === "Product Launch")
    if (f !== -1) return aiPlayCardAt(state, f)
  }
  if (opp.active && opp.active.energy >= opp.active.specialSkillCost) {
    const f = me.hand.findIndex(
      (c) => c.type === "event" && c.key === "Competitor Enters Market",
    )
    if (f !== -1) return aiPlayCardAt(state, f)
  }
  return state
}

function aiPlayCardAt(state: GameState, handIndex: number, targetId?: string): GameState {
  const me = state.opponent
  const card = me.hand[handIndex]
  if (!card) return state
  const hand = [...me.hand]
  hand.splice(handIndex, 1)
  state = setSide(state, "opponent", {
    ...me,
    hand,
    discard: [...me.discard, card],
    hasPlayedSupportThisTurn: true,
  })
  pushLog(state, `Opponent played ${card.name}.`, "opponent")

  if (card.type === "resource") return playResource(state, "opponent", card)
  if (card.type === "feature") {
    return playFeature(state, "opponent", card, targetId ?? state.opponent.active!.id)
  }
  if (card.type === "event") {
    if (card.key === "Reorg") {
      const bench = state.opponent.bench
      if (bench.length > 0) {
        const idx = bench.reduce((mi, op, i) => (op.hp > bench[mi].hp ? i : mi), 0)
        return swapAction(state, "opponent", idx, true)
      }
    }
    return playEvent(state, "opponent", card)
  }
  return state
}

function aiBattleAction(state: GameState): GameState {
  const me = state.opponent
  if (me.hasTakenBattleActionThisTurn || !me.active) return state
  const opp = state.player
  if (!opp.active) return state

  const oppDef = effectiveDef(opp.active)
  const myAtk = effectiveAtk(me.active)
  const basicDmg = Math.max(MIN_DAMAGE, myAtk - oppDef)

  if (me.active.energy >= me.active.specialSkillCost && me.active.skillBlockedTurns === 0) {
    let skillEstimate = 0
    switch (me.active.name) {
      case "Customer Success Manager":
        skillEstimate = 15
        break
      case "Sales Engineer":
        skillEstimate = 35 + (hasFeature(me.active, "SSO/SAML") ? 15 : 0)
        break
      case "Product Manager":
        skillEstimate = 30
        break
      case "Platform Engineer":
        skillEstimate = 35
        break
      default:
        skillEstimate = 30
    }
    skillEstimate = Math.max(MIN_DAMAGE, skillEstimate + me.active.nextDamageBonus - oppDef)
    if (skillEstimate >= opp.active.hp || skillEstimate > basicDmg + 10) {
      return specialSkill(state, "opponent")
    }
  }

  if (me.active.hp <= me.active.maxHp * 0.3) {
    const better = me.bench.findIndex((b) => b.hp > me.active!.hp + 20)
    if (better !== -1) return swapAction(state, "opponent", better)
    return defendAction(state, "opponent")
  }

  return basicAttack(state, "opponent")
}

// =============== reducer ===============

export type Action =
  | { type: "START_GAME" }
  | { type: "INIT_MATCH"; playerIds: OperatorTemplateId[]; opponentIds: OperatorTemplateId[] }
  | { type: "RESET" }
  | { type: "SELECT_HAND"; index: number }
  | { type: "CLEAR_SELECTION" }
  | { type: "PLAY_SELECTED_NO_TARGET" }
  | { type: "PLAY_SELECTED_ON_TARGET"; targetId: string }
  | { type: "BASIC_ATTACK" }
  | { type: "SPECIAL_SKILL" }
  | { type: "DEFEND" }
  | { type: "SWAP"; benchIndex: number }
  | { type: "RANK_UP" }
  | { type: "END_TURN" }
  | { type: "AI_STEP" }

export function reduce(state: GameState, action: Action): GameState {
  if (action.type === "RESET") return createInitialState()
  if (action.type === "INIT_MATCH") {
    const fresh = createInitialState({ player: action.playerIds, opponent: action.opponentIds })
    return { ...fresh, hasStarted: true }
  }
  if (action.type === "START_GAME") return { ...state, hasStarted: true }
  if (state.winner) return state
  if (!state.hasStarted) return state

  switch (action.type) {
    case "SELECT_HAND": {
      if (state.currentPlayer !== "player") return state
      const card = state.player.hand[action.index]
      if (!card) return state
      if (state.player.hasPlayedSupportThisTurn) return state
      let mode: GameState["targetMode"] = null
      if (card.type === "feature") mode = "friendly"
      else if (card.type === "event" && card.key === "Security Questionnaire") mode = "opponent-feature"
      return { ...state, selectedHandIndex: action.index, targetMode: mode }
    }
    case "CLEAR_SELECTION":
      return { ...state, selectedHandIndex: null, targetMode: null }

    case "PLAY_SELECTED_NO_TARGET": {
      if (state.currentPlayer !== "player") return state
      if (state.selectedHandIndex === null) return state
      if (state.player.hasPlayedSupportThisTurn) return state
      const card = state.player.hand[state.selectedHandIndex]
      if (!card) return state
      const hand = [...state.player.hand]
      hand.splice(state.selectedHandIndex, 1)
      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          hand,
          discard: [...state.player.discard, card],
          hasPlayedSupportThisTurn: true,
        },
        selectedHandIndex: null,
        targetMode: null,
      }
      pushLog(s, `Player played ${card.name}.`, "player")
      if (card.type === "resource") s = playResource(s, "player", card)
      else if (card.type === "event") {
        if (card.key === "Reorg") {
          const bench = s.player.bench
          if (bench.length > 0) {
            const idx = bench.findIndex((b) => b.hp > 0)
            if (idx !== -1) s = swapAction(s, "player", idx, true)
          }
        } else {
          s = playEvent(s, "player", card)
        }
      }
      return s
    }
    case "PLAY_SELECTED_ON_TARGET": {
      if (state.currentPlayer !== "player") return state
      if (state.selectedHandIndex === null) return state
      if (state.player.hasPlayedSupportThisTurn) return state
      const card = state.player.hand[state.selectedHandIndex]
      if (!card) return state
      const hand = [...state.player.hand]
      hand.splice(state.selectedHandIndex, 1)
      let s: GameState = {
        ...state,
        player: {
          ...state.player,
          hand,
          discard: [...state.player.discard, card],
          hasPlayedSupportThisTurn: true,
        },
        selectedHandIndex: null,
        targetMode: null,
      }
      pushLog(s, `Player played ${card.name}.`, "player")
      if (card.type === "feature") s = playFeature(s, "player", card, action.targetId)
      else if (card.type === "event" && card.key === "Security Questionnaire")
        s = playEvent(s, "player", card)
      return s
    }

    case "BASIC_ATTACK":
      if (state.currentPlayer !== "player") return state
      if (state.player.hasTakenBattleActionThisTurn) return state
      return basicAttack(state, "player")
    case "SPECIAL_SKILL": {
      if (state.currentPlayer !== "player") return state
      if (state.player.hasTakenBattleActionThisTurn) return state
      const op = state.player.active
      if (!op) return state
      if (op.energy < op.specialSkillCost) return state
      if (op.skillBlockedTurns > 0) return state
      return specialSkill(state, "player")
    }
    case "DEFEND":
      if (state.currentPlayer !== "player") return state
      if (state.player.hasTakenBattleActionThisTurn) return state
      return defendAction(state, "player")
    case "SWAP":
      if (state.currentPlayer !== "player") return state
      if (state.player.hasTakenBattleActionThisTurn) return state
      return swapAction(state, "player", action.benchIndex)
    case "RANK_UP":
      if (state.currentPlayer !== "player") return state
      return rankUp(state, "player")
    case "END_TURN":
      if (state.currentPlayer !== "player") return state
      return endTurn(state)
    case "AI_STEP":
      if (state.currentPlayer !== "opponent") return state
      return aiTakeTurn(state)
  }
  return state
}

// =============== selectors ===============

export function canSpecial(op: OperatorCard | null): { ok: boolean; reason?: string } {
  if (!op) return { ok: false, reason: "No Active." }
  if (op.skillBlockedTurns > 0) return { ok: false, reason: "Skill blocked." }
  if (op.energy < op.specialSkillCost) return { ok: false, reason: `Needs ${op.specialSkillCost} Energy` }
  return { ok: true }
}

export function rankUpCost(op: OperatorCard): number | null {
  if (op.rank === 3) return null
  return op.rank === 1 ? 2 : 3
}

export function getEffectiveAtk(op: OperatorCard): number {
  return effectiveAtk(op)
}
export function getEffectiveDef(op: OperatorCard): number {
  return effectiveDef(op)
}
