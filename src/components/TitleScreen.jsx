import React, { useState, useEffect } from 'react';
import { GAME_PHASES } from '../services/GameEngine';
import Strands from './Strands';

/* ─── Steampunk Gear SVG Clasp ────────────────────────────────────── */
const GearClasp = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gearGrad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#D4AA6A" />
        <stop offset="60%" stopColor="#8B6914" />
        <stop offset="100%" stopColor="#5C4008" />
      </radialGradient>
    </defs>
    {/* Outer ring */}
    <circle cx="28" cy="28" r="25" fill="url(#gearGrad)" stroke="#4A3208" strokeWidth="1.5" />
    {/* Gear teeth */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 28 + 19 * Math.cos(rad);
      const y1 = 28 + 19 * Math.sin(rad);
      const x2 = 28 + 25 * Math.cos(rad);
      const y2 = 28 + 25 * Math.sin(rad);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A3208" strokeWidth="5" strokeLinecap="round" />;
    })}
    {/* Inner ring */}
    <circle cx="28" cy="28" r="16" fill="url(#gearGrad)" stroke="#4A3208" strokeWidth="1" />
    {/* Pen nib center */}
    <ellipse cx="28" cy="28" rx="7" ry="9" fill="#2C1A06" stroke="#D4AA6A" strokeWidth="1" />
    <line x1="28" y1="19" x2="28" y2="37" stroke="#D4AA6A" strokeWidth="0.8" />
    <ellipse cx="28" cy="35" rx="3" ry="2" fill="#D4AA6A" opacity="0.5" />
  </svg>
);

/* ─── Dip Pen SVG ─────────────────────────────────────────────────── */
const DipPen = () => (
  <svg width="340" height="80" viewBox="0 0 340 80" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(2px 4px 8px rgba(44,26,8,0.35))' }}>
    <defs>
      <linearGradient id="penBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C8A96A" />
        <stop offset="40%" stopColor="#8B6A30" />
        <stop offset="100%" stopColor="#5C3D10" />
      </linearGradient>
      <linearGradient id="nibGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8B8C0" />
        <stop offset="50%" stopColor="#6A6A78" />
        <stop offset="100%" stopColor="#2A2A35" />
      </linearGradient>
    </defs>
    {/* Pen barrel (wooden) */}
    <rect x="40" y="30" width="220" height="18" rx="9" fill="url(#penBodyGrad)" />
    {/* Wood grain lines */}
    {[0, 1, 2, 3, 4, 5].map(i => (
      <line key={i} x1={60 + i * 36} y1="31" x2={65 + i * 36} y2="47" stroke="#4A2D08" strokeWidth="0.6" opacity="0.5" />
    ))}
    {/* Pen end cap */}
    <ellipse cx="260" cy="39" rx="8" ry="10" fill="#4A2D08" />
    <ellipse cx="262" cy="39" rx="4" ry="7" fill="#8B6A30" opacity="0.5" />
    {/* Metal collar near nib */}
    <rect x="35" y="31" width="14" height="16" rx="3" fill="#9A8060" stroke="#7A6040" strokeWidth="0.8" />
    <line x1="38" y1="31" x2="38" y2="47" stroke="#C8A96A" strokeWidth="0.5" />
    <line x1="44" y1="31" x2="44" y2="47" stroke="#C8A96A" strokeWidth="0.5" />
    {/* Nib */}
    <polygon points="0,39 35,30 35,48" fill="url(#nibGrad)" />
    <line x1="12" y1="39" x2="33" y2="39" stroke="#9090A0" strokeWidth="0.8" opacity="0.7" />
    {/* Nib tip ink drop */}
    <ellipse cx="3" cy="40" rx="3" ry="2" fill="#1A1A2E" opacity="0.7" />
  </svg>
);

/* ─── Ornamental divider ──────────────────────────────────────────── */
const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 400, margin: '0 auto' }}>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #8B6914)' }} />
    <span style={{ color: '#8B6914', fontSize: 14, fontFamily: 'serif' }}>❧</span>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #8B6914)' }} />
  </div>
);

export default function TitleScreen({ onStart }) {
  const [hovering, setHovering] = useState(null);
  const [inked, setInked] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleStart = () => {
    setTransitioning(true);
    setTimeout(() => {
      onStart();
    }, 4500); // Wait for the transition effect
  };

  useEffect(() => {
    // Subtle ink-in animation
    const t = setTimeout(() => setInked(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.root}>
      {/* ── Injected keyframes ─────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800;900&family=Lora:ital,wght@0,400;0,600;1,400&family=Caveat:wght@400;600&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); filter: blur(0px); }
          to   { opacity: 0; transform: scale(0.97); filter: blur(4px); }
        }
        @keyframes sketchIn {
          from { opacity: 0; filter: blur(3px) saturate(0); transform: scale(0.97); }
          to   { opacity: 1; filter: blur(0px) saturate(1); transform: scale(1); }
        }
        @keyframes shimmerTitle {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatPen {
          0%, 100% { transform: rotate(-18deg) translateY(0px); }
          50%       { transform: rotate(-18deg) translateY(-4px); }
        }
        @keyframes flickerIn {
          0%   { opacity: 0; }
          60%  { opacity: 0.85; }
          75%  { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .btn-begin {
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-begin::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,220,130,0.25) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .btn-begin:hover::after {
          transform: translateX(100%);
        }
        .btn-begin:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(100,70,10,0.4), 0 0 0 1px rgba(200,169,106,0.6);
        }
        .btn-begin:active {
          transform: translateY(0px);
        }
        .btn-credits {
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .btn-credits:hover {
          opacity: 1 !important;
          transform: translateY(-1px);
        }
        .credits-modal {
          animation: fadeInUp 0.25s ease forwards;
        }
      `}</style>

      {/* ── Desk background ──────────────────────────────────────── */}
      <div style={styles.deskBg} />

      {/* ── Open Notebook ─────────────────────────────────────────── */}
      <div style={{
        ...styles.notebook,
        animation: transitioning ? 'fadeOut 1s forwards' : inked ? 'sketchIn 0.8s cubic-bezier(.4,0,.2,1) forwards' : 'none',
        opacity: inked ? 1 : 0,
      }}>

        {/* Spine shadow in center */}
        <div style={styles.spineShadow} />

        {/* ── LEFT PAGE ─────────────────────────────────────────── */}
        <div style={styles.leftPage}>
          {/* Ruled lines */}
          <div style={styles.ruledLines} />

          {/* London cityscape sketch */}
          <div style={{
            ...styles.sketchLeft,
            animation: inked ? 'sketchIn 1.1s ease 0.2s both' : 'none',
          }}>
            <img
              src="/london_sketch.png"
              alt="Victorian London"
              style={styles.sketchImg}
            />
            <div style={styles.sketchVignette} />
          </div>

          {/* Left page decorative text */}
          <div style={{
            position: 'absolute', bottom: 60, left: 30, right: 20,
            fontFamily: "'Caveat', cursive",
            fontSize: 11, color: 'rgba(80,55,20,0.4)',
            lineHeight: 2.1, letterSpacing: '0.02em',
            pointerEvents: 'none',
          }}>
            {['Field Report — Node Alpha', 'London Station, 1901', 'The Lattice has begun', 'its override sequence...', '— M. Voss, Engineer'].map((line, i) => (
              <div key={i} style={{ opacity: 0.7 - i * 0.1 }}>{line}</div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PAGE ─────────────────────────────────────────── */}
        <div style={styles.rightPage}>
          {/* Ruled lines */}
          <div style={styles.ruledLines} />

          {/* Victorian street sketch — bottom right */}
          <div style={{
            ...styles.sketchRight,
            animation: inked ? 'sketchIn 1.1s ease 0.4s both' : 'none',
          }}>
            <img
              src="/street_sketch.png"
              alt="Victorian Street"
              style={{ ...styles.sketchImg, objectPosition: 'top center' }}
            />
            <div style={styles.sketchVignette} />
          </div>

          {/* ── TITLE BLOCK ──────────────────────────────────────── */}
          <div style={{
            ...styles.titleBlock,
            animation: inked ? 'fadeInUp 0.9s ease 0.5s both' : 'none',
          }}>
            {/* Subtitle tag */}
            <div style={styles.subtitle}>
              <Divider />
              <span style={styles.subtitleText}>An Educational RPG · 1901</span>
              <Divider />
            </div>

            {/* Main title */}
            <div style={styles.titleMain}>
              <span style={styles.titleWord}>MARI</span>
              <span style={styles.titleWord}>VECTORI</span>
            </div>

            {/* Tagline */}
            <div style={styles.tagline}>
              "Override The Lattice. Save Europe."
            </div>
          </div>

          {/* ── PEN ──────────────────────────────────────────────── */}
          <div style={{
            ...styles.penWrap,
            animation: inked ? 'floatPen 3.5s ease-in-out 1.2s infinite' : 'none',
            opacity: inked ? 1 : 0,
          }}>
            <DipPen />
          </div>

          {/* ── BUTTONS ──────────────────────────────────────────── */}
          <div style={{
            ...styles.buttonsWrap,
            animation: inked ? 'fadeInUp 0.7s ease 0.9s both' : 'none',
          }}>
            {/* BEGIN PROTOCOL */}
            <button
              className="btn-begin"
              style={{
                ...styles.btnBegin,
                ...(hovering === 'begin' ? styles.btnBeginHover : {}),
              }}
              onMouseEnter={() => setHovering('begin')}
              onMouseLeave={() => setHovering(null)}
              onClick={handleStart}
            >
              <span style={styles.btnBeginBracketL}>❬</span>
              &nbsp;&nbsp;START&nbsp;&nbsp;
              <span style={styles.btnBeginBracketR}>❭</span>
            </button>

            {/* CREDITS */}
            <button
              className="btn-credits"
              style={styles.btnCredits}
              onMouseEnter={() => setHovering('credits')}
              onMouseLeave={() => setHovering(null)}
              onClick={() => setShowCredits(true)}
            >
              <span style={styles.creditsIcon}>ⓘ</span>
              <span style={styles.creditsLabel}>CREDITS</span>
            </button>
          </div>
        </div>

        {/* ── LEATHER CLASP (top center) ─────────────────────────── */}
        <div style={styles.clasp}>
          <div style={styles.claspLeather} />
          <GearClasp />
        </div>

      </div>

      {/* ── Credits Modal ──────────────────────────────────────────── */}
      {showCredits && (
        <div style={styles.modalOverlay} onClick={() => setShowCredits(false)}>
          <div className="credits-modal" style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>❧ Credits ❧</div>
            <Divider />
            <div style={styles.modalBody}>
              <p><strong>MariVectori</strong> Turn-Based RPG</p>
              <p style={{ marginTop: 8 }}>A game about AI Architecture,<br />Prompt Injection & Trustworthy AI.</p>
              <div style={{ marginTop: 16, borderTop: '1px dashed #8B6914', paddingTop: 12 }}>
                <div style={{ marginBottom: 4 }}><strong>Developed by:</strong></div>
                <div>Pongchai Boonyawan</div>
                <div>Natdanai Kongrod</div>
                <div>Natirapee Jitnarong</div>
                <div>Advisor: Sarawut Singhtotong</div>
                <div>Petpittayakom School</div>
              </div>
            </div>
            <button style={styles.modalClose} onClick={() => setShowCredits(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Transition Effect ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        opacity: transitioning ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        background: '#0a0603', // dark fade
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {transitioning && (
          <div style={{ width: '100%', height: '50vh', position: 'relative' }}>
            <Strands
              colors={["#C8A96A", "#8B6914", "#D4AA6A"]}
              count={5}
              speed={1.5}
              amplitude={2}
              waviness={1.5}
              thickness={1}
              glow={2.6}
              taper={3}
              spread={2}
              intensity={0.8}
              saturation={1.5}
              opacity={1}
              scale={1.5}
              glass={false}
              refraction={1}
              dispersion={1}
              glassSize={1}
              hueShift={0}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────── */
const PAPER = '#F2EBD9';
const PAPER_SHADOW = '#E0D4BE';
const INK = '#2C1A06';
const GOLD = '#8B6914';
const GOLD_LIGHT = '#C8A96A';

const styles = {
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    background: '#1A1008',
  },

  deskBg: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse at 50% 50%, #3D2810 0%, #1E1106 60%, #0D0803 100%)
    `,
    backgroundImage: `
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 4px,
        rgba(255,200,100,0.015) 4px,
        rgba(255,200,100,0.015) 5px
      )
    `,
  },

  notebook: {
    position: 'relative',
    display: 'flex',
    width: 'min(960px, 95vw)',
    height: 'min(600px, 90vh)',
    borderRadius: 6,
    boxShadow: `
      0 30px 80px rgba(0,0,0,0.8),
      0 10px 30px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,230,170,0.2)
    `,
    overflow: 'visible',
  },

  spineShadow: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    transform: 'translateX(-50%)',
    width: 12,
    background: 'linear-gradient(to right, rgba(20,10,2,0.5), rgba(60,35,10,0.2), rgba(20,10,2,0.5))',
    zIndex: 5,
    pointerEvents: 'none',
  },

  leftPage: {
    flex: 1,
    background: `
      linear-gradient(to right, ${PAPER_SHADOW}, ${PAPER} 8%)
    `,
    borderRadius: '4px 0 0 4px',
    position: 'relative',
    overflow: 'hidden',
  },

  rightPage: {
    flex: 1,
    background: `
      linear-gradient(to left, ${PAPER_SHADOW}, ${PAPER} 8%)
    `,
    borderRadius: '0 4px 4px 0',
    position: 'relative',
    overflow: 'hidden',
  },

  ruledLines: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 27px,
        rgba(140,110,60,0.22) 27px,
        rgba(140,110,60,0.22) 28px
      )
    `,
    backgroundPosition: '0 40px',
    pointerEvents: 'none',
  },

  sketchLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    height: '55%',
    borderRadius: 4,
    overflow: 'hidden',
  },

  sketchRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '52%',
    bottom: 0,
    overflow: 'hidden',
  },

  sketchImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    mixBlendMode: 'multiply',
    filter: 'sepia(30%) contrast(0.9) brightness(1.05)',
    opacity: 0.85,
  },

  sketchVignette: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse at center, transparent 40%, ${PAPER} 100%)
    `,
    pointerEvents: 'none',
  },

  titleBlock: {
    position: 'absolute',
    top: '18%',
    left: 24,
    right: '44%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '0 16px',
    zIndex: 6,
  },

  subtitle: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },

  subtitleText: {
    fontFamily: "'Caveat', cursive",
    fontSize: 12,
    color: '#7A5C20',
    letterSpacing: '0.15em',
    padding: '2px 0',
    opacity: 0.8,
  },

  titleMain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    lineHeight: 1.0,
    marginTop: 4,
  },

  titleWord: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(28px, 5vw, 46px)',
    fontWeight: 900,
    letterSpacing: '0.18em',
    background: `linear-gradient(
      170deg,
      #C8A96A 0%,
      #8B6914 30%,
      #D4AA6A 50%,
      #6A4A08 70%,
      #C8A96A 100%
    )`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: 'none',
    filter: 'drop-shadow(1px 2px 3px rgba(80,50,0,0.4))',
    animation: 'shimmerTitle 4s linear infinite',
  },

  tagline: {
    fontFamily: "'Lora', serif",
    fontStyle: 'italic',
    fontSize: 11,
    color: '#7A5C20',
    opacity: 0.75,
    letterSpacing: '0.04em',
    marginTop: 2,
    textAlign: 'center',
  },

  penWrap: {
    position: 'absolute',
    bottom: '22%',
    left: -10,
    right: '45%',
    display: 'flex',
    justifyContent: 'center',
    transformOrigin: 'center center',
    transform: 'rotate(-18deg)',
    zIndex: 4,
    pointerEvents: 'none',
  },

  buttonsWrap: {
    position: 'absolute',
    bottom: '12%',
    left: 0,
    right: '46%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    zIndex: 5,
  },

  btnBegin: {
    background: `linear-gradient(
      to bottom,
      #4A3208 0%,
      #2C1A06 40%,
      #1E1004 100%
    )`,
    color: '#C8A96A',
    border: '1.5px solid #8B6914',
    borderRadius: 4,
    padding: '10px 28px',
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.25em',
    outline: 'none',
    boxShadow: `
      0 2px 8px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(200,169,106,0.15),
      0 0 0 1px rgba(60,40,8,0.8)
    `,
  },

  btnBeginBracketL: {
    fontSize: 10,
    opacity: 0.7,
    marginRight: 2,
  },

  btnBeginBracketR: {
    fontSize: 10,
    opacity: 0.7,
    marginLeft: 2,
  },

  btnCredits: {
    background: 'transparent',
    border: '1px solid rgba(139,105,20,0.5)',
    borderRadius: 4,
    padding: '5px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    cursor: 'pointer',
    outline: 'none',
    opacity: 0.7,
  },

  creditsIcon: {
    fontFamily: 'serif',
    fontSize: 13,
    color: GOLD,
  },

  creditsLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: 9,
    color: GOLD,
    letterSpacing: '0.2em',
  },

  clasp: {
    position: 'absolute',
    top: -28,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  claspLeather: {
    width: 40,
    height: 28,
    background: `linear-gradient(to bottom, #3D2508, #5C3D10)`,
    borderRadius: '3px 3px 0 0',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.5)',
    position: 'relative',
    marginBottom: -2,
  },

  /* ── Credits Modal ── */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  modal: {
    background: PAPER,
    border: '1px solid #8B6914',
    borderRadius: 6,
    padding: '28px 36px',
    maxWidth: 380,
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    fontFamily: "'Lora', serif",
    color: INK,
    backgroundImage: `repeating-linear-gradient(
      to bottom, transparent, transparent 27px,
      rgba(140,110,60,0.2) 27px, rgba(140,110,60,0.2) 28px
    )`,
  },

  modalTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 18,
    fontWeight: 700,
    color: GOLD,
    marginBottom: 12,
    letterSpacing: '0.1em',
  },

  modalBody: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 1.75,
    color: '#2C1A06',
  },

  modalClose: {
    marginTop: 20,
    padding: '7px 24px',
    background: 'transparent',
    border: '1px solid #8B6914',
    borderRadius: 4,
    color: GOLD,
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: '0.15em',
    cursor: 'pointer',
  },
};
