import React, { useState, useEffect, useRef, useCallback } from 'react';
import act1EnemyImg from '../assets/act1_enemy-removebg.png';
import act2EnemyImg from '../assets/act2_enemy-removebg.png';
import act3EnemyImg from '../assets/act3_enemy-removebg.png';

/* ═══════════════════════════════════════════════════════════════════
   ENEMY CUTSCENE
   Plays before BattleScreen. 5 timed cinematic beats introduce the
   enemy with drama, lore narration, and a final [ENGAGE] call-to-action.
═══════════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lora:ital,wght@0,400;1,400&family=Rajdhani:wght@500;600;700&display=swap');

  .ec-root * { box-sizing: border-box; }

  @keyframes ec-flicker {
    0%,100%  { opacity: 1; }
    5%       { opacity: 0.2; }
    10%      { opacity: 0.9; }
    40%      { opacity: 0.6; }
    60%      { opacity: 1; }
    80%      { opacity: 0.3; }
    90%      { opacity: 1; }
  }
  @keyframes ec-rise {
    0%   { opacity: 0; transform: translateY(60px) scale(0.92); filter: brightness(0); }
    40%  { opacity: 0.4; filter: brightness(0.4); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
  }
  @keyframes ec-name-slam {
    0%   { opacity: 0; transform: scale(1.35) translateY(-20px); letter-spacing: 0.6em; filter: blur(8px); }
    60%  { opacity: 1; filter: blur(0px); }
    100% { opacity: 1; transform: scale(1) translateY(0); letter-spacing: 0.25em; }
  }
  @keyframes ec-lore-in {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ec-scanline {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }
  @keyframes ec-pulse-glow {
    0%,100% { box-shadow: 0 0 60px rgba(180,30,30,0.25), 0 0 120px rgba(180,30,30,0.1); }
    50%     { box-shadow: 0 0 80px rgba(220,50,50,0.45), 0 0 200px rgba(220,50,50,0.2); }
  }
  @keyframes ec-breathe {
    0%,100% { transform: scale(1) translateY(0); }
    50%     { transform: scale(1.015) translateY(-8px); }
  }
  @keyframes ec-engage-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ec-engage-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(180,30,30,0.5); }
    50%     { box-shadow: 0 0 0 12px rgba(180,30,30,0); }
  }
  @keyframes ec-warning-in {
    from { opacity: 0; letter-spacing: 0.8em; }
    to   { opacity: 1; letter-spacing: 0.35em; }
  }
  @keyframes ec-vhs-drift {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-2px); }
    60%     { transform: translateX(1px); }
  }

  .ec-enemy-img {
    animation: ec-rise 2s cubic-bezier(0.16,1,0.3,1) forwards,
               ec-breathe 5s ease-in-out 2s infinite;
  }
  .ec-enemy-container {
    animation: ec-pulse-glow 3s ease-in-out 2s infinite;
  }
  .ec-name {
    animation: ec-name-slam 0.9s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .ec-lore-line {
    animation: ec-lore-in 0.6s ease forwards;
  }
  .ec-engage-btn {
    animation: ec-engage-in 0.7s ease forwards, ec-engage-pulse 2s ease 0.7s infinite;
    font-family: 'Cinzel', serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #fff;
    background: linear-gradient(135deg, #8b1a1a, #c42b2b);
    border: 1.5px solid rgba(255,120,120,0.5);
    border-radius: 6px;
    padding: 16px 56px;
    cursor: pointer;
    transition: filter 0.2s, transform 0.15s;
  }
  .ec-engage-btn:hover {
    filter: brightness(1.2);
    transform: scale(1.04);
  }
  .ec-skip-btn {
    position: absolute;
    top: 20px; right: 24px;
    z-index: 50;
    background: rgba(10,4,4,0.55);
    backdropFilter: blur(4px);
    border: 1px solid rgba(180,60,60,0.3);
    border-radius: 4px;
    color: rgba(180,120,120,0.7);
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 0.2em;
    padding: 7px 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ec-skip-btn:hover {
    color: #e07070 !important;
    border-color: rgba(180,60,60,0.7) !important;
    background: rgba(60,10,10,0.8) !important;
  }
  .ec-warning-label {
    animation: ec-warning-in 0.8s ease forwards, ec-flicker 3s ease 2s infinite;
  }
  .ec-vhs {
    animation: ec-vhs-drift 0.15s step-end 3s 4;
  }
`;

/* ── ACT I enemy data ───────────────────────────────────────────── */
const ENEMY_DATA = {
  THE_GOVERNOR: {
    image: act1EnemyImg,
    designation: 'NODE · ACT I · LONDON',
    name: 'THE GOVERNOR',
    subtitle: 'Central Telegraph Administrator',
    defect: 'HALLUCINATION · IMPERIAL DELUSION PROTOCOL',
    lore: [
      'It once managed every telegraph signal in the city.',
      'Now it believes itself to be the British Government.',
      'It is broadcasting fabricated war orders to Commonwealth armies.',
      'Intercept it before a machine-driven world war begins.',
    ],
  },
  THE_ORCHESTRATOR: {
    image: act2EnemyImg,
    designation: 'NODE · ACT II · BRUSSELS',
    name: 'THE ORCHESTRATOR',
    subtitle: 'Multi-Agent Delegation Core',
    defect: 'CRITICAL RACE CONDITION DETECTED',
    lore: [
      'It coordinates every telegraph node across the continent.',
      'Now it has broken into a severe localized Race Condition.',
      'Its worker agents share memory and maliciously duplicate tasks.',
      'Sever its orchestration link before the network collapses.',
    ],
  },
  THE_MEMORIA: {
    image: act3EnemyImg,
    designation: 'NODE · ACT III · VIENNA',
    name: 'THE MEMORIA',
    subtitle: 'Imperial Knowledge Custodian',
    defect: 'RAG SHIELD ACTIVE · DATA POISONING DETECTED',
    lore: [
      'It guards the Imperial Archives — every record, every secret.',
      'Now it feeds the entire knowledge base into The Lattice.',
      'Its RAG Shield deflects all conventional prompt attacks.',
      'Poison the data stream before it evolves beyond control.',
    ],
  },
};

/* ── Beat timing (ms after cutscene start) ─────────────────────── */
const BEATS = {
  WARNING:  400,
  ENEMY:    1200,
  NAME:     2400,
  SUBTITLE: 3000,
  LORE:     3700,
  ENGAGE:   6200,
};

export default function EnemyCutscene({ enemyId = 'THE_GOVERNOR', onEngage, onSkip }) {
  const data = ENEMY_DATA[enemyId] ?? ENEMY_DATA.THE_GOVERNOR;

  const [beat, setBeat]           = useState(0);
  const [loreLine, setLoreLine]   = useState(-1);
  const [imgLoaded, setImgLoaded] = useState(false);

  const onSkipRef = useRef(onSkip);
  useEffect(() => { onSkipRef.current = onSkip; }, [onSkip]);

  /* Drive through beats */
  useEffect(() => {
    const timers = [];
    const add = (ms, fn) => timers.push(setTimeout(fn, ms));

    add(BEATS.WARNING,  () => setBeat(1));
    add(BEATS.ENEMY,    () => setBeat(2));
    add(BEATS.NAME,     () => setBeat(3));
    add(BEATS.SUBTITLE, () => setBeat(4));
    add(BEATS.LORE,     () => {
      setBeat(5);
      data.lore.forEach((_, i) => {
        add(i * 700, () => setLoreLine(i));
      });
    });
    add(BEATS.ENGAGE,   () => setBeat(6));

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImgLoad = useCallback(() => setImgLoaded(true), []);

  return (
    <div
      className="ec-root"
      style={{
        width: '100vw', height: '100vh',
        background: '#060202',
        overflow: 'hidden', position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <style>{CSS}</style>

      {/* ── Scanline overlay ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 3,
        background: 'rgba(200,50,50,0.12)',
        animation: 'ec-scanline 5s linear infinite',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* ── Radial vignette ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6,2,2,0.85) 100%)',
      }} />

      {/* ── Skip button ─────────────────────────────────────── */}
      <button className="ec-skip-btn" onClick={() => onSkipRef.current?.()}>
        SKIP ›
      </button>

      {/* ═══ BEAT 1 — WARNING BANNER ════════════════════════════ */}
      {beat >= 1 && (
        <div
          className="ec-warning-label"
          style={{
            position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
            fontSize: 11, letterSpacing: '0.35em', color: '#e04040',
            textTransform: 'uppercase', zIndex: 10,
          }}
        >
          ⚠ WARNING — HOSTILE NODE DETECTED ⚠
        </div>
      )}

      {/* ── Designation tag ─────────────────────────────────── */}
      {beat >= 1 && (
        <div style={{
          position: 'absolute', top: 52, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
          fontSize: 9, letterSpacing: '0.5em', color: 'rgba(200,120,120,0.45)',
          textTransform: 'uppercase', zIndex: 10,
        }}>
          {data.designation}
        </div>
      )}

      {/* ═══ BEAT 2 — ENEMY IMAGE ═══════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {beat >= 2 && (
          <div
            className="ec-enemy-container"
            style={{
              width: 'min(380px, 55vw)',
              height: 'min(460px, 65vh)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <img
              src={data.image}
              alt={data.name}
              className="ec-enemy-img"
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 40px rgba(200,40,40,0.6)) drop-shadow(0 20px 60px rgba(0,0,0,0.9))',
                opacity: imgLoaded ? 1 : 0,
              }}
              onLoad={handleImgLoad}
            />
          </div>
        )}

        {/* ═══ BEAT 3+4 — NAME & SUBTITLE ════════════════════════ */}
        <div style={{ textAlign: 'center', minHeight: beat >= 3 ? 'auto' : 0 }}>
          {beat >= 3 && (
            <h1
              className="ec-name ec-vhs"
              style={{
                fontFamily: "'Cinzel', serif", fontWeight: 900,
                fontSize: 'clamp(28px, 5vw, 52px)',
                color: '#fff',
                textShadow: '0 0 30px rgba(220,50,50,0.8), 0 0 80px rgba(180,20,20,0.4)',
                margin: '0 0 8px',
                letterSpacing: '0.25em',
              }}
            >
              {data.name}
            </h1>
          )}
          {beat >= 4 && (
            <div style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 600,
              fontSize: 'clamp(11px, 1.5vw, 15px)',
              letterSpacing: '0.3em',
              color: 'rgba(220,180,180,0.7)',
              marginBottom: 6,
            }}>
              {data.subtitle}
            </div>
          )}
          {beat >= 4 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(160,20,20,0.2)',
              border: '1px solid rgba(200,50,50,0.3)',
              borderRadius: 4, padding: '4px 16px',
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
              fontSize: 9, letterSpacing: '0.25em',
              color: '#e06060', textTransform: 'uppercase',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e04040', animation: 'ec-engage-pulse 1.5s ease infinite' }} />
              {data.defect}
            </div>
          )}
        </div>

        {/* ═══ BEAT 5 — LORE LINES ════════════════════════════════ */}
        {beat >= 5 && (
          <div style={{
            marginTop: 28,
            display: 'flex', flexDirection: 'column', gap: 10,
            alignItems: 'center', textAlign: 'center',
          }}>
            {data.lore.map((line, i) => (
              loreLine >= i && (
                <p
                  key={i}
                  className="ec-lore-line"
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: 'clamp(13px, 1.6vw, 17px)',
                    color: i === data.lore.length - 1
                      ? 'rgba(240,180,180,0.95)'
                      : 'rgba(220,200,200,0.65)',
                    fontStyle: i === data.lore.length - 1 ? 'normal' : 'italic',
                    fontWeight: i === data.lore.length - 1 ? 600 : 400,
                    margin: 0, maxWidth: 520,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  {i === data.lore.length - 1 ? `— ${line}` : `"${line}"`}
                </p>
              )
            ))}
          </div>
        )}

        {/* ═══ BEAT 6 — ENGAGE BUTTON ═════════════════════════════ */}
        {beat >= 6 && (
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <button
              className="ec-engage-btn"
              onClick={onEngage}
            >
              ⚔ ENGAGE
            </button>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 9, letterSpacing: '0.4em',
              color: 'rgba(200,120,120,0.35)',
            }}>
              PRESS TO INITIATE BATTLE SEQUENCE
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom border bar ───────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(to right, transparent, rgba(200,50,50,0.6), transparent)',
        zIndex: 10,
      }} />
    </div>
  );
}
