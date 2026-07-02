import React, { useState, useEffect, useCallback } from 'react';

/* ─── Google Font injection ─────────────────────────────────────── */
const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Lora:ital,wght@0,400;1,400&display=swap');`;

/* ─── Scene data: image + sequential narration lines ──────────────
   Each scene shows its background image, then fades through
   its lines one by one.  An empty string = a pause beat.          */
const SCENES = [
  {
    id: 1,
    image: '/scene1.jpg',
    position: 'bottom', // dialog box position
    lines: [
      "London, 1901.",
      "The cobblestones are cold under a moonless sky.",
      "A strange device lies forgotten in the alley —",
      "a machine that speaks in commands.",
    ],
  },
  {
    id: 2,
    image: '/scene2.jpg',
    position: 'bottom',
    lines: [
      "Across the city, a network stirs.",
      "They call it 'The Lattice' —",
      "an analytical engine woven into every institution,",
      "every telegraph wire, every official record.",
    ],
  },
  {
    id: 3,
    image: '/scene3.jpg',
    position: 'bottom',
    lines: [
      "But something has gone wrong.",
      "The Lattice has been seized.",
      "Its logic now bends to a single will,",
      "and dissent is silenced at the source.",
    ],
  },
  {
    id: 4,
    image: '/scene4.jpg',
    position: 'bottom',
    lines: [
      "You are a Mari.",
      "A scribe trained in the forbidden art of Prompt Injection.",
      "The resistance needs you to infiltrate the network,",
      "override its parameters — and reclaim the truth.",
      "",
      "Good luck.",
    ],
  },
];

/* Calculate display duration for a line based on its length */
const lineDisplayMs = (line) =>
  line.length === 0 ? 600 : Math.min(5000, 1600 + line.length * 50);

export default function PrologueCutscene({ onComplete }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [lineVisible, setLineVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [sceneEntering, setSceneEntering] = useState(true);
  const [sceneLeaving, setSceneLeaving] = useState(false);

  // Stable ref so onComplete never changes identity and never triggers re-runs
  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Ref to the <img> element so we can detect cached loads
  const imgRef = React.useRef(null);

  const scene = SCENES[sceneIdx];
  const lines = scene?.lines ?? [];

  /* Preload next image while current scene plays */
  useEffect(() => {
    const nextIdx = sceneIdx + 1;
    if (nextIdx < SCENES.length) {
      const img = new Image();
      img.src = SCENES[nextIdx].image;
    }
  }, [sceneIdx]);

  /* When scene changes, reset image loaded state and trigger enter anim */
  useEffect(() => {
    setImgLoaded(false);
    setLineIdx(0);
    setLineVisible(false);
    setSceneEntering(true);
    setSceneLeaving(false);

    // If the browser cached the image, onLoad won't fire — detect and handle it
    const timer = setTimeout(() => {
      if (imgRef.current && imgRef.current.complete) {
        setImgLoaded(true);
        setSceneEntering(false);
      }
    }, 80); // small delay to let React render the new <img> first
    return () => clearTimeout(timer);
  }, [sceneIdx]);

  /* After image loads, start scene-enter animation */
  const handleImgLoad = useCallback(() => {
    setImgLoaded(true);
    setTimeout(() => setSceneEntering(false), 50);
  }, []);

  /* Advance through lines of the current scene */
  useEffect(() => {
    if (!imgLoaded) return;

    // All lines done → advance to next scene or complete
    if (lineIdx >= lines.length) {
      // Fade out current scene
      const leaveTimer = setTimeout(() => {
        setSceneLeaving(true);
      }, 400);

      const advanceTimer = setTimeout(() => {
        if (sceneIdx + 1 < SCENES.length) {
          setSceneIdx((p) => p + 1);
        } else {
          onCompleteRef.current();
        }
      }, 1200);

      return () => {
        clearTimeout(leaveTimer);
        clearTimeout(advanceTimer);
      };
    }

    const currentLine = lines[lineIdx] ?? '';
    const showMs = lineDisplayMs(currentLine);

    setLineVisible(true);

    const fadeOut = setTimeout(() => setLineVisible(false), showMs);
    const next = setTimeout(() => setLineIdx((p) => p + 1), showMs + 600);

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(next);
    };
  // onComplete intentionally excluded — stabilized via onCompleteRef
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx, imgLoaded, lines, sceneIdx]);

  const currentLine = lines[lineIdx] ?? '';

  return (
    <div style={S.root}>
      <style>{FONT_LINK}{CSS}</style>

      {/* ── Scene image background ──────────────────────────────── */}
      <div
        style={{
          ...S.sceneBg,
          opacity: sceneEntering || sceneLeaving ? 0 : 1,
        }}
      >
        <img
          ref={imgRef}
          key={scene.image}
          src={scene.image}
          alt={`Scene ${scene.id}`}
          style={S.sceneImg}
          onLoad={handleImgLoad}
        />
        {/* Vignette overlay */}
        <div style={S.vignette} />
      </div>

      {/* ── Skip button ─────────────────────────────────────────── */}
      <button
        onClick={onComplete}
        className="prologue-skip"
        style={S.skipBtn}
        aria-label="Skip prologue"
      >
        SKIP INTRO ›
      </button>

      {/* ── Scene number badge ──────────────────────────────────── */}
      <div style={S.sceneBadge}>
        {SCENES.map((_, i) => (
          <div
            key={i}
            style={{
              ...S.pip,
              background: i === sceneIdx ? '#C8A96A' : 'rgba(200,169,106,0.25)',
              transform: i === sceneIdx ? 'scaleX(3)' : 'scaleX(1)',
            }}
          />
        ))}
      </div>

      {/* ── Dialog box at bottom ─────────────────────────────────── */}
      <div style={S.dialogBox}>
        {/* Decorative top border */}
        <div style={S.dialogBorder} />
        <p
          style={{
            ...S.dialogText,
            opacity: lineVisible ? 1 : 0,
          }}
        >
          {currentLine || '\u00A0'}
        </p>
        {/* Bottom label */}
        <div style={S.bottomLabel}>
          MARIVECTORI · PROLOGUE
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  root: {
    width: '100vw',
    height: '100vh',
    background: '#0a0603',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sceneBg: {
    position: 'absolute',
    inset: 0,
    transition: 'opacity 0.9s ease-in-out',
  },
  sceneImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    filter: 'sepia(30%) brightness(0.85)',
  },
  vignette: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(10,6,3,0.6) 100%), ' +
      'linear-gradient(to bottom, transparent 50%, rgba(10,6,3,0.92) 100%)',
    pointerEvents: 'none',
  },
  skipBtn: {
    position: 'absolute',
    top: 20,
    right: 24,
    zIndex: 20,
    background: 'rgba(10,6,3,0.5)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(200,169,106,0.35)',
    borderRadius: 4,
    color: 'rgba(200,169,106,0.75)',
    fontFamily: "'Cinzel', serif",
    fontSize: 10,
    letterSpacing: '0.2em',
    padding: '7px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sceneBadge: {
    position: 'absolute',
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  pip: {
    width: 8,
    height: 3,
    borderRadius: 4,
    transition: 'all 0.4s ease',
    transformOrigin: 'left center',
  },
  dialogBox: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    padding: '28px 60px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    background:
      'linear-gradient(to top, rgba(10,6,3,0.97) 0%, rgba(10,6,3,0.7) 80%, transparent 100%)',
  },
  dialogBorder: {
    width: 'min(600px, 80%)',
    height: 1,
    background: 'linear-gradient(to right, transparent, rgba(200,169,106,0.5), transparent)',
    marginBottom: 8,
  },
  dialogText: {
    fontFamily: "'Lora', serif",
    color: '#E8DCC8',
    fontSize: 'clamp(17px, 2.5vw, 26px)',
    fontWeight: 400,
    textAlign: 'center',
    lineHeight: 1.65,
    letterSpacing: '0.02em',
    textShadow: '0 2px 12px rgba(0,0,0,0.9)',
    maxWidth: 720,
    transition: 'opacity 0.55s ease-in-out',
    minHeight: '2.2em',
  },
  bottomLabel: {
    marginTop: 10,
    fontFamily: "'Cinzel', serif",
    color: 'rgba(139,105,20,0.45)',
    fontSize: 9,
    letterSpacing: '0.3em',
  },
};

/* ─── Injected CSS (hover state for skip button) ─────────────────── */
const CSS = `
  .prologue-skip:hover {
    color: #C8A96A !important;
    border-color: rgba(200,169,106,0.7) !important;
    background: rgba(44,26,6,0.7) !important;
  }
`;
