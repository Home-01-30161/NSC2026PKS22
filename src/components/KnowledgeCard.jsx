import React, { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   KNOWLEDGE CARD
   Shown after battle victory. Encyclopedic archive-style card
   teaching the real AI concept the player just experienced.
═══════════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Nunito+Sans:opsz,wght@6..12,300;400;600;700&display=swap');

  .kc-root { font-family: 'Nunito Sans', sans-serif; }
  .kc-root h1, .kc-root h2 { font-family: 'Cinzel', serif; }

  @keyframes kc-fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes kc-card-rise {
    from { opacity: 0; transform: scale(0.96) translateY(24px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes kc-tag-in {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes kc-scanline {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }
  @keyframes kc-continue-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(200,169,106,0.5); }
    50%     { box-shadow: 0 0 0 10px rgba(200,169,106,0); }
  }
  @keyframes kc-ornament-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .kc-continue-btn {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.2em;
    cursor: pointer;
    padding: 14px 48px;
    border-radius: 8px;
    background: transparent;
    color: #C8A96A;
    border: 1.5px solid rgba(200,169,106,0.6);
    transition: all 0.25s;
    animation: kc-continue-pulse 2.5s ease 1s infinite;
  }
  .kc-continue-btn:hover {
    background: rgba(200,169,106,0.12);
    border-color: #C8A96A;
    color: #e0c880;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200,169,106,0.2);
  }

  /* Custom Scrollbar for Right Pane */
  .kc-scroll-pane::-webkit-scrollbar { width: 8px; }
  .kc-scroll-pane::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-left: 1px solid rgba(200,169,106,0.1); }
  .kc-scroll-pane::-webkit-scrollbar-thumb { background: rgba(200,169,106,0.3); border-radius: 4px; }
  .kc-scroll-pane::-webkit-scrollbar-thumb:hover { background: rgba(200,169,106,0.5); }
`;

/* ── Knowledge card data — ACT I ───────────────────────────────── */
const KNOWLEDGE_CARDS = {
  ACT_1: {
    extract: '104',
    title: 'LLM Fundamentals',
    subtitle: 'Hallucination & System Prompts',
    tags: ['Architecture', 'Theory', 'Safety'],
    initialCap: 'A',
    sections: [
      {
        heading: null,
        body: 'Large Language Model operates much like a vast, mechanized analytical engine of unprecedented scale. It does not possess intellect, intent, or consciousness; rather, it calculates the statistical probability of the next optimal sequence of characters based on exhaustive training archives.',
      },
      {
        heading: 'The Mechanism of Hallucination',
        headingColor: '#d4883a',
        body: 'When the engine encounters a void in its archives or conflicting statistical weights, it does not falter. Instead, it weaves a highly plausible, grammatically perfect, yet entirely fabricated schematic to fill the gap. Operators must remain vigilant against these confident falsehoods.',
      },
      {
        heading: 'The System Prompt',
        headingColor: '#4a8c6a',
        body: 'Every AI engine is governed by an invisible foundational instruction called the System Prompt. It defines the engine\'s role, constraints, and purpose before any interaction begins. A well-engineered System Prompt is the difference between a docile tool and a rogue intellect. In this encounter, you wrote one yourself.',
      },
    ],
    pullQuote: {
      text: '"When the engine encounters a void in its archives… it weaves a highly plausible, yet entirely fabricated schematic to fill the gap. Operators must remain vigilant against these confident falsehoods."',
      color: '#d4883a',
    },
    ornamentSrc: null, // uses SVG inline
  },
  ACT_2: {
    extract: '215',
    title: 'Multi-Agent Systems',
    subtitle: 'Orchestration & Race Conditions',
    tags: ['Architecture', 'Concurrency', 'Network'],
    initialCap: 'M',
    sections: [
      {
        heading: null,
        body: 'Multi-Agent architectures elevate AI engines beyond simple text generation by introducing a network of specialized sub-routines. An Orchestrator core divides complex objectives into smaller components, delegating these sub-tasks to independent worker agents that operate in parallel.',
      },
      {
        heading: 'The Race Condition',
        headingColor: '#d4883a',
        body: 'When multiple autonomous agents attempt to read or overwrite the exact same shared memory state simultaneously, structural paradoxes emerge. Without strict synchronization protocols, agents act on outdated or conflicting data, leading to severe cascading failures across the entire system network.',
      },
      {
        heading: 'Model Context Protocol (MCP)',
        headingColor: '#4a8c6a',
        body: 'To coordinate effectively, agents utilize standardized interfaces like the Model Context Protocol. MCP allows an AI agent to securely access external datasets, execute discrete tools, and communicate with other nodes within a highly structured operational boundary.',
      },
    ],
    pullQuote: {
      text: '"When multiple autonomous agents attempt to read or overwrite the exact same shared memory state simultaneously, structural paradoxes emerge."',
      color: '#d4883a',
    },
    ornamentSrc: null,
  },
  ACT_3: {
    extract: '347',
    title: 'RAG & Data Poisoning',
    subtitle: 'Retrieval-Augmented Generation & MCP',
    tags: ['RAG', 'Security', 'MCP'],
    initialCap: 'R',
    sections: [
      {
        heading: null,
        body: 'Retrieval-Augmented Generation is an architecture that grants an AI engine access to an external knowledge base at inference time. Rather than relying solely on its training data, the engine dynamically retrieves relevant documents and injects them into its context window before forming a response — allowing it to cite current, accurate, and specialized knowledge.',
      },
      {
        heading: 'Data Poisoning',
        headingColor: '#d4883a',
        body: 'Because a RAG system blindly trusts its document sources, an adversary can corrupt the knowledge base with strategically crafted documents. These poisoned entries contain hidden instructions that override the engine\'s reasoning when retrieved. A single malicious file can redirect the AI\'s behavior, extract sensitive data, or trigger unauthorized actions — all without the user\'s knowledge.',
      },
      {
        heading: 'Model Context Protocol (MCP)',
        headingColor: '#4a8c6a',
        body: 'The Model Context Protocol is a standardized interface that allows an AI agent to invoke external tools, query databases, and communicate with other systems within a structured and auditable boundary. Without strict MCP call validation and sandboxing, a compromised AI can weaponize legitimate tool access to execute destructive operations far beyond its sanctioned operational scope.',
      },
    ],
    pullQuote: {
      text: '"A single malicious document injected into the retrieval pipeline can redirect the engine\'s entire reasoning — all without the user\'s knowledge."',
      color: '#d4883a',
    },
    ornamentSrc: null,
  },
};

/* ── Decorative gear/cog SVG ───────────────────────────────────── */
const OrnamentSVG = () => (
  <svg viewBox="0 0 80 80" width="72" height="72" fill="none" style={{ display: 'block' }}>
    <circle cx="40" cy="40" r="30" stroke="#C8A96A" strokeWidth="1.5" strokeDasharray="4 6" />
    <circle cx="40" cy="40" r="18" stroke="#C8A96A" strokeWidth="1" opacity="0.5" />
    {[0,45,90,135,180,225,270,315].map((deg, i) => (
      <rect
        key={i}
        x="37" y="6" width="6" height="10" rx="2"
        fill="#C8A96A" opacity="0.7"
        transform={`rotate(${deg} 40 40)`}
      />
    ))}
    <circle cx="40" cy="40" r="6" fill="#C8A96A" opacity="0.6" />
    <circle cx="40" cy="40" r="3" fill="#8B6914" />
  </svg>
);

export default function KnowledgeCard({ actId = 'ACT_1', onContinue }) {
  const card = KNOWLEDGE_CARDS[actId] ?? KNOWLEDGE_CARDS.ACT_1;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="kc-root"
      style={{
        width: '100vw', height: '100vh',
        background: '#0e0c08',
        overflow: 'hidden', position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <style>{CSS}</style>

      {/* ── Subtle parchment texture overlay ─────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        opacity: 0.4,
      }} />

      {/* ── Scanline ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        background: 'rgba(200,169,106,0.04)',
        animation: 'kc-scanline 12s linear infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Top header ───────────────────────────────────────── */}
      {visible && (
        <div style={{
          marginBottom: 20, textAlign: 'center',
          animation: 'kc-fade-in 0.7s ease forwards',
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10, letterSpacing: '0.5em',
            color: 'rgba(200,169,106,0.5)',
            textTransform: 'uppercase', marginBottom: 4,
          }}>
            Knowledge Archive · Extract #{card.extract}
          </div>
          <div style={{
            width: 180, height: 1, margin: '0 auto',
            background: 'linear-gradient(to right, transparent, rgba(200,169,106,0.4), transparent)',
          }} />
        </div>
      )}

      {/* ══ MAIN CARD ═══════════════════════════════════════════ */}
      {visible && (
        <div style={{
          maxWidth: 780, width: '100%', maxHeight: '75vh',
          background: 'linear-gradient(145deg, #1a1508, #120f07)',
          border: '1px solid rgba(200,169,106,0.2)',
          borderRadius: 12,
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,169,106,0.05) inset',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          animation: 'kc-card-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        }}>

          {/* Card top gold bar */}
          <div style={{
            height: 3,
            background: 'linear-gradient(to right, transparent, #C8A96A 30%, #e0c860 50%, #C8A96A 70%, transparent)',
          }} />

          <div style={{ display: 'flex', gap: 0, flex: 1, minHeight: 0 }}>

            {/* ── LEFT ORNAMENT COLUMN ──────────────────────── */}
            <div style={{
              width: 140, flexShrink: 0,
              background: 'rgba(200,169,106,0.04)',
              borderRight: '1px solid rgba(200,169,106,0.12)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '32px 16px', gap: 16,
            }}>
              <div style={{ animation: 'kc-ornament-spin 30s linear infinite' }}>
                <OrnamentSVG />
              </div>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 8, letterSpacing: '0.3em',
                color: 'rgba(200,169,106,0.35)',
                textAlign: 'center', lineHeight: 1.8,
                textTransform: 'uppercase',
              }}>
                AI<br/>Research<br/>Archive
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {card.tags.map((tag, i) => (
                  <div
                    key={tag}
                    style={{
                      fontFamily: "'Nunito Sans', sans-serif",
                      fontSize: 9, letterSpacing: '0.1em',
                      color: 'rgba(200,169,106,0.7)',
                      border: '1px solid rgba(200,169,106,0.2)',
                      borderRadius: 3, padding: '3px 8px',
                      textAlign: 'center',
                      background: 'rgba(200,169,106,0.06)',
                      animation: `kc-tag-in 0.5s ease ${0.4 + i * 0.1}s both`,
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT CONTENT ─────────────────────────────── */}
            <div className="kc-scroll-pane" style={{ flex: 1, padding: '36px 36px 32px', minWidth: 0, overflowY: 'auto' }}>

              {/* Title */}
              <h1 style={{
                fontFamily: "'Cinzel', serif", fontWeight: 700,
                fontSize: 'clamp(20px, 3vw, 30px)',
                color: '#e8d8a8', margin: '0 0 4px',
                letterSpacing: '0.04em',
              }}>
                {card.title}
              </h1>
              <div style={{
                fontFamily: "'Lora', serif",
                fontSize: 13, color: 'rgba(200,169,106,0.6)',
                fontStyle: 'italic', marginBottom: 22,
              }}>
                {card.subtitle}
              </div>

              {/* Divider */}
              <div style={{
                height: 1, marginBottom: 22,
                background: 'linear-gradient(to right, rgba(200,169,106,0.3), transparent)',
              }} />

              {/* Body sections */}
              {card.sections.map((sec, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  {sec.heading && (
                    <h2 style={{
                      fontFamily: "'Cinzel', serif", fontWeight: 600,
                      fontSize: 13, letterSpacing: '0.08em',
                      color: sec.headingColor ?? '#C8A96A',
                      margin: '0 0 8px', textTransform: 'none',
                    }}>
                      {/* Decorative bullet */}
                      <span style={{ marginRight: 8, opacity: 0.7 }}>◆</span>
                      {sec.heading}:
                    </h2>
                  )}
                  <p style={{
                    fontFamily: "'Lora', serif",
                    fontSize: 'clamp(12px, 1.4vw, 14px)',
                    color: i === 0 ? 'rgba(232,220,192,0.9)' : 'rgba(210,195,165,0.75)',
                    lineHeight: 1.85,
                    margin: 0,
                    fontStyle: sec.heading ? 'italic' : 'normal',
                  }}>
                    {/* Drop cap on first paragraph */}
                    {i === 0 && (
                      <span style={{
                        float: 'left',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '3.2em', lineHeight: 0.8,
                        color: '#C8A96A',
                        marginRight: 6, marginTop: 6,
                        paddingRight: 2,
                      }}>
                        {card.initialCap}
                      </span>
                    )}
                    {i === 0 ? sec.body.slice(1) : sec.body}
                  </p>
                </div>
              ))}

              {/* Pull quote */}
              {card.pullQuote && (
                <blockquote style={{
                  margin: '20px 0 0',
                  padding: '12px 20px',
                  borderLeft: `3px solid ${card.pullQuote.color}`,
                  background: `${card.pullQuote.color}0f`,
                  borderRadius: '0 6px 6px 0',
                }}>
                  <p style={{
                    fontFamily: "'Lora', serif",
                    fontSize: 12, fontStyle: 'italic',
                    color: card.pullQuote.color,
                    lineHeight: 1.75, margin: 0,
                    opacity: 0.9,
                  }}>
                    {card.pullQuote.text}
                  </p>
                </blockquote>
              )}
            </div>
          </div>

          {/* Card bottom bar */}
          <div style={{
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(200,169,106,0.25), transparent)',
          }} />
        </div>
      )}

      {/* ── Continue button ───────────────────────────────────── */}
      {visible && (
        <div style={{
          marginTop: 28, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10,
          animation: 'kc-fade-in 0.7s ease 0.6s both',
        }}>
          <button className="kc-continue-btn" onClick={onContinue}>
            CONTINUE  ›
          </button>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 9, letterSpacing: '0.4em',
            color: 'rgba(200,169,106,0.25)',
          }}>
            PROCEED TO ROSSI'S SHOP
          </div>
        </div>
      )}
    </div>
  );
}
