import type {
  OperatorCard,
  OperatorTemplateId,
  ResourceCard,
  FeatureCard,
  EventCard,
  ResourceKey,
  FeatureKey,
  EventKey,
} from "./types"

let _id = 0
const nid = (prefix: string) => `${prefix}-${++_id}`

const baseStatus = {
  isDefending: false,
  shield: 0,
  nextDamageBonus: 0,
  atkPenalty: 0,
  atkPenaltyExpiresAtTurn: null,
  skillBlockedTurns: 0,
  selfDamageEndTurn: 0,
  ignoreTechDebtSelfDamage: false,
  bdrAtkBuff: 0,
  bdrAtkBuffExpiresAtTurn: null,
  momentum: 0,
}

// ===== OPERATORS =====

export const makeSupportEngineer = (): OperatorCard => ({
  id: nid("op"),
  templateId: "support-engineer",
  type: "operator",
  name: "Support Engineer",
  category: "Engineering",
  rank: 1,
  hp: 80,
  maxHp: 80,
  atk: 20,
  def: 10,
  energy: 2,
  maxEnergy: 4,
  basicAttackName: "Bug Bash",
  specialSkillName: "Hotfix",
  specialSkillCost: 2,
  specialSkillDescription: "Heal self for 25 HP.",
  attachedFeatures: [],
  flavor: "Reliable, practical, and always cleaning up someone else's mess.",
  image: "/operators/support-engineer.jpg",
  ...baseStatus,
})

export const makeBDR = (): OperatorCard => ({
  id: nid("op"),
  templateId: "bdr",
  type: "operator",
  name: "BDR",
  category: "Sales",
  rank: 1,
  hp: 65,
  maxHp: 65,
  atk: 18,
  def: 5,
  energy: 3,
  maxEnergy: 5,
  basicAttackName: "Pipeline Ping",
  specialSkillName: "Book a Meeting",
  specialSkillCost: 2,
  specialSkillDescription: "Deal 20 damage and gain +10 ATK until end of next turn.",
  attachedFeatures: [],
  flavor: "Small hit, big follow-up.",
  image: "/operators/bdr.jpg",
  ...baseStatus,
})

export const makeCSM = (): OperatorCard => ({
  id: nid("op"),
  templateId: "csm",
  type: "operator",
  name: "Customer Success Manager",
  category: "Success",
  rank: 1,
  hp: 85,
  maxHp: 85,
  atk: 18,
  def: 10,
  energy: 3,
  maxEnergy: 5,
  basicAttackName: "Retention Nudge",
  specialSkillName: "Save the Account",
  specialSkillCost: 2,
  specialSkillDescription: "Deal 15 damage and heal lowest-HP friendly Operator for 20 HP.",
  attachedFeatures: [],
  flavor: "Keeps the team alive when churn pressure spikes.",
  image: "/operators/csm.jpg",
  ...baseStatus,
})

export const makeSalesEngineer = (): OperatorCard => ({
  id: nid("op"),
  templateId: "sales-engineer",
  type: "operator",
  name: "Sales Engineer",
  category: "Sales/Technical",
  rank: 1,
  hp: 90,
  maxHp: 90,
  atk: 24,
  def: 10,
  energy: 2,
  maxEnergy: 4,
  basicAttackName: "Demo Hit",
  specialSkillName: "Technical Demo",
  specialSkillCost: 2,
  specialSkillDescription: "Deal 35 damage. +15 if SSO/SAML attached.",
  attachedFeatures: [],
  flavor: "Turns technical confidence into commercial momentum.",
  image: "/operators/sales-engineer.jpg",
  ...baseStatus,
})

export const makeProductManager = (): OperatorCard => ({
  id: nid("op"),
  templateId: "product-manager",
  type: "operator",
  name: "Product Manager",
  category: "Product",
  rank: 1,
  hp: 90,
  maxHp: 90,
  atk: 22,
  def: 10,
  energy: 2,
  maxEnergy: 4,
  basicAttackName: "Scope Push",
  specialSkillName: "Roadmap Push",
  specialSkillCost: 2,
  specialSkillDescription: "Deal 30 damage. Draw 1 card if Project Dashboard attached.",
  attachedFeatures: [],
  flavor: "Always one prioritization call away from chaos.",
  image: "/operators/product-manager.jpg",
  ...baseStatus,
})

export const makePlatformEngineer = (): OperatorCard => ({
  id: nid("op"),
  templateId: "platform-engineer",
  type: "operator",
  name: "Platform Engineer",
  category: "Engineering",
  rank: 1,
  hp: 105,
  maxHp: 105,
  atk: 24,
  def: 15,
  energy: 2,
  maxEnergy: 4,
  basicAttackName: "Infra Hit",
  specialSkillName: "Scale the Platform",
  specialSkillCost: 2,
  specialSkillDescription: "Deal 35 damage. Ignore Tech Debt self-damage while Active.",
  attachedFeatures: [],
  flavor: "The one holding everything together.",
  image: "/operators/platform-engineer.jpg",
  ...baseStatus,
})

export const makeBIMConsultant = (): OperatorCard => ({
  id: nid("op"),
  templateId: "bim-consultant",
  type: "operator",
  name: "BIM Consultant",
  category: "AEC",
  rank: 1,
  hp: 95,
  maxHp: 95,
  atk: 24,
  def: 10,
  energy: 2,
  maxEnergy: 4,
  basicAttackName: "Model Check",
  specialSkillName: "Clash Review",
  specialSkillCost: 2,
  specialSkillDescription: "Deal 35 damage. +15 if IFC Export attached.",
  attachedFeatures: [],
  flavor: "Deep domain knowledge with sharp elbows.",
  image: "/operators/bim-consultant.jpg",
  ...baseStatus,
})

export const makeHeadOfUX = (): OperatorCard => ({
  id: nid("op"),
  templateId: "head-of-ux",
  type: "operator",
  name: "Head of UX",
  category: "Product/Leadership",
  rank: 1,
  hp: 100,
  maxHp: 100,
  atk: 22,
  def: 12,
  energy: 2,
  maxEnergy: 4,
  basicAttackName: "Design Critique",
  specialSkillName: "Design Alignment",
  specialSkillCost: 2,
  specialSkillDescription: "Deal 30 damage. Heal all friendly +10 if Design System attached.",
  attachedFeatures: [],
  flavor: "Turns scattered product decisions into a coherent experience.",
  image: "/operators/head-of-ux.jpg",
  ...baseStatus,
})

// ===== SUPPORT CARDS =====

const RES_DESCRIPTIONS: Record<ResourceKey, string> = {
  ARR: "Restore 2 Energy to your Active Operator.",
  Runway: "Shield Active for 20 incoming damage.",
  "Consulting Revenue": "Heal your Active Operator for 25 HP.",
  "Tech Debt": "Active's next attack/skill deals +25. Active takes 10 self-damage at end of turn (Platform Engineer ignores).",
  "MRR Growth": "Heal Active 15 HP and increase its max HP by 5 for the rest of the match.",
  "Investor Capital": "Restore Active to full Energy. Opponent draws 1.",
}

const FEAT_DESCRIPTIONS: Record<FeatureKey, string> = {
  "Project Dashboard": "After this Operator uses a Special Skill, draw 1 (once per turn).",
  "SSO/SAML": "+5 DEF. Sales Engineer's Technical Demo deals +15.",
  "IFC Export": "+5 ATK. BIM Consultant's Clash Review deals +15.",
  "Design System": "+5 DEF. Head of UX's Design Alignment heals all friendly +10.",
  "AI Integration": "Special Skills deal +20. After skill, flip — on tails take 10 self-damage.",
  "Document Management": "Reduce incoming damage to this Operator by 10.",
  "API v2": "+10 ATK.",
}

const EVT_DESCRIPTIONS: Record<EventKey, string> = {
  "Server Outage": "Opponent's Active can't use a Special Skill on its next turn.",
  "All-Hands Meeting": "Both Actives gain 1 Energy. Opponent's Active gets -10 ATK until end of its next turn.",
  "Security Questionnaire": "Discard one Feature attached to opponent's Active.",
  "Product Launch": "Your Active's next attack or Special Skill deals +30 this turn.",
  "Competitor Enters Market": "Opponent's Active loses 1 Energy.",
  "GDPR Audit": "Until end of opponent's next turn, AI Integration & Project Dashboard don't trigger.",
  "Conference Season": "Draw 2 support cards, then discard 1.",
  Reorg: "Swap your Active with a Bench Operator. Doesn't use your battle action.",
}

export const makeResource = (key: ResourceKey): ResourceCard => ({
  id: nid("res"),
  type: "resource",
  key,
  name: key,
  description: RES_DESCRIPTIONS[key],
})

export const makeFeature = (key: FeatureKey): FeatureCard => ({
  id: nid("feat"),
  type: "feature",
  key,
  name: key,
  description: FEAT_DESCRIPTIONS[key],
})

export const makeEvent = (key: EventKey): EventCard => ({
  id: nid("evt"),
  type: "event",
  key,
  name: key,
  description: EVT_DESCRIPTIONS[key],
})

// ===== ROSTER & TEAM SELECTION =====

const OPERATOR_FACTORIES: Record<OperatorTemplateId, () => OperatorCard> = {
  "support-engineer": makeSupportEngineer,
  bdr: makeBDR,
  "bim-consultant": makeBIMConsultant,
  "head-of-ux": makeHeadOfUX,
  csm: makeCSM,
  "sales-engineer": makeSalesEngineer,
  "product-manager": makeProductManager,
  "platform-engineer": makePlatformEngineer,
}

export const ALL_OPERATOR_IDS: OperatorTemplateId[] = [
  "support-engineer",
  "bdr",
  "bim-consultant",
  "head-of-ux",
  "csm",
  "sales-engineer",
  "product-manager",
  "platform-engineer",
]

/** Returns a fresh operator instance from a template id. */
export function makeOperator(id: OperatorTemplateId): OperatorCard {
  return OPERATOR_FACTORIES[id]()
}

/** Returns a static preview of an operator (for the draft UI) without consuming an id slot. */
export function previewOperator(id: OperatorTemplateId): OperatorCard {
  return OPERATOR_FACTORIES[id]()
}

/** Builds a 4-operator team from the chosen template ids, in order. */
export function makeTeam(ids: OperatorTemplateId[]): OperatorCard[] {
  return ids.map((id) => makeOperator(id))
}

/** Returns 4 unique random operator template ids. */
export function randomTeamIds(): OperatorTemplateId[] {
  const pool = [...ALL_OPERATOR_IDS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 4)
}

/** Default player team (kept for backwards compatibility / fallbacks). */
export const makePlayerTeam = (): OperatorCard[] =>
  makeTeam(["support-engineer", "bdr", "bim-consultant", "head-of-ux"])

/** Default opponent team (kept for backwards compatibility / fallbacks). */
export const makeOpponentTeam = (): OperatorCard[] =>
  makeTeam(["csm", "sales-engineer", "product-manager", "platform-engineer"])
