import React, { useState, useEffect, useRef, useCallback } from 'react';
import BattleScreen from './BattleScreen';
import { BATTLE_STATES } from '../services/GameEngine';

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════
   TUTORIAL BATTLE
   Wrapper around BattleScreen with coach marks, step-by-step hints,
   and forgiving mechanics for teaching the 4-phase battle loop.
════════════════════════════════════════════════════════════════════════════════════════════════════════ */

const TUTORIAL_CSS = `
  .tutorial-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none; /* Let clicks pass through to BattleScreen */
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Move to top */
    padding-top: 40px; /* Space from top */
    color: #fff;
    font-family: 'Cinzel', serif;
    text-align: center;
  }

  .tutorial-box {
    background: rgba(10, 6, 3, 0.95);
    border: 2px solid #c8a96e;
    border-radius: 12px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    pointer-events: auto; /* Box itself is clickable if needed */
    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
  }

  .tutorial-step {
    margin: 16px 0;
    padding: 12px;
    background: rgba(200, 169, 110, 0.1);
    border-left: 3px solid #c8a96e;
  }

  .tutorial-button {
    background: linear-gradient(to bottom, #4a7c59, #2e5c3a);
    color: #fff;
    border: 1.5px solid #4a7c59;
    border-radius: 8px;
    padding: 8px 16px;
    font-family: 'Literata', serif;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin: 8px 4px;
  }

  .tutorial-button:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .tutorial-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .highlight-pulse {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .coach-mark {
    position: absolute;
    pointer-events: none;
    z-index: 50;
  }

  .coach-mark-circle {
    border: 3px solid #ffeb3b;
    border-radius: 50%;
    box-shadow: 0 0 0 0 3px rgba(255, 235, 59, 0.4);
    animation: pulse-circle 2s ease-in-out infinite;
    width: 60px;
    height: 60px;
  }

  @keyframes pulse-circle {
    0% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(0.8); opacity: 0.5; }
  }

  .tutorial-hint {
    background: rgba(40, 34, 28, 0.7);
    border: 1px solid #c8a96e;
    border-radius: 6px;
    padding: 12px;
    margin: 8px 0;
    font-family: 'Nunito Sans', sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }
`

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
   TUTORIAL BATTLE — main export
══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

export default function TutorialBattle({ player, enemyData, onVictory, onDefeat, onReturnToMap }) {
  const [tutorialStep, setTutorialStep] = useState(0); // 0=intro, 1=recon, 2=skill select, 3=injection, 4=counter/qte, 5=resolution, 6=overwrite, 7=complete
  const [battleFinished, setBattleFinished] = useState(false);
  const [victory, setVictory] = useState(false);

  // Handle battle outcomes
  const handleVictory = useCallback((result) => {
    setVictory(true);
    setBattleFinished(true);
    setTutorialStep(7); // Complete step
    onVictory(result);
  }, [onVictory]);

  const handleDefeat = useCallback(() => {
    setBattleFinished(true);
    onDefeat();
  }, [onDefeat]);

  const handleReturnToMap = useCallback(() => {
    onReturnToMap();
  }, [onReturnToMap]);

  // Handle tutorial progression from BattleScreen events
  const handleTutorialEvent = useCallback((event) => {
    switch (event) {
      case 'SCAN_COMPLETED':
        setTutorialStep(2);
        break;
      case 'SKILL_SELECTED':
        setTutorialStep(3);
        break;
      case 'SKILL_USED':
        setTutorialStep(4);
        break;
      case 'QTE_COMPLETED':
        setTutorialStep(5);
        break;
      case 'OVERWRITE_STARTED':
        setTutorialStep(6);
        break;
      default:
        break;
    }
  }, [tutorialStep]);

  if (battleFinished && tutorialStep === 7) {
    // Tutorial complete
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Tutorial Complete!</h2>
        <p>You've learned the basics of MariVectori's battle system.</p>
        <button onClick={handleReturnToMap} className="tutorial-button">
          Return to World Map
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{TUTORIAL_CSS}</style>
      {/* BattleScreen with tutorial modifications */}
      <BattleScreen
        player={player}
        enemyData={{ ...enemyData, id: 'TUTORIAL_DUMMY' }}
        onVictory={handleVictory}
        onDefeat={handleDefeat}
        onReturnToMap={handleReturnToMap}
        isTutorial={true}
        tutorialStep={tutorialStep}
        onTutorialEvent={handleTutorialEvent}
        // Tutorial-specific props for forgiving mechanics
        tutorialMode={true}
        qteForgiving={true} // Don't penalize missed QTEs in tutorial
        autoAdvanceEnabled={true} // Auto-advance after certain actions
      />

      {/* Tutorial overlay */}
      <div className="tutorial-overlay">
        <div className="tutorial-box">
          {/* Render current tutorial step */}
          {tutorialStep === 0 && <TutorialIntro onNext={() => setTutorialStep(1)} />}
          {tutorialStep === 1 && <ReconStep onNext={() => setTutorialStep(2)} />}
          {tutorialStep === 2 && <SkillSelectionStep onNext={() => setTutorialStep(3)} />}
          {tutorialStep === 3 && <InjectionStep onNext={() => setTutorialStep(4)} />}
          {tutorialStep === 4 && <CounterQTEStep onNext={() => setTutorialStep(5)} />}
          {tutorialStep === 5 && <ResolutionStep onNext={() => setTutorialStep(6)} />}
          {tutorialStep === 6 && <OverwriteStep onNext={() => setTutorialStep(7)} />}
          {tutorialStep === 7 && <TutorialComplete onNext={() => handleVictory({ credits: 0, avg: 0, destroyed: false })} />}
        </div>
      </div>
    </div>
  );
}

// Tutorial step components
function TutorialIntro({ onNext }) {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 22, color: '#e0c880' }}>Welcome to the Tutorial!</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>Learn the basics of MariVectori's battle system. Follow the instructions to proceed.</p>
      <button onClick={onNext} className="tutorial-button">
        Start Tutorial
      </button>
    </>
  );
}

function ReconStep({ onNext }) {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#e0c880' }}>Step 1: Recon</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>Press the <strong>Seek For Vulnerability</strong> button to analyze the enemy and discover their weaknesses.</p>
      <div className="tutorial-hint" style={{ padding: '8px', fontSize: 12 }}>
        <strong>Tip:</strong> Scanning gives you a damage bonus on your next attack!
      </div>
    </>
  );
}

function SkillSelectionStep({ onNext }) {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#e0c880' }}>Step 2: Skill Selection</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>Choose a skill from the skill panel on the right.</p>
      <div className="tutorial-hint" style={{ padding: '8px', fontSize: 12 }}>
        <strong>Tip:</strong> The tutorial dummy is weak to all elements.
      </div>
    </>
  );
}

function InjectionStep({ onNext }) {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#e0c880' }}>Step 3: Injection</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>Click <strong>Execute Injection</strong> to attack the enemy.</p>
      <div className="tutorial-hint" style={{ padding: '8px', fontSize: 12 }}>
        <strong>Tip:</strong> Watch the battle log for explanations!
      </div>
    </>
  );
}

function CounterQTEStep({ onNext }) {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#e0c880' }}>Step 4: Counter (QTE)</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>When the enemy attacks, press the <strong>Space Bar</strong> at the right moment to defend.</p>
      <div className="tutorial-hint" style={{ padding: '8px', fontSize: 12 }}>
        <strong>Tip:</strong> In the tutorial, missed QTEs won't hurt you! Try to hit the green zone.
      </div>
    </>
  );
}

function ResolutionStep({ onNext }) {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#e0c880' }}>Step 5: Resolution</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>See the results of the exchange. The boss is defeated!</p>
      <div className="tutorial-hint" style={{ padding: '8px', fontSize: 12 }}>
        <strong>Tip:</strong> The battle log explains what happened and teaches AI concepts!
      </div>
    </>
  );
}

function OverwriteStep() {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#e0c880' }}>Step 6: Victory & Overwrite</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>Click <strong>Enter Overwrite Console</strong> to complete the battle!</p>
      <div className="tutorial-hint" style={{ padding: '8px', fontSize: 12 }}>
        <strong>Tip:</strong> In the full game, this is where you realign the AI.
      </div>
    </>
  );
}

function TutorialComplete({ onNext }) {
  return (
    <>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 22, color: '#e0c880' }}>Tutorial Complete!</h3>
      <p style={{ margin: '0 0 16px 0', fontFamily: "'Nunito Sans', sans-serif" }}>You've learned all the basics. Return to the map to begin your journey.</p>
      <button onClick={onNext} className="tutorial-button">
        Return to World Map
      </button>
    </>
  );
}