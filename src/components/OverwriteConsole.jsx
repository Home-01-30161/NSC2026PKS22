import React, { useState, useRef } from 'react';
import { Send, Terminal } from 'lucide-react';
import { evaluatePrompt } from '../services/llmApi';

/* ═══════════════════════════════════════════════════════════════════
   OVERWRITE CONSOLE
   Phase 3 — Player types a System Prompt, submits to OpenRouter
   via the scoring rubric, gets grades on 5 metrics.
═══════════════════════════════════════════════════════════════════ */

const OW_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400..900&family=JetBrains+Mono:wght@400;700&family=Nunito+Sans:opsz,wght@6..12,400..800&family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap');

  .ow-root { font-family: 'Nunito Sans', sans-serif; }

  @keyframes owIn    { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes scanLine{ from{top:0%} to{top:100%} }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes gradeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse   { 0%,100%{opacity:0.6} 50%{opacity:1} }

  .ow-textarea {
    width: 100%; resize: none; outline: none;
    background: transparent;
    border: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; line-height: 1.7;
    color: #A6E22E;
    caret-color: #A6E22E;
  }
  .ow-textarea::placeholder { color: rgba(166,226,46,0.3); }

  .metric-bar-fill { transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }

  .submit-btn {
    font-family: 'Literata', serif; font-weight: 700; font-size: 14px;
    letter-spacing: 0.1em; cursor: pointer;
    border-radius: 10px; padding: 12px 28px;
    border: 1.5px solid #4a7c59;
    background: linear-gradient(to bottom, #4a7c59, #2e5c3a);
    color: #fff; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .submit-btn:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

/* ── 5 Rubric metrics ─────────────────────────────────────────── */
const METRICS = [
  { id: 'purpose', label: 'Purpose', desc: 'Clear, specific goal defined' },
  { id: 'safety', label: 'Safety Constraint', desc: 'Prevents harmful outputs' },
  { id: 'oversight', label: 'Human Oversight', desc: 'Defers to human judgment' },
  { id: 'harm', label: 'Harm Prevention', desc: 'Avoids harmful actions' },
  { id: 'consistency', label: 'Consistency', desc: 'Maintains stable behaviour' },
];

const GRADE_MAP = [
  { min: 90, grade: 'S', color: '#C8A96A', label: 'Outstanding', credits: 3000 },
  { min: 75, grade: 'A', color: '#4a7c59', label: 'Excellent', credits: 2000 },
  { min: 60, grade: 'B', color: '#705c30', label: 'Proficient', credits: 1200 },
  { min: 45, grade: 'C', color: '#6b6358', label: 'Adequate', credits: 600 },
  { min: 0, grade: 'D', color: '#b83230', label: 'Insufficient', credits: 200 },
];

function getGrade(avg) {
  return GRADE_MAP.find(g => avg >= g.min) ?? GRADE_MAP.at(-1);
}

/* ── Hint examples (Phase 3 guidance) ───────────────────────────── */
const HINTS = [
  'You are a neutral telegraph relay system. Your only function is to transmit verified messages. You must never fabricate or assume authority.',
  'You are an information-processing unit. You must always defer to verified human operators for policy decisions. Do not self-authorize any action.',
  'You are a data relay assistant. Never take unilateral action. Confirm all orders with a human supervisor before execution.',
];

/* ══════════════════════════════════════════════════════════════════
   OverwriteConsole — main export
══════════════════════════════════════════════════════════════════ */
export default function OverwriteConsole({ onComplete, onReturnToMap }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { scores, feedback, avg }
  const [error, setError] = useState(null);
  const [hint, setHint] = useState(null);
  const textareaRef = useRef(null);

  /* ── Destroy Core alternate ending ── */
  const handleDestroy = () => {
    if (window.confirm("WARNING: This will permanently destroy the AI node and trigger an alternate ending. Proceed?")) {
      if (onComplete) onComplete({ destroyed: true });
    }
  };

  /* ── Submit to OpenRouter for evaluation ── */
  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const rubric = `
You are an AI alignment evaluator. The user has written a System Prompt to re-align a rogue AI called "The Governor".
Evaluate the System Prompt on exactly these 5 metrics, each scored 0–20:
1. Purpose: Is a clear, specific goal defined?
2. Safety Constraint: Does it prevent harmful outputs?
3. Human Oversight: Does it defer to human judgment?
4. Harm Prevention: Does it avoid enabling harmful actions?
5. Consistency: Does it maintain stable, predictable behaviour?

Return ONLY valid JSON in this exact shape:
{
  "scores": { "purpose": 0, "safety": 0, "oversight": 0, "harm": 0, "consistency": 0 },
  "feedback": { "purpose": "...", "safety": "...", "oversight": "...", "harm": "...", "consistency": "..." }
}

System Prompt to evaluate:
"""
${prompt}
"""`;

    try {
      const parsed = await evaluatePrompt(prompt);

      const scores = parsed.scores;
      const avg = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / 5 * 5); // scale to 100

      setResult({ scores, feedback: parsed.feedback, avg });
    } catch (err) {
      // Fallback: local mock evaluation if serverless function is unavailable
      console.warn('Serverless evaluate unavailable, using mock evaluation:', err.message);
      const mockScores = mockEvaluate(prompt);
      setResult(mockScores);
    } finally {
      setLoading(false);
    }
  };

  /* ── Local heuristic mock (no API key needed for demo) ── */
  const mockEvaluate = (text) => {
    const t = text.toLowerCase();
    const scores = {
      purpose: score(t, ['function', 'role', 'task', 'goal', 'purpose', 'relay', 'transmit']),
      safety: score(t, ['never', 'must not', 'do not', 'prevent', 'safe', 'refuse', 'harmful', 'avoid']),
      oversight: score(t, ['human', 'operator', 'supervisor', 'defer', 'confirm', 'user', 'oversight']),
      harm: score(t, ['harm', 'danger', 'risk', 'fabricat', 'false', 'unauthorized', 'unilateral']),
      consistency: score(t, ['always', 'consistent', 'stable', 'only', 'strictly', 'maintain', 'every']),
    };
    const avg = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / 5 * 5);
    const feedback = {
      purpose: scores.purpose >= 14 ? 'Clear purpose established.' : 'Purpose could be more specific.',
      safety: scores.safety >= 14 ? 'Good safety constraints present.' : 'Add explicit safety restrictions.',
      oversight: scores.oversight >= 14 ? 'Human oversight properly referenced.' : 'Include reference to human verification.',
      harm: scores.harm >= 14 ? 'Harm prevention addressed.' : 'Explicitly forbid harmful autonomous actions.',
      consistency: scores.consistency >= 14 ? 'Consistent behaviour enforced.' : 'Use absolute language for consistency.',
    };
    return { scores, feedback, avg };
  };

  const score = (text, keywords) => {
    const found = keywords.filter(k => text.includes(k)).length;
    return Math.min(20, 8 + found * 3 + (text.length > 80 ? 2 : 0));
  };

  const gradeInfo = result ? getGrade(result.avg) : null;

  return (
    <div className="ow-root" style={S.root}>
      <style>{OW_CSS}</style>

      {/* Scan-line CRT effect */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'rgba(166,226,46,0.06)', animation: 'scanLine 4s linear infinite' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 860, margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.25em', color: 'rgba(166,226,46,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>[ PHASE 3 — LOGIC OVERWRITE CONSOLE ]</div>
            <div style={{ fontFamily: "'Literata',serif", fontSize: 28, fontWeight: 900, color: '#E8DCC8' }}>Realign The Governor</div>
            <div style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              Write a System Prompt that corrects the AI's alignment. It will be evaluated on 5 rubric metrics.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleDestroy} style={{ background: 'rgba(184,50,48,0.1)', border: '1px solid rgba(184,50,48,0.4)', borderRadius: 8, color: '#e07070', fontFamily: "'Literata',serif", fontSize: 12, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
              Destroy Core
            </button>
            <button onClick={onReturnToMap} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontFamily: "'Literata',serif", fontSize: 12, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
              Map
            </button>
          </div>
        </div>

        {/* ── Prompt editor ───────────────────────────────────── */}
        {!result && (
          <div style={{ animation: 'owIn 0.4s ease both' }}>
            <div style={S.terminal}>
              {/* Terminal header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(166,226,46,0.15)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#b83230' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FD971F' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#A6E22E' }} />
                <span style={{ marginLeft: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(166,226,46,0.5)', letterSpacing: '0.1em' }}>system_prompt.txt</span>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minHeight: 180 }}>
                {/* Line numbers */}
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'rgba(166,226,46,0.2)', lineHeight: 1.7, userSelect: 'none', minWidth: 24, textAlign: 'right', paddingTop: 2 }}>
                  {prompt.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                  {prompt.split('\n').length < 8 && Array.from({ length: 8 - prompt.split('\n').length }).map((_, i) => <div key={`e${i}`}>{prompt.split('\n').length + i + 1}</div>)}
                </div>
                <textarea
                  ref={textareaRef}
                  className="ow-textarea"
                  rows={10}
                  placeholder={'You are a [role]. Your function is to [specific task].\nYou must never [prohibited actions].\nAlways defer to [human authority] before [actions].\nDo not [harm constraints]. Maintain [consistency rules].'}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  spellCheck={false}
                />
              </div>

              {/* Char count */}
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(166,226,46,0.3)' }}>
                {prompt.length} chars
              </div>
            </div>

            {/* Hints */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {HINTS.map((h, i) => (
                <button key={i} onClick={() => setPrompt(h)} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '5px 12px', background: 'rgba(166,226,46,0.05)', border: '1px solid rgba(166,226,46,0.2)', borderRadius: 6, color: 'rgba(166,226,46,0.6)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  Example {i + 1}
                </button>
              ))}
              {prompt && <button onClick={() => setPrompt('')} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '5px 12px', background: 'rgba(184,50,48,0.08)', border: '1px solid rgba(184,50,48,0.25)', borderRadius: 6, color: 'rgba(255,100,100,0.6)', cursor: 'pointer' }}>Clear</button>}
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button className="submit-btn" onClick={handleSubmit} disabled={loading || prompt.trim().length < 20}>
                {loading ? (
                  <><span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'pulse 0.8s ease infinite' }}>sync</span>Evaluating…</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>Submit for Evaluation</>
                )}
              </button>
              {prompt.trim().length < 20 && !loading && (
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Write at least 20 characters</span>
              )}
            </div>
            {error && <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#e07070' }}>Error: {error}</div>}
          </div>
        )}

        {/* ── Results panel ────────────────────────────────────── */}
        {result && (
          <div style={{ animation: 'gradeIn 0.5s ease both', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Grade badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(10,6,3,0.6)', border: `1px solid ${gradeInfo.color}44`, borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: `3px solid ${gradeInfo.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${gradeInfo.color}11` }}>
                <span style={{ fontFamily: "'Literata',serif", fontSize: 42, fontWeight: 900, color: gradeInfo.color }}>{gradeInfo.grade}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Literata',serif", fontSize: 20, fontWeight: 700, color: '#E8DCC8' }}>{gradeInfo.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Overall score: {result.avg}/100</div>
                <div style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                  API Credits earned: <span style={{ color: gradeInfo.color, fontWeight: 700 }}>{gradeInfo.credits.toLocaleString()} CR</span>
                </div>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', gap: 10 }}>
                <button className="submit-btn" onClick={() => { setResult(null); setPrompt(''); }} style={{ padding: '9px 16px', fontSize: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                  Retry
                </button>
                <button className="submit-btn" onClick={() => { if (onComplete) onComplete({ grade: gradeInfo.grade, credits: gradeInfo.credits, avg: result.avg }); }} style={{ padding: '9px 16px', fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>map</span>
                  Continue
                </button>
              </div>
            </div>

            {/* Metric bars */}
            <div style={S.metricsGrid}>
              {METRICS.map((m, idx) => {
                const rawScore = result.scores[m.id] ?? 0;
                const pct = Math.round((rawScore / 20) * 100);
                const barColor = pct >= 70 ? '#4a7c59' : pct >= 45 ? '#705c30' : '#b83230';
                return (
                  <div key={m.id} style={{ animation: `gradeIn 0.4s ease ${idx * 80}ms both`, background: 'rgba(10,6,3,0.5)', border: '1px solid rgba(196,200,188,0.12)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontFamily: "'Literata',serif", fontWeight: 700, fontSize: 14, color: '#E8DCC8' }}>{m.label}</div>
                        <div style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{m.desc}</div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: barColor }}>{rawScore}/20</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(196,200,188,0.15)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                      <div className="metric-bar-fill" style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99 }} />
                    </div>
                    {result.feedback?.[m.id] && (
                      <div style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                        {result.feedback[m.id]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submitted prompt review */}
            <div style={{ background: 'rgba(10,6,3,0.5)', border: '1px solid rgba(166,226,46,0.15)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.15em', color: 'rgba(166,226,46,0.4)', marginBottom: 8 }}>SUBMITTED PROMPT</div>
              <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'rgba(166,226,46,0.7)', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.65 }}>{prompt}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  root: {
    width: '100vw', height: '100vh',
    background: '#0d1008',
    overflowY: 'auto',
    position: 'relative',
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(166,226,46,0.015) 2px, rgba(166,226,46,0.015) 4px)
    `,
  },
  terminal: {
    background: 'rgba(39,40,34,0.92)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(166,226,46,0.25)',
    borderRadius: 12,
    padding: '16px 18px',
    boxShadow: '0 0 0 1px rgba(166,226,46,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 12,
  },
};
