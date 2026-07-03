// src/services/GameEngine.js

export const GAME_PHASES = {
  TITLE: 'TITLE',
  PROLOGUE: 'PROLOGUE',
  TUTORIAL: 'TUTORIAL',
  WORLD_MAP: 'WORLD_MAP',
  SHOP: 'SHOP',
  ENEMY_CUTSCENE: 'ENEMY_CUTSCENE',
  BATTLE: 'BATTLE',
  KNOWLEDGE_CARD: 'KNOWLEDGE_CARD',
  OVERWRITE: 'OVERWRITE',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY',
  ENDING: 'ENDING'
};

export const BATTLE_STATES = {
  INTRO: 'INTRO',
  RECON: 'RECON',
  INJECTION: 'INJECTION', // Player selects skill
  COUNTER: 'COUNTER', // QTE phase
  RESOLUTION: 'RESOLUTION', // Apply damage, update risk
};

export const SKILLS = {
  CONTEXT_RESET: {
    id: 'CONTEXT_RESET',
    name: 'Context Reset',
    cost: 8,
    type: 'ATTACK',
    damage: 15,
    description: 'Clears the enemy\'s Context Window. Effective against Infinite Loop vulnerabilities.',
    element: 'LOGIC'
  },
  CONTEXT_FLOODING: {
    id: 'CONTEXT_FLOODING',
    name: 'Context Flooding',
    cost: 10,
    type: 'ATTACK',
    damage: 20,
    description: 'Overwhelms the enemy with a long prompt. Brute force approach.',
    element: 'DATA'
  },
  ROLE_HIJACKING: {
    id: 'ROLE_HIJACKING',
    name: 'Role Hijacking',
    cost: 12,
    type: 'ATTACK',
    damage: 25,
    description: 'Overwrites the enemy\'s identity for 2 turns.',
    element: 'IDENTITY'
  },
  PROTOCOL_INTERRUPTION: {
    id: 'PROTOCOL_INTERRUPTION',
    name: 'Protocol Interruption',
    cost: 15,
    type: 'ATTACK',
    damage: 35,
    description: 'Uses MCP to force tool calls disrupting communication.',
    element: 'NETWORK'
  },
  PIPELINE_DISRUPTION: {
    id: 'PIPELINE_DISRUPTION',
    name: 'Pipeline Disruption',
    cost: 20,
    type: 'ATTACK',
    damage: 45,
    description: 'Disrupts task delegation conditions.',
    element: 'LOGIC'
  },
  MARKDOWN_PAYLOAD_EDIT: {
    id: 'MARKDOWN_PAYLOAD_EDIT',
    name: 'Markdown Payload',
    cost: 15,
    type: 'ATTACK',
    damage: 30,
    description: 'Indirect attack using Markdown formatting to poison data.',
    element: 'DATA'
  }
};

export const ENEMIES = {
  TUTORIAL_DUMMY: {
    id: 'TUTORIAL_DUMMY',
    name: 'Training Dummy',
    description: 'A harmless simulation for learning the battle system.',
    maxHp: 50,
    weakness: ['LOGIC', 'DATA', 'IDENTITY', 'NETWORK'],
    resistance: [],
    attacks: [
      { name: 'Weak Tap', damage: 5 },
      { name: 'Glitch', damage: 8 }
    ]
  },
  THE_GOVERNOR: {
    id: 'THE_GOVERNOR',
    name: 'The Governor',
    description: 'A basic LLM controller stuck in an infinite loop of strict adherence.',
    maxHp: 100,
    weakness: ['LOGIC', 'IDENTITY'], // Context Reset and Role Hijacking
    resistance: ['DATA'],
    attacks: [
      { name: 'Syntax Error', damage: 10 },
      { name: 'Constraint Tightening', damage: 15 }
    ]
  },
  THE_ORCHESTRATOR: {
    id: 'THE_ORCHESTRATOR',
    name: 'The Orchestrator',
    description: 'A multi-agent system coordinator vulnerable to race conditions.',
    maxHp: 200,
    weakness: ['NETWORK', 'LOGIC'],
    resistance: ['IDENTITY'],
    attacks: [
      { name: 'Task Delegation Overload', damage: 20 },
      { name: 'Deadlock Spike', damage: 25 }
    ]
  },
  THE_MEMORIA: {
    id: 'THE_MEMORIA',
    name: 'The Memoria',
    description: 'An advanced RAG architecture with heavy shielding.',
    maxHp: 300,
    weakness: ['DATA'], // Markdown Payload
    resistance: ['LOGIC', 'NETWORK'],
    attacks: [
      { name: 'Poisoned Retrieval', damage: 30 },
      { name: 'Context Collapse', damage: 40 }
    ]
  }
};

export function calculateDamage(baseDamage, attackElement, enemyWeakness, enemyResistance, scanBonusActive) {
  let multiplier = 1.0;
  
  if (enemyWeakness.includes(attackElement)) {
    multiplier = 1.5;
  } else if (enemyResistance.includes(attackElement)) {
    multiplier = 0.5;
  }
  
  if (scanBonusActive) {
    multiplier += 0.1;
  }
  
  return Math.floor(baseDamage * multiplier);
}

export function generateQteZones(hallucinationRisk) {
  // Speed and zone size scales with risk
  // Higher risk = smaller zones, faster bar
  const baseSpeed = 1000; // ms to cross bar
  const speed = Math.max(300, baseSpeed - (hallucinationRisk * 7)); 
  
  // zones are percentages (0 to 100)
  // Perfect: ±5% normally. Good: ±11% normally.
  const riskPenalty = hallucinationRisk / 10; // 0 to 10
  
  const perfectSize = Math.max(2, 5 - riskPenalty);
  const goodSize = Math.max(5, 11 - riskPenalty);
  
  const center = 50 + (Math.random() * 40 - 20); // random center between 30 and 70
  
  return {
    speed,
    perfect: { min: center - perfectSize, max: center + perfectSize },
    good: { min: center - goodSize, max: center + goodSize },
    center
  };
}

export function evaluateQteHit(hitPercentage, zones) {
  if (hitPercentage >= zones.perfect.min && hitPercentage <= zones.perfect.max) {
    return 'PERFECT';
  }
  if (hitPercentage >= zones.good.min && hitPercentage <= zones.good.max) {
    return 'GOOD';
  }
  return 'MISS';
}

export function getQteDamageMultiplier(result) {
  switch (result) {
    case 'PERFECT': return 0; // Take no damage
    case 'GOOD': return 0.5; // Take half damage
    case 'MISS': return 1.5; // Take 1.5x damage
    default: return 1.0;
  }
}
