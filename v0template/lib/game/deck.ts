import type { SupportCard } from "./types"
import { makeResource, makeFeature, makeEvent } from "./cards"

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 20-card MVP support deck per spec.
export function buildSupportDeck(): SupportCard[] {
  const deck: SupportCard[] = [
    // Resources (11)
    makeResource("ARR"), makeResource("ARR"), makeResource("ARR"),
    makeResource("Runway"), makeResource("Runway"),
    makeResource("Consulting Revenue"), makeResource("Consulting Revenue"),
    makeResource("Tech Debt"), makeResource("Tech Debt"),
    makeResource("MRR Growth"),
    makeResource("Investor Capital"),
    // Features (7)
    makeFeature("Project Dashboard"),
    makeFeature("SSO/SAML"),
    makeFeature("IFC Export"),
    makeFeature("Design System"),
    makeFeature("AI Integration"),
    makeFeature("Document Management"),
    makeFeature("API v2"),
    // Events (4)
    makeEvent("Server Outage"),
    makeEvent("Security Questionnaire"),
    makeEvent("Product Launch"),
    makeEvent("Competitor Enters Market"),
  ]
  return shuffle(deck)
}
