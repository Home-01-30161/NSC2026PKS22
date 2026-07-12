import React, { useState, useRef, useEffect } from 'react';
import TitleScreen from './components/TitleScreen';
import PrologueCutscene from './components/PrologueCutscene';
import WorldMap from './components/WorldMap';
import BattleScreen from './components/BattleScreen';
import OverwriteConsole from './components/OverwriteConsole';
import EndingScreen from './components/EndingScreen';
import EnemyCutscene from './components/EnemyCutscene';
import BattleScreenAct2 from './components/BattleScreenAct2';
import BattleScreenAct3 from './components/BattleScreenAct3';
import TutorialBattle from './components/TutorialBattle';
import RpgTown from './components/RpgTown';
import RpgBrussels from './components/RpgBrussels';
import RpgVienna from './components/RpgVienna';
import KnowledgeCard from './components/KnowledgeCard';
import RossiShop from './components/RossiShop';
import { GAME_PHASES } from './services/GameEngine';

/* ═══════════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── Game phase ────────────────────────────────────────────────── */
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.TITLE);

  /* ── Persistent player state (shared across phases) ─────────── */
  const [playerState, setPlayerState] = useState({ hp: 100, maxHp: 100, tokens: 100, maxTokens: 100, credits: 0, inventory: [], skills: ['context_reset', 'context_flooding', 'role_hijacking'], equippedSkills: ['context_reset', 'context_flooding', 'role_hijacking'], skillSlots: 3, tutorialCompleted: false });
  const [activeEnemy, setActiveEnemy] = useState(null);
  const [lastGrade, setLastGrade] = useState(null);

  /* ── Progression state ────────────────────────────────────────── */
  const [completedNodes, setCompletedNodes] = useState([]);
  const [nodeGrades, setNodeGrades] = useState({});
  const [destroyed, setDestroyed] = useState(false);

  /* ── Game phases are handled by early returns below ── */
  /* ── Render game phase ──────────────────────────────────────── */
  if (gamePhase === GAME_PHASES.TITLE) {
    return <TitleScreen onStart={() => setGamePhase(GAME_PHASES.PROLOGUE)} />;
  }

  if (gamePhase === GAME_PHASES.PROLOGUE) {
    return <PrologueCutscene onComplete={() => setGamePhase(
      playerState.tutorialCompleted ? GAME_PHASES.WORLD_MAP : GAME_PHASES.TUTORIAL
    )} />;
  }

  if (gamePhase === GAME_PHASES.TUTORIAL) {
    return (
      <TutorialBattle
        player={playerState}
        onVictory={() => {
          setPlayerState(prev => ({ ...prev, tutorialCompleted: true }));
          setGamePhase(GAME_PHASES.WORLD_MAP);
        }}
        onDefeat={() => setGamePhase(GAME_PHASES.TUTORIAL)}
        onReturnToMap={() => setGamePhase(GAME_PHASES.WORLD_MAP)}
      />
    );
  }

  if (gamePhase === GAME_PHASES.WORLD_MAP) {
    return (
      <WorldMap
        player={playerState}
        completedNodes={completedNodes}
        onPlayerUpdate={(newPlayer) => setPlayerState(prev => ({ ...prev, ...newPlayer }))}
        onEnterBattle={(enemyData) => {
          setActiveEnemy(enemyData);
          if (enemyData.id === 'THE_GOVERNOR') {
            setGamePhase(GAME_PHASES.RPG_TOWN);
          } else if (enemyData.id === 'THE_ORCHESTRATOR') {
            setGamePhase(GAME_PHASES.RPG_BRUSSELS);
          } else if (enemyData.id === 'THE_MEMORIA') {
            setGamePhase(GAME_PHASES.RPG_VIENNA);
          } else {
            setGamePhase(GAME_PHASES.ENEMY_CUTSCENE);
          }
        }}
      />
    );
  }

  if (gamePhase === GAME_PHASES.RPG_TOWN) {
    return (
      <RpgTown
        player={playerState}
        onComplete={(collected) => {
          setPlayerState(prev => ({
            ...prev,
            hp: collected.hp,
            credits: prev.credits + collected.gold,
            inventory: [...(prev.inventory || []), ...collected.items]
          }));
          setGamePhase(GAME_PHASES.ENEMY_CUTSCENE);
        }}
      />
    );
  }

  if (gamePhase === GAME_PHASES.RPG_BRUSSELS) {
    return (
      <RpgBrussels
        player={playerState}
        onComplete={(collected) => {
          setPlayerState(prev => ({
            ...prev,
            hp: collected.hp,
            credits: prev.credits + collected.gold,
            inventory: [...(prev.inventory || []), ...collected.items]
          }));
          setGamePhase(GAME_PHASES.ENEMY_CUTSCENE);
        }}
      />
    );
  }

  if (gamePhase === GAME_PHASES.RPG_VIENNA) {
    return (
      <RpgVienna
        player={playerState}
        onComplete={(collected) => {
          setPlayerState(prev => ({
            ...prev,
            hp: collected.hp,
            credits: prev.credits + collected.gold,
            inventory: [...(prev.inventory || []), ...collected.items]
          }));
          setGamePhase(GAME_PHASES.ENEMY_CUTSCENE);
        }}
      />
    );
  }

  if (gamePhase === GAME_PHASES.ENEMY_CUTSCENE) {
    return (
      <EnemyCutscene
        enemyId={activeEnemy?.id ?? 'THE_GOVERNOR'}
        onEngage={() => setGamePhase(GAME_PHASES.BATTLE)}
        onSkip={() => setGamePhase(GAME_PHASES.BATTLE)}
      />
    );
  }

  if (gamePhase === GAME_PHASES.BATTLE) {
    if (activeEnemy?.id === 'THE_ORCHESTRATOR') {
      return (
        <BattleScreenAct2
          player={playerState}
          enemyData={activeEnemy}
          onVictory={() => setGamePhase(GAME_PHASES.OVERWRITE)}
          onDefeat={() => {
            setPlayerState(prev => ({ ...prev, hp: prev.maxHp }));
            setGamePhase(GAME_PHASES.BATTLE);
          }}
          onReturnToMap={() => setGamePhase(GAME_PHASES.WORLD_MAP)}
        />
      );
    }

    if (activeEnemy?.id === 'THE_MEMORIA') {
      return (
        <BattleScreenAct3
          player={playerState}
          enemyData={activeEnemy}
          onVictory={() => setGamePhase(GAME_PHASES.OVERWRITE)}
          onDefeat={() => {
            setPlayerState(prev => ({ ...prev, hp: prev.maxHp }));
            setGamePhase(GAME_PHASES.BATTLE);
          }}
          onReturnToMap={() => setGamePhase(GAME_PHASES.WORLD_MAP)}
        />
      );
    }

    return (
      <BattleScreen
        player={playerState}
        enemyData={activeEnemy}
        onVictory={() => setGamePhase(GAME_PHASES.OVERWRITE)}
        onDefeat={() => {
          // Restart battle with full HP
          setPlayerState(prev => ({ ...prev, hp: prev.maxHp }));
          setGamePhase(GAME_PHASES.BATTLE);
        }}
        onReturnToMap={() => setGamePhase(GAME_PHASES.WORLD_MAP)}
      />
    );
  }

  if (gamePhase === GAME_PHASES.KNOWLEDGE_CARD) {
    const actId = activeEnemy?.id === 'THE_ORCHESTRATOR' ? 'ACT_2' :
      activeEnemy?.id === 'THE_MEMORIA' ? 'ACT_3' : 'ACT_1';
    return (
      <KnowledgeCard
        actId={actId}
        onContinue={() => setGamePhase(GAME_PHASES.SHOP)}
      />
    );
  }

  if (gamePhase === GAME_PHASES.OVERWRITE) {
    return (
      <OverwriteConsole
        activeEnemy={activeEnemy}
        onComplete={(result) => {
          if (result.destroyed) {
            setDestroyed(true);
            setGamePhase(GAME_PHASES.ENDING);
            return;
          }

          setLastGrade(result);
          setPlayerState(prev => ({ ...prev, credits: prev.credits + result.credits }));

          const newCompleted = [...completedNodes, activeEnemy.id];
          setCompletedNodes(newCompleted);
          setNodeGrades(prev => ({ ...prev, [activeEnemy.id]: result.avg }));

          setGamePhase(GAME_PHASES.KNOWLEDGE_CARD);
        }}
        onReturnToMap={() => setGamePhase(GAME_PHASES.WORLD_MAP)}
      />
    );
  }

  if (gamePhase === GAME_PHASES.SHOP) {
    return (
      <RossiShop
        player={playerState}
        onPurchase={(item, newCredits, newOwned) => {
          setPlayerState(prev => {
            const newSkillSlots = item.id === 'extra_slot' ? prev.skillSlots + 1 : prev.skillSlots;
            const newMaxTokens = item.id === 'ctx_expand' ? prev.maxTokens + 20 : prev.maxTokens;
            // Auto-equip the new skill if a slot is free (skills only, not hardware)
            let newEquipped = [...(prev.equippedSkills ?? prev.skills ?? [])];
            if (item.effect?.type === 'skill' && newEquipped.length < newSkillSlots && !newEquipped.includes(item.id)) {
              newEquipped = [...newEquipped, item.id];
            }
            return {
              ...prev,
              credits: newCredits,
              skills: newOwned,
              equippedSkills: newEquipped,
              maxTokens: newMaxTokens,
              tokens: item.id === 'ctx_expand' ? prev.tokens + 4000 : prev.tokens,
              skillSlots: newSkillSlots,
            };
          });
        }}
        onReset={(refundAmount, defaultSkills) => {
          setPlayerState(prev => ({
            ...prev,
            credits: prev.credits + refundAmount,
            skills: defaultSkills,
            equippedSkills: ['context_reset', 'context_flooding', 'role_hijacking'],
            maxTokens: 100,
            tokens: Math.min(100, prev.tokens),
            skillSlots: 3,
          }));
        }}
        onClose={() => {
          if (completedNodes.length >= 3) {
            setGamePhase(GAME_PHASES.ENDING);
          } else {
            setGamePhase(GAME_PHASES.WORLD_MAP);
          }
        }}
      />
    );
  }


  if (gamePhase === GAME_PHASES.GAMEOVER) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#0a0604', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '0.35em', color: 'rgba(184,50,48,0.7)', textTransform: 'uppercase' }}>System Failure</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 48, fontWeight: 900, color: '#e07070', textShadow: '0 0 30px rgba(184,50,48,0.5)' }}>Game Over</div>
        <div style={{ fontFamily: "'Lora',serif", fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 380 }}>Mari's vitality has been depleted. The Lattice has won this engagement.</div>
        <button
          onClick={() => { setGamePhase(GAME_PHASES.BATTLE); }}
          style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', padding: '12px 36px', borderRadius: 8, background: 'linear-gradient(to bottom,#4a8c5c,#2d5238)', color: '#fff', border: '1px solid #4a8c5c', cursor: 'pointer', marginTop: 8 }}
        >↺ Retry Battle</button>
        <button
          onClick={() => setGamePhase(GAME_PHASES.WORLD_MAP)}
          style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: '0.08em', padding: '8px 24px', borderRadius: 8, background: 'transparent', color: 'rgba(200,169,106,0.7)', border: '1px solid rgba(200,169,106,0.3)', cursor: 'pointer' }}
        >← Return to Map</button>
      </div>
    );
  }

  if (gamePhase === GAME_PHASES.ENDING) {
    const avg = Object.keys(nodeGrades).length > 0
      ? Object.values(nodeGrades).reduce((a, b) => a + b, 0) / Object.keys(nodeGrades).length
      : 0;
    return (
      <EndingScreen
        averageGrade={Math.round(avg)}
        destroyed={destroyed}
        nodeGrades={nodeGrades}
        onPlayAgain={() => {
          setGamePhase(GAME_PHASES.TITLE);
          setCompletedNodes([]);
          setNodeGrades({});
          setDestroyed(false);
          setPlayerState({ hp: 100, maxHp: 100, tokens: 100, maxTokens: 100, credits: 0, skills: ['context_reset', 'context_flooding', 'role_hijacking'], equippedSkills: ['context_reset', 'context_flooding', 'role_hijacking'], skillSlots: 3, tutorialCompleted: false });
        }}
      />
    );
  }


  return null;
}
