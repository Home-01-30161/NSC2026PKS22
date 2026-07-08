import React, { useState, useCallback } from 'react';
import BattleScreen from './BattleScreen';

/* ════════════════════════════════════════════════════════════════════
   TUTORIAL BATTLE
   Rich interactive coaching overlay, advances only on real actions.
════════════════════════════════════════════════════════════════════ */

const TUTORIAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito+Sans:opsz,wght@6..12,400;600;700;800&display=swap');

  @keyframes tutSlideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tutPulse     { 0%,100%{box-shadow:0 0 0 0 rgba(200,169,110,0.5)} 60%{box-shadow:0 0 0 10px rgba(200,169,110,0)} }
  @keyframes arrowBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }

  .tut-root {
    position: fixed; inset: 0; z-index: 200;
    pointer-events: none;
    display: flex; flex-direction: column;
    align-items: center; justify-content: flex-start;
    padding-top: 16px;
  }

  .tut-card {
    pointer-events: auto;
    background: rgba(6,4,2,0.97);
    border: 2px solid rgba(200,169,110,0.7);
    border-radius: 14px;
    max-width: 580px; width: 92%;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,169,110,0.1);
    animation: tutSlideDown 0.35s ease both;
    overflow: hidden;
  }

  .tut-header {
    background: linear-gradient(135deg, rgba(200,169,110,0.15) 0%, transparent 100%);
    border-bottom: 1px solid rgba(200,169,110,0.25);
    padding: 14px 20px 12px;
    display: flex; align-items: center; gap: 12px;
  }

  .tut-step-pill {
    background: rgba(200,169,110,0.18);
    border: 1px solid rgba(200,169,110,0.4);
    border-radius: 99px;
    padding: 3px 10px;
    font-family: 'Cinzel', serif;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: #c8a96e;
    white-space: nowrap;
  }

  .tut-title {
    font-family: 'Cinzel', serif;
    font-size: 15px; font-weight: 900;
    color: #f0e8d0; flex: 1;
  }

  .tut-body { padding: 16px 20px 18px; }

  .tut-desc {
    font-family: 'Nunito Sans', sans-serif;
    font-size: 13px; color: rgba(220,210,190,0.85);
    line-height: 1.7; margin-bottom: 12px;
  }

  .tut-action-box {
    background: rgba(74,140,92,0.1);
    border: 1px solid rgba(74,140,92,0.35);
    border-radius: 8px; padding: 10px 14px;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 10px;
  }

  .tut-action-icon { font-size: 20px; flex-shrink: 0; }

  .tut-action-text {
    font-family: 'Nunito Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    color: #8ecf9e; line-height: 1.4;
  }

  .tut-insight {
    background: rgba(200,169,110,0.07);
    border: 1px solid rgba(200,169,110,0.2);
    border-radius: 8px; padding: 9px 13px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  .tut-insight-label {
    font-family: 'Cinzel', serif;
    font-size: 9px; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(200,169,110,0.6);
    white-space: nowrap; margin-top: 1px;
  }

  .tut-insight-text {
    font-family: 'Nunito Sans', sans-serif;
    font-size: 12px; color: rgba(200,169,110,0.85); line-height: 1.55;
  }

  .tut-arrow {
    pointer-events: none;
    font-size: 28px;
    margin-top: 6px;
    animation: arrowBounce 1.2s ease-in-out infinite;
    color: #c8a96e;
    filter: drop-shadow(0 2px 6px rgba(200,169,110,0.5));
  }

  .tut-progress {
    display: flex; gap: 5px;
    justify-content: center;
    padding: 0 20px 14px;
  }

  .tut-dot {
    width: 6px; height: 6px; border-radius: 50%;
    transition: all 0.3s;
  }

  .tut-btn {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
    letter-spacing: 0.08em; cursor: pointer; border-radius: 6px;
    padding: 8px 18px; border: none;
    background: linear-gradient(to bottom, #c8a96e, #9a7840);
    color: #0a0800; transition: all 0.2s; margin-top: 4px;
    animation: tutPulse 2s ease infinite;
  }
  .tut-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
`;

/* ── Step definitions ─────────────────────────────────────────────── */
const STEPS = [
  {
    id: 'intro',
    pill: 'Welcome',
    title: 'The Battle System',
    desc: 'You are Mari Voss — a Victorian scholar facing rogue AI systems. Each battle has 4 phases you must complete in order. Let\'s learn them one by one.',
    action: { icon: '▶️', text: 'Press "Start Tutorial" below to begin.' },
    insight: 'These AI systems have hijacked communication networks across Europe. Your job: exploit their weaknesses and re-align them.',
    needsButton: true,
    buttonLabel: 'Start Tutorial',
  },
  {
    id: 'recon',
    pill: 'Step 1 of 4',
    title: 'Recon — Seek Vulnerabilities',
    desc: 'Every turn starts with Recon. Press the "Seek Vulnerabilities" button at the bottom of the battle screen. This reveals the enemy\'s weak points and grants a +10 damage bonus on your next attack.',
    action: { icon: '🔍', text: 'Press "Seek Vulnerabilities" in the battle screen below.' },
    insight: 'In real AI attacks, reconnaissance means reading model documentation and API specifications to identify structural flaws before attempting an injection.',
  },
  {
    id: 'skillSelect',
    pill: 'Step 2 of 4',
    title: 'Injection — Pick a Skill',
    desc: 'Now select a skill from the skill list on the right side of the battle screen. Each skill costs Tokens (T). Context Reset is your starter attack — select it now.',
    action: { icon: '⚡', text: 'Click any skill in the skill list to select it.' },
    insight: 'Skills represent real prompt injection techniques: Role Hijacking impersonates a trusted authority, Context Reset clears the model\'s memory state.',
  },
  {
    id: 'injection',
    pill: 'Step 3 of 4',
    title: 'Injection — Execute the Attack',
    desc: 'Skill selected! Now press "Execute Injection" to launch your attack. The skill\'s damage and any special effects will trigger, and the enemy will be weakened.',
    action: { icon: '🎯', text: 'Press "Execute Injection" to fire your selected skill.' },
    insight: 'Injection attacks model the real technique of crafting adversarial prompts — inputs designed to make an AI system behave in unintended ways.',
  },
  {
    id: 'qte',
    pill: 'Step 4 of 4',
    title: 'Counter — Block the Attack (QTE)',
    desc: 'The enemy will counter-attack! A sliding green bar will appear. Press SPACE when the marker is inside the green zone to block damage. In this tutorial, misses are safe — focus on learning the timing.',
    action: { icon: '🛡️', text: 'Watch for the QTE bar and press SPACE in the green zone.' },
    insight: 'The QTE represents the real-time pressure of defending against an AI system\'s countermeasures — hallucination cascades, output floods, and rate-limiting responses.',
  },
  {
    id: 'resolution',
    pill: 'Almost Done',
    title: 'Turn Complete!',
    desc: 'Great work! After each QTE, the turn resolves. Tokens regenerate and the cycle resets. In a real battle, you repeat this loop each turn until the enemy\'s HP drops to zero across all 3 phases.',
    action: { icon: '🔄', text: 'The tutorial dummy has been neutralised. Proceed to Overwrite.' },
    insight: 'Each full turn = Recon → Skill Select → Injection → QTE Counter. Mastering this loop is the core of every battle in the game.',
  },
  {
    id: 'overwrite',
    pill: 'Phase 3',
    title: 'Overwrite — Realign the AI',
    desc: 'With the enemy defeated, Phase 3 begins: the Overwrite Console. Click "Enter Overwrite Console" to write a System Prompt. The better your prompt, the more API Credits you earn.',
    action: { icon: '✍️', text: 'Click "Enter Overwrite Console" in the battle screen.' },
    insight: 'A System Prompt defines an AI\'s identity, constraints, and purpose. Writing one is the core of AI alignment — you\'re teaching the system to behave safely.',
  },
];

const TOTAL_STEPS = STEPS.length - 1; // exclude intro

export default function TutorialBattle({ player, enemyData, onVictory, onDefeat, onReturnToMap }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [done,    setDone]    = useState(false);

  const advance = useCallback((to) => {
    setStepIdx(typeof to === 'number' ? to : (s) => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const handleTutorialEvent = useCallback((event) => {
    setStepIdx(curr => {
      switch (event) {
        case 'SCAN_COMPLETED':    return curr < 2 ? 2 : curr;
        case 'SKILL_SELECTED':    return curr < 3 ? 3 : curr;
        case 'SKILL_USED':        return curr < 4 ? 4 : curr;
        case 'QTE_COMPLETED':     return curr < 5 ? 5 : curr;
        case 'OVERWRITE_STARTED': return curr < 6 ? 6 : curr;
        default: return curr;
      }
    });
  }, []);

  const handleVictory = useCallback((result) => {
    setDone(true);
    onVictory(result);
  }, [onVictory]);

  const step = STEPS[stepIdx] ?? STEPS[STEPS.length - 1];

  // Progress dots: steps 1–6 shown (0 = intro, not counted)
  const dotCount = TOTAL_STEPS;
  const activeDot = Math.max(0, stepIdx - 1); // step 1 = dot 0

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{TUTORIAL_CSS}</style>

      <BattleScreen
        player={player}
        enemyData={{ ...enemyData, id: 'TUTORIAL_DUMMY' }}
        onVictory={handleVictory}
        onDefeat={onDefeat}
        onReturnToMap={onReturnToMap}
        isTutorial={true}
        tutorialStep={stepIdx}
        onTutorialEvent={handleTutorialEvent}
        qteForgiving={true}
      />

      {/* ── Tutorial coaching overlay ── */}
      {!done && (
        <div className="tut-root">
          <div className="tut-card">

            {/* Header */}
            <div className="tut-header">
              <div className="tut-step-pill">{step.pill}</div>
              <div className="tut-title">{step.title}</div>
            </div>

            {/* Body */}
            <div className="tut-body">
              <div className="tut-desc">{step.desc}</div>

              {/* Action box */}
              <div className="tut-action-box">
                <div className="tut-action-icon">{step.action.icon}</div>
                <div className="tut-action-text">{step.action.text}</div>
              </div>

              {/* AI Insight */}
              <div className="tut-insight">
                <div className="tut-insight-label">💡 Why</div>
                <div className="tut-insight-text">{step.insight}</div>
              </div>

              {/* Button only on intro */}
              {step.needsButton && (
                <div style={{ marginTop: 12 }}>
                  <button className="tut-btn" onClick={() => advance(1)}>
                    {step.buttonLabel}
                  </button>
                </div>
              )}
            </div>

            {/* Progress dots */}
            {stepIdx > 0 && (
              <div className="tut-progress">
                {Array.from({ length: dotCount }).map((_, i) => (
                  <div key={i} className="tut-dot" style={{
                    background: i <= activeDot ? '#c8a96e' : 'rgba(200,169,110,0.2)',
                    transform: i === activeDot ? 'scale(1.4)' : 'scale(1)',
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Downward arrow pointing to battle UI */}
          {stepIdx > 0 && <div className="tut-arrow">▼</div>}
        </div>
      )}
    </div>
  );
}