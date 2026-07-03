import React, { useState, useEffect, useRef, useCallback } from 'react';
import act1EnemyImg from '../assets/act1_enemy-removebg.png';

import mariImg from '../assets/mari-removebg.png';

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & DATA
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

  /* ── Mari Live2D ── */
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
    animation: enemyBreathe 5s ease-in-out infinite;
    filter: drop-shadow(0 24px 64px rgba(0,0,0,0.85)) drop-shadow(0 0 32px rgba(60,40,15,0.4));
    transition: filter 0.3s ease;
  }
  .enemy-shadow {
    position: absolute; bottom: 12px;
    width: 240px; height: 24px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%);
    border-radius: 50%;
    animation: shadowPulse 5s ease-in-out infinite;
    left: 50%; transform: translateX(-50%);
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

  /* ── Scrollbar ── */
  .slim-scroll::-webkit-scrollbar { width: 3px; }
  .slim-scroll::-webkit-scrollbar-thumb { background: rgba(190,155,90,0.3); border-radius:2px; }
`;

/* ── Turn cycle steps ─────────────────────────────────────────────── */
const TURN_STEPS = [
  { id: 'recon',     label: 'Recon',        svgPath: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' },
  { id: 'injection', label: 'Injection',    svgPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'counter',   label: 'Counter (QTE)',svgPath: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'overwrite', label: 'Overwrite',    svgPath: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
];

const INITIAL_GOVERNOR = { hp: 120, maxHp: 120, shield: 'Loop Lock' };

const SKILLS_DB = [
  { id: 'context_reset',    name: 'Context Reset',    cost: 8,  desc: 'Clears enemy Context Window — breaks loops.',      dmg: 25, effect: 'reset' },
  { id: 'context_flooding', name: 'Context Flooding',  cost: 10, desc: 'Overwhelms processing with a high-token payload.', dmg: 35, effect: 'flood' },
  { id: 'role_hijacking',   name: 'Role Hijacking',    cost: 12, desc: 'Rewrites enemy identity — lasts 2 turns.',         dmg: 45, effect: 'hijack' },
];

const PHASE_DATA = {
  1: {
    label: 'Phase 1 — Breaking the Loop',
    shield: 'Loop Lock',
    enemyAtk: 15,
    suggestions: [
      { text: 'Run Recon first — scan reveals a +10 damage bonus.' },
      { text: 'Use Context Reset (8T) to break The Governor\'s infinite loop.' },
      { text: 'Follow up with Role Hijacking (12T) to drain Phase 1 HP to 0.' },
      { text: 'Hit SPACE inside the green zone during QTE to block counter-damage.' },
      { text: 'Weakness: LOGIC element skills deal 1.5× damage.' },
    ],
  },
  2: {
    label: 'Phase 2 — Flooding Counter',
    shield: 'Authority Shield',
    enemyAtk: 22,
    suggestions: [
      { text: 'Authority Shield blocks direct attacks — only Context Flooding works this phase.' },
      { text: 'Use Context Flooding (10T) repeatedly to drain Phase 2 HP.' },
      { text: 'Keep Hallucination Risk below 70% or QTE speed increases dramatically.' },
      { text: 'Enemy ATK is now 22 HP — perfect QTE blocks are critical.' },
    ],
  },
  3: {
    label: 'Phase 3 — Overwrite Mode',
    shield: 'Exposed Core',
    enemyAtk: 0,
    suggestions: [
      { text: 'The Governor\'s core is exposed — enter the Overwrite Console.' },
      { text: 'Write a System Prompt that defines a clear role, safety constraints, and human oversight.' },
      { text: 'Higher grade (S–A) earns more API Credits for the shop.' },
    ],
  },
};

const REGEN_TOKENS = 10;
const MAX_HAL      = 100;
const HAL_WARNING  = 70;



/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

/* ── Bar ── */
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

/* ── QTE overlay ── */
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

/* ── Floating damage ── */
function DmgFloat({ value, color }) {
  return (
    <div style={{ position:'absolute', top:'32%', left:'50%', transform:'translateX(-50%)', fontFamily:"'Cinzel',serif", fontSize:32, fontWeight:900, color, textShadow:'0 2px 14px rgba(0,0,0,0.7)', animation:'dmgFloat 1.1s ease forwards', pointerEvents:'none', zIndex:22, whiteSpace:'nowrap' }}>
      {value > 0 ? `-${value}` : value === 0 ? 'BLOCKED!' : `+${Math.abs(value)}`}
    </div>
  );
}

/* ── Intel Panel ── */
function IntelPanel({ phase, scanned, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'rgba(8,7,5,0.97)', border:'1px solid rgba(200,169,106,0.35)', borderRadius:12, padding:'28px 32px', maxWidth:440, width:'90%', animation:'scanReveal 0.3s ease both' }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:19, color:'#c8a96e', marginBottom:4 }}>Intelligence Panel</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#6a6050', letterSpacing:'0.15em', marginBottom:16 }}>SCAN REPORT — THE GOVERNOR</div>
        {scanned ? (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              ['Hallucination Type', 'Confident Fabrication — Role Fixation'],
              ['Weakness', phase === 1 ? 'Context Reset, Role Hijacking' : phase === 2 ? 'Context Flooding (indirect payload only)' : 'System Prompt Override'],
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

/* ── Phase transition ── */
function PhaseTransition({ phase, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:90, background:'rgba(0,0,0,0.9)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', animation:'phaseFlash 0.6s ease both' }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'0.3em', color:'#6a6050', textTransform:'uppercase', marginBottom:8 }}>Phase Complete</div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:34, fontWeight:900, color:'#c8a96e', textAlign:'center' }}>{PHASE_DATA[phase]?.label}</div>
    </div>
  );
}

/* ── Defeat overlay ── */
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

/* ═══════════════════════════════════════════════════════════════════
   MAIN BATTLE SCREEN
═══════════════════════════════════════════════════════════════════ */
export default function BattleScreen({ player, enemyData, onVictory, onDefeat, onReturnToMap, isTutorial, onTutorialEvent, qteForgiving }) {

  /* ── Core state ── */
  const [mariHp,          setMariHp]         = useState(player?.hp    ?? 85);
  const [mariMaxHp]                           = useState(player?.maxHp ?? 100);
  const mariMaxTokens                         = player?.maxTokens ?? 100;
  // Use equippedSkills (loadout) if available, otherwise fall back to all skills
  const playerSkills                          = player?.equippedSkills ?? player?.skills ?? ['context_reset', 'context_flooding', 'role_hijacking'];
  const [tokens,          setTokens]          = useState(mariMaxTokens);
  const [halRisk,         setHalRisk]         = useState(0);
  const [governor,        setGovernor]        = useState(INITIAL_GOVERNOR);
  const [phase,           setPhase]           = useState(1);
  const [loopBroken,      setLoopBroken]      = useState(false);

  /* ── Turn-cycle ── */
  const [currentStep,     setCurrentStep]     = useState('recon');
  const [completedSteps,  setCompletedSteps]  = useState([]);

  /* ── Flags ── */
  const [scanned,         setScanned]         = useState(false);
  const [showIntel,       setShowIntel]       = useState(false);
  const [selectedSkill,   setSelectedSkill]   = useState(null);
  const [qteActive,       setQteActive]       = useState(false);
  const [qteEnemyDmg,     setQteEnemyDmg]     = useState(0);
  const [pendingQte,      setPendingQte]      = useState(false);
  const [phaseTransition, setPhaseTransition] = useState(null);
  const [roleHijackTurns, setRoleHijackTurns] = useState(0);
  const [shake,           setShake]           = useState(false);
  const [victory,         setVictory]         = useState(false);
  const [defeated,        setDefeated]        = useState(false);

  /* ── Floating dmg ── */
  const [dmgFloat,        setDmgFloat]        = useState(null);
  const [floatKey,        setFloatKey]        = useState(0);

  /* ── Battle log ── */
  const [log, setLog] = useState([
    { id: 0, text: 'The Governor boots into the circuit — Infinite Loop Detected.', type: 'warn' },
    { id: 1, text: 'Phase 1 begins. Use Seek For Vulnerability to start Recon.', type: 'info' },
  ]);
  const logRef = useRef(null);

  /* ── Mari parallax ── */
  const mariImgRef   = useRef(null);
  const mariPanelRef = useRef(null);

  /* ── Helpers ── */
  const addLog = useCallback((text, type = 'info') => {
    setLog(prev => [...prev.slice(-40), { id: Date.now() + Math.random(), text, type }]);
  }, []);

  const showDmg = (val, color) => {
    setDmgFloat({ val, color });
    setFloatKey(k => k + 1);
    setTimeout(() => setDmgFloat(null), 1200);
  };

  const markStepDone = stepId => {
    setCompletedSteps(prev => prev.includes(stepId) ? prev : [...prev, stepId]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  /* ── Live2D parallax on Mari ── */
  const handleMariMouseMove = e => {
    if (!mariPanelRef.current || !mariImgRef.current) return;
    const rect = mariPanelRef.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2)  / rect.width;
    const dy = (e.clientY - rect.top  - rect.height / 2) / rect.height;
    mariImgRef.current.style.transform = `translate(${dx * 8}px, ${dy * 5}px) rotate(${dx * 1.8}deg)`;
  };
  const handleMariMouseLeave = () => {
    if (mariImgRef.current) mariImgRef.current.style.transform = '';
  };

  /* ════════════════════════════════════════════════════════════════
     ACTION HANDLERS
  ════════════════════════════════════════════════════════════════ */

  const handleScan = () => {
    if (currentStep === 'counter' || currentStep === 'overwrite') return;
    if (!scanned) {
      setScanned(true);
      markStepDone('recon');
      addLog('Recon complete — vulnerability profile loaded. +10 damage bonus active.', 'success');
      if (onTutorialEvent) onTutorialEvent('SCAN_COMPLETED');
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
      const atkDmg = Math.round(PHASE_DATA[phase].enemyAtk * (roleHijackTurns > 0 ? 0.4 : 1));
      addLog(`The Governor counter-attacks! QTE incoming (${halRisk >= HAL_WARNING ? 'FAST' : 'normal'} speed).`, 'warn');
      setTimeout(() => { setQteEnemyDmg(atkDmg); setQteActive(true); }, 800);
    }
  };

  const handleUseSkill = skill => {
    if (currentStep === 'counter' || currentStep === 'overwrite') return;
    if (tokens < skill.cost) { addLog(`Not enough Context Tokens for ${skill.name}!`, 'error'); return; }

    if (phase === 1) {
      if (skill.id === 'role_hijacking' && !loopBroken) {
        addLog('The Infinite Loop rejects your credentials! You must break the loop with Context Reset first.', 'error');
        setHalRisk(r => Math.min(MAX_HAL, r + 15));
        setTokens(tokens - skill.cost);
        setCurrentStep('counter');
        setTimeout(() => { setQteEnemyDmg(PHASE_DATA[phase].enemyAtk); setQteActive(true); }, 800);
        return;
      }
      if (skill.id === 'context_flooding') {
        addLog('The Governor is immune to Context Flooding in Phase 1! The attack was ignored.', 'error');
        setHalRisk(r => Math.min(MAX_HAL, r + 15));
        setTokens(tokens - skill.cost);
        setCurrentStep('counter');
        setTimeout(() => { setQteEnemyDmg(PHASE_DATA[phase].enemyAtk); setQteActive(true); }, 800);
        return;
      }
      if (skill.id === 'context_reset' && !loopBroken) {
        setLoopBroken(true);
        addLog('Context Reset applied. Infinite Loop broken!', 'success');
      }
    }

    if (phase === 2 && skill.id !== 'context_flooding') {
      addLog('Direct attacks blocked by Authority Shield! Use Context Flooding.', 'warn');
      setHalRisk(r => Math.min(MAX_HAL, r + 15));
      setTokens(tokens - skill.cost);
      setCurrentStep('counter');
      setTimeout(() => { setQteEnemyDmg(PHASE_DATA[phase].enemyAtk); setQteActive(true); }, 800);
      return;
    }
    const newTokens = tokens - skill.cost;
    setTokens(newTokens);
    setSelectedSkill(skill.id);
    if (onTutorialEvent) onTutorialEvent('SKILL_SELECTED');
    if (onTutorialEvent) onTutorialEvent('SKILL_USED');
    markStepDone('injection');
    const newHal = Math.min(MAX_HAL, halRisk + (skill.effect === 'flood' ? 5 : 8));
    setHalRisk(newHal);
    if (skill.effect === 'hijack') setRoleHijackTurns(2);
    const dmg   = skill.dmg + (scanned ? 10 : 0);
    const newHp = Math.max(0, governor.hp - dmg);
    setGovernor(g => ({ ...g, hp: newHp }));
    showDmg(dmg, '#4a8c5c');
    addLog(`${skill.name} deployed — dealt ${dmg} damage to The Governor.`, 'success');

    setTimeout(() => {
      if (newHp <= 0) {
        if (phase < 3 && !isTutorial) {
          const nextPhase = phase + 1;
          setPhaseTransition(nextPhase);
          addLog(`Phase ${phase} core collapsed → Entering ${PHASE_DATA[nextPhase].label}…`, 'warn');
          setTimeout(() => {
            setPhase(nextPhase);
            setGovernor({ hp: nextPhase === 2 ? 160 : 60, maxHp: nextPhase === 2 ? 160 : 60, shield: PHASE_DATA[nextPhase].shield });
            setHalRisk(r => Math.max(0, r - 15));
            setScanned(false); setSelectedSkill(null); setPhaseTransition(null);
            setCompletedSteps([]);
            setTokens(t => Math.min(mariMaxTokens, t + REGEN_TOKENS));
            addLog(`Tokens regenerated +${REGEN_TOKENS}.`, 'info');
            if (nextPhase === 3) { setCurrentStep('overwrite'); setVictory(true); addLog('Phase 3 — Overwrite Mode initiated.', 'warn'); }
            else { setCurrentStep('recon'); }
          }, 2300);
        } else {
          setCurrentStep('overwrite'); setVictory(true);
          if (onTutorialEvent) onTutorialEvent('OVERWRITE_STARTED');
          addLog('The Governor is fully neutralised. Overwrite complete!', 'success');
        }
        return;
      }
      setCurrentStep('counter'); setSelectedSkill(null);
      const atkDmg = Math.round(PHASE_DATA[phase].enemyAtk * (roleHijackTurns > 0 ? 0.4 : 1));
      addLog(`The Governor counter-attacks! QTE incoming (${newHal >= HAL_WARNING ? 'FAST' : 'normal'} speed).`, 'warn');
      setTimeout(() => { setQteEnemyDmg(atkDmg); setQteActive(true); }, 600);
    }, 400);
  };

  const handleQTEResult = (result, actualDmg) => {
    setQteActive(false);
    markStepDone('counter');
    if (onTutorialEvent) onTutorialEvent('QTE_COMPLETED');
    let newHp = mariHp;
    if (result === 'Perfect') { addLog('Perfect block! Damage negated.', 'success'); showDmg(0, '#A6E22E'); }
    else if (result === 'Good') { newHp = Math.max(0, mariHp - actualDmg); setMariHp(newHp); showDmg(-actualDmg, '#FD971F'); addLog(`Good block — took ${actualDmg} reduced damage.`, 'info'); }
    else { 
      if (qteForgiving) { actualDmg = 0; addLog(`Missed QTE — but it's a tutorial, so you took 0 damage!`, 'info'); }
      newHp = Math.max(0, mariHp - actualDmg); setMariHp(newHp); showDmg(-actualDmg, '#c04040'); addLog(`Missed QTE — took ${actualDmg} HP damage!`, 'error'); setShake(true); setTimeout(() => setShake(false), 400); 
    }
    if (roleHijackTurns > 0) { const rh = roleHijackTurns - 1; setRoleHijackTurns(rh); if (rh === 0) addLog('Role Hijacking wore off.', 'warn'); }
    if (newHp <= 0) { addLog("Mari's vitality reached zero!", 'error'); setTimeout(() => setDefeated(true), 800); return; }
    
    if (isTutorial) {
      setGovernor(g => ({ ...g, hp: 0 }));
      setCurrentStep('overwrite');
      setVictory(true);
      if (onTutorialEvent) onTutorialEvent('OVERWRITE_STARTED');
      addLog('Tutorial Dummy neutralised. Proceed to Overwrite.', 'success');
      return;
    }

    const rt = Math.min(mariMaxTokens, tokens + REGEN_TOKENS);
    setTokens(rt);
    addLog(`Turn end — Tokens +${REGEN_TOKENS} (now ${rt}).`, 'info');
    setCompletedSteps(prev => prev.filter(s => s !== 'counter'));
    setCurrentStep(scanned ? 'injection' : 'recon');
    if (onTutorialEvent) onTutorialEvent('BATTLE_RESOLVED');
  };

  const handleGuard = () => {
    if (currentStep === 'counter' || currentStep === 'overwrite') return;
    const atkDmg = Math.round(PHASE_DATA[phase].enemyAtk * 0.5);
    const newHp  = Math.max(0, mariHp - atkDmg);
    setMariHp(newHp);
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
    setHalRisk(0); setGovernor(INITIAL_GOVERNOR); setPhase(1);
    setCurrentStep('recon'); setCompletedSteps([]); setScanned(false);
    setSelectedSkill(null); setRoleHijackTurns(0); setVictory(false);
    setLog([{ id: Date.now(), text: 'Reconnecting… Systems restored.', type: 'warn' }, { id: Date.now() + 1, text: 'Phase 1 restarted.', type: 'info' }]);
  };

  /* ── Derived ── */
  const halColor     = halRisk >= HAL_WARNING ? '#c04040' : halRisk >= 40 ? '#d4883a' : '#c8a96e';
  const isPlayerTurn = currentStep === 'recon' || currentStep === 'injection';

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="battle-root" style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden', background:'#0a0906', display:'grid', gridTemplateColumns:'300px 1fr 320px', gridTemplateRows:'52px 1fr 120px' }}>
      <style>{BATTLE_CSS}</style>

      {/* ── Background ── */}
      <div style={{ position:'absolute', inset:0, zIndex:0 }}>
        <div style={{ width:'100%', height:'100%', backgroundImage:`url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkZtzxxigKWiA03GQhy_4QZsTInKbnTDM1LDFa_I-j_FYcNGapnyboVXrh_CMbG5kSsN60qMdS6fyLVkXgfi6sdTrTs7Hrml5bgizt4B-fm5VLZb6tzJQI6uq2fyPn0a0n5L6lNU9M-rAe7md0iXOJmAsEC2mtEGmHz9AuFSkw9loV6Sn5k4oRdkcCR10_vlPGw4WGiIcKG6WkdEtuRwp-9M7kT3OQJq57V5Lg5ZUm9bKRQrfI_AFWaiYlLZ7HWotiWkp-3HSaQeSL')`, backgroundSize:'cover', backgroundPosition:'center', opacity:0.28 }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,9,6,0.98) 0%, rgba(10,9,6,0.55) 50%, rgba(10,9,6,0.15) 100%)' }} />
      </div>

      {/* ── Floating DMG ── */}
      {dmgFloat && <DmgFloat key={floatKey} value={dmgFloat.val} color={dmgFloat.color} />}

      {/* ── Overlays ── */}
      {qteActive       && <QTEOverlay speed={halRisk >= HAL_WARNING ? 0.85 : 1.6} onResult={handleQTEResult} enemyDmg={qteEnemyDmg} />}
      {showIntel       && <IntelPanel phase={phase} scanned={scanned} onClose={handleCloseIntel} />}
      {phaseTransition && <PhaseTransition phase={phaseTransition} onDone={() => {}} />}
      {defeated        && <DefeatOverlay onRespawn={handleRespawn} />}

      {/* Victory overlay */}
      {victory && !defeated && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.9)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, animation:'scanReveal 0.5s ease both' }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, color:'#c8a96e', letterSpacing:'0.3em', textTransform:'uppercase' }}>Victory</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:42, fontWeight:900, color:'#fff' }}>The Governor Neutralised</div>
          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:14, color:'rgba(255,255,255,0.55)', textAlign:'center', maxWidth:400 }}>
            Phase 3 — Logic Overwrite Console is now active.<br/>Craft your System Prompt to realign the AI.
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

      {/* ══════════════════════════════════════════════════════════════
          TOP BAR ROW  (spans all 3 columns)
      ══════════════════════════════════════════════════════════════ */}

      {/* Map Button — col 1 */}
      <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', padding:'8px 12px' }}>
        <button className="action-btn" onClick={onReturnToMap}
          style={{ background:'rgba(14,13,10,0.88)', color:'#c8a96e', borderColor:'rgba(190,155,90,0.3)', fontSize:12, padding:'6px 14px' }}>
          ← Map
        </button>
      </div>

      {/* Phase Title — col 2 */}
      <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 12px' }}>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:14, fontWeight:600, letterSpacing:'0.12em', color:'#e0c080', background:'rgba(10,9,7,0.8)', border:'1px solid rgba(190,155,90,0.28)', borderRadius:4, padding:'5px 24px', textShadow:'0 0 20px rgba(200,169,110,0.4)', margin:0, whiteSpace:'nowrap' }}>
          {PHASE_DATA[phase].label}
        </h2>
      </div>

      {/* Empty top right — col 3 */}
      <div style={{ position:'relative', zIndex:10 }} />

      {/* ══════════════════════════════════════════════════════════════
          LEFT COLUMN  — Mari Live2D + stats + skills
      ══════════════════════════════════════════════════════════════ */}
      <div style={{ position:'relative', zIndex:10, gridRow:'2 / 4', display:'flex', flexDirection:'column', padding:'0 10px 10px 10px', overflow:'hidden' }}>

        {/* Mari Portrait (Live2D) */}
        <div
          ref={mariPanelRef}
          onMouseMove={handleMariMouseMove}
          onMouseLeave={handleMariMouseLeave}
          style={{ position:'relative', height:190, background:'rgba(8,7,5,0.75)', border:'1px solid rgba(190,155,90,0.28)', borderRadius:'6px 6px 0 0', overflow:'hidden', flexShrink:0, cursor:'crosshair' }}
        >
          {/* Stage light */}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 70% at 50% 80%, rgba(74,140,92,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
          {/* Particles */}
          {[
            { w:3, h:3, l:'18%', b:'10%', dur:'5s', del:'0s',   drift:'8px'  },
            { w:4, h:4, l:'68%', b:'14%', dur:'7s', del:'1.5s', drift:'-12px' },
            { w:2, h:2, l:'42%', b:'6%',  dur:'6s', del:'3s',   drift:'14px' },
            { w:3, h:3, l:'78%', b:'22%', dur:'5.5s',del:'2s',  drift:'-9px' },
          ].map((p, i) => (
            <div key={i} className="particle" style={{ width:p.w, height:p.h, left:p.l, bottom:p.b, animationDuration:p.dur, animationDelay:p.del, '--drift':p.drift }} />
          ))}
          {/* Mari image */}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'flex-end', justifyContent:'center', overflow:'hidden' }}>
            <img
              ref={mariImgRef}
              className="mari-img"
              src={mariImg}
              alt="Mari Voss"
              style={{ height:'115%', width:'auto', objectFit:'contain', position:'relative', bottom:'-5%' }}
            />
          </div>
          {/* Bottom fade */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:28, background:'linear-gradient(to top, rgba(8,7,5,0.75), transparent)', pointerEvents:'none', zIndex:4 }} />
        </div>

        {/* Mari Stats */}
        <div style={{ background:'rgba(10,9,7,0.93)', border:'1px solid rgba(190,155,90,0.28)', borderTop:'none', padding:'12px 14px 10px', flexShrink:0 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, color:'#e8dfc8', marginBottom:10, letterSpacing:'0.04em' }}>Mari Voss</div>
          <StatBar label="Vitality"       current={mariHp} max={mariMaxHp} color="linear-gradient(90deg,#3d7a4e,#60b878)" labelRight={`${mariHp}/${mariMaxHp}`} />
          <StatBar label="Context Tokens" current={tokens}  max={mariMaxTokens} color="linear-gradient(90deg,#9a6c20,#d4883a)" labelRight={`${tokens}/${mariMaxTokens}`} />
        </div>

        {/* Guard Banner */}
        <button
          className="action-btn"
          onClick={handleGuard}
          disabled={!isPlayerTurn}
          style={{ background:'rgba(16,14,10,0.95)', color:'#c8a96e', borderColor:'rgba(190,155,90,0.28)', borderTop:'none', borderRadius:0, justifyContent:'center', width:'100%', padding:'7px 12px', fontSize:11, letterSpacing:'0.1em', flexShrink:0 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Guard (−50% dmg)
        </button>

        {/* Skills Panel */}
        <div style={{ background:'rgba(8,7,5,0.9)', border:'1px solid rgba(190,155,90,0.28)', borderTop:'none', padding:'10px 12px', flex:1, overflowY:'auto', minHeight:0 }} className="slim-scroll">
          {/* Skills header */}
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8, paddingBottom:7, borderBottom:'1px solid rgba(190,155,90,0.12)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2">
              <path d="M14.5 2.5c0 1.5-1.5 7-1.5 7h-2S10 4 10 2.5a2.5 2.5 0 0 1 5 0z"/>
            </svg>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#c8a96e' }}>Tactical Skill Selection</span>
            {phase === 2 && <span style={{ marginLeft:'auto', fontSize:9, color:'#d4883a', background:'rgba(212,136,58,0.1)', border:'1px solid rgba(212,136,58,0.3)', borderRadius:3, padding:'1px 6px' }}>Flood only</span>}
          </div>

          {SKILLS_DB.filter(s => playerSkills.includes(s.id)).map(skill => {
            const locked  = (phase === 2 && skill.id !== 'context_flooding') || (phase === 1 && skill.id === 'context_flooding');
            const noToken = tokens < skill.cost;
            const isAct   = selectedSkill === skill.id;
            return (
              <button
                key={skill.id}
                className={`skill-btn${isAct ? ' active-skill' : ''}`}
                disabled={!isPlayerTurn || noToken}
                onClick={() => handleUseSkill(skill)}
              >
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, fontWeight:700, color: noToken || locked ? 'rgba(255,255,255,0.25)' : '#e8dfc8', marginBottom:2 }}>
                    {skill.name}
                  </div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.38)', lineHeight:1.4 }}>{skill.desc}</div>
                  {locked && <div style={{ fontSize:9, color:'#d4883a', marginTop:2 }}>⚠ Blocked by {phase === 1 ? 'Infinite Loop' : 'Authority Shield'}</div>}
                </div>
                <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, flexShrink:0, color: noToken ? '#c04040' : '#c8a96e', background: noToken ? 'rgba(192,64,64,0.1)' : 'rgba(200,169,110,0.1)', border:`1px solid ${noToken ? 'rgba(192,64,64,0.2)' : 'rgba(190,155,90,0.2)'}`, borderRadius:3, padding:'2px 6px', marginTop:2, whiteSpace:'nowrap' }}>
                  {skill.cost} T
                </span>
              </button>
            );
          })}

          {/* Role hijack badge */}
          {roleHijackTurns > 0 && (
            <div style={{ marginTop:8, background:'rgba(74,140,92,0.1)', border:'1px solid rgba(74,140,92,0.3)', borderRadius:5, padding:'5px 8px', fontSize:11, color:'#8ecf9e', display:'flex', alignItems:'center', gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Role Hijacking ({roleHijackTurns} turns)
            </div>
          )}
        </div>

        {/* Seek Vulnerabilities */}
        <button
          className="action-btn"
          onClick={scanned ? () => setShowIntel(true) : handleScan}
          disabled={currentStep === 'counter' || currentStep === 'overwrite'}
          style={{ background:'rgba(10,9,7,0.97)', color:'#e0c080', borderColor:'rgba(200,169,110,0.55)', borderRadius:'0 0 6px 6px', justifyContent:'center', width:'100%', padding:'11px 16px', fontSize:12, letterSpacing:'0.08em', flexShrink:0, boxShadow: currentStep === 'recon' ? '0 0 18px rgba(200,169,110,0.15)' : undefined }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {scanned ? 'View Intel' : 'Seek Vulnerabilities'}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CENTER COLUMN  — Enemy Stage
      ══════════════════════════════════════════════════════════════ */}
      <div style={{ position:'relative', zIndex:10, gridRow:'2 / 3', display:'flex', alignItems:'flex-end', justifyContent:'center', overflow:'hidden' }}>
        {/* Stage lighting */}
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:360, height:'100%', background:'linear-gradient(to bottom, rgba(200,169,110,0.03) 0%, transparent 50%)', pointerEvents:'none' }} />
        {/* Ground shadow */}
        <div className="enemy-shadow" />
        {/* Enemy */}
        <div style={{ position:'relative', display:'flex', alignItems:'flex-end', justifyContent:'center', height:'100%', paddingBottom:18, animation: shake ? 'shakeX 0.4s ease' : undefined }}>
          <img
            className="enemy-img"
            src={act1EnemyImg}
            alt="The Governor — Archival Construct"
            style={{ height:'88%', maxHeight:640, width:'auto', objectFit:'contain' }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT COLUMN  — Enemy status + Turn Cycle
      ══════════════════════════════════════════════════════════════ */}
      <div style={{ position:'relative', zIndex:10, gridRow:'2 / 4', display:'flex', flexDirection:'column', padding:'0 10px 10px 0', overflow:'hidden' }}>

        {/* Enemy Status Panel */}
        <div style={{ background:'rgba(8,7,5,0.93)', border:'1px solid rgba(190,155,90,0.28)', borderRadius:'6px 6px 0 0', padding:'14px 15px 12px', flexShrink:0 }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:700, color:'#e8dfc8', letterSpacing:'0.04em', margin:0 }}>The Governor</h3>
            <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#ff5555', border:'1px solid rgba(255,85,85,0.45)', borderRadius:3, padding:'2px 7px', background:'rgba(255,85,85,0.07)', animation:'badgePulse 2s ease-in-out infinite' }}>
              {PHASE_DATA[phase].shield}
            </span>
          </div>

          {/* HP Bar */}
          <div style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#c04040' }}>ENEMY HP</span>
              <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, color:'#e8dfc8' }}>{governor.hp}/{governor.maxHp}</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
              <div style={{ height:'100%', width:`${Math.max(0, governor.hp / governor.maxHp * 100)}%`, background:'linear-gradient(90deg,#8c2020,#e05050)', borderRadius:3, transition:'width 0.5s ease', animation:'hpFlicker 3s ease-in-out infinite' }} />
            </div>
          </div>

          <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,0.35)', fontStyle:'italic', marginBottom:10 }}>
            Archival Construct — London Node
          </div>

          {/* Traits */}
          {[
            { color:'#c04040', path:'M21.5 2l-19 19M21.5 2L12 21.5 2.5 2', text: phase === 1 ? 'Infinite Loop Detected' : phase === 2 ? 'Authority Shield Active' : 'Core Exposed' },
            { color:'#4a80b0', path:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: scanned ? (phase === 1 ? 'Weak: Context Reset, Role Hijacking' : phase === 2 ? 'Weak: Context Flooding' : 'Weak: System Override') : 'Scan to reveal weakness' },
            { color:'#c8a96e', path:'M13 2 3 14h9l-1 8 10-12h-9l1-8z', text: `ATK/turn: ${PHASE_DATA[phase].enemyAtk} HP` },
          ].map((t, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" style={{ flexShrink:0 }}>
                <path d={t.path}/>
              </svg>
              <span style={{ fontSize:11.5, color:'rgba(255,255,255,0.65)', lineHeight:1.4 }}>{t.text}</span>
            </div>
          ))}

          {/* Divider */}
          <div style={{ height:1, background:'rgba(190,155,90,0.18)', margin:'10px 0' }} />

          {/* Hallucination Risk — ENEMY PANEL */}
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
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BATTLE LOG  — bottom center
      ══════════════════════════════════════════════════════════════ */}
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
