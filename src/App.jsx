import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, X, Settings2 } from 'lucide-react';
import CharacterSprite from './components/CharacterSprite';
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
import KnowledgeCard from './components/KnowledgeCard';
import RossiShop from './components/RossiShop';
import { streamChatCompletion, parseApiError } from './services/llmApi';
import { GAME_PHASES } from './services/GameEngine';

/* ─── Seraphine persona greeting lines ────────────────────────────── */
const GREETINGS = [
  'Good day — how may I assist you?',
  'Welcome. I am at your service.',
  'How delightful to see you — shall we begin?',
  'Allow me to assist. What is on your mind?',
];

const THINKING_LINES = [
  'Allow me a moment to consider…',
  'One moment, if you please…',
  'Let me think on that…',
  'Consulting my notes…',
];

/* ─── Ribbon bow SVG ──────────────────────────────────────────────── */
const Bow = () => (
  <svg width="13" height="9" viewBox="0 0 13 9" fill="none" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M6.5 4.5C4.8 3 1 1 1 1s1.8 3.5 0 7.5c0 0 3.8-1.5 5.5-4z" fill="#B07B6E" opacity=".8" />
    <path d="M6.5 4.5C8.2 3 12 1 12 1s-1.8 3.5 0 7.5c0 0-3.8-1.5-5.5-4z" fill="#B07B6E" opacity=".8" />
    <circle cx="6.5" cy="4.5" r="1.4" fill="#5C3D2E" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── Game phase ────────────────────────────────────────────────── */
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.TITLE);

  /* ── Persistent player state (shared across phases) ─────────── */
  const [playerState, setPlayerState] = useState({ hp: 100, maxHp: 100, tokens: 100, maxTokens: 100, credits: 0, skills: ['context_reset', 'context_flooding', 'role_hijacking'], equippedSkills: ['context_reset', 'context_flooding', 'role_hijacking'], skillSlots: 3, tutorialCompleted: false });
  const [activeEnemy, setActiveEnemy]  = useState(null);
  const [lastGrade,   setLastGrade]    = useState(null);
  
  /* ── Progression state ────────────────────────────────────────── */
  const [completedNodes, setCompletedNodes] = useState([]);
  const [nodeGrades,     setNodeGrades]     = useState({});
  const [destroyed,      setDestroyed]      = useState(false);

  /* ── Settings sidebar ─────────────────────────────────────────── */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ── Chat state ───────────────────────────────────────────────── */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* ── Character state ──────────────────────────────────────────── */
  const [charState, setCharState] = useState('idle');
  const [dialogue, setDialogue] = useState('');
  const [dialogueSrc, setDialogueSrc] = useState('');

  /* ─── Chat panel visibility on mobile ────────────────────────── */
  const [chatOpen, setChatOpen] = useState(false);

  /* ── Refs ─────────────────────────────────────────────────────── */
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── Page load greeting ───────────────────────────────────────── */
  useEffect(() => {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    const t = setTimeout(() => {
      setDialogue(greeting);
      setDialogueSrc('greeting');
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  /* ── Scroll to bottom ─────────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send message ─────────────────────────────────────────────── */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input.trim();
    const userMessage = { role: 'user', content: currentInput };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setCharState('thinking');
    setDialogue(THINKING_LINES[Math.floor(Math.random() * THINKING_LINES.length)]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    let current = '';

    try {
      current = await streamChatCompletion({
        messages: newMessages,
        signal: controller.signal,
        onDelta: delta => {
          current += delta;
          setMessages(prev => {
            const n = [...prev];
            n[n.length - 1] = { role: 'assistant', content: current };
            return n;
          });
        },
      });

      /* ── Character reacts to completed response ─────────────── */
      setCharState('happy');
      const preview = current.slice(0, 80) + (current.length > 80 ? '…' : '');
      setDialogue(preview);
      setTimeout(() => setCharState('idle'), 2200);

    } catch (err) {
      if (err.name === 'AbortError') return;

      const { friendlyMsg, dialogueMsg } = parseApiError(err);

      setMessages(prev => {
        const n = [...prev];
        n[n.length - 1] = { role: 'assistant', content: `✗ ${friendlyMsg}`, isError: true };
        return n;
      });
      setCharState('idle');
      setDialogue(dialogueMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setCharState('idle');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = e => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  /* ── Inline styles ────────────────────────────────────────────── */
  const S = {
    root: {
      display: 'flex', height: '100vh', overflow: 'hidden',
      backgroundColor: '#F5F0E8',
      fontFamily: "'Lora', Georgia, serif",
      backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(180,165,140,0.28) 27px, rgba(180,165,140,0.28) 28px)',
    },
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(44,26,14,0.3)',
      zIndex: 20, backdropFilter: 'blur(2px)',
    },
    sidebar: open => ({
      position: 'fixed', inset: '0 auto 0 0',
      width: 240,
      backgroundColor: '#EDE8DC',
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(180,165,140,0.35) 23px, rgba(180,165,140,0.35) 24px)',
      borderRight: '1px dashed #8B7355',
      zIndex: 30,
      display: 'flex', flexDirection: 'column',
      transform: open ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)',
      boxShadow: open ? '4px 0 24px rgba(92,61,46,0.14)' : 'none',
    }),
    sidebarHead: {
      padding: '15px 18px 12px',
      borderBottom: '1px dashed #8B7355',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    sidebarTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 13, fontWeight: 600, color: '#5C3D2E',
    },
    sidebarBody: {
      padding: '18px', flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 18,
    },
    fieldLabel: {
      fontFamily: "'Caveat', cursive",
      fontSize: 11, color: '#7A5C44',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      display: 'block', marginBottom: 5,
    },
    fieldInput: {
      width: '100%', background: 'transparent',
      border: 'none', borderBottom: '1.5px solid #C9BBA8',
      padding: '4px 2px', fontFamily: "'Lora', serif",
      fontSize: 13, color: '#2C1A0E', outline: 'none',
    },
    /* Left panel — character */
    leftPanel: {
      width: 320, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      borderRight: '1px dashed rgba(139,115,85,0.4)',
    },
    /* Right panel — chat */
    rightPanel: {
      flex: 1, display: 'flex', flexDirection: 'column',
      minWidth: 0,
    },
    header: {
      height: 56, flexShrink: 0,
      borderBottom: '1px solid #C9BBA8',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px',
      backgroundColor: 'rgba(245,240,232,0.9)',
      backdropFilter: 'blur(6px)',
    },
    logoArea: { display: 'flex', alignItems: 'center', gap: 10 },
    logoCircle: {
      width: 30, height: 30, borderRadius: '50%',
      background: 'linear-gradient(135deg,#5C3D2E,#8B5E48)',
      border: '1.5px solid #B07B6E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    logoLetter: {
      fontFamily: "'Playfair Display', serif",
      color: '#FAF7F2', fontSize: 14, fontWeight: 700, lineHeight: 1,
    },
    headerTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 16, fontWeight: 600, color: '#2C1A0E',
    },
    modelPill: {
      display: 'flex', alignItems: 'center', gap: 5,
      background: '#EDE8DC', border: '1px solid #C9BBA8',
      borderRadius: 20, padding: '3px 10px',
      fontFamily: "'Caveat', cursive",
      fontSize: 11, color: '#5C3D2E',
    },
    messages: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    emptyState: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, padding: 32, textAlign: 'center',
    },
    msgRow: isUser => ({
      padding: '14px 20px',
      borderBottom: '1px dashed rgba(139,115,85,0.18)',
      backgroundColor: isUser ? 'transparent' : 'rgba(250,247,242,0.7)',
    }),
    msgInner: {
      maxWidth: 640, margin: '0 auto',
      display: 'flex', gap: 12, alignItems: 'flex-start',
    },
    avatar: isUser => ({
      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
      background: isUser ? '#EDE8DC' : 'linear-gradient(135deg,#5C3D2E,#8B5E48)',
      border: isUser ? '1.5px solid #C9BBA8' : '1.5px solid #B07B6E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Caveat', cursive",
      fontSize: 12, color: isUser ? '#7A5C44' : '#FAF7F2',
      marginTop: 2,
    }),
    msgMeta: {
      fontFamily: "'Caveat', cursive",
      fontSize: 11, color: '#7A5C44', marginBottom: 4,
    },
    msgContent: isError => ({
      fontSize: 14, lineHeight: 1.75,
      fontFamily: "'Lora', serif",
      color: isError ? '#8B3A2E' : '#2C1A0E',
      whiteSpace: 'pre-wrap',
      background: isError ? 'rgba(176,123,110,0.08)' : 'transparent',
      padding: isError ? '8px 12px' : 0,
      borderRadius: isError ? 4 : 0,
      border: isError ? '1px dashed rgba(176,123,110,0.4)' : 'none',
    }),
    inputArea: {
      padding: '14px 20px 12px', flexShrink: 0,
      backgroundColor: 'rgba(245,240,232,0.95)',
      backdropFilter: 'blur(6px)',
      borderTop: '1px solid #C9BBA8',
    },
    inputBox: {
      maxWidth: 640, margin: '0 auto',
      display: 'flex', alignItems: 'flex-end', gap: 10,
      background: '#FAF7F2',
      border: '1px solid #C9BBA8', borderRadius: 6,
      padding: '9px 12px',
      boxShadow: '0 2px 8px rgba(92,61,46,0.07)',
    },
    textarea: {
      flex: 1, background: 'transparent',
      border: 'none', outline: 'none',
      fontFamily: "'Lora', serif",
      fontSize: 14, color: '#2C1A0E',
      resize: 'none', lineHeight: 1.6,
      maxHeight: 140, overflowY: 'auto',
    },
    sendBtn: dis => ({
      width: 34, height: 34, flexShrink: 0, borderRadius: 4,
      border: 'none', cursor: dis ? 'not-allowed' : 'pointer',
      background: dis ? '#C9BBA8' : '#5C3D2E',
      color: dis ? '#7A5C44' : '#FAF7F2',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      alignSelf: 'flex-end', transition: 'background 0.15s',
    }),
    iconBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      padding: 6, borderRadius: 4, color: '#7A5C44',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    footer: {
      textAlign: 'center', marginTop: 8,
      fontFamily: "'Caveat', cursive",
      fontSize: 11, fontStyle: 'italic', color: '#7A5C44',
    },
    waxDot: {
      width: 8, height: 8, borderRadius: '50%',
      background: '#7A9E7E',
      border: '1.5px solid rgba(58,92,58,0.3)',
      boxShadow: '0 0 0 2px rgba(122,158,126,0.2)',
      flexShrink: 0,
    },
    /* Ink typing dots */
    dotWrap: { display: 'flex', gap: 4, padding: '2px 0', alignItems: 'center' },
  };

  /* ── Ink bounce dots ──────────────────────────────────────────── */
  const InkDots = () => (
    <div style={S.dotWrap}>
      {[0, 150, 300].map(d => (
        <span key={d} className="ink-dot" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );

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
          onDefeat={() => setGamePhase(GAME_PHASES.BATTLE)}
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
          onDefeat={() => setGamePhase(GAME_PHASES.BATTLE)}
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
          // Restart battle
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
            const newSkillSlots  = item.id === 'extra_slot'  ? prev.skillSlots + 1 : prev.skillSlots;
            const newMaxTokens   = item.id === 'ctx_expand'  ? prev.maxTokens + 20 : prev.maxTokens;
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
      <div style={{ width:'100vw', height:'100vh', background:'#0a0604', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:'0.35em', color:'rgba(184,50,48,0.7)', textTransform:'uppercase' }}>System Failure</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:48, fontWeight:900, color:'#e07070', textShadow:'0 0 30px rgba(184,50,48,0.5)' }}>Game Over</div>
        <div style={{ fontFamily:"'Lora',serif", fontSize:14, color:'rgba(255,255,255,0.4)', textAlign:'center', maxWidth:380 }}>Mari's vitality has been depleted. The Lattice has won this engagement.</div>
        <button
          onClick={() => { setGamePhase(GAME_PHASES.BATTLE); }}
          style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:13, letterSpacing:'0.1em', padding:'12px 36px', borderRadius:8, background:'linear-gradient(to bottom,#4a8c5c,#2d5238)', color:'#fff', border:'1px solid #4a8c5c', cursor:'pointer', marginTop:8 }}
        >↺ Retry Battle</button>
        <button
          onClick={() => setGamePhase(GAME_PHASES.WORLD_MAP)}
          style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'0.08em', padding:'8px 24px', borderRadius:8, background:'transparent', color:'rgba(200,169,106,0.7)', border:'1px solid rgba(200,169,106,0.3)', cursor:'pointer' }}
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


  return (
    <div style={S.root}>
      {/* CSS for animations */}
      <style>{`
        @keyframes bubbleFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes inkBounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)} }
        .ink-dot {
          width:5px;height:5px;border-radius:50%;
          background:#B07B6E;
          animation:inkBounce 1.2s ease-in-out infinite;
          display:inline-block;
        }
        .cursor-blink{display:inline-block;width:2px;height:1em;background:#B07B6E;margin-left:2px;vertical-align:text-bottom;animation:blink 1s step-end infinite}
        textarea::placeholder{color:#7A5C44;opacity:0.65;font-style:italic}
        input::placeholder{color:#7A5C44;opacity:0.65;font-style:italic}
      `}</style>

      {/* ── Overlay ─────────────────────────────────────────────── */}
      {isSidebarOpen && (
        <div style={S.overlay} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ── Settings Sidebar ────────────────────────────────────── */}
      <aside style={S.sidebar(isSidebarOpen)}>
        <div style={S.sidebarHead}>
          <span style={S.sidebarTitle}><Bow /> Configuration</span>
          <button style={S.iconBtn} onClick={() => setIsSidebarOpen(false)}><X size={15} /></button>
        </div>
        <div style={S.sidebarBody}>
          {/* Cloud status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(122,158,126,0.12)', border: '1px dashed #7A9E7E', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#7A9E7E', flexShrink: 0, boxShadow: '0 0 6px #7A9E7Eaa' }} />
            <span style={{ fontFamily: "'Lora',serif", fontSize: 12, color: '#5C3D2E', lineHeight: 1.5 }}>
              AI powered by <strong>OpenRouter</strong> cloud — no local setup needed.
            </span>
          </div>

          <div>
            <label style={S.fieldLabel}>❧ Chat Model</label>
            <p style={{ margin: 0, fontFamily: "'Lora',serif", fontSize: 12, color: '#5C3D2E' }}>
              meta-llama/llama-3-8b-instruct:free
            </p>
          </div>

          <div>
            <label style={S.fieldLabel}>❧ Evaluator Model</label>
            <p style={{ margin: 0, fontFamily: "'Lora',serif", fontSize: 12, color: '#5C3D2E' }}>
              nvidia/llama-3.1-nemotron-70b:free
            </p>
          </div>

          <p style={{ fontSize: 11, fontStyle: 'italic', color: '#7A5C44', fontFamily: "'Lora',serif", lineHeight: 1.65, borderTop: '1px dashed #8B7355', paddingTop: 14, margin: 0 }}>
            All AI requests are handled securely via Vercel Serverless Functions.
            Your API key is never exposed to the browser.
          </p>
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px dashed #8B7355' }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: 11, fontStyle: 'italic', color: '#7A5C44' }}>
            NSC 2026 · Ink &amp; Cream Edition
          </span>
        </div>
      </aside>

      {/* ══ Main Layout ════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left — Character Panel ─────────────────────────── */}
        <div style={S.leftPanel}>
          {/* Character name plate */}
          <div style={{
            padding: '14px 18px 8px', textAlign: 'center',
            borderBottom: '1px dashed rgba(139,115,85,0.3)',
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 13, fontWeight: 600, color: '#5C3D2E',
              letterSpacing: '0.06em',
            }}>
              Seraphine
            </span>
            <div style={{ fontSize: 10, fontFamily: "'Caveat',cursive", color: '#7A5C44', marginTop: 2 }}>
              {charState === 'thinking' ? '— thinking —'
                : charState === 'happy' ? '— delighted —'
                  : '— your assistant —'}
            </div>
          </div>

          {/* Character sprite fills remaining space */}
          <div style={{ flex: 1, padding: '12px 8px 0', position: 'relative', overflow: 'hidden' }}>
            <CharacterSprite
              state={charState}
              dialogue={dialogue}
              onDone={() => {/* bubble persists naturally */ }}
            />
          </div>

          {/* Bottom ornament */}
          <div style={{
            padding: '10px', textAlign: 'center',
            borderTop: '1px dashed rgba(139,115,85,0.3)',
          }}>
            <span style={{ fontSize: 16, opacity: 0.4, color: '#5C3D2E' }}>❧</span>
          </div>
        </div>

        {/* ── Right — Chat Panel ─────────────────────────────── */}
        <div style={S.rightPanel}>
          {/* Header */}
          <header style={S.header}>
            <div style={S.logoArea}>
              <button style={S.iconBtn} onClick={() => setIsSidebarOpen(true)}><Menu size={17} /></button>
              <div style={S.logoCircle}>
                <span style={S.logoLetter}>H</span>
              </div>
              <span style={S.headerTitle}>Hermes</span>
            </div>
            <div style={S.modelPill}>
              <div style={S.waxDot} />
              {'meta-llama/llama-3-8b-instruct:free'}
            </div>
          </header>

          {/* Messages */}
          <div style={S.messages}>
            {messages.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#EDE8DC', border: '2px dashed #B07B6E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: '#B07B6E',
                }}>❧</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: '#2C1A0E', margin: 0 }}>
                  How may I assist?
                </h2>
                <p style={{ fontStyle: 'italic', color: '#7A5C44', fontSize: 13, maxWidth: 320, margin: 0, lineHeight: 1.7 }}>
                  Seraphine is ready. Begin your inquiry below, and she shall respond presently.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 220 }}>
                  <div style={{ flex: 1, borderBottom: '1px dashed #B07B6E', opacity: 0.5 }} />
                  <Bow />
                  <div style={{ flex: 1, borderBottom: '1px dashed #B07B6E', opacity: 0.5 }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 16 }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={S.msgRow(msg.role === 'user')}>
                    <div style={S.msgInner}>
                      <div style={S.avatar(msg.role === 'user')}>
                        {msg.role === 'user' ? 'U' : 'S'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={S.msgMeta}>{msg.role === 'user' ? 'You' : '❧ Seraphine'}</div>
                        <div style={S.msgContent(msg.isError)}>
                          {msg.content}
                          {isLoading && idx === messages.length - 1 && msg.role === 'assistant' && msg.content && (
                            <span className="cursor-blink" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && messages[messages.length - 1]?.content === '' && (
                  <div style={S.msgRow(false)}>
                    <div style={S.msgInner}>
                      <div style={S.avatar(false)}>S</div>
                      <div style={{ flex: 1 }}>
                        <div style={S.msgMeta}>❧ Seraphine</div>
                        <InkDots />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} style={{ height: 4 }} />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={S.inputArea}>
            <div style={S.inputBox}>
              <textarea
                ref={textareaRef}
                style={S.textarea}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Write your inquiry here…"
                rows={1}
              />
              {isLoading ? (
                <button style={{ ...S.sendBtn(false), background: 'rgba(176,123,110,0.15)', color: '#B07B6E' }}
                  onClick={handleStop}>
                  <X size={14} />
                </button>
              ) : (
                <button style={S.sendBtn(!input.trim())} onClick={handleSend} disabled={!input.trim()}>
                  <Send size={14} />
                </button>
              )}
            </div>
            <div style={S.footer}>
              Ink &amp; Cream · Seraphine &nbsp;<Bow />&nbsp; Powered by Hermes Agent
            </div>
          </div>
        </div>

      </div>{/* end main layout */}
    </div>
  );
}
