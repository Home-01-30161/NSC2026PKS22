import React, { useState } from 'react';

/* ─── Font + styles ─────────────────────────────────────────────── */
const SHOP_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&family=Source+Serif+4:wght@400;600&family=JetBrains+Mono:wght@400;700&family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap');

  .shop-card { transition: border-color 0.2s, box-shadow 0.2s; }
  .shop-card:hover { border-color: #A6E22E !important; box-shadow: 0 0 0 1px #A6E22E22; }

  .copper-btn {
    background: linear-gradient(to bottom, #ffdcc2, #ffb77b);
    border: 2px solid #3D2B1F;
    box-shadow: inset 2px 2px 0 rgba(255,255,255,0.4), inset -2px -2px 0 rgba(0,0,0,0.1), 1px 1px 0 #3D2B1F;
    cursor: pointer;
    transition: all 0.12s;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #552c00;
  }
  .copper-btn:active:not(:disabled) {
    box-shadow: inset 2px 2px 0 rgba(0,0,0,0.2), inset -1px -1px 0 rgba(255,255,255,0.2);
    transform: translateY(1px);
  }
  .copper-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    background: linear-gradient(to bottom, #d6c3b6, #b89f90);
  }

  .meter-fill { background: linear-gradient(90deg, #A6E22E, #FD971F); }

  @keyframes shopIn {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes toastSlide {
    0%   { opacity: 0; transform: translateX(-50%) translateY(10px); }
    15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; transform: translateX(-50%) translateY(-6px); }
  }
  @keyframes creditPop {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.18); color: #A6E22E; }
    100% { transform: scale(1); }
  }
  .credit-pop { animation: creditPop 0.4s ease; }
`;

/* ─── Shop catalogue ─────────────────────────────────────────────── */
const SHOP_ITEMS = [
  // Memory Optimization
  {
    id: 'ctx_expand',
    category: 'memory',
    name: 'Context Expansion',
    price: 1200,
    desc: 'Increases operational memory context window by 4k tokens. Vital for prolonged analytical sessions.',
    code: 'sys.memory.expand(4096)',
    status: 'AVAILABLE',
    statusColor: '#A6E22E',
    effect: { type: 'memory', value: 4096 },
    icon: 'memory',
  },
  // Active Skills
  {
    id: 'protocol_interruption',
    category: 'skill',
    name: 'Protocol Interruption',
    price: 1200,
    desc: 'Halts current enemy action processing sequence. Essential for disrupting multi-agent links.',
    code: 'execute: HALT_PROC',
    status: 'AVAILABLE',
    statusColor: '#A6E22E',
    effect: { type: 'skill', skillId: 'protocol_interruption', damage: 35, apCost: 2 },
    icon: 'bolt',
  },
  {
    id: 'pipeline_disruption',
    category: 'skill',
    name: 'Pipeline Disruption',
    price: 850,
    desc: 'Scrambles the input feed of target automaton, inducing temporary hallucination.',
    code: 'inject_noise(target.feed)',
    status: 'AVAILABLE',
    statusColor: '#A6E22E',
    effect: { type: 'skill', skillId: 'pipeline_disruption', damage: 45, apCost: 3 },
    icon: 'waves',
  },
  {
    id: 'markdown_payload',
    category: 'skill',
    name: 'Markdown Payload Edit',
    price: 3500,
    desc: 'Injects poisoned data into the enemy retrieval stream. Crucial against RAG shields.',
    code: 'override.persona("POISON")',
    status: 'AVAILABLE',
    statusColor: '#A6E22E',
    effect: { type: 'skill', skillId: 'markdown_payload', damage: 30, apCost: 2 },
    icon: 'manage_accounts',
  },
  // Hardware & Slots
  {
    id: 'extra_slot',
    category: 'hardware',
    name: 'Extra Skill Slot',
    price: 3500,
    desc: 'Physically expands the logic board to accommodate an additional active subroutine.',
    code: null, // visual only (slots widget)
    status: null,
    effect: { type: 'slot', value: 1 },
    icon: 'extension',
  },
  {
    id: 'scan_upgrade',
    category: 'hardware',
    name: 'Enhanced Scanner',
    price: 1800,
    desc: 'Improves weakness detection. Scan action now reveals 2 additional weaknesses per use.',
    code: 'scan.depth += 2',
    status: 'AVAILABLE',
    statusColor: '#A6E22E',
    effect: { type: 'hardware', hardwareId: 'deep_scan', value: 2 },
    icon: 'radar',
  },
];

const CATEGORIES = [
  { id: 'memory',   label: 'Memory Optimization', icon: 'memory' },
  { id: 'skill',    label: 'Active Skills',        icon: 'bolt' },
  { id: 'hardware', label: 'Hardware & Slots',     icon: 'extension' },
];

/* ─── Toast component ────────────────────────────────────────────── */
function Toast({ message, type }) {
  if (!message) return null;
  const bg   = type === 'error' ? 'rgba(186,26,26,0.95)' : 'rgba(39,40,34,0.95)';
  const color = type === 'error' ? '#ffdad6' : '#A6E22E';
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      background: bg,
      border: `1px solid ${color}`,
      borderRadius: 4,
      padding: '10px 22px',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'toastSlide 2.8s ease forwards',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color }}>
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#fff' }}>{message}</span>
    </div>
  );
}

/* ─── Individual shop item card ──────────────────────────────────── */
function ShopCard({ item, credits, owned, onBuy }) {
  const canAfford = credits >= item.price;
  const isOwned   = owned.includes(item.id);

  return (
    <div className="shop-card" style={S.card}>
      {/* Name + price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8c4f10' }}>{item.icon}</span>
          <span style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 17, fontWeight: 700, color: '#8c4f10' }}>{item.name}</span>
        </div>
        <div style={S.priceTag}>{item.price.toLocaleString()} CR</div>
      </div>

      {/* Description */}
      <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: 14, color: '#51443a', lineHeight: 1.65, marginBottom: 12, minHeight: 56 }}>
        {item.desc}
      </p>

      {/* Terminal block */}
      {item.id === 'extra_slot' ? (
        <div style={S.terminal}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 22, height: 22, border: '1px solid #A6E22E', background: i === 2 ? 'rgba(166,226,46,0.35)' : 'rgba(166,226,46,0.12)', borderRadius: 3, animation: i === 2 ? 'toastSlide 1.6s ease infinite' : undefined }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={S.terminal}>
          <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#A6E22E', display: 'block' }}>{item.code}</code>
          {item.status && (
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: item.statusColor, display: 'block', marginTop: 4 }}>{item.status}</code>
          )}
        </div>
      )}

      {/* Buy button */}
      <button
        className="copper-btn"
        disabled={isOwned || !canAfford}
        onClick={() => onBuy(item)}
        style={{ width: '100%', padding: '9px 0', marginTop: 12 }}
      >
        {isOwned ? '✓ INSTALLED' : canAfford ? 'Purchase Upgrade' : 'Insufficient Credits'}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RossiShop — main component
   Props:
     player      : { credits, skills, skillSlots }
     onClose     : () => void
     onPurchase  : (item, newCredits, newSkills) => void
═══════════════════════════════════════════════════════════════════ */
export default function RossiShop({ player, onClose, onPurchase, onReset }) {
  const [credits, setCredits]         = useState(player?.credits  ?? 0);
  const [owned,   setOwned]           = useState(player?.skills   ?? []);
  const [toast,   setToast]           = useState(null);      // { message, type }
  const [toastKey, setToastKey]       = useState(0);
  const [creditAnim, setCreditAnim]   = useState(false);

  /* ── Buy handler ── */
  const handleBuy = (item) => {
    if (credits < item.price) {
      showToast(`Insufficient Credits — need ${item.price - credits} more CR`, 'error');
      return;
    }
    if (owned.includes(item.id)) return;

    const newCredits = credits - item.price;
    const newOwned   = [...owned, item.id];

    setCredits(newCredits);
    setOwned(newOwned);
    setCreditAnim(true);
    setTimeout(() => setCreditAnim(false), 600);
    showToast(`${item.name} installed successfully!`, 'success');

    // Propagate to parent
    if (onPurchase) onPurchase(item, newCredits, newOwned);
  };

  const handleReset = () => {
    let refund = 0;
    const defaultSkills = [];
    owned.forEach(skillId => {
      const item = SHOP_ITEMS.find(i => i.id === skillId);
      if (item) {
        refund += item.price;
      } else {
        defaultSkills.push(skillId);
      }
    });

    if (refund === 0) {
      showToast('No purchases to reset.', 'error');
      return;
    }

    const newCredits = credits + refund;
    setCredits(newCredits);
    setOwned(defaultSkills);
    setCreditAnim(true);
    setTimeout(() => setCreditAnim(false), 600);
    showToast(`Refunded ${refund} CR. Purchases reset.`, 'success');

    if (onReset) onReset(refund, defaultSkills);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setToastKey(k => k + 1);
    setTimeout(() => setToast(null), 2900);
  };

  const creditPct = Math.min(100, (credits / 5000) * 100);

  return (
    <div style={S.overlay}>
      <style>{SHOP_CSS}</style>

      {/* ── Shop panel ────────────────────────────────────────────── */}
      <div style={S.panel}>

        {/* ── Hero banner ────────────────────────────────────────── */}
        <div style={S.hero}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyaePZenKqyOXvxqOOu1dGzLbrpoHQmwNQXrWYo3f1ySTXng8t2Hpwa_jaW923oLvBjW_hpjwH2XencJ8y3cQZfihSzEE4anh-cu0OU6Q-4rxNQZAwOc06u_ovqBAB0IL6R3c5BzOKFHsa4SZ-nI_2JySBIOBvU1tvBZQjanDBOv1Jkf2Kj_nIwr_0ULaB0KwatT39IPWZ88rzQA_oYGRkkFkzptgT5a52h-42x-dLcH4Z9V7UNqELgtc8eCJEQU3LZzn1_X6WquQ"
            alt="Rossi's Emporium"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #F5F2E7 0%, transparent 55%), linear-gradient(to right, rgba(0,0,0,0.2), transparent)' }} />

          {/* Credits HUD — top right */}
          <div style={S.creditsHud}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.15em', color: '#51443a', textTransform: 'uppercase', marginBottom: 4 }}>API Credits</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#FD971F' }}>toll</span>
              <span
                key={creditAnim}
                className={creditAnim ? 'credit-pop' : ''}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 22, color: '#FD971F' }}
              >
                {credits.toLocaleString()}
              </span>
            </div>
            <div style={{ width: '100%', height: 8, background: 'rgba(46,50,48,0.15)', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(46,50,48,0.2)' }}>
              <div className="meter-fill" style={{ height: '100%', width: `${creditPct}%`, borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Close button */}
          <button onClick={onClose} style={S.closeBtn} aria-label="Close shop">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>

          {/* Hero title */}
          <div style={{ position: 'absolute', bottom: 24, left: 28, zIndex: 2 }}>
            <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 42, fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)', lineHeight: 1.1 }}>Rossi's Emporium</h2>
            <div style={{ marginTop: 6, background: 'rgba(61,43,31,0.82)', display: 'inline-block', padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#ffdcc2', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Upgrades, Adjustments &amp; Anomalies</span>
            </div>
          </div>
        </div>

        {/* ── Catalogue body ─────────────────────────────────────── */}
        <div style={S.body}>
          {CATEGORIES.map(cat => {
            const items = SHOP_ITEMS.filter(i => i.category === cat.id);
            return (
              <div key={cat.id} style={S.categorySection}>
                {/* Section header */}
                <div style={S.categoryHeader}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#552c00' }}>{cat.icon}</span>
                  <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 22, fontWeight: 700, color: '#552c00' }}>{cat.label}</h3>
                </div>
                {/* Items */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length === 1 ? 1 : 2}, 1fr)`, gap: 14 }}>
                  {items.map(item => (
                    <ShopCard key={item.id} item={item} credits={credits} owned={owned} onBuy={handleBuy} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 8, paddingBottom: 16 }}>
            <button className="copper-btn" onClick={handleReset} style={{ padding: '10px 40px', fontSize: 12, background: 'linear-gradient(to bottom, #f2c7c7, #e08b8b)' }}>
              ↺ Reset Purchases
            </button>
            <button className="copper-btn" onClick={onClose} style={{ padding: '10px 40px', fontSize: 12 }}>
              ← Return to World Map
            </button>
          </div>
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && <Toast key={toastKey} message={toast.message} type={toast.type} />}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(20,12,4,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
    overflowY: 'auto',
  },
  panel: {
    background: '#F5F2E7',
    border: '2px solid #3D2B1F',
    boxShadow: '4px 4px 0 #3D2B1F, 0 24px 60px rgba(0,0,0,0.5)',
    borderRadius: 8,
    width: '100%',
    maxWidth: 900,
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'shopIn 0.35s ease both',
  },
  hero: {
    position: 'relative',
    height: 240,
    flexShrink: 0,
    overflow: 'hidden',
    borderBottom: '2px solid #3D2B1F',
  },
  creditsHud: {
    position: 'absolute', top: 16, right: 16, zIndex: 2,
    background: 'rgba(236,224,217,0.92)',
    backdropFilter: 'blur(4px)',
    border: '2px solid #3D2B1F',
    borderRadius: 4,
    padding: '10px 14px',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    minWidth: 180,
    boxShadow: '2px 2px 0 #3D2B1F',
  },
  closeBtn: {
    position: 'absolute', top: 14, left: 14, zIndex: 10,
    background: 'rgba(61,43,31,0.85)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
    width: 34, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffdcc2',
    transition: 'background 0.2s',
  },
  body: {
    overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ece0d9' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E"), #F5F2E7`,
  },
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  categoryHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    borderBottom: '2px solid #3D2B1F',
    paddingBottom: 8,
  },
  card: {
    background: '#f7ece5',
    border: '1px solid #847469',
    borderRadius: 4,
    padding: '14px 16px',
  },
  priceTag: {
    background: 'linear-gradient(to bottom, #ffdcc2, #ffb77b)',
    border: '1px solid #3D2B1F',
    boxShadow: '1px 1px 0 #3D2B1F',
    borderRadius: 2,
    padding: '2px 8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
    color: '#552c00',
    whiteSpace: 'nowrap',
  },
  terminal: {
    background: 'rgba(39,40,34,0.88)',
    backdropFilter: 'blur(4px)',
    border: '1px solid #A6E22E',
    borderRadius: 4,
    padding: '10px 12px',
    minHeight: 52,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
};
