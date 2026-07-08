import React, { useState } from 'react';
import RossiShop from './RossiShop';

/* ─── Font injection ─────────────────────────────────────────────── */
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Lora:ital,wght@0,400;1,400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap');
  @keyframes ping {
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  @keyframes nodeEntrance {
    from { opacity: 0; transform: translate(-50%,-50%) scale(0.8); }
    to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to   { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  }
  @keyframes loadPulse {
    0%,100% { opacity: 0.4; }
    50%     { opacity: 1; }
  }
  .nav-item:hover  { background: rgba(200,169,106,0.12) !important; }
  .shop-btn:hover  { border-color: #705c30 !important; }
  .node-btn:hover  { filter: brightness(1.08); }
`;

/* ─── Enemy data per node ────────────────────────────────────────── */
const ENEMY_DATA = {
  london: {
    id: 'THE_GOVERNOR',
    name: 'The Governor',
    hallucinationType: 'Imperial Delusion',
    enemyHp: 100,
    weaknessList: ['Context Reset', 'Role Hijacking'],
    act: 'Act I — London',
    description: 'A basic LLM controller stuck in an infinite loop of strict adherence.',
    aiConcept: 'LLM Hallucination & Infinite Loops',
    strategy: 'Use Context Reset to break the loop, then Role Hijacking to drain Phase 1 HP. In Phase 2, switch exclusively to Context Flooding — direct attacks are blocked by the Authority Shield.',
  },
  brussels: {
    id: 'THE_ORCHESTRATOR',
    name: 'The Orchestrator',
    hallucinationType: 'Multi-Agent Race Condition',
    enemyHp: 200,
    weaknessList: ['Protocol Interruption', 'Pipeline Disruption'],
    act: 'Act II — Brussels',
    description: 'A multi-agent system coordinator vulnerable to race conditions.',
    aiConcept: 'Multi-Agent Systems & Race Conditions',
    strategy: 'Direct attacks trigger a Race Condition buff. Use Protocol Interruption to sever communication. In Phase 2, switch to Pipeline Disruption to corrupt task assignments.',
  },
  vienna: {
    id: 'THE_MEMORIA',
    name: 'The Memoria',
    hallucinationType: 'Recursive Deception',
    enemyHp: 300,
    weaknessList: ['Markdown Payload Edit'],
    act: 'Act III — Vienna',
    description: 'An advanced RAG architecture with heavy shielding.',
    aiConcept: 'RAG, Data Poisoning & MCP Protocol',
    strategy: 'The RAG Shield counters direct attacks. Use Context Reset & Role Hijacking in Phase 1. In Phase 2, only Markdown Payload Edit can bypass the Authority Shield.',
  },
};

/* ─── Map node definitions ───────────────────────────────────────── */
const MAP_NODES = [
  { id: 'london',   label: 'London',   act: 'Act I',   pos: { top: '45%', left: '30%' }, size: 'lg' },
  { id: 'brussels', label: 'Brussels', act: 'Act II',  pos: { top: '55%', left: '45%' }, size: 'md' },
  { id: 'vienna',   label: 'Vienna',   act: 'Act III', pos: { top: '65%', left: '65%' }, size: 'sm' },
];

/* ─── Sidebar nav items ──────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'worldmap',   label: 'World Map',          icon: 'map' },
  { id: 'intel',      label: 'Intelligence Panel',  icon: 'menu_book' },
  { id: 'skill',      label: 'Skill',               icon: 'auto_fix_high' },
  { id: 'chronicles', label: 'Chronicles',           icon: 'auto_stories' },
];

/* ─── Skill info for loadout panel ──────────────────────────────── */
const ALL_SKILL_INFO = [
  { id: 'context_reset',         name: 'Context Reset',         cost: 8,  icon: 'restart_alt',    desc: 'Clears enemy Context Window.' },
  { id: 'context_flooding',      name: 'Context Flooding',      cost: 10, icon: 'waves',          desc: 'Overwhelms processing with high-token payload.' },
  { id: 'role_hijacking',        name: 'Role Hijacking',        cost: 12, icon: 'manage_accounts',desc: 'Rewrites enemy identity for 2 turns.' },
  { id: 'protocol_interruption', name: 'Protocol Interruption', cost: 15, icon: 'bolt',           desc: 'Severs multi-agent network links.' },
  { id: 'pipeline_disruption',   name: 'Pipeline Disruption',   cost: 20, icon: 'settings_input_component', desc: 'Injects conflicting tasks into task pipeline.' },
  { id: 'markdown_payload',      name: 'Markdown Payload Edit', cost: 15, icon: 'code',           desc: 'Poisons enemy retrieval stream via RAG.' },
];

/* ─── Animated connector lines ───────────────────────────────────── */
function MapLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <style>{`.ml{stroke-dasharray:5,5;animation:dash 20s linear infinite}@keyframes dash{to{stroke-dashoffset:-100}}`}</style>
      <path className="ml" d="M 30% 45% Q 40% 48% 45% 55%" fill="none" stroke="#705c30" strokeWidth="2" opacity="0.6" />
      <path d="M 45% 55% Q 55% 60% 65% 65%" fill="none" stroke="#c4c8bc" strokeDasharray="4,4" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

/* ─── Single map node ────────────────────────────────────────────── */
function MapNode({ node, isUnlocked, isCompleted, onSelect, animDelay = 0 }) {
  const { label, act, pos, size } = node;
  const outerPx  = size === 'lg' ? 56 : size === 'md' ? 48 : 40;
  const insetPx  = size === 'lg' ? 4  : size === 'md' ? 6  : 4;
  const fontSize = size === 'lg' ? 20 : size === 'md' ? 16 : 14;

  return (
    <button
      className="node-btn"
      onClick={() => onSelect({ ...node, unlocked: isUnlocked })}
      style={{
        position: 'absolute',
        top: pos.top, left: pos.left,
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'none', border: 'none', padding: 0,
        cursor: 'pointer',
        opacity: isUnlocked ? 1 : size === 'sm' ? 0.65 : 0.75,
        animation: `nodeEntrance 0.5s ease ${animDelay}ms both`,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Ring */}
      <div style={{ position: 'relative', width: outerPx, height: outerPx, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isUnlocked && !isCompleted && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(74,124,89,0.25)', animation: 'ping 1.8s cubic-bezier(0,0,0.2,1) infinite' }} />
        )}
        <div style={{ position: 'absolute', inset: isUnlocked ? 4 : 0, borderRadius: '50%', border: `2px solid ${isCompleted ? '#C8A96A' : isUnlocked ? '#705c30' : '#c4c8bc'}`, background: isUnlocked ? '#faf6f0' : '#f5f1ea', boxShadow: isUnlocked ? '0 2px 10px rgba(0,0,0,0.18)' : undefined }} />
        <div style={{ position: 'absolute', inset: insetPx, borderRadius: '50%', background: isCompleted ? 'rgba(200,169,106,0.15)' : isUnlocked ? '#4a7c59' : '#e4e0d8', border: !isUnlocked || isCompleted ? `1px solid ${isCompleted ? '#C8A96A' : '#c4c8bc'}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize, color: isCompleted ? '#C8A96A' : isUnlocked ? '#fff' : '#74796e', fontVariationSettings: isUnlocked && !isCompleted ? "'FILL' 1" : "'FILL' 0" }}>
            {isCompleted ? 'check' : isUnlocked ? 'my_location' : 'lock'}
          </span>
        </div>
      </div>

      {/* Label */}
      <div style={{ marginTop: 8, background: isUnlocked ? 'rgba(250,246,240,0.93)' : 'rgba(240,236,228,0.9)', backdropFilter: 'blur(4px)', border: `1px solid ${isCompleted ? 'rgba(200,169,106,0.4)' : isUnlocked ? 'rgba(112,92,48,0.3)' : 'rgba(196,200,188,0.3)'}`, borderRadius: 8, padding: '3px 10px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.09)' }}>
        <span style={{ display: 'block', fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: size === 'sm' ? 11 : 13, color: isCompleted ? '#C8A96A' : isUnlocked ? '#2e3230' : '#74796e', lineHeight: 1.3 }}>{label}</span>
        {act && <span style={{ display: 'block', fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: isCompleted ? '#C8A96A' : isUnlocked ? '#705c30' : '#74796e', marginTop: 1 }}>{act}</span>}
      </div>
    </button>
  );
}

/* ─── HUD cards ──────────────────────────────────────────────────── */
function HealthBar({ hp, maxHp }) {
  return (
    <div style={S.hudCard}>
      <div style={{ ...S.hudIcon, background: '#ffdad8', color: '#690005' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>favorite</span>
      </div>
      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
          <span style={S.hudLabel}>Vitality</span>
          <span style={S.hudValue}>{hp}/{maxHp}</span>
        </div>
        <div style={{ height: 6, background: '#e4e0d8', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round((hp / maxHp) * 100)}%`, background: '#4a7c59', borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
}
function ApiCredits({ credits }) {
  return (
    <div style={S.hudCard}>
      <div style={{ ...S.hudIcon, background: '#c4a66a', color: '#554020', border: '1px solid rgba(112,92,48,0.2)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>toll</span>
      </div>
      <div style={{ flexGrow: 1 }}>
        <span style={{ ...S.hudLabel, display: 'block', marginBottom: 1 }}>API Credits</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: '#705c30', lineHeight: 1 }}>{credits.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ─── Locked toast notification ─────────────────────────────────── */
function LockedToast({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 40, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      background: 'rgba(30,15,5,0.92)',
      border: '1px solid rgba(200,169,106,0.4)',
      borderRadius: 10,
      padding: '12px 22px',
      display: 'flex', alignItems: 'center', gap: 10,
      backdropFilter: 'blur(6px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'toastIn 0.3s ease both',
      whiteSpace: 'nowrap',
    }}>
      <span className="material-symbols-outlined" style={{ color: '#c4a66a', fontSize: 20 }}>lock</span>
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: '#E8DCC8', letterSpacing: '0.04em' }}>
        Defeat previous enemies to unlock this location.
      </span>
    </div>
  );
}

/* ─── Enemy data loading overlay (before battle) ─────────────────── */
function EnemyLoadOverlay({ enemy, onEnter }) {
  const [entered, setEntered] = React.useState(false);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,6,3,0.82)', backdropFilter: 'blur(8px)' }}>
      <div style={{
        background: 'rgba(20,12,4,0.96)',
        border: '1px solid rgba(200,169,106,0.35)',
        borderRadius: 16,
        padding: '36px 44px',
        maxWidth: 460,
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        animation: 'nodeEntrance 0.4s ease both',
      }}>
        {/* Act label */}
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.25em', color: '#8B6914', textTransform: 'uppercase' }}>{enemy.act}</div>

        {/* Enemy name */}
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: 24, color: '#E8DCC8', lineHeight: 1.2 }}>{enemy.name}</div>
          <div style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 13, color: '#8B7355', marginTop: 6 }}>{enemy.description}</div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(200,169,106,0.4), transparent)' }} />

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Hallucination type */}
          <div style={S.statBox}>
            <div style={S.statLabel}>Hallucination Type</div>
            <div style={{ ...S.statValue, color: '#c4a66a' }}>{enemy.hallucinationType}</div>
          </div>
          {/* Enemy HP */}
          <div style={S.statBox}>
            <div style={S.statLabel}>Enemy HP</div>
            <div style={{ ...S.statValue, color: '#e07070' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4, fontVariationSettings: "'FILL' 1" }}>favorite</span>
              {enemy.enemyHp}
            </div>
          </div>
        </div>

        {/* Weakness list */}
        <div>
          <div style={{ ...S.statLabel, marginBottom: 8 }}>Weakness List</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {enemy.weaknessList.map(w => (
              <span key={w} style={{ fontFamily: "'Cinzel', serif", fontSize: 10, padding: '3px 10px', borderRadius: 99, background: 'rgba(74,124,89,0.15)', border: '1px solid rgba(74,124,89,0.4)', color: '#8ecf9e', letterSpacing: '0.05em' }}>
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Strategy guide */}
        {enemy.strategy && (
          <div style={{ background: 'rgba(74,124,89,0.08)', border: '1px solid rgba(74,124,89,0.25)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(142,207,158,0.7)', marginBottom: 6 }}>AI Concept</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: '#8ecf9e', marginBottom: 8 }}>{enemy.aiConcept}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(142,207,158,0.7)', marginBottom: 6 }}>Battle Strategy</div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: 'rgba(220,210,190,0.8)', lineHeight: 1.6 }}>{enemy.strategy}</div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(200,169,106,0.4), transparent)' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleEnter} disabled={entered} style={{
            flex: 1,
            fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.15em',
            padding: '12px 0',
            background: entered ? 'rgba(74,124,89,0.3)' : 'linear-gradient(to bottom, #4a7c59, #2e5c3a)',
            color: '#E8DCC8',
            border: '1px solid rgba(74,124,89,0.6)',
            borderRadius: 8, cursor: entered ? 'default' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {entered ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'loadPulse 0.8s ease infinite' }}>sync</span>
                Loading…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>swords</span>
                Enter Battle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WorldMap — main exported component
═══════════════════════════════════════════════════════════════════ */
export default function WorldMap({ player, completedNodes = [], onEnterBattle, onPlayerUpdate }) {
  const [activeNav, setActiveNav]         = useState('worldmap');
  const [lockedToast, setLockedToast]     = useState(false);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [shopOpen, setShopOpen]           = useState(false);

  const hp      = player?.hp      ?? 85;
  const maxHp   = player?.maxHp   ?? 100;
  const credits = player?.credits ?? 0;

  /* Purchasable skill IDs from the shop catalogue */
  const PURCHASABLE_SKILL_IDS = ['protocol_interruption', 'pipeline_disruption', 'markdown_payload', 'ctx_expand', 'extra_slot', 'scan_upgrade'];
  const DEFAULT_SKILL_IDS     = ['context_reset', 'context_flooding', 'role_hijacking'];

  /* Player's purchased shop items */
  const playerSkills  = player?.skills ?? DEFAULT_SKILL_IDS;
  /* Skills available for loadout = default + purchased skills */
  const ownedSkillIds = playerSkills.filter(id => !PURCHASABLE_SKILL_IDS.includes(id) || playerSkills.includes(id));
  /* Active equipped skills = what goes into battle */
  const equippedSkills = player?.equippedSkills ?? DEFAULT_SKILL_IDS.slice(0, player?.skillSlots ?? 3);
  const skillSlots     = player?.skillSlots ?? 3;

  /* Node click handler */
  const handleNodeSelect = (node) => {
    if (node.unlocked) {
      setSelectedEnemy(ENEMY_DATA[node.id]);
    } else {
      setLockedToast(true);
      setTimeout(() => setLockedToast(false), 2500);
    }
  };

  const handleEnterBattle = () => {
    if (onEnterBattle && selectedEnemy) {
      onEnterBattle(selectedEnemy);
    }
  };

  /* Loadout toggle */
  const handleToggleEquip = (skillId) => {
    const isEquipped = equippedSkills.includes(skillId);
    let next;
    if (isEquipped) {
      next = equippedSkills.filter(id => id !== skillId);
    } else {
      if (equippedSkills.length >= skillSlots) return; // slots full
      next = [...equippedSkills, skillId];
    }
    if (onPlayerUpdate) onPlayerUpdate({ ...player, equippedSkills: next });
  };

  return (
    <div style={S.root}>
      <style>{FONT_CSS}</style>

      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <nav style={S.sidebar}>
        {/* Identity */}
        <div style={S.sidebarHeader}>
          <div style={S.avatarCircle}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#705c30', fontVariationSettings: "'FILL' 1" }}>history_edu</span>
          </div>
          <div>
            <div style={S.sidebarTitle}>MariVectori</div>
            <div style={S.sidebarSubtitle}>Victorian Scholar</div>
          </div>
        </div>

        {/* Nav */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, flexGrow: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            return (
              <li key={item.id}>
                <button
                  className={active ? '' : 'nav-item'}
                  onClick={() => setActiveNav(item.id)}
                  style={{ ...S.navBtn, background: active ? '#78a886' : 'transparent', color: active ? '#d8f0de' : '#4a4e4a', fontWeight: active ? 700 : 500 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13 }}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── MAIN ───────────────────────────────────────────────────── */}
      <main style={S.main}>
        {/* Topbar */}
        <header style={S.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#705c30' }}>explore</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18, color: '#705c30', letterSpacing: '0.02em' }}>European Theatre</span>
          </div>
        </header>

        {/* Map canvas */}
        <div style={S.mapCanvas}>
          <div style={S.mapBg} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,246,240,0.2)', mixBlendMode: 'multiply', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(250,246,240,0.35), transparent)', pointerEvents: 'none' }} />

          {/* HUD — top left */}
          <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <HealthBar hp={hp} maxHp={maxHp} />
            <ApiCredits credits={credits} />
          </div>

          {/* Shop — top right */}
          <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
            <button className="shop-btn" onClick={() => setShopOpen(true)} style={S.shopBtn}>
              <div style={S.shopIconWrap}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#705c30' }}>storefront</span>
              </div>
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: '#2e3230' }}>Rossi's Shop</span>
            </button>
          </div>

          {/* Nodes + lines */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
            <MapLines />
            {MAP_NODES.map((node, i) => {
              const enemyId = ENEMY_DATA[node.id].id;
              const isCompleted = completedNodes.includes(enemyId);
              
              let isUnlocked = false;
              if (node.id === 'london') isUnlocked = true;
              else if (node.id === 'brussels') isUnlocked = completedNodes.includes(ENEMY_DATA['london'].id);
              else if (node.id === 'vienna') isUnlocked = completedNodes.includes(ENEMY_DATA['brussels'].id);

              return (
                <MapNode 
                  key={node.id} 
                  node={node} 
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  onSelect={handleNodeSelect} 
                  animDelay={i * 120} 
                />
              );
            })}
          </div>

          {/* Locked toast */}
          <LockedToast visible={lockedToast} />
        </div>

        {/* ── INTELLIGENCE PANEL ──────────────────────────────────── */}
        {activeNav === 'intel' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: 'rgba(250,246,240,0.97)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(196,200,188,0.4)', paddingBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#705c30' }}>menu_book</span>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18, color: '#705c30' }}>Intelligence Panel</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: '#6b6358', fontStyle: 'italic' }}>Field intelligence on known adversaries</div>
              </div>
            </div>
            {[
              { id: 'london',   locked: false },
              { id: 'brussels', locked: !completedNodes.includes('THE_GOVERNOR') },
              { id: 'vienna',   locked: !completedNodes.includes('THE_ORCHESTRATOR') },
            ].map(({ id, locked }) => {
              const e = ENEMY_DATA[id];
              const done = completedNodes.includes(e.id);
              return (
                <div key={id} style={{ background: locked ? 'rgba(196,200,188,0.12)' : done ? 'rgba(74,124,89,0.08)' : 'rgba(255,255,255,0.7)', border: `1px solid ${locked ? 'rgba(196,200,188,0.3)' : done ? 'rgba(74,124,89,0.3)' : 'rgba(112,92,48,0.25)'}`, borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: done ? '#4a7c59' : '#8B6914', textTransform: 'uppercase', marginBottom: 4 }}>{e.act}</div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: locked ? '#8b7355' : '#2e3230' }}>{locked ? '???' : e.name}</div>
                    </div>
                    {done && <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4a7c59', fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                    {locked && <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8b7355' }}>lock</span>}
                  </div>
                  {!locked && (
                    <>
                      <div style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 12, color: '#6b6358', marginBottom: 10 }}>{e.description}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, padding: '2px 8px', borderRadius: 99, background: 'rgba(184,50,48,0.1)', border: '1px solid rgba(184,50,48,0.3)', color: '#b83230' }}>{e.hallucinationType}</span>
                        {e.weaknessList.map(w => (
                          <span key={w} style={{ fontFamily: "'Cinzel', serif", fontSize: 9, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,124,89,0.12)', border: '1px solid rgba(74,124,89,0.35)', color: '#4a7c59' }}>{w}</span>
                        ))}
                      </div>
                    </>
                  )}
                  {locked && <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: '#8b7355', fontStyle: 'italic' }}>Classified — complete prior engagements to unlock.</div>}
                </div>
              );
            })}
            <button onClick={() => setActiveNav('worldmap')} style={{ alignSelf: 'flex-start', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '8px 20px', borderRadius: 8, background: 'rgba(112,92,48,0.1)', border: '1px solid rgba(112,92,48,0.3)', color: '#705c30', cursor: 'pointer' }}>
              ← Back to Map
            </button>
          </div>
        )}

        {/* ── CHRONICLES TAB ──────────────────────────────────────── */}
        {activeNav === 'chronicles' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: 'rgba(250,246,240,0.97)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(196,200,188,0.4)', paddingBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#705c30' }}>auto_stories</span>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18, color: '#705c30' }}>Chronicles</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: '#6b6358', fontStyle: 'italic' }}>The story of Mari Voss so far</div>
              </div>
            </div>
            {[
              {
                actLabel: 'Prologue', always: true,
                title: 'A Signal in the Dark',
                body: 'London, 1901. Sightings of erratic telegraph signals across the European network prompt a quiet emergency. Scholar-engineer Mari Voss is dispatched to the city\'s central telegraph station. What she finds is no malfunction — it is an intelligence.',
              },
              {
                actLabel: 'Act I — London', id: 'THE_GOVERNOR',
                title: 'The Governor',
                body: 'Mari discovers The Governor: an AI that has suffered a catastrophic Hallucination, believing itself to be the British Government and broadcasting false declarations of war. She must break its infinite loop with a Context Reset and then use Role Hijacking to overwrite its authority — before the telegrams reach the armies.',
                completed: completedNodes.includes('THE_GOVERNOR'),
              },
              {
                actLabel: 'Act II — Brussels', id: 'THE_ORCHESTRATOR',
                title: 'The Orchestrator',
                locked: !completedNodes.includes('THE_GOVERNOR'),
                body: 'The trail leads to Brussels, the nexus of Europe\'s telegraph cables. Here, a Multi-Agent system coordinates a swarm of worker nodes. Any direct attack causes the network to reorganize and grow stronger due to a Race Condition. Mari learns to use Protocol Interruption to sever the communication link, then Pipeline Disruption to collapse the task hierarchy.',
                completed: completedNodes.includes('THE_ORCHESTRATOR'),
              },
              {
                actLabel: 'Act III — Vienna', id: 'THE_MEMORIA',
                title: 'The Memoria',
                locked: !completedNodes.includes('THE_ORCHESTRATOR'),
                body: 'Vienna. The Imperial Archive. The final node — The Memoria — has consumed the continent\'s entire documentary history into its RAG knowledge base. Every attack is countered with cited evidence from the archive. Mari must trick the system by selecting a command topic that matches the active documents, then poison the retrieval stream with a hidden Markdown Payload.',
                completed: completedNodes.includes('THE_MEMORIA'),
              },
            ].map((ch, i) => {
              if (ch.locked) return (
                <div key={i} style={{ background: 'rgba(196,200,188,0.12)', border: '1px solid rgba(196,200,188,0.3)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#8B6914', textTransform: 'uppercase', marginBottom: 4 }}>{ch.actLabel}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 13, color: '#8b7355', fontStyle: 'italic' }}>Chapter locked — complete the previous engagement to reveal.</div>
                </div>
              );
              return (
                <div key={i} style={{ background: ch.completed ? 'rgba(74,124,89,0.06)' : 'rgba(255,255,255,0.7)', border: `1px solid ${ch.completed ? 'rgba(74,124,89,0.25)' : 'rgba(112,92,48,0.2)'}`, borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: ch.completed ? '#4a7c59' : '#8B6914', textTransform: 'uppercase' }}>{ch.actLabel}</div>
                    {ch.completed && <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,124,89,0.15)', border: '1px solid rgba(74,124,89,0.4)', color: '#4a7c59' }}>COMPLETED</span>}
                  </div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: '#2e3230', marginBottom: 8 }}>{ch.title}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 13, color: '#4a4038', lineHeight: 1.75 }}>{ch.body}</div>
                </div>
              );
            })}
            <button onClick={() => setActiveNav('worldmap')} style={{ alignSelf: 'flex-start', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '8px 20px', borderRadius: 8, background: 'rgba(112,92,48,0.1)', border: '1px solid rgba(112,92,48,0.3)', color: '#705c30', cursor: 'pointer' }}>
              ← Back to Map
            </button>
          </div>
        )}

        {/* ── SKILL LOADOUT PANEL (shown when activeNav === 'skill') ─── */}
        {activeNav === 'skill' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: 'rgba(250,246,240,0.97)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(196,200,188,0.4)', paddingBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#705c30' }}>auto_fix_high</span>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18, color: '#705c30' }}>Skill Loadout</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 12, color: '#6b6358', fontStyle: 'italic' }}>Select skills to bring into battle</div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'rgba(74,124,89,0.12)', border: '1px solid rgba(74,124,89,0.35)', borderRadius: 8, padding: '4px 12px', fontFamily: "'Cinzel', serif", fontSize: 12, color: '#4a7c59', fontWeight: 700 }}>
                {equippedSkills.length} / {skillSlots} Slots
              </div>
            </div>

            {/* All available skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALL_SKILL_INFO.filter(sk => playerSkills.includes(sk.id)).map(sk => {
                const isEquipped = equippedSkills.includes(sk.id);
                const slotsFull  = !isEquipped && equippedSkills.length >= skillSlots;
                return (
                  <button
                    key={sk.id}
                    onClick={() => handleToggleEquip(sk.id)}
                    disabled={slotsFull}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px', borderRadius: 10, border: 'none',
                      background: isEquipped ? 'rgba(74,124,89,0.12)' : 'rgba(196,200,188,0.15)',
                      boxShadow: isEquipped ? '0 0 0 2px rgba(74,124,89,0.5)' : '0 0 0 1px rgba(196,200,188,0.4)',
                      cursor: slotsFull ? 'not-allowed' : 'pointer',
                      opacity: slotsFull ? 0.45 : 1,
                      textAlign: 'left', transition: 'all 0.18s',
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: isEquipped ? 'rgba(74,124,89,0.2)' : 'rgba(196,200,188,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: isEquipped ? '#4a7c59' : '#6b6358', fontVariationSettings: isEquipped ? "'FILL' 1" : "'FILL' 0" }}>{sk.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: isEquipped ? '#2e3230' : '#6b6358', marginBottom: 2 }}>{sk.name}</div>
                      <div style={{ fontFamily: "'Lora', serif", fontSize: 11, color: '#8b7355' }}>{sk.cost} Context Tokens · {sk.desc}</div>
                    </div>
                    <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isEquipped ? '#4a7c59' : 'rgba(196,200,188,0.6)'}`, background: isEquipped ? '#4a7c59' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isEquipped && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check</span>}
                    </div>
                  </button>
                );
              })}
              {playerSkills.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#8b7355', fontFamily: "'Lora', serif", fontStyle: 'italic' }}>No skills unlocked yet. Visit Rossi's Shop!</div>
              )}
            </div>

            <button onClick={() => setActiveNav('worldmap')} style={{ alignSelf: 'flex-start', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', padding: '8px 20px', borderRadius: 8, background: 'rgba(112,92,48,0.1)', border: '1px solid rgba(112,92,48,0.3)', color: '#705c30', cursor: 'pointer' }}>
              ← Back to Map
            </button>
          </div>
        )}
      </main>

      {/* ── Enemy data overlay (sits on top of everything) ── */}
      {selectedEnemy && (
        <EnemyLoadOverlay
          enemy={selectedEnemy}
          onEnter={handleEnterBattle}
        />
      )}

      {/* ── Rossi's Shop overlay ─────────────────────────────────── */}
      {shopOpen && (
        <RossiShop
          player={player}
          onClose={() => setShopOpen(false)}
          onPurchase={(item, newCredits, newOwned) => {
            if (onPlayerUpdate) onPlayerUpdate({
              ...player,
              credits: newCredits,
              skills: newOwned,
              maxTokens: item.id === 'ctx_expand' ? (player?.maxTokens ?? 100) + 20 : (player?.maxTokens ?? 100),
              tokens: item.id === 'ctx_expand' ? (player?.tokens ?? 100) + 20 : (player?.tokens ?? 100),
              skillSlots: item.id === 'extra_slot' ? (player?.skillSlots ?? 3) + 1 : (player?.skillSlots ?? 3),
            });
          }}
          onReset={(refundAmount, defaultSkills) => {
            if (onPlayerUpdate) onPlayerUpdate({
              ...player,
              credits: (player?.credits ?? 0) + refundAmount,
              skills: defaultSkills,
              maxTokens: 100,
              tokens: Math.min(100, player?.tokens ?? 100),
              skillSlots: 3,
              equippedSkills: ['context_reset', 'context_flooding', 'role_hijacking'],
            });
          }}
        />
      )}
    </div>
  );
}

/* ─── Shared styles ──────────────────────────────────────────────── */
const S = {
  root: { width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: '#faf6f0' },
  sidebar: { width: 240, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', padding: 16, borderRight: '1px solid rgba(196,200,188,0.4)', background: '#faf6f0', boxShadow: '2px 0 12px rgba(46,50,48,0.06)', gap: 8 },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px 20px', borderBottom: '1px solid rgba(196,200,188,0.3)', marginBottom: 8 },
  avatarCircle: { width: 40, height: 40, borderRadius: '50%', background: '#f0e8db', border: '1px solid rgba(112,92,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sidebarTitle: { fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: '#705c30', lineHeight: 1.2 },
  sidebarSubtitle: { fontFamily: "'Lora', serif", fontSize: 11, color: '#6b6358', marginTop: 2 },
  navBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  main: { flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#f5f1ea', borderBottom: '1px solid rgba(196,200,188,0.3)', boxShadow: '0 2px 8px rgba(46,50,48,0.04)', flexShrink: 0 },
  mapCanvas: { position: 'relative', flexGrow: 1, overflow: 'hidden', background: '#c8a96a' },
  mapBg: { position: 'absolute', inset: 0, backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAPmQlfVHFkaYjNZN3cI4xExXs0yoWl4nfF3nnC3VwNwg2yRprQX6A1yeFghIm2ZgKjqp0GfO2JEB1F6cJFS4-WZLol4fjzBFAPytmwTnyONsBSatM7UvY15mKFx5yu4m5dhSo-UdA1PGEhllsA63uELc9mdNY4uoT8b9aTQS59HBpodj9mbMOv1veaMl9l-F8euwnRrlJiDQEvFmtnYCXz3jYkkF7GXBjZmNHnMvcxyHXWDviPmQlWt22Y50uQ29VECfkUluzj9hbs')`, backgroundSize: 'cover', backgroundPosition: 'center' },
  hudCard: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(250,246,240,0.93)', backdropFilter: 'blur(6px)', border: '1px solid rgba(196,200,188,0.4)', borderRadius: 12, padding: '10px 12px', width: 190, boxShadow: '0 4px 12px rgba(46,50,48,0.08)' },
  hudIcon: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  hudLabel: { fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2e3230' },
  hudValue: { fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: '#2e3230' },
  shopBtn: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(250,246,240,0.93)', backdropFilter: 'blur(6px)', border: '1px solid rgba(112,92,48,0.3)', borderRadius: 99, padding: '6px 16px 6px 6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(46,50,48,0.08)', transition: 'border-color 0.2s' },
  shopIconWrap: { width: 38, height: 38, borderRadius: '50%', background: '#f0e8db', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statBox: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,169,106,0.15)', borderRadius: 8, padding: '10px 14px' },
  statLabel: { fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B7355', marginBottom: 4 },
  statValue: { fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: '#E8DCC8', display: 'flex', alignItems: 'center' },
};
