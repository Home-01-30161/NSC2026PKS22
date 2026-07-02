import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Frame map ────────────────────────────────────────────────────── */
const FRAMES = {
  idle: '/character/seraphine-idle.png',
  blink: '/character/seraphine-blink.png',
  think: '/character/seraphine-think.png',
  happy: '/character/seraphine-happy.png',
};

/* ─── Speech bubble typewriter hook ──────────────────────────────── */
function useTypewriter(text, speed = 28) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, done };
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function CharacterSprite({ state = 'idle', dialogue = '', onDone }) {
  /* ── Eye tracking ─────────────────────────────────────────────── */
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.35; // approx eye level
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    setEyeOffset({
      x: Math.max(-4, Math.min(4, dx * 8)),
      y: Math.max(-3, Math.min(3, dy * 6)),
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  /* ── Auto blink ───────────────────────────────────────────────── */
  const [frame, setFrame] = useState('idle');
  const blinkTimerRef = useRef(null);

  const scheduleBlink = useCallback(() => {
    const delay = 3500 + Math.random() * 2500;
    blinkTimerRef.current = setTimeout(() => {
      setFrame('blink');
      setTimeout(() => { setFrame('idle'); scheduleBlink(); }, 220);
    }, delay);
  }, []);

  useEffect(() => {
    scheduleBlink();
    return () => clearTimeout(blinkTimerRef.current);
  }, [scheduleBlink]);

  /* ── External state override (thinking / happy) ───────────────── */
  useEffect(() => {
    if (state === 'thinking') { setFrame('think'); return; }
    if (state === 'happy') {
      setFrame('happy');
      const t = setTimeout(() => setFrame('idle'), 2000);
      return () => clearTimeout(t);
    }
  }, [state]);

  /* ── Typewriter dialogue ──────────────────────────────────────── */
  const { displayed, done } = useTypewriter(dialogue, 30);

  useEffect(() => {
    if (done && onDone) onDone();
  }, [done, onDone]);

  /* ── Breathing animation phase ────────────────────────────────── */
  const [breathPhase, setBreathPhase] = useState(0);
  useEffect(() => {
    let raf;
    const tick = (t) => {
      setBreathPhase(Math.sin(t / 1400) * 4); // ±4px vertical bob
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Bounce on happy ──────────────────────────────────────────── */
  const [bounceY, setBounceY] = useState(0);
  useEffect(() => {
    if (state !== 'happy') return;
    let start = null;
    const bounce = (t) => {
      if (!start) start = t;
      const elapsed = t - start;
      // spring: peaks at 100ms, dies at 600ms
      const y = -14 * Math.sin((elapsed / 600) * Math.PI) * Math.exp(-elapsed / 400);
      setBounceY(y);
      if (elapsed < 700) requestAnimationFrame(bounce);
      else setBounceY(0);
    };
    requestAnimationFrame(bounce);
  }, [state]);

  /* ── Page-load greeting tilt ──────────────────────────────────── */
  const [greetTilt, setGreetTilt] = useState(-8);
  useEffect(() => {
    const t = setTimeout(() => setGreetTilt(0), 900);
    return () => clearTimeout(t);
  }, []);

  /* ── Computed transform ───────────────────────────────────────── */
  const transform = `
    translateY(${breathPhase + bounceY}px)
    rotate(${greetTilt}deg)
  `.trim();

  const imgSrc = FRAMES[frame] ?? FRAMES.idle;

  /* ── Speech bubble visibility ─────────────────────────────────── */
  const showBubble = !!displayed;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* ── Speech bubble ─────────────────────────────────────────── */}
      {showBubble && (
        <div
          style={{
            position: 'absolute',
            bottom: '88%',
            left: '55%',
            maxWidth: 260,
            minWidth: 120,
            background: '#FAF7F2',
            border: '1.5px solid #C9BBA8',
            borderRadius: '14px 14px 14px 2px',
            padding: '10px 14px',
            boxShadow: '2px 3px 12px rgba(92,61,46,0.12)',
            pointerEvents: 'auto',
            // slightly imperfect with border-image trick
            filter: 'drop-shadow(0 2px 6px rgba(92,61,46,0.10))',
            animation: 'bubbleFadeIn 0.2s ease',
          }}
        >
          {/* tail */}
          <div style={{
            position: 'absolute',
            bottom: -10, left: 14,
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '10px solid #C9BBA8',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -8, left: 15,
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '3px solid transparent',
            borderTop: '9px solid #FAF7F2',
          }} />
          <p style={{
            margin: 0,
            fontFamily: "'Caveat', cursive",
            fontSize: 15,
            color: '#2C1A0E',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}>
            {displayed}
            {!done && (
              <span style={{
                display: 'inline-block',
                width: 2, height: '1em',
                background: '#B07B6E',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                animation: 'blink 0.7s step-end infinite',
              }} />
            )}
          </p>
        </div>
      )}

      {/* ── Character image with eye-tracking overlay ──────────────── */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={imgSrc}
          alt="Seraphine"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            maxHeight: '55vh',
            objectFit: 'contain',
            transform,
            transition: 'transform 0.6s cubic-bezier(.34,1.56,.64,1)',
            filter: 'sepia(8%) contrast(1.02)',
            // smooth frame swap
            imageRendering: 'crisp-edges',
          }}
        />
        {/* Eye tracking dot overlay — subtle shift on eyes layer */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            /* tune these % values to sit on the eyes in your sprites */
            top: '32%',
            left: '50%',
            width: '30%',
            height: '10%',
            transform: `translate(calc(-50% + ${eyeOffset.x}px), ${eyeOffset.y}px)`,
            transition: 'transform 0.12s linear',
            pointerEvents: 'none',
            /* purely positional — no visible style; move real elements instead */
          }}
        />
      </div>
    </div>
  );
}
