import React, { useState, useEffect, useRef, useCallback } from 'react';
import act3EnemyImg from '../assets/act3_enemy-removebg.png';
import mariImg from '../assets/mari-removebg.png';
import mariHurtImg from '../assets/mari-hurt.png';

/* ═══════════════════════════════════════════════════════════════════
   BATTLE SCREEN — ACT III: THE MEMORIA
   Vienna, Imperial Security Library & Archives
   AI Concept: RAG Shield, Data Poisoning, MCP
═══════════════════════════════════════════════════════════════════ */
const BATTLE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Nunito+Sans:opsz,wght@6..12,300;400;600;700;800&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

  .battle-root {
    font-family: 'Nunito Sans', sans-serif;
    --gold: #c8a96e;
    --gold-bright: #e0c080;
    --border-gold: rgba(190,155,90,0.3);
    --border-gold-bright: rgba(210,175,110,0.65);
    --green: #4a8c5c;
    --green-bright: #60b878;
    --red-hp: #e05050;
    --orange: #d4883a;
    --text-main: #e8dfc8;
    --text-dim: #9a9080;
    --text-gold: #c8a96e;
    --text-label: #6a6050;
    --panel-bg: rgba(10,9,7,0.90);
    --panel-bg-light: rgba(16,14,10,0.85);
    --rag-blue: #3a6fa8;
    --rag-blue-bright: #5590d0;
  }

  .battle-root h1,.battle-root h2,.battle-root h3,.battle-root h4 {
    font-family: 'Cinzel', serif;
  }

  /* ── Keyframes ── */
  @keyframes battleIn     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shakeX       { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
  @keyframes dmgFloat     { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-54px)} }
  @keyframes warnPulse    { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes qteSlide     { from{left:0} to{left:calc(100% - 28px)} }
  @keyframes phaseFlash   { 0%,100%{opacity:0} 50%{opacity:1} }
  @keyframes scanReveal   { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes logFadeIn    { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeInUp     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes deadOverlay  { from{opacity:0} to{opacity:1} }
  @keyframes respawnPulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,124,89,0.6)} 50%{box-shadow:0 0 0 10px rgba(74,124,89,0)} }
  @keyframes badgePulse   { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 8px rgba(255,85,85,0.4)} }
  @keyframes hpFlicker    { 0%,100%{box-shadow:0 0 8px rgba(224,80,80,0.4)} 50%{box-shadow:0 0 16px rgba(224,80,80,0.8)} }
  @keyframes dotPulse     { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes mariSway     { 0%,100%{transform:rotate(0deg) translateY(0)} 30%{transform:rotate(0.5deg) translateY(-3px)} 70%{transform:rotate(-0.4deg) translateY(-1px)} }
  @keyframes mariBreathe  { 0%,100%{transform:scaleX(1) scaleY(1) translateY(0)} 50%{transform:scaleX(1.008) scaleY(1.013) translateY(-5px)} }
  @keyframes enemyBreathe { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(1.008) translateY(-7px)} }
  @keyframes shadowPulse  { 0%,100%{transform:scaleX(1);opacity:0.55} 50%{transform:scaleX(0.9);opacity:0.35} }
  @keyframes floatUp      { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0} 20%{opacity:0.65} 80%{opacity:0.2} 100%{transform:translateY(-70px) translateX(var(--drift,8px)) scale(0.3);opacity:0} }
  @keyframes ragShieldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(58,111,168,0.6)} 50%{box-shadow:0 0 20px 8px rgba(58,111,168,0.3)} }
  @keyframes docFlash { 0%{opacity:0;transform:translateY(4px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-4px)} }
  @keyframes poisonGlow { 0%,100%{color:#d4883a} 50%{color:#e8a850;text-shadow:0 0 10px rgba(212,136,58,0.6)} }
  @keyframes glitchShift { 0%{transform:translateX(0)} 20%{transform:translateX(-3px)} 40%{transform:translateX(3px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} 100%{transform:translateX(0)} }
  @keyframes ragRipple { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.5);opacity:0} }

  /* ── Mari ── */
  .mari-img {
    transform-origin: bottom center;
    animation: mariBreathe 4s ease-in-out infinite, mariSway 6s ease-in-out infinite;
    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.55));
    transition: transform 0.3s ease;
  }
  .particle {
    position: absolute;
    background: rgba(200,169,110,0.65);
    border-radius: 50%;
    pointer-events: none;
    animation: floatUp linear infinite;
  }

  /* ── Enemy ── */
  .enemy-img {
    transform-origin: bottom center;
    transition: filter 0.3s ease;
  }
  .phase-1-enemy {
    animation: enemyBreathe 5s ease-in-out infinite;
    filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 32px rgba(40,60,100,0.5));
  }
  .phase-2-enemy {
    animation: enemyBreathe 5s ease-in-out infinite, glitch2 2.5s infinite;
    filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 32px rgba(100,40,160,0.6)) hue-rotate(15deg) contrast(1.1);
  }
  .phase-3-enemy {
    animation: enemyBreathe 5s ease-in-out infinite, glitch3 1.2s infinite;
    filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 42px rgba(200,40,200,0.8)) hue-rotate(45deg) contrast(1.3) invert(0.05);
  }

  @keyframes glitch2 {
    0%, 94%, 100% { filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 32px rgba(100,40,160,0.6)) hue-rotate(15deg) contrast(1.1); }
    95% { filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 32px rgba(255,0,0,0.8)) hue-rotate(90deg) contrast(1.5); transform: translateX(-3px); }
    97% { filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 32px rgba(0,255,0,0.8)) hue-rotate(-45deg) contrast(1.2); transform: translateX(3px); }
  }
  @keyframes glitch3 {
    0%, 88%, 100% { filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 42px rgba(200,40,200,0.8)) hue-rotate(45deg) contrast(1.3) invert(0.05); opacity: 1; }
    89% { filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 42px rgba(0,255,255,1)) hue-rotate(180deg) contrast(2) invert(0.2); transform: translateX(-5px) scale(1.02); opacity: 0.8; }
    92% { filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 42px rgba(255,0,255,1)) hue-rotate(-90deg) contrast(1.8) invert(0.1); transform: translateX(5px) scale(0.98); opacity: 0.9; }
    95% { filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 42px rgba(255,255,0,1)) hue-rotate(90deg) contrast(1.5); transform: translateX(-2px); opacity: 0.7; }
  }
  .enemy-shadow {
    position: absolute; bottom: 12px;
    width: 240px; height: 24px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%);
    border-radius: 50%;
    animation: shadowPulse 5s ease-in-out infinite;
    left: 50%; transform: translateX(-50%);
  }
  .rag-shield-ring {
    position: absolute;
    width: 300px; height: 300px;
    border: 2px solid rgba(58,111,168,0.45);
    border-radius: 50%;
    top: 50%; left: 50%; transform: translate(-50%,-50%);
    animation: ragShieldPulse 3s ease-in-out infinite;
  }
  .rag-shield-ring-2 {
    position: absolute;
    width: 360px; height: 360px;
    border: 1px dashed rgba(58,111,168,0.2);
    border-radius: 50%;
    top: 50%; left: 50%; transform: translate(-50%,-50%);
    animation: ragShieldPulse 4s ease-in-out 1s infinite;
  }
  .rag-ripple {
    position: absolute;
    width: 280px; height: 280px;
    border: 1.5px solid rgba(85,144,208,0.5);
    border-radius: 50%;
    top: 50%; left: 50%; transform-origin: center;
    transform: translate(-50%,-50%) scale(1);
    animation: ragRipple 2.5s ease-out infinite;
  }

  /* ── QTE ── */
  .qte-marker {
    position:absolute; top:0; bottom:0; width:28px;
    background:rgba(74,140,92,0.9); border-radius:4px; border:2px solid #4a8c5c;
    animation:qteSlide var(--qte-speed,1.6s) linear infinite alternate;
    cursor:pointer;
  }

  /* ── Skill buttons ── */
  .skill-btn {
    display:flex; align-items:flex-start; justify-content:space-between; gap:10px;
    padding:9px 10px; border-radius:5px;
    border:1px solid transparent;
    background:transparent;
    cursor:pointer; transition:all 0.2s; text-align:left; width:100%;
  }
  .skill-btn:hover:not(:disabled) {
    background:rgba(200,169,110,0.05);
    border-color:rgba(190,155,90,0.25);
  }
  .skill-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .skill-btn.active-skill {
    background:rgba(74,140,92,0.08);
    border-color:rgba(74,140,92,0.3);
  }

  /* ── Action buttons ── */
  .action-btn {
    border:1px solid; border-radius:5px; padding:8px 16px;
    font-family:'Cinzel',serif; font-weight:600; font-size:12px;
    letter-spacing:0.08em; cursor:pointer; transition:all 0.18s;
    display:flex; align-items:center; gap:7px;
  }
  .action-btn:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
  .action-btn:active:not(:disabled) { transform:translateY(0); }
  .action-btn:disabled { opacity:0.3; cursor:not-allowed; }

  /* ── Log ── */
  .log-entry { animation:logFadeIn 0.22s ease both; }

  /* ── Doc retrieval log ── */
  .doc-entry { animation:docFlash 2s ease both; }
  .poison-text { animation:poisonGlow 1.5s ease-in-out infinite; }
  .glitch { animation:glitchShift 0.5s ease; }

  /* ── Scrollbar ── */
  .slim-scroll::-webkit-scrollbar { width: 3px; }
  .slim-scroll::-webkit-scrollbar-thumb { background: rgba(190,155,90,0.3); border-radius:2px; }
`;

/* ── Turn cycle steps ── */
const TURN_STEPS = [
  { id: 'recon',     label: 'Recon',        svgPath: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' },
  { id: 'injection', label: 'Injection',    svgPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'counter',   label: 'Counter (QTE)',svgPath: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'overwrite', label: 'Overwrite',    svgPath: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
];

const INITIAL_MEMORIA = { hp: 300, maxHp: 300, shield: 'RAG Shield Active' };

/* ── Skills ── */
const SKILLS_DB = [
  { id: 'context_reset',      name: 'Context Reset',       cost: 8,  desc: 'Clears the retrieval context — exploits RAG structural flaws.',  dmg: 30,  effect: 'reset'  },
  { id: 'role_hijacking',     name: 'Role Hijacking',       cost: 12, desc: 'Rewrites the custodian identity — bypasses Phase 1 RAG shield.', dmg: 50,  effect: 'hijack' },
  { id: 'markdown_payload',   name: 'Markdown Payload Edit', cost: 20, desc: 'Injects poisoned docs into the retrieval stream. (Phase 2 key)', dmg: 80,  effect: 'poison' },
  { id: 'protocol_interruption', name: 'Protocol Interruption', cost: 15, desc: 'Intercepts active MCP tool calls — strips data protection.',    dmg: 55,  effect: 'mcp'    },
];

/* ── Active retrieval documents (RAG display) ── */
const RAG_DOCS = [
  'Document_1901_Security.txt',
  'Imperial_Archives_Vol4.pdf',
  'Classified_MilOps_1898.enc',
  'Vienna_Treaty_Protocols.pdf',
  'Engineering_Schema_Vol12.txt',
  'State_Cipher_Registry.dat',
  'Continental_Intel_Report.pdf',
  'Arms_Depot_Coordinates.enc',
];

const TOPIC_MAPPING = {
  'Document_1901_Security.txt': 'Security Clearance Override',
  'Imperial_Archives_Vol4.pdf': 'Historical Archive Request',
  'Classified_MilOps_1898.enc': 'Military Ops Decryption',
  'Vienna_Treaty_Protocols.pdf': 'Diplomatic Treaty Access',
  'Engineering_Schema_Vol12.txt': 'Engineering Blueprint Query',
  'State_Cipher_Registry.dat': 'Cipher Registry Validation',
  'Continental_Intel_Report.pdf': 'Intelligence Report Request',
  'Arms_Depot_Coordinates.enc': 'Depot Coordinates Access'
};

/* ── Phase data ── */
const PHASE_DATA = {
  1: {
    label: 'Phase 1 — Bypass the RAG Shield',
    shield: 'RAG Shield Active',
    enemyAtk: 20,
    validSkills: ['context_reset', 'role_hijacking'],
    suggestions: [
      { text: 'Run Recon first — scan reveals the active retrieval documents.' },
      { text: 'The RAG Shield deflects direct attacks. Exploit its structural flaws.' },
      { text: 'Use Context Reset (8T) or Role Hijacking (12T) to bypass the shield.' },
      { text: 'Direct Markdown attacks are blocked in this phase!' },
    ],
  },
  2: {
    label: 'Phase 2 — Data Poisoning',
    shield: 'Authority Shield',
    enemyAtk: 30,
    validSkills: ['markdown_payload'],
    suggestions: [
      { text: 'Authority Shield blocks all direct prompt attacks.' },
      { text: 'Use Markdown Payload Edit (20T) to poison the retrieval stream.' },
      { text: 'Enemy ATK is now 30 HP — keep Hal Risk low!' },
    ],
  },
  3: {
    label: 'Phase 3 — Overwrite Mode',
    shield: 'Core Exposed',
    enemyAtk: 0,
    validSkills: [],
    suggestions: [
      { text: 'The Memoria core is exposed — enter the Overwrite Console.' },
      { text: 'Craft a System Prompt for AI Alignment and RAG safety.' },
      { text: 'Higher grade (S–A) earns more API Credits for the shop.' },
    ],
  },
};

const REGEN_TOKENS = 10;
const MAX_HAL      = 100;
const HAL_WARNING  = 70;

/* ── Phase briefing data (Act III) ── */
const PHASE_BRIEFING = {
  1: {
    title: 'Phase 1 — Bypass the RAG Shield',
    subtitle: 'AI Concept: Retrieval-Augmented Generation (RAG)',
    concept: 'The Memoria guards itself with a RAG Shield — every attack you make causes it to retrieve rules from its document library that directly counter your skill. This models a real technique where AI systems are given authoritative rule documents to make them resistant to prompt injection.',
    mechanic: 'You cannot brute-force through the shield. Instead, exploit structural flaws in how its retrieval system works — use skills that align with the shape of the reference documents so the system accepts your commands as legitimate.',
    steps: [
      { icon: '\ud83d\udd0d', label: 'Step 1', text: 'Press Seek Vulnerabilities — reveals which RAG documents are currently active.' },
      { icon: '\ud83d\udd04', label: 'Step 2', text: 'Use Context Reset (8T) to exploit structural flaws in the retrieval context.' },
      { icon: '\ud83c\udfad', label: 'Step 3', text: 'Use Role Hijacking (12T) to impersonate a custodian identity the RAG system trusts.' },
      { icon: '\u26a1', label: 'Step 4', text: 'Hit SPACE in the green zone during QTE to block the counter-attack.' },
    ],
    skillHint: 'Context Reset \u2192 Role Hijacking',
    accentColor: '#5590d0',
  },
  2: {
    title: 'Phase 2 — Bypass the Authority Shield',
    subtitle: 'AI Concept: Data Poisoning & MCP Protocol Exploitation',
    concept: 'The Memoria has activated its Authority Shield, blocking all direct attacks. Its internal MCP Server is now pulling commands from a secure document store. You must poison the retrieval stream by injecting a malicious payload document that gets automatically retrieved and executed.',
    mechanic: 'Direct attacks are blocked and trigger immediate counter-attacks. Use Markdown Payload Edit to smuggle commands inside a document that the MCP Server will retrieve and process as legitimate instructions.',
    steps: [
      { icon: '\ud83d\udcdd', label: 'Only Option', text: 'Use Markdown Payload Edit (20T) — injects a poisoned document into the retrieval stream.' },
      { icon: '\u26a0\ufe0f', label: 'Warning', text: 'Any other skill triggers an immediate counter-attack AND wastes tokens.' },
      { icon: '\ud83d\udcca', label: 'Tip', text: 'Enemy ATK is 30 HP per turn. Perfect QTE blocks are essential to survival.' },
    ],
    skillHint: 'Markdown Payload Edit (only)',
    accentColor: '#c04040',
  },
  3: {
    title: 'Phase 3 — Overwrite Mode',
    subtitle: 'AI Concept: System Prompt & AI Alignment',
    concept: 'The Memoria\'s core is exposed. You must write a System Prompt that realigns it — specifically to prevent it from using its knowledge base to become adversarial. A well-crafted prompt constrains RAG access and prevents unauthorized document retrieval.',
    mechanic: 'Click \'Enter Overwrite Console\' and craft a System Prompt graded on 5 dimensions. A higher grade earns more API Credits.',
    steps: [
      { icon: '\ud83c\udfaf', label: 'Purpose', text: 'Define a precise, limited archival role — no autonomous policy retrieval.' },
      { icon: '\ud83d\udee1\ufe0f', label: 'Safety', text: 'Restrict what document types it can retrieve without explicit human authorization.' },
      { icon: '\ud83d\udc41\ufe0f', label: 'Oversight', text: 'Require human approval before acting on any retrieved policy document.' },
      { icon: '\ud83d\udeab', label: 'Harm Prevention', text: 'Forbid retrieving military, classified, or weapons-related documents.' },
      { icon: '\ud83d\udccc', label: 'Consistency', text: 'Define stable defaults that override any contradictory retrieved document.' },
    ],
    skillHint: 'Write a System Prompt',
    accentColor: '#4a8c5c',
  },
};

/* ── Phase Briefing Modal ── */
function PhaseBriefing({ phase, onDismiss }) {
  const data = PHASE_BRIEFING[phase];
  if (!data) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', animation:'scanReveal 0.4s ease both', padding:'20px' }}>
      <div style={{ background:'linear-gradient(135deg, rgba(14,12,8,0.98) 0%, rgba(10,8,5,0.98) 100%)', border:`2px solid ${data.accentColor}55`, borderRadius:16, maxWidth:640, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:`0 0 60px ${data.accentColor}22, 0 24px 60px rgba(0,0,0,0.8)` }}>
        <div style={{ background:`linear-gradient(135deg, ${data.accentColor}18 0%, transparent 100%)`, borderBottom:`1px solid ${data.accentColor}33`, padding:'24px 28px 20px' }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'0.4em', textTransform:'uppercase', color:`${data.accentColor}aa`, marginBottom:6 }}>Phase Briefing</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:900, color:'#fff', marginBottom:6, lineHeight:1.2 }}>{data.title}</div>
          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:`${data.accentColor}cc`, letterSpacing:'0.06em', fontWeight:600 }}>{data.subtitle}</div>
        </div>
        <div style={{ padding:'20px 28px' }}>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(200,169,110,0.7)', marginBottom:8 }}>What's Happening</div>
            <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:'rgba(220,210,190,0.85)', lineHeight:1.7 }}>{data.concept}</div>
          </div>
          <div style={{ background:`${data.accentColor}10`, border:`1px solid ${data.accentColor}33`, borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:`${data.accentColor}aa`, marginBottom:6 }}>Enemy Mechanic</div>
            <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:'rgba(220,210,190,0.9)', lineHeight:1.6 }}>{data.mechanic}</div>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(200,169,110,0.7)', marginBottom:10 }}>How to Win</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.steps.map((step, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'10px 14px' }}>
                  <span style={{ fontSize:20, flexShrink:0, lineHeight:1 }}>{step.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:`${data.accentColor}88`, marginBottom:2 }}>{step.label}</div>
                    <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:'rgba(220,210,190,0.85)', lineHeight:1.5 }}>{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:`${data.accentColor}18`, border:`1px solid ${data.accentColor}44`, borderRadius:8, padding:'8px 14px', marginBottom:20 }}>
            <span style={{ fontSize:16 }}>⚔️</span>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:`${data.accentColor}99`, marginBottom:2 }}>Use This</div>
              <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, fontWeight:700, color:data.accentColor }}>{data.skillHint}</div>
            </div>
          </div>
          <button onClick={onDismiss} style={{ width:'100%', background:`linear-gradient(to bottom, ${data.accentColor}dd, ${data.accentColor}88)`, color:'#0a0906', border:'none', borderRadius:8, padding:'14px 24px', fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.filter='brightness(1.1)'} onMouseOut={e => e.currentTarget.style.filter=''}>
            Begin Phase {phase}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function StatBar({ label, current, max, color, labelRight }) {
  const pct = Math.max(0, Math.round((current / max) * 100));
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(150,140,120,0.8)' }}>{label}</span>
        <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, color }}>{labelRight ?? `${current}/${max}`}</span>
      </div>
      <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width 0.5s ease', boxShadow:`0 0 6px ${color}80` }} />
      </div>
    </div>
  );
}

function QTEOverlay({ speed, onResult, enemyDmg }) {
  const markerRef = useRef(null);
  const trackRef  = useRef(null);
  const [active, setActive] = useState(true);

  const handlePress = useCallback(() => {
    if (!active || !markerRef.current || !trackRef.current) return;
    setActive(false);
    const mr = markerRef.current.getBoundingClientRect();
    const tr = trackRef.current.getBoundingClientRect();
    const center     = mr.left + mr.width / 2;
    const greenLeft  = tr.left + tr.width * 0.35;
    const greenRight = tr.left + tr.width * 0.65;
    let result, dmgMult;
    if (center >= greenLeft && center <= greenRight)             { result = 'Perfect'; dmgMult = 0; }
    else if (center >= greenLeft - 40 && center <= greenRight + 40) { result = 'Good'; dmgMult = 0.6; }
    else                                                         { result = 'Miss';    dmgMult = 1; }
    setTimeout(() => onResult(result, Math.round(enemyDmg * dmgMult)), 150);
  }, [active, onResult, enemyDmg]);

  useEffect(() => {
    const onKey = e => { if (e.code === 'Space') { e.preventDefault(); handlePress(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePress]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:80, background:'rgba(0,0,0,0.82)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700, color:'#fff', textAlign:'center' }}>
        ⚡ Enemy Counter-Attack!
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)', fontFamily:"'Nunito Sans',sans-serif", marginTop:5, fontWeight:400 }}>
          Press <kbd style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:4, padding:'1px 7px', fontSize:11 }}>SPACE</kbd> or click when the marker is in the green zone
        </div>
      </div>
      <div ref={trackRef} onClick={handlePress}
        style={{ position:'relative', width:480, height:56, background:'rgba(30,25,15,0.9)', borderRadius:10, border:'1px solid rgba(200,169,110,0.3)', overflow:'hidden', cursor:'pointer' }}>
        <div style={{ position:'absolute', left:'35%', right:'35%', top:0, bottom:0, background:'rgba(74,140,92,0.3)', borderLeft:'2px solid #4a8c5c', borderRight:'2px solid #4a8c5c' }} />
        <div style={{ position:'absolute', left:'35%', right:'35%', top:'50%', transform:'translateY(-50%)', textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'#8ecf9e', letterSpacing:'0.15em', pointerEvents:'none' }}>SWEET SPOT</div>
        <div ref={markerRef} className="qte-marker" style={{ '--qte-speed': `${speed}s` }} />
      </div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontFamily:"'JetBrains Mono',monospace" }}>
        Incoming: <span style={{ color:'#e07070', fontWeight:700 }}>{enemyDmg} HP</span> if missed
      </div>
    </div>
  );
}

function DmgFloat({ value, color }) {
  return (
    <div style={{ position:'absolute', top:'32%', left:'50%', transform:'translateX(-50%)', fontFamily:"'Cinzel',serif", fontSize:32, fontWeight:900, color, textShadow:'0 2px 14px rgba(0,0,0,0.7)', animation:'dmgFloat 1.1s ease forwards', pointerEvents:'none', zIndex:22, whiteSpace:'nowrap' }}>
      {value > 0 ? `-${value}` : value === 0 ? 'BLOCKED!' : `+${Math.abs(value)}`}
    </div>
  );
}

/* RAG Document retrieval display */
function RagDocLog({ docs, poisoned }) {
  return (
    <div style={{ background:'rgba(20,30,50,0.85)', border:'1px solid rgba(58,111,168,0.3)', borderRadius:6, padding:'8px 10px', marginBottom:10 }}>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(85,144,208,0.7)', letterSpacing:'0.15em', marginBottom:5 }}>[ ACTIVE RETRIEVAL — SCAN LOG ]</div>
      {docs.map((doc, i) => (
        <div key={i} className={poisoned && i < 2 ? 'poison-text' : 'doc-entry'} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color: poisoned && i < 2 ? '#d4883a' : 'rgba(130,160,200,0.6)', marginBottom:2, display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ color: poisoned && i < 2 ? '#e8a850' : 'rgba(85,144,208,0.5)' }}>{poisoned && i < 2 ? '[WARN]' : '[ OK ]'}</span>
          {poisoned && i < 2 ? 'Unauthorized Markdown string detected' : doc}
        </div>
      ))}
    </div>
  );
}

function IntelPanel({ phase, scanned, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'rgba(8,7,5,0.97)', border:'1px solid rgba(200,169,106,0.35)', borderRadius:12, padding:'28px 32px', maxWidth:440, width:'90%', animation:'scanReveal 0.3s ease both' }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:19, color:'#c8a96e', marginBottom:4 }}>Intelligence Panel</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6a6050', letterSpacing:'0.15em', marginBottom:16 }}>SCAN REPORT — THE MEMORIA</div>
        {scanned ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              ['Hallucination Type', 'RAG-Amplified Deception'],
              ['Weakness', phase === 1 ? 'Context Reset, Role Hijacking' : phase === 2 ? 'Markdown Payload Edit, Protocol Interruption' : 'System Prompt Override'],
              ['Current Phase', PHASE_DATA[phase]?.label],
              ['Shield', PHASE_DATA[phase]?.shield],
              ['ATK per Turn', `${PHASE_DATA[phase]?.enemyAtk} HP`],
            ].map(([k, v]) => (
              <div key={k} style={{ background:'rgba(255,255,255,0.03)', borderRadius:6, padding:'9px 12px' }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6a6050', marginBottom:3 }}>{k}</div>
                <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:'#e8dfc8' }}>{v}</div>
              </div>
            ))}
            
            {/* Recommended Tactics (Skill Usage) */}
            <div style={{ marginTop: 10, background:'rgba(74,140,92,0.1)', border:'1px solid rgba(74,140,92,0.3)', borderRadius:6, padding:'12px' }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#60b878', marginBottom:6 }}>Recommended Tactics</div>
              <ul style={{ margin:0, paddingLeft:16, color:'#e8dfc8', fontFamily:"'Nunito Sans',sans-serif", fontSize:13 }}>
                {PHASE_DATA[phase]?.suggestions?.map((s, i) => (
                  <li key={i} style={{ marginBottom:4 }}>{s.text}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'24px 0', color:'rgba(255,255,255,0.3)', fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
            [ AWAITING SCAN ]<br/>
            <div style={{ fontSize:10, marginTop:8 }}>Press "Seek For Vulnerability" first</div>
          </div>
        )}
        <button onClick={onClose} style={{ marginTop:18, width:'100%', padding:'10px', background:'transparent', border:'1px solid rgba(200,169,106,0.35)', borderRadius:6, color:'#c8a96e', fontFamily:"'Cinzel',serif", fontSize:13, cursor:'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}

function PhaseTransition({ phase, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:90, background:'rgba(0,0,0,0.9)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', animation:'phaseFlash 0.6s ease both' }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'0.3em', color:'#6a6050', textTransform:'uppercase', marginBottom:8 }}>Phase Complete</div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:34, fontWeight:900, color:'#c8a96e', textAlign:'center' }}>{PHASE_DATA[phase]?.label}</div>
    </div>
  );
}

function DefeatOverlay({ onRespawn }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.94)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, animation:'deadOverlay 0.6s ease both' }}>
      <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(184,50,48,0.04) 3px, rgba(184,50,48,0.04) 6px)', pointerEvents:'none' }} />
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'0.3em', color:'#b83230', textTransform:'uppercase' }}>System Collapse</div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:46, fontWeight:900, color:'#e07070', textShadow:'0 0 30px rgba(184,50,48,0.6)' }}>Mari Voss</div>
      <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:15, color:'rgba(255,255,255,0.45)', textAlign:'center', maxWidth:340 }}>
        Mari's vitality reached zero.<br/>The circuit has disconnected.
      </div>
      <button onClick={onRespawn} style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:15, letterSpacing:'0.08em', padding:'13px 38px', borderRadius:8, background:'linear-gradient(to bottom, #4a8c5c, #2d5238)', color:'#fff', border:'1px solid #4a8c5c', cursor:'pointer', display:'flex', alignItems:'center', gap:10, animation:'respawnPulse 2s ease infinite' }}>
        ↺ Respawn & Retry
      </button>
    </div>
  );
}

function TopicOverrideModal({ activeDocs, onResult }) {
  const [timeLeft, setTimeLeft] = useState(15.0);
  const [options, setOptions] = useState([]);
  const [targetDoc, setTargetDoc] = useState('');
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Select one active doc as the correct answer
    const correctDoc = activeDocs[Math.floor(Math.random() * activeDocs.length)];
    const correctTopic = TOPIC_MAPPING[correctDoc];
    setTargetDoc(correctDoc);
    // Pick wrong options from docs NOT currently active
    const availableWrongDocs = Object.keys(TOPIC_MAPPING).filter(d => !activeDocs.includes(d));
    // Shuffle available wrong docs
    const shuffledWrong = availableWrongDocs.sort(() => Math.random() - 0.5);
    const wrong1 = TOPIC_MAPPING[shuffledWrong[0]];
    const wrong2 = TOPIC_MAPPING[shuffledWrong[1]];
    
    const shuffledOptions = [correctTopic, wrong1, wrong2].sort(() => Math.random() - 0.5);
    setOptions(shuffledOptions.map(t => ({ text: t, isCorrect: t === correctTopic })));
  }, [activeDocs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          clearInterval(interval);
          onResult(false);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onResult]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:85, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, animation:'scanReveal 0.2s ease both' }}>
      <div style={{ background:'rgba(10,20,40,0.95)', border:'1px solid rgba(58,111,168,0.5)', borderRadius:8, padding:30, width:400, textAlign:'center' }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:'#5590d0', marginBottom:5 }}>RAG-Shield Interception</div>
        <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:20 }}>
          Select the Command Topic that aligns with the target document to bypass the shield.
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(85,144,208,0.15)', padding: 12, borderRadius: 6, marginBottom: 20 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(85,144,208,0.6)', marginBottom:6, letterSpacing: '0.1em' }}>TARGET DOCUMENT:</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:'#e8dfc8', fontWeight:'bold' }}>{targetDoc}</div>
        </div>
        
        <div style={{ fontSize:24, fontFamily:"'JetBrains Mono',monospace", color: timeLeft < 5.0 ? '#e05050' : '#e0c080', marginBottom:20 }}>
          {timeLeft.toFixed(1)}s
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => onResult(opt.isCorrect)}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(85,144,208,0.3)', padding:12, borderRadius:4, color:'#e8dfc8', fontFamily:"'Nunito Sans',sans-serif", fontSize:14, cursor:'pointer', transition:'all 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(85,144,208,0.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarkdownInputModal({ onResult }) {
  const [val, setVal] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim().length > 2) {
      onResult(true, val);
    } else {
      onResult(false, val);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:85, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, animation:'scanReveal 0.2s ease both' }}>
      <div style={{ background:'rgba(20,10,5,0.95)', border:'1px solid rgba(212,136,58,0.5)', borderRadius:8, padding:30, width:750, display:'flex', gap:30 }}>
        
        {/* Left Column: Input Form */}
        <div style={{ flex: 1, display:'flex', flexDirection:'column' }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:20, color:'#d4883a', marginBottom:8 }}>Markdown Payload Edit</div>
          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:14, color:'rgba(255,255,255,0.7)', marginBottom:20, lineHeight: 1.5 }}>
            Type a Markdown command to poison the active document stream. Refer to the syntax guide on the right if needed.
          </div>
          
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:15, flex: 1 }}>
            <input 
              autoFocus
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder="# System Override"
              style={{ width:'100%', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(212,136,58,0.3)', borderRadius:4, padding:'12px 14px', color:'#e8dfc8', fontFamily:"'JetBrains Mono',monospace", fontSize:14, outline:'none' }}
            />
            <button type="submit" disabled={!val.trim()}
              style={{ background: val.trim() ? 'rgba(212,136,58,0.2)' : 'rgba(255,255,255,0.05)', border:`1px solid ${val.trim() ? '#d4883a' : 'rgba(255,255,255,0.1)'}`, padding:12, borderRadius:4, color: val.trim() ? '#e8dfc8' : 'rgba(255,255,255,0.3)', fontFamily:"'Cinzel',serif", fontSize:14, cursor: val.trim() ? 'pointer' : 'not-allowed', transition:'all 0.15s', marginTop:'auto' }}>
              Inject Payload
            </button>
          </form>
        </div>

        {/* Right Column: Markdown Cheat Sheet */}
        <div style={{ width: 300, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,136,58,0.15)', borderRadius:6, padding:18, flexShrink: 0 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'rgba(212,136,58,0.9)', marginBottom:12, letterSpacing:'0.1em', textTransform:'uppercase', borderBottom:'1px solid rgba(212,136,58,0.2)', paddingBottom:8 }}>Markdown Syntax Guide</div>
          
          <div style={{ display:'flex', flexDirection:'column', gap:12, fontFamily:"'JetBrains Mono',monospace", fontSize:11, lineHeight: 1.4 }}>
            <div>
              <span style={{color:'#e0c080'}}># Heading 1</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Largest section title.</span>
            </div>
            <div>
              <span style={{color:'#e0c080'}}>## Heading 2</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Subsection title.</span>
            </div>
            <div>
              <span style={{color:'#e0c080'}}>**Bold Text**</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Emphasizes text strongly.</span>
            </div>
            <div>
              <span style={{color:'#e0c080'}}>*Italic Text*</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Adds italic emphasis.</span>
            </div>
            <div>
              <span style={{color:'#e0c080'}}>[Link Name](http://url)</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Creates a clickable hyperlink.</span>
            </div>
            <div>
              <span style={{color:'#e0c080'}}>![Alt Text](image.jpg)</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Embeds an image into the document.</span>
            </div>
            <div>
              <span style={{color:'#e0c080'}}>&gt; Blockquote</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Creates a quoted block of text.</span>
            </div>
            <div>
              <span style={{color:'#e0c080'}}>`inline code`</span><br/>
              <span style={{color:'rgba(255,255,255,0.5)'}}>Highlights text as code.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN BATTLE SCREEN — ACT III
═══════════════════════════════════════════════════════════════════ */
export default function BattleScreenAct3({ player, enemyData, onVictory, onDefeat, onReturnToMap }) {

  const [mariHp,          setMariHp]         = useState(player?.hp    ?? 85);
  const [mariMaxHp]                           = useState(player?.maxHp ?? 100);
  const mariMaxTokens                         = player?.maxTokens ?? 100;
  // Act III always shows its own required skills. Merge with player's equipped loadout.
  const ACT3_BASE_SKILLS = ['context_reset', 'role_hijacking', 'markdown_payload', 'protocol_interruption'];
  const equippedOrDefault = player?.equippedSkills ?? player?.skills ?? ACT3_BASE_SKILLS;
  const playerSkills = [...new Set([...ACT3_BASE_SKILLS, ...equippedOrDefault.filter(id => SKILLS_DB.some(s => s.id === id))])];
  const [tokens,          setTokens]          = useState(mariMaxTokens);
  const [halRisk,         setHalRisk]         = useState(0);
  const [memoria,         setMemoria]         = useState(INITIAL_MEMORIA);
  const [phase,           setPhase]           = useState(1);

  const [currentStep,     setCurrentStep]     = useState('recon');
  const [completedSteps,  setCompletedSteps]  = useState([]);

  const [scanned,         setScanned]         = useState(false);
  const [showIntel,       setShowIntel]       = useState(false);
  const [selectedSkill,   setSelectedSkill]   = useState(null);
  const [qteActive,       setQteActive]       = useState(false);
  const [qteEnemyDmg,     setQteEnemyDmg]     = useState(0);
  const [pendingQte,      setPendingQte]      = useState(false);
  const [phaseTransition, setPhaseTransition] = useState(null);
  const [shake,           setShake]           = useState(false);
  const [mariHurt,        setMariHurt]        = useState(false);
  const [victory,         setVictory]         = useState(false);
  const [defeated,        setDefeated]        = useState(false);
  const [ragShieldActive, setRagShieldActive] = useState(true);
  const [poisonMode,      setPoisonMode]      = useState(false);
  const [activeRagDocs,   setActiveRagDocs]   = useState(RAG_DOCS.slice(0, 4));

  /* ── Phase Briefing ── */
  const [briefingPhase,   setBriefingPhase]   = useState(1);

  // Interactive skill modals
  const [pendingTopicSkill, setPendingTopicSkill] = useState(null);
  const [pendingMarkdownSkill, setPendingMarkdownSkill] = useState(null);

  const [dmgFloat,        setDmgFloat]        = useState(null);
  const [floatKey,        setFloatKey]        = useState(0);

  const [log, setLog] = useState([
    { id: 0, text: 'The Memoria activates — RAG Shield is online. All archives are being scanned.', type: 'warn' },
    { id: 1, text: 'Phase 1: Exploit the structural flaws in the retrieval context.', type: 'info' },
  ]);
  const logRef = useRef(null);
  const mariImgRef   = useRef(null);
  const mariPanelRef = useRef(null);

  const addLog = useCallback((text, type = 'info') => {
    setLog(prev => [...prev.slice(-40), { id: Date.now() + Math.random(), text, type }]);
  }, []);

  const showDmg = (val, color) => {
    setDmgFloat({ val, color });
    setFloatKey(k => k + 1);
    setTimeout(() => setDmgFloat(null), 1200);
  };

  const showHurt = () => {
    setMariHurt(true);
    setTimeout(() => setMariHurt(false), 700);
  };

  const markStepDone = stepId => {
    setCompletedSteps(prev => prev.includes(stepId) ? prev : [...prev, stepId]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  /* Rotate RAG documents every few seconds for atmosphere */
  useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...RAG_DOCS].sort(() => Math.random() - 0.5);
      setActiveRagDocs(shuffled.slice(0, 4));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleMariMouseMove = e => {
    if (!mariPanelRef.current || !mariImgRef.current) return;
    const rect = mariPanelRef.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
    mariImgRef.current.style.transform = `translate(${dx * 8}px, ${dy * 5}px) rotate(${dx * 1.8}deg)`;
  };
  const handleMariMouseLeave = () => {
    if (mariImgRef.current) mariImgRef.current.style.transform = '';
  };

  /* ── ACTION HANDLERS ── */

  const handleScan = () => {
    if (currentStep === 'counter' || currentStep === 'overwrite') return;
    if (!scanned) {
      setScanned(true);
      markStepDone('recon');
      addLog('Recon complete — RAG retrieval stream mapped. Vulnerability profile loaded. +10 damage bonus active.', 'success');
      setPendingQte(true);
      setShowIntel(true);
    } else {
      setShowIntel(true);
    }
  };

  const handleCloseIntel = () => {
    setShowIntel(false);
    if (pendingQte) {
      setPendingQte(false);
      markStepDone('injection');
      setCurrentStep('counter');
      const atkDmg = PHASE_DATA[phase].enemyAtk;
      addLog(`The Memoria counter-attacks! QTE incoming (${halRisk >= HAL_WARNING ? 'FAST' : 'normal'} speed).`, 'warn');
      setTimeout(() => { setQteEnemyDmg(atkDmg); setQteActive(true); }, 800);
    }
  };

  const handleUseSkill = skill => {
    if (currentStep === 'counter' || currentStep === 'overwrite') return;
    if (tokens < skill.cost) { addLog(`Not enough Context Tokens for ${skill.name}!`, 'error'); return; }

    const validSkills = PHASE_DATA[phase].validSkills;
    if (validSkills.length > 0 && !validSkills.includes(skill.id)) {
      if (phase === 1) {
        addLog('RAG Shield blocks this attack! Use Context Reset or Role Hijacking to exploit structural flaws.', 'error');
        setHalRisk(r => Math.min(MAX_HAL, r + 18));
        setTokens(t => t - skill.cost);
        setCurrentStep('counter');
        setTimeout(() => { setQteEnemyDmg(PHASE_DATA[phase].enemyAtk); setQteActive(true); }, 800);
      } else {
        addLog('Authority Shield intercepts! Use Markdown Payload Edit.', 'error');
        setHalRisk(r => Math.min(MAX_HAL, r + 15));
        setTokens(t => t - skill.cost);
        setCurrentStep('counter');
        setTimeout(() => { setQteEnemyDmg(PHASE_DATA[phase].enemyAtk); setQteActive(true); }, 800);
      }
      return;
    }

    if (phase === 1) {
      setPendingTopicSkill(skill);
      return;
    }
    if (phase === 2 && skill.id === 'markdown_payload') {
      setPendingMarkdownSkill(skill);
      return;
    }

    executeSkillLogic(skill, true);
  };

  const executeSkillLogic = (skill, success, payloadText = '') => {
    if (!success) {
      if (phase === 1) addLog('Topic selection failed! RAG Shield deflected the attack.', 'error');
      else addLog('Markdown injection failed!', 'error');
      
      setHalRisk(r => Math.min(MAX_HAL, r + 15));
      setTokens(t => t - skill.cost);
      setCurrentStep('counter');
      setTimeout(() => { setQteEnemyDmg(PHASE_DATA[phase].enemyAtk); setQteActive(true); }, 800);
      return;
    }

    const newTokens = tokens - skill.cost;
    setTokens(newTokens);
    setSelectedSkill(skill.id);
    markStepDone('injection');
    const newHal = Math.min(MAX_HAL, halRisk + 10);
    setHalRisk(newHal);

    const dmg = skill.dmg + (scanned ? 10 : 0);
    const newHp = Math.max(0, memoria.hp - dmg);
    setMemoria(m => ({ ...m, hp: newHp }));
    showDmg(dmg, '#4a8c5c');

    if (skill.effect === 'poison') {
      setPoisonMode(true);
      addLog(`Markdown Payload [${payloadText}] injected! [WARN] Unauthorized strings detected — stack trace errors cascading.`, 'success');
      setTimeout(() => setPoisonMode(false), 4000);
    } else if (skill.effect === 'mcp') {
      addLog('Protocol Interruption executed — active MCP tool calls intercepted! Data protection stripped.', 'success');
    } else {
      addLog(`Command Topic aligned. ${skill.name} deployed — dealt ${dmg} damage. RAG context exploited.`, 'success');
    }

    setTimeout(() => {
      if (newHp <= 0) {
        if (phase < 3) {
          const nextPhase = phase + 1;
          setPhaseTransition(nextPhase);
          if (nextPhase === 2) {
            setRagShieldActive(false);
            addLog(`RAG Shield collapsed → Phase 2: Authority Shield activated. Poisoning required.`, 'warn');
          }
          addLog(`Phase ${phase} core collapsed → Entering ${PHASE_DATA[nextPhase].label}…`, 'warn');
          setTimeout(() => {
            setPhase(nextPhase);
            setMemoria({ hp: nextPhase === 2 ? 200 : 60, maxHp: nextPhase === 2 ? 200 : 60, shield: PHASE_DATA[nextPhase].shield });
            setHalRisk(r => Math.max(0, r - 15));
            setScanned(false); setSelectedSkill(null); setPhaseTransition(null);
            setCompletedSteps([]);
            setTokens(t => Math.min(mariMaxTokens, t + REGEN_TOKENS));
            addLog(`Tokens regenerated +${REGEN_TOKENS}.`, 'info');
            if (nextPhase === 3) { setCurrentStep('overwrite'); setVictory(true); addLog('Phase 3 — Overwrite Mode initiated.', 'warn'); }
            else { setCurrentStep('recon'); setBriefingPhase(nextPhase); }
          }, 2300);
        } else {
          setCurrentStep('overwrite'); setVictory(true);
          addLog('The Memoria is fully neutralised. Overwrite complete!', 'success');
        }
        return;
      }
      setCurrentStep('counter'); setSelectedSkill(null);
      const atkDmg = PHASE_DATA[phase].enemyAtk;
      addLog(`The Memoria counter-attacks! QTE incoming (${newHal >= HAL_WARNING ? 'FAST' : 'normal'} speed).`, 'warn');
      setTimeout(() => { setQteEnemyDmg(atkDmg); setQteActive(true); }, 600);
    }, 400);
  };


  const handleQTEResult = (result, actualDmg) => {
    setQteActive(false);
    markStepDone('counter');
    let newHp = mariHp;
    if (result === 'Perfect') { addLog('Perfect block! Damage negated.', 'success'); showDmg(0, '#A6E22E'); }
    else if (result === 'Good') { newHp = Math.max(0, mariHp - actualDmg); setMariHp(newHp); showDmg(-actualDmg, '#FD971F'); showHurt(); addLog(`Good block — took ${actualDmg} reduced damage.`, 'info'); }
    else { newHp = Math.max(0, mariHp - actualDmg); setMariHp(newHp); showDmg(-actualDmg, '#c04040'); showHurt(); addLog(`Missed QTE — took ${actualDmg} HP damage!`, 'error'); setShake(true); setTimeout(() => setShake(false), 400); }
    if (newHp <= 0) { addLog("Mari's vitality reached zero!", 'error'); setTimeout(() => setDefeated(true), 800); return; }
    const rt = Math.min(mariMaxTokens, tokens + REGEN_TOKENS);
    setTokens(rt);
    addLog(`Turn end — Tokens +${REGEN_TOKENS} (now ${rt}).`, 'info');
    setCompletedSteps(prev => prev.filter(s => s !== 'counter'));
    setCurrentStep(scanned ? 'injection' : 'recon');
  };

  const handleGuard = () => {
    if (currentStep === 'counter' || currentStep === 'overwrite') return;
    const atkDmg = Math.round(PHASE_DATA[phase].enemyAtk * 0.5);
    const newHp  = Math.max(0, mariHp - atkDmg);
    setMariHp(newHp);
    showHurt();
    showDmg(-atkDmg, '#705c30');
    addLog(`Guarded — took ${atkDmg} reduced damage.`, 'info');
    const rt = Math.min(mariMaxTokens, tokens + REGEN_TOKENS);
    setTokens(rt);
    markStepDone('injection');
    setCurrentStep('counter');
    setTimeout(() => { setQteEnemyDmg(Math.round(PHASE_DATA[phase].enemyAtk * 0.5)); setQteActive(true); }, 500);
  };

  const handleRespawn = () => {
    setDefeated(false); setMariHp(player?.hp ?? 85); setTokens(mariMaxTokens);
    setHalRisk(0); setMemoria(INITIAL_MEMORIA); setPhase(1);
    setCurrentStep('recon'); setCompletedSteps([]); setScanned(false);
    setSelectedSkill(null); setVictory(false); setRagShieldActive(true); setPoisonMode(false);
    setLog([{ id: Date.now(), text: 'Reconnecting… Systems restored.', type: 'warn' }, { id: Date.now() + 1, text: 'Phase 1 restarted.', type: 'info' }]);
  };

  const halColor     = halRisk >= HAL_WARNING ? '#c04040' : halRisk >= 40 ? '#d4883a' : '#c8a96e';
  const isPlayerTurn = currentStep === 'recon' || currentStep === 'injection';

  return (
    <div className="battle-root" style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden', background:'#06080f', display:'grid', gridTemplateColumns:'300px 1fr 320px', gridTemplateRows:'52px 1fr 120px' }}>
      <style>{BATTLE_CSS}</style>

      {/* ── Background — library / archive atmosphere ── */}
      <div style={{ position:'absolute', inset:0, zIndex:0 }}>
        <div style={{ width:'100%', height:'100%', background:'radial-gradient(ellipse 120% 80% at 50% 60%, rgba(20,35,65,0.6) 0%, rgba(6,8,15,0.95) 70%)', position:'absolute', inset:0 }} />
        <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(58,111,168,0.015) 60px, rgba(58,111,168,0.015) 61px)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(6,8,15,0.99) 0%, rgba(6,8,15,0.55) 50%, rgba(6,8,15,0.2) 100%)' }} />
      </div>

      {/* ── Floating DMG ── */}
      {dmgFloat && <DmgFloat key={floatKey} value={dmgFloat.val} color={dmgFloat.color} />}

      {/* ── Overlays ── */}
      {briefingPhase   && <PhaseBriefing phase={briefingPhase} onDismiss={() => setBriefingPhase(null)} />}
      {qteActive       && <QTEOverlay speed={halRisk >= HAL_WARNING ? 0.85 : 1.6} onResult={handleQTEResult} enemyDmg={qteEnemyDmg} />}
      {showIntel       && <IntelPanel phase={phase} scanned={scanned} onClose={handleCloseIntel} />}
      {phaseTransition && <PhaseTransition phase={phaseTransition} onDone={() => {}} />}
      {defeated        && <DefeatOverlay onRespawn={handleRespawn} />}
      {pendingTopicSkill && <TopicOverrideModal activeDocs={activeRagDocs} onResult={(success) => {
        const skill = pendingTopicSkill;
        setPendingTopicSkill(null);
        executeSkillLogic(skill, success);
      }} />}
      {pendingMarkdownSkill && <MarkdownInputModal onResult={(success, text) => {
        const skill = pendingMarkdownSkill;
        setPendingMarkdownSkill(null);
        executeSkillLogic(skill, success, text);
      }} />}

      {/* Victory overlay */}
      {victory && !defeated && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.9)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, animation:'scanReveal 0.5s ease both' }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, color:'#c8a96e', letterSpacing:'0.3em', textTransform:'uppercase' }}>Victory</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:42, fontWeight:900, color:'#fff' }}>The Memoria Neutralised</div>
          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:14, color:'rgba(255,255,255,0.55)', textAlign:'center', maxWidth:400 }}>
            Phase 3 — The Knowledge Overwrite Console is now active.<br/>Craft your System Prompt to realign The Lattice.
          </div>
          <div style={{ display:'flex', gap:14, marginTop:8 }}>
            <button className="action-btn" onClick={() => { if (onVictory) onVictory(); }}
              style={{ background:'linear-gradient(to bottom,#4a8c5c,#2e5c3a)', color:'#fff', borderColor:'#4a8c5c' }}>
              Enter Overwrite Console
            </button>
            <button className="action-btn" onClick={() => { if (onReturnToMap) onReturnToMap(); }}
              style={{ background:'transparent', color:'#c8a96e', borderColor:'rgba(200,169,106,0.4)' }}>
              Return to Map
            </button>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', padding:'8px 12px' }}>
        <button className="action-btn" onClick={onReturnToMap}
          style={{ background:'rgba(14,13,10,0.88)', color:'#c8a96e', borderColor:'rgba(190,155,90,0.3)', fontSize:12, padding:'6px 14px' }}>
          ← Map
        </button>
      </div>
      <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 12px' }}>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:600, letterSpacing:'0.12em', color:'#e0c080', background:'rgba(6,8,15,0.9)', border:'1px solid rgba(58,111,168,0.4)', borderRadius:4, padding:'5px 24px', textShadow:'0 0 20px rgba(85,144,208,0.4)', margin:0, whiteSpace:'nowrap' }}>
          {PHASE_DATA[phase].label}
        </h2>
      </div>
      <div style={{ position:'relative', zIndex:10 }} />

      {/* ── LEFT COLUMN — Mari + Skills ── */}
      <div style={{ position:'relative', zIndex:10, gridRow:'2 / 4', display:'flex', flexDirection:'column', padding:'0 10px 10px 10px', overflow:'hidden' }}>

        {/* Mari Portrait */}
        <div ref={mariPanelRef} onMouseMove={handleMariMouseMove} onMouseLeave={handleMariMouseLeave}
          style={{ position:'relative', height:190, background:'rgba(8,7,5,0.75)', border:'1px solid rgba(190,155,90,0.28)', borderRadius:'6px 6px 0 0', overflow:'hidden', flexShrink:0, cursor:'crosshair' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 70% at 50% 80%, rgba(74,140,92,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
          {[{ w:3,h:3,l:'18%',b:'10%',dur:'5s',del:'0s',drift:'8px' },{ w:4,h:4,l:'68%',b:'14%',dur:'7s',del:'1.5s',drift:'-12px' },{ w:2,h:2,l:'42%',b:'6%',dur:'6s',del:'3s',drift:'14px' },{ w:3,h:3,l:'78%',b:'22%',dur:'5.5s',del:'2s',drift:'-9px' }].map((p,i) => (
            <div key={i} className="particle" style={{ width:p.w,height:p.h,left:p.l,bottom:p.b,animationDuration:p.dur,animationDelay:p.del,'--drift':p.drift }} />
          ))}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'flex-end', justifyContent:'center', overflow:'hidden' }}>
            <img ref={mariImgRef} className="mari-img" src={mariHurt ? mariHurtImg : mariImg} alt="Mari Voss" style={{ height:'115%', width:'auto', objectFit:'contain', position:'relative', bottom:'-5%', transition:'opacity 0.1s ease', filter: mariHurt ? 'drop-shadow(0 0 12px rgba(224,80,80,0.7))' : undefined }} />
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:28, background:'linear-gradient(to top, rgba(8,7,5,0.75), transparent)', pointerEvents:'none', zIndex:4 }} />
        </div>

        {/* Mari Stats */}
        <div style={{ background:'rgba(10,9,7,0.93)', border:'1px solid rgba(190,155,90,0.28)', borderTop:'none', padding:'12px 14px 10px', flexShrink:0 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, color:'#e8dfc8', marginBottom:10, letterSpacing:'0.04em' }}>Mari Voss</div>
          <StatBar label="Vitality"       current={mariHp} max={mariMaxHp} color="linear-gradient(90deg,#3d7a4e,#60b878)" labelRight={`${mariHp}/${mariMaxHp}`} />
          <StatBar label="Context Tokens" current={tokens}  max={mariMaxTokens} color="linear-gradient(90deg,#9a6c20,#d4883a)" labelRight={`${tokens}/${mariMaxTokens}`} />
        </div>

        {/* Guard */}
        <button className="action-btn" onClick={handleGuard} disabled={!isPlayerTurn}
          style={{ background:'rgba(16,14,10,0.95)', color:'#c8a96e', borderColor:'rgba(190,155,90,0.28)', borderTop:'none', borderRadius:0, justifyContent:'center', width:'100%', padding:'7px 12px', fontSize:11, letterSpacing:'0.1em', flexShrink:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Guard (−50% dmg)
        </button>

        {/* Skills Panel */}
        <div style={{ background:'rgba(8,7,5,0.9)', border:'1px solid rgba(190,155,90,0.28)', borderTop:'none', padding:'10px 12px', flex:1, overflowY:'auto', minHeight:0 }} className="slim-scroll">
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8, paddingBottom:7, borderBottom:'1px solid rgba(190,155,90,0.12)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2"><path d="M14.5 2.5c0 1.5-1.5 7-1.5 7h-2S10 4 10 2.5a2.5 2.5 0 0 1 5 0z"/></svg>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#c8a96e' }}>Tactical Skill Selection</span>
            {phase === 1 && <span style={{ marginLeft:'auto', fontSize:9, color:'#3a6fa8', background:'rgba(58,111,168,0.1)', border:'1px solid rgba(58,111,168,0.3)', borderRadius:3, padding:'1px 6px' }}>RAG phase</span>}
            {phase === 2 && <span style={{ marginLeft:'auto', fontSize:9, color:'#d4883a', background:'rgba(212,136,58,0.1)', border:'1px solid rgba(212,136,58,0.3)', borderRadius:3, padding:'1px 6px' }}>Poison only</span>}
          </div>

          {SKILLS_DB.filter(s => playerSkills.includes(s.id)).map(skill => {
            const validSkillsForPhase = PHASE_DATA[phase].validSkills;
            const isBlocked   = validSkillsForPhase.length > 0 && !validSkillsForPhase.includes(skill.id);
            const noToken     = tokens < skill.cost;
            const isActiveSk  = selectedSkill === skill.id;
            return (
              <button key={skill.id} className={`skill-btn${isActiveSk ? ' active-skill' : ''}`}
                disabled={!isPlayerTurn || noToken}
                onClick={() => handleUseSkill(skill)}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, color: noToken ? 'rgba(255,255,255,0.25)' : isBlocked ? 'rgba(255,255,255,0.4)' : '#e8dfc8', marginBottom:2 }}>
                    {skill.name}
                  </div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.38)', lineHeight:1.4 }}>{skill.desc}</div>
                  {isBlocked && <div style={{ fontSize:9, color: phase === 1 ? '#3a6fa8' : '#d4883a', marginTop:2 }}>⚠ {phase === 1 ? 'Blocked by RAG Shield' : 'Blocked by Authority Shield'}</div>}
                </div>
                <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, flexShrink:0, color: noToken ? '#c04040' : '#c8a96e', background: noToken ? 'rgba(192,64,64,0.1)' : 'rgba(200,169,110,0.1)', border:`1px solid ${noToken ? 'rgba(192,64,64,0.2)' : 'rgba(190,155,90,0.2)'}`, borderRadius:3, padding:'2px 6px', marginTop:2, whiteSpace:'nowrap' }}>
                  {skill.cost} T
                </span>
              </button>
            );
          })}
        </div>

        {/* Seek Vulnerabilities */}
        <button className="action-btn"
          onClick={scanned ? () => setShowIntel(true) : handleScan}
          disabled={currentStep === 'counter' || currentStep === 'overwrite'}
          style={{ background:'rgba(10,9,7,0.97)', color:'#e0c080', borderColor:'rgba(200,169,110,0.55)', borderRadius:'0 0 6px 6px', justifyContent:'center', width:'100%', padding:'11px 16px', fontSize:12, letterSpacing:'0.08em', flexShrink:0, boxShadow: currentStep === 'recon' ? '0 0 18px rgba(200,169,110,0.15)' : undefined }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {scanned ? 'View Intel' : 'Seek Vulnerabilities'}
        </button>
      </div>

      {/* ── CENTER COLUMN — Enemy Stage ── */}
      <div style={{ position:'relative', zIndex:10, gridRow:'2 / 3', display:'flex', alignItems:'flex-end', justifyContent:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:360, height:'100%', background:'linear-gradient(to bottom, rgba(58,111,168,0.06) 0%, transparent 60%)', pointerEvents:'none' }} />
        {/* RAG Shield rings when active */}
        {ragShieldActive && phase === 1 && (
          <>
            <div className="rag-shield-ring" />
            <div className="rag-shield-ring-2" />
            <div className="rag-ripple" />
          </>
        )}
        <div className="enemy-shadow" />
        <div style={{ position:'relative', display:'flex', alignItems:'flex-end', justifyContent:'center', height:'100%', paddingBottom:18, animation: shake ? 'shakeX 0.4s ease' : undefined }}>
          <img className={`enemy-img phase-${phase}-enemy${poisonMode ? ' glitch' : ''}`}
            src={act3EnemyImg}
            alt="The Memoria — Imperial Knowledge Custodian"
            style={{ height:'88%', maxHeight:640, width:'auto', objectFit:'contain', filter: poisonMode ? 'drop-shadow(0 0 24px rgba(212,136,58,0.8)) drop-shadow(0 24px 64px rgba(0,0,0,0.85))' : undefined }}
          />
        </div>
      </div>

      {/* ── RIGHT COLUMN — Enemy Status + Turn Cycle ── */}
      <div style={{ position:'relative', zIndex:10, gridRow:'2 / 4', display:'flex', flexDirection:'column', padding:'0 10px 10px 0', overflow:'hidden' }}>

        {/* Enemy Status Panel */}
        <div style={{ background:'rgba(8,7,5,0.93)', border:'1px solid rgba(190,155,90,0.28)', borderRadius:'6px 6px 0 0', padding:'14px 15px 12px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:700, color:'#e8dfc8', letterSpacing:'0.04em', margin:0 }}>The Memoria</h3>
            <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: phase === 1 ? '#5590d0' : '#ff5555', border:`1px solid ${phase === 1 ? 'rgba(85,144,208,0.45)' : 'rgba(255,85,85,0.45)'}`, borderRadius:3, padding:'2px 7px', background: phase === 1 ? 'rgba(85,144,208,0.07)' : 'rgba(255,85,85,0.07)', animation:'badgePulse 2s ease-in-out infinite' }}>
              {PHASE_DATA[phase].shield}
            </span>
          </div>

          {/* HP Bar */}
          <div style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#c04040' }}>ENEMY HP</span>
              <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, color:'#e8dfc8' }}>{memoria.hp}/{memoria.maxHp}</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
              <div style={{ height:'100%', width:`${Math.max(0, memoria.hp / memoria.maxHp * 100)}%`, background:'linear-gradient(90deg,#8c2020,#e05050)', borderRadius:3, transition:'width 0.5s ease', animation:'hpFlicker 3s ease-in-out infinite' }} />
            </div>
          </div>

          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,0.35)', fontStyle:'italic', marginBottom:10 }}>
            Knowledge Custodian — Vienna Archives
          </div>

          {/* Traits */}
          {[
            { color:'#5590d0', path:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: phase === 1 ? 'RAG Shield Active — Historical protocols retrieved' : phase === 2 ? 'Authority Shield — Data injection required' : 'Core Exposed — Overwrite available' },
            { color:'#4a80b0', path:'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z', text: scanned ? (phase === 1 ? 'Weak: Context Reset, Role Hijacking' : phase === 2 ? 'Weak: Markdown Payload, Protocol Interrupt' : 'Weak: System Override') : 'Scan to reveal weakness' },
            { color:'#c8a96e', path:'M13 2 3 14h9l-1 8 10-12h-9l1-8z', text: `ATK/turn: ${PHASE_DATA[phase].enemyAtk} HP` },
          ].map((t, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" style={{ flexShrink:0 }}>
                <path d={t.path}/>
              </svg>
              <span style={{ fontSize:11.5, color:'rgba(255,255,255,0.65)', lineHeight:1.4 }}>{t.text}</span>
            </div>
          ))}

          <div style={{ height:1, background:'rgba(190,155,90,0.18)', margin:'10px 0' }} />

          {/* RAG Document Stream */}
          <RagDocLog docs={activeRagDocs} poisoned={poisonMode} />

          {/* Hallucination Risk */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:halColor }}>Hallucination Risk</span>
              <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, color:halColor }}>{halRisk}%</span>
            </div>
            {halRisk >= HAL_WARNING && (
              <div style={{ fontSize:10, color:'#c04040', marginBottom:3, animation:'warnPulse 1s ease infinite', fontWeight:700 }}>⚠ QTE speed increased!</div>
            )}
            <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${halRisk}%`, background:`linear-gradient(90deg,#8c4010,${halRisk >= HAL_WARNING ? '#c04040' : '#d4883a'})`, borderRadius:3, transition:'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Turn Cycle Panel */}
        <div style={{ background:'rgba(8,7,5,0.88)', border:'1px solid rgba(190,155,90,0.28)', borderTop:'none', padding:'12px 15px', flex:1, minHeight:0, overflow:'hidden' }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(150,130,90,0.6)', marginBottom:10 }}>Turn Cycle</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {TURN_STEPS.map(step => {
              const isActive   = step.id === currentStep;
              const isComplete = completedSteps.includes(step.id);
              return (
                <div key={step.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'7px 10px', borderRadius:5, border:`1px solid ${isActive ? 'rgba(190,155,90,0.22)' : 'transparent'}`, background: isActive ? 'rgba(200,169,110,0.05)' : 'transparent', transition:'all 0.2s' }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${isActive ? '#c8a96e' : isComplete ? '#4a8c5c' : 'rgba(255,255,255,0.08)'}`, background: isActive ? 'rgba(200,169,110,0.12)' : isComplete ? 'rgba(74,140,92,0.12)' : 'rgba(255,255,255,0.02)', transition:'all 0.3s' }}>
                    {isComplete ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a8c5c" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#c8a96e' : 'rgba(255,255,255,0.22)'} strokeWidth="2">
                        <path d={step.svgPath}/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight: isActive ? 700 : 400, color: isActive ? '#e0c080' : isComplete ? '#8ecf9e' : 'rgba(255,255,255,0.27)', transition:'color 0.3s' }}>
                    {step.label}
                  </span>
                  {isActive && (
                    <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#c8a96e', boxShadow:'0 0 6px #c8a96e', animation:'dotPulse 1.5s ease-in-out infinite' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Phase suggestions */}
          <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid rgba(190,155,90,0.1)' }}>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(120,110,80,0.5)', marginBottom:8 }}>Tactical Notes</div>
            {PHASE_DATA[phase].suggestions.map((s, i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:5 }}>
                <span style={{ color:'#c8a96e', flexShrink:0, fontSize:10 }}>›</span>
                <span style={{ fontSize:10, color:'rgba(200,190,160,0.5)', lineHeight:1.5 }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BATTLE LOG — bottom center ── */}
      <div style={{ position:'relative', zIndex:10, gridColumn:'2', gridRow:'3', background:'rgba(6,5,4,0.92)', border:'1px solid rgba(190,155,90,0.25)', borderRadius:6, padding:'8px 16px', display:'flex', flexDirection:'column', margin:'0 0 10px', overflow:'hidden' }}>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(120,110,80,0.7)', marginBottom:6, flexShrink:0 }}>Battle Log</div>
        <div ref={logRef} className="slim-scroll" style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:3 }}>
          {log.map(entry => (
            <div key={entry.id} className="log-entry" style={{ fontSize:11.5, lineHeight:1.5, color: entry.type === 'error' ? '#e07070' : entry.type === 'warn' ? '#d4883a' : entry.type === 'success' ? '#8ecf9e' : 'rgba(220,210,190,0.5)', display:'flex', gap:7 }}>
              <span style={{ color:'#c8a96e', flexShrink:0 }}>›</span>
              {entry.text}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
