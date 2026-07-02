// Stack Attack: Market Clash — squad battler types

export type Side = "player" | "opponent"

export type OperatorCategory =
  | "Engineering"
  | "Sales"
  | "Sales/Technical"
  | "Success"
  | "Product"
  | "Product/Leadership"
  | "AEC"

export type SupportType = "resource" | "feature" | "event"

export type OperatorTemplateId =
  | "support-engineer"
  | "bdr"
  | "bim-consultant"
  | "head-of-ux"
  | "csm"
  | "sales-engineer"
  | "product-manager"
  | "platform-engineer"

export type FeatureKey =
  | "Project Dashboard"
  | "SSO/SAML"
  | "IFC Export"
  | "Design System"
  | "AI Integration"
  | "Document Management"
  | "API v2"

export type ResourceKey =
  | "ARR"
  | "Runway"
  | "Consulting Revenue"
  | "Tech Debt"
  | "MRR Growth"
  | "Investor Capital"

export type EventKey =
  | "Server Outage"
  | "All-Hands Meeting"
  | "Security Questionnaire"
  | "Product Launch"
  | "Competitor Enters Market"
  | "GDPR Audit"
  | "Conference Season"
  | "Reorg"

export interface AttachedFeature {
  instanceId: string
  name: FeatureKey
  description: string
}

export interface OperatorCard {
  id: string
  templateId: OperatorTemplateId
  type: "operator"
  name: string
  category: OperatorCategory
  rank: 1 | 2 | 3
  hp: number
  maxHp: number
  atk: number
  def: number
  energy: number
  maxEnergy: number
  basicAttackName: string
  specialSkillName: string
  specialSkillCost: number
  specialSkillDescription: string
  attachedFeatures: AttachedFeature[]
  flavor: string
  image: string

  // status
  isDefending: boolean
  shield: number
  nextDamageBonus: number
  atkPenalty: number
  atkPenaltyExpiresAtTurn: number | null
  skillBlockedTurns: number
  selfDamageEndTurn: number
  ignoreTechDebtSelfDamage: boolean
  bdrAtkBuff: number
  bdrAtkBuffExpiresAtTurn: number | null
  momentum: number
}

export interface SupportCardBase {
  id: string
  name: string
  description: string
}

export interface ResourceCard extends SupportCardBase {
  type: "resource"
  key: ResourceKey
}

export interface FeatureCard extends SupportCardBase {
  type: "feature"
  key: FeatureKey
}

export interface EventCard extends SupportCardBase {
  type: "event"
  key: EventKey
}

export type SupportCard = ResourceCard | FeatureCard | EventCard
export type AnyCard = OperatorCard | SupportCard

export interface PlayerState {
  side: Side
  active: OperatorCard | null
  bench: OperatorCard[]
  defeated: OperatorCard[]
  deck: SupportCard[]
  hand: SupportCard[]
  discard: SupportCard[]
  hasPlayedSupportThisTurn: boolean
  hasTakenBattleActionThisTurn: boolean
}

export type LogTone = "info" | "player" | "opponent" | "damage" | "heal" | "system"

export interface LogEntry {
  id: string
  text: string
  tone: LogTone
  turn: number
}

export type TargetMode = null | "friendly" | "opponent-feature"

export interface GameState {
  player: PlayerState
  opponent: PlayerState
  currentPlayer: Side
  turnNumber: number
  log: LogEntry[]
  selectedHandIndex: number | null
  targetMode: TargetMode
  winner: Side | null
  winReason: string | null
  hasStarted: boolean
}
