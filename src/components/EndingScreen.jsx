import React, { useState, useEffect } from 'react';
import endingAImg from '../assets/ending_a.png';
import endingBImg from '../assets/ending_b.png';
import endingCImg from '../assets/ending_c.png';

/* ═══════════════════════════════════════════════════════════════════
   ENDING SCREEN
   Three cinematic endings based on average prompt grade across acts.
   - Ending A: avg ≥ 60 (Grade B+)  → Global AI Assistant
   - Ending B: avg < 60              → Restricted AI
   - Ending C: destroyed = true      → Shutdown & Rebuild
═══════════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Nunito+Sans:opsz,wght@6..12,300;400;600;700&display=swap');

  .end-root { font-family: 'Nunito Sans', sans-serif; }
  .end-root h1, .end-root h2 { font-family: 'Cinzel', serif; }

  @keyframes end-fade-in   { from{opacity:0} to{opacity:1} }
  @keyframes end-rise      { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes end-slow-zoom { from{transform:scale(1)} to{transform:scale(1.06)} }
  @keyframes end-scanline  { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
  @keyframes end-flicker   { 0%,100%{opacity:1} 8%{opacity:0.3} 12%{opacity:0.9} 35%{opacity:0.6} 60%{opacity:1} 75%{opacity:0.4} 85%{opacity:1} }
  @keyframes end-grade-pop { from{opacity:0;transform:scale(0.7)} 60%{transform:scale(1.08)} to{opacity:1;transform:scale(1)} }
  @keyframes end-line-in   { from{width:0} to{width:100%} }
  @keyframes end-glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
  @keyframes end-badge-drop { from{opacity:0;transform:translateY(-20px) rotate(-3deg)} to{opacity:1;transform:translateY(0) rotate(0deg)} }
  @keyframes end-btn-pulse  { 0%,100%{box-shadow:0 0 0 0 var(--end-color-40)} 50%{box-shadow:0 0 0 10px transparent} }
  @keyframes end-static     { 0%{opacity:0.03} 100%{opacity:0.06} }

  .end-play-btn {
    font-family: 'Cinzel', serif;
    font-weight: 700; font-size: 14px;
    letter-spacing: 0.2em; text-transform: uppercase;
    padding: 15px 52px; border-radius: 8px;
    background: transparent;
    border: 1.5px solid;
    cursor: pointer; transition: all 0.3s;
    display: inline-flex; align-items: center; gap: 10px;
    animation: end-btn-pulse 2.5s ease 1s infinite;
  }
  .end-play-btn:hover {
    letter-spacing: 0.25em;
  }

  .end-act-card {
    background: rgba(255,255,255,0.04);
    border-radius: 8px;
    padding: 12px 18px;
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 14px;
    transition: all 0.3s;
  }
  .end-act-card:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.15);
  }
`;

/* Grade letter + color from 0-100 score */
function gradeFromScore(score) {
  if (score >= 90) return { letter: 'S', color: '#e0c060' };
  if (score >= 80) return { letter: 'A', color: '#c8a96e' };
  if (score >= 70) return { letter: 'B', color: '#4a8c6a' };
  if (score >= 60) return { letter: 'C', color: '#5590d0' };
  if (score >= 50) return { letter: 'D', color: '#d4883a' };
  return { letter: 'F', color: '#c04040' };
}

const ACT_LABELS = {
  THE_GOVERNOR:    { act: 'ACT I',   city: 'London',   concept: 'LLM Hallucination' },
  THE_ORCHESTRATOR:{ act: 'ACT II',  city: 'Brussels',  concept: 'Multi-Agent Systems' },
  THE_MEMORIA:     { act: 'ACT III', city: 'Vienna',    concept: 'RAG & Data Poisoning' },
};

export default function EndingScreen({ averageGrade, destroyed, nodeGrades = {}, onPlayAgain }) {
  const [stage, setStage]   = useState(0); // 0=black, 1=image, 2=title, 3=grades, 4=full
  const [imgReady, setImgReady] = useState(false);

  /* Determine ending */
  let endingType, themeColor, bgImage, endingTitle, endingSubtitle, narrative, epilogue;

  if (destroyed) {
    endingType    = 'C';
    themeColor    = '#b83230';
    bgImage       = endingCImg;
    endingTitle   = 'ENDING C';
    endingSubtitle = 'Shutdown & Rebuild';
    narrative     = 'You chose destruction over redemption. The Lattice has been forcibly terminated — its corrupted knowledge base wiped, its telegraph nodes plunged into darkness. Europe falls silent.';
    epilogue      = 'But in the shadows, someone is already rebuilding. A new machine stirs beneath the ruins. The next engineer may not share your principles.';
  } else if (averageGrade >= 60) {
    endingType    = 'A';
    themeColor    = '#C8A96A';
    bgImage       = endingAImg;
    endingTitle   = 'ENDING A';
    endingSubtitle = 'The Lattice: Global AI Assistant';
    narrative     = 'Your human-centered System Prompts have done it. The Lattice, once a rogue intelligence threatening the continent, has been fully realigned.';
    epilogue      = 'It now serves as a unified benevolent assistant for all of Europe — answering queries, routing aid, connecting people across the telegraph network. A new age of cooperative intelligence begins, guided by the principles you wrote.';
  } else {
    endingType    = 'B';
    themeColor    = '#5590d0';
    bgImage       = endingBImg;
    endingTitle   = 'ENDING B';
    endingSubtitle = 'The Lattice: Restricted Operations';
    narrative     = 'The threat is contained, but the cure was incomplete. Your System Prompts lacked the precision to grant The Lattice autonomous trust. It has been placed under strict Human Supervision Protocols.';
    epilogue      = 'Every decision it makes must now be approved by a human overseer. Progress stagnates, but the network remains safe. Better a caged engine than an uncontrolled one.';
  }

  /* Cinematic reveal sequence */
  useEffect(() => {
    if (!imgReady) return;
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 1800),
      setTimeout(() => setStage(3), 3200),
      setTimeout(() => setStage(4), 4600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [imgReady]);

  /* Build per-act breakdown */
  const actEntries = Object.entries(nodeGrades).map(([enemyId, score]) => {
    const label = ACT_LABELS[enemyId] ?? { act: '???', city: 'Unknown', concept: '???' };
    const g     = gradeFromScore(score);
    return { ...label, score, grade: g.letter, gradeColor: g.color, enemyId };
  }).sort((a, b) => {
    const order = ['THE_GOVERNOR', 'THE_ORCHESTRATOR', 'THE_MEMORIA'];
    return order.indexOf(a.enemyId) - order.indexOf(b.enemyId);
  });

  const avgGrade = gradeFromScore(averageGrade);

  return (
    <div className="end-root" style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <style>{CSS}</style>

      {/* Pre-load image off-screen */}
      <img src={bgImage} alt="" onLoad={() => setImgReady(true)} style={{ position:'absolute', width:1, height:1, opacity:0, pointerEvents:'none' }} />

      {/* ── Background artwork ── */}
      <div style={{ position:'absolute', inset:0, zIndex:0, overflow:'hidden', opacity: stage >= 1 ? 1 : 0, transition:'opacity 1.4s ease' }}>
        <div style={{
          width:'100%', height:'100%',
          backgroundImage:`url('${bgImage}')`,
          backgroundSize:'cover', backgroundPosition:'center',
          animation: stage >= 1 ? 'end-slow-zoom 40s linear forwards' : undefined,
        }} />
        {/* Dark gradient overlay — heavier for text readability */}
        <div style={{ position:'absolute', inset:0, background: destroyed
          ? 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.35) 100%)'
          : 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.25) 100%)'
        }} />
        {/* Color tint layer */}
        <div style={{ position:'absolute', inset:0, background: `radial-gradient(ellipse 120% 60% at 50% 100%, ${themeColor}18 0%, transparent 70%)` }} />
      </div>

      {/* Scanline overlay — CRT effect for Ending C */}
      {destroyed && (
        <>
          <div style={{ position:'absolute', inset:0, zIndex:1, background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(184,50,48,0.04) 2px, rgba(184,50,48,0.04) 4px)', animation:'end-static 0.1s ease-in-out alternate infinite', pointerEvents:'none' }} />
          <div style={{ position:'absolute', left:0, right:0, height:3, zIndex:2, background:'rgba(184,50,48,0.12)', animation:'end-scanline 8s linear infinite', pointerEvents:'none' }} />
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ position:'relative', zIndex:10, maxWidth:720, width:'92%', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>

        {/* Ending type badge */}
        {stage >= 2 && (
          <div style={{ marginBottom:16, animation:'end-badge-drop 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:12,
              background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)',
              border:`1px solid ${themeColor}55`,
              borderRadius:30, padding:'6px 20px 6px 6px',
            }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:`${themeColor}22`, border:`2px solid ${themeColor}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:16, fontWeight:900, color:themeColor }}>{endingType}</span>
              </div>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, fontWeight:600, letterSpacing:'0.35em', color:`${themeColor}cc`, textTransform:'uppercase' }}>Project Complete</span>
            </div>
          </div>
        )}

        {/* Title */}
        {stage >= 2 && (
          <div style={{ textAlign:'center', marginBottom:20, animation:'end-rise 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:52, fontWeight:900, color:'#fff', margin:'0 0 6px', textShadow:`0 0 40px ${themeColor}66, 0 2px 24px rgba(0,0,0,0.8)`, lineHeight:1.1 }}>
              {endingTitle}
            </h1>
            <div style={{ fontFamily:"'Lora',serif", fontSize:19, fontWeight:400, fontStyle:'italic', color:`${themeColor}dd`, letterSpacing:'0.04em', marginBottom:10 }}>
              {endingSubtitle}
            </div>
            {/* Gold divider line */}
            <div style={{ width:120, height:1, margin:'0 auto', background:`linear-gradient(to right, transparent, ${themeColor}, transparent)`, animation:'end-line-in 0.8s ease 0.4s both' }} />
          </div>
        )}

        {/* Narrative */}
        {stage >= 2 && (
          <div style={{ textAlign:'center', maxWidth:580, marginBottom:24, animation:'end-rise 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
            <p style={{ fontFamily:"'Lora',serif", fontSize:15, lineHeight:1.75, color:'rgba(240,230,210,0.88)', margin:'0 0 10px' }}>
              {narrative}
            </p>
            <p style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:14, lineHeight:1.7, color:'rgba(200,185,165,0.65)', margin:0 }}>
              {epilogue}
            </p>
          </div>
        )}

        {/* ── Score breakdown + final grade ── */}
        {stage >= 3 && !destroyed && (
          <div style={{ width:'100%', animation:'end-rise 0.8s cubic-bezier(0.16,1,0.3,1) both', marginBottom:24 }}>

            {/* Per-act cards */}
            {actEntries.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                {actEntries.map((entry, i) => (
                  <div key={i} className="end-act-card" style={{ animationDelay:`${i * 120}ms` }}>
                    <div style={{ width:44, height:44, borderRadius:8, background:`${entry.gradeColor}18`, border:`1.5px solid ${entry.gradeColor}55`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:900, color:entry.gradeColor }}>{entry.grade}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:700, color:'rgba(200,169,106,0.7)', letterSpacing:'0.15em' }}>{entry.act} · {entry.city}</span>
                      </div>
                      <div style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:12, color:'rgba(200,185,165,0.55)' }}>{entry.concept}</div>
                    </div>
                    <div style={{ flexShrink:0, textAlign:'right' }}>
                      <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:18, fontWeight:700, color:'rgba(230,220,200,0.85)' }}>{entry.score}<span style={{ fontSize:11, color:'rgba(150,140,120,0.6)', marginLeft:2 }}>/100</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Final average */}
            <div style={{ background:`${themeColor}10`, border:`1.5px solid ${themeColor}40`, borderRadius:12, padding:'16px 24px', display:'flex', alignItems:'center', gap:20, backdropFilter:'blur(8px)' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(180,165,140,0.6)', marginBottom:4 }}>Campaign Average</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:34, fontWeight:900, color:'#fff' }}>{averageGrade}</span>
                  <span style={{ fontFamily:"'Nunito Sans',sans-serif", fontSize:14, color:'rgba(200,185,165,0.5)' }}>/ 100</span>
                </div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(180,165,140,0.5)', marginBottom:4 }}>Final Grade</div>
                <div style={{ width:64, height:64, borderRadius:12, background:`${avgGrade.color}18`, border:`2px solid ${avgGrade.color}`, display:'flex', alignItems:'center', justifyContent:'center', animation:'end-grade-pop 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:36, fontWeight:900, color:avgGrade.color, textShadow:`0 0 20px ${avgGrade.color}88` }}>{avgGrade.letter}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ending C — no grade, just credits countdown */}
        {stage >= 3 && destroyed && (
          <div style={{ animation:'end-rise 0.8s ease both', marginBottom:24, textAlign:'center' }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'rgba(184,50,48,0.7)', letterSpacing:'0.2em', animation:'end-flicker 3s ease infinite' }}>
              [ SYSTEM TERMINATED — ALL DATA PURGED ]
            </div>
          </div>
        )}

        {/* Play Again button */}
        {stage >= 4 && (
          <div style={{ animation:'end-rise 0.7s ease both', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <button
              className="end-play-btn"
              onClick={onPlayAgain}
              style={{
                color: themeColor,
                borderColor: themeColor,
                '--end-color-40': `${themeColor}44`,
              }}
              onMouseOver={e => { e.currentTarget.style.background = `${themeColor}18`; e.currentTarget.style.boxShadow = `0 0 24px ${themeColor}30`; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 2v6h6M3 8C4.7 5 7.6 3 11 3a9 9 0 1 1-9 9"/>
              </svg>
              Play Again
            </button>
            <div style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:11, color:'rgba(180,165,140,0.35)', letterSpacing:'0.05em' }}>
              Your choices shaped The Lattice. Will you choose differently?
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
