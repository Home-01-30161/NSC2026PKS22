import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   RPG VIENNA  (Act III — The Memoria)
   Imperial Palace & Corrupted Archive.
   Unique mechanics:
     • Poison tiles (~)  — step = −12 HP, invincibility flash
     • Phantom sentinels — home toward player when within 4 tiles
     • Two-zone map: Grand Baroque Hall (G) + Imperial Archive (V)
═══════════════════════════════════════════════════════════════════ */

const TOWN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=IM+Fell+English:ital@0;1&family=Cinzel:wght@500;600;700&display=swap');

  .vienna-root {
    min-height: 100vh;
    background: radial-gradient(ellipse at 50% 0%, #110a1e 0%, #060408 70%);
    color: #e0d4f0;
    font-family: 'IM Fell English', serif;
    display: flex; flex-direction: column; align-items: center;
    padding: 22px 14px 40px;
  }

  .vienna-header { text-align: center; margin-bottom: 14px; }
  .vienna-header h1 {
    font-family: 'UnifrakturMaguntia', cursive;
    font-weight: 400; font-size: clamp(28px, 5.5vw, 48px);
    color: #c9a0dc; margin: 0 0 2px;
    text-shadow: 0 0 20px rgba(180,120,240,0.45), 0 2px 0 #000;
  }
  .vienna-header p {
    font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 3px;
    text-transform: uppercase; color: #7a6090; margin: 0;
  }

  .vienna-wrap {
    display: flex; gap: 16px; align-items: flex-start;
    flex-wrap: wrap; justify-content: center;
  }

  .vienna-canvas-frame {
    position: relative;
    border: 10px solid #0c0812; border-radius: 4px;
    box-shadow: 0 0 0 2px #4a2a6a, 0 0 0 6px #0c0812, 0 18px 40px rgba(0,0,0,0.8);
    background: #000; overflow: hidden;
  }
  .vienna-canvas-frame canvas { display: block; image-rendering: pixelated; }

  .vienna-toast {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    background: rgba(10,4,18,0.94); border: 1px solid #6030a0;
    color: #e0d4f0; padding: 8px 16px; border-radius: 5px;
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.5px;
    opacity: 0; pointer-events: none;
    transition: opacity .35s ease, transform .35s ease; white-space: nowrap; z-index: 20;
  }
  .vienna-toast.show { opacity: 1; transform: translateX(-50%) translateY(6px); }

  .vienna-panel {
    width: 250px;
    background: linear-gradient(180deg, #160e24, #0e0818);
    border: 2px solid #4a2a6a; border-radius: 6px;
    padding: 16px 16px 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.4);
  }
  .vienna-panel h2 {
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 2px;
    text-transform: uppercase; color: #c9a0dc;
    border-bottom: 1px solid #2a1a42; padding-bottom: 6px; margin: 0 0 8px;
  }
  .vienna-section { margin-bottom: 16px; }

  .vienna-hp-bar { width:100%; height:16px; background:#060210; border:1px solid #2a1a42; border-radius:8px; overflow:hidden; }
  .vienna-hp-fill { height:100%; background:linear-gradient(90deg,#4a1a6a,#9040c0); transition:width .25s ease; }
  .vienna-stat-text { font-size:13px; margin-top:4px; color:#7a6090; font-family:'Cinzel',serif; letter-spacing:1px; }
  .vienna-danger-bar { width:100%; height:10px; background:#060210; border:1px solid #4a2020; border-radius:6px; overflow:hidden; margin-top:4px; }
  .vienna-danger-fill { height:100%; background:linear-gradient(90deg,#7c1f1f,#c94b3f); transition:width .3s ease; }
  .vienna-gold-row { display:flex; align-items:center; gap:8px; font-family:'Cinzel',serif; font-size:15px; }

  .vienna-satchel { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }
  .vienna-slot {
    aspect-ratio:1/1; border:1px solid #2a1a42; border-radius:4px;
    background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:18px;
  }
  .vienna-slot.filled { background:rgba(180,120,240,0.08); border-color:#6030a0; }

  .vienna-controls { font-size:14px; line-height:1.5; color:#7a6090; margin:0; padding-left:0; list-style:none; }
  .vienna-controls li { margin-bottom:4px; }
  .vienna-controls b { color:#c9a0dc; }

  .vienna-warn { color:#e07070; font-size:12px; font-family:'Cinzel',serif; letter-spacing:0.5px; }
`;

/* ─── Map constants ──────────────────────────────────────────────── */
const MAP_COLS = 30;
const MAP_ROWS = 22;
const TILE = 46;
const VIEW_COLS = 15;
const VIEW_ROWS = 11;
const CANVAS_W = VIEW_COLS * TILE; // 690
const CANVAS_H = VIEW_ROWS * TILE; // 506

/*
  Tile legend:
  #  — imperial stone wall (red/gold brick with window glow)
  .  — marble floor (ivory / grey-white)
  ~  — POISON tile: corrupted data node, glows violet, damages on step
  G  — Grand Baroque Hall floor (cream marble, golden veins)
  V  — Imperial Archive vault floor (dark plum stone)
  F  — Feature: chandelier node in G zone, mirror pool in V zone
  E  — Exit gate (south)
  X  — Side passage
*/
const MAP_DATA = [
  "##############################",  // 0  border
  "#...........................X#",  // 1  top corridor + side exit (col 28)
  "#.###.###.##.##.###.###.#####",  // 2  imperial facades
  "#.#.#.#.#.##.##.#.#.#.#.....#", // 3
  "#.###.###.##.##.###.###.#####",  // 4
  "#............................#",  // 5  wide connecting corridor
  "#.#####.GGGGGGGGGGG.#####.###",  // 6  Grand Hall top
  "#.#...#.G.........G.#...#.###",  // 7
  "#.#...#.G...GFG...G.#...#...#",  // 8  F = chandelier
  "#.#...#.G.........G.#...#.###",  // 9
  "#.#####.GGGGGGGGGGG.#####.###",  // 10 Grand Hall bottom
  "#.~~~~~.............~~~~~....#",  // 11 POISON central corridor
  "#.#####.VVVVVVVVVVV.#####.###",  // 12 Archive top
  "#.#...#.V.........V.#...#.###",  // 13
  "#.#...#.V...VFV...V.#...#...#",  // 14 F = mirror pool
  "#.#...#.V.........V.#...#.###",  // 15
  "#.#####.VVVVVVVVVVV.#####.###",  // 16 Archive bottom
  "#............................#",  // 17 wide connecting corridor
  "#.###.###.~~.~~.###.###.#####",  // 18 facades with poison gaps
  "#.#.#.#.#.~~.~~.#.#.#.#.....#", // 19
  "#...........................X#",  // 20 bottom corridor + side exit
  "##############E###############",  // 21 imperial exit gate (col 14)
];

/* ─── Items ──────────────────────────────────────────────────────── */
const ITEM_TYPES = {
  franc: { icon: "🪙", name: "Imperial Thaler", type: "gold" },
  tonic: { icon: "🧪", name: "Amber Memory Vial", type: "heal" },
  tome: { icon: "📕", name: "Imperial Tome", type: "trinket" },
  seal: { icon: "🔮", name: "Imperial Seal", type: "trinket" },
  score: { icon: "🎼", name: "Music Manuscript", type: "trinket" },
  cipher: { icon: "🗝️", name: "Cipher Fragment", type: "trinket" },
};

const INIT_ITEMS = [
  { col: 2, row: 1, kind: "franc" },
  { col: 15, row: 1, kind: "franc" },
  { col: 2, row: 5, kind: "tonic" },
  { col: 26, row: 5, kind: "franc" },
  { col: 2, row: 7, kind: "tome" },
  { col: 26, row: 7, kind: "seal" },
  { col: 12, row: 8, kind: "franc" },
  { col: 17, row: 8, kind: "franc" },
  { col: 2, row: 13, kind: "score" },
  { col: 26, row: 13, kind: "cipher" },
  { col: 12, row: 14, kind: "tonic" },
  { col: 17, row: 14, kind: "franc" },
  { col: 2, row: 17, kind: "franc" },
  { col: 26, row: 17, kind: "tonic" },
  { col: 15, row: 20, kind: "franc" },
  { col: 2, row: 20, kind: "seal" },
].map(it => ({ ...it, collected: false }));

/* ─── Phantom sentinels ──────────────────────────────────────────── */
const INIT_SENTINELS = [
  { col: 5, row: 5, kind: "patrol" },
  { col: 24, row: 5, kind: "patrol" },
  { col: 5, row: 17, kind: "patrol" },
  { col: 24, row: 17, kind: "patrol" },
  { col: 2, row: 11, kind: "hunt" }, // always hunts
  { col: 27, row: 11, kind: "hunt" },
].map(s => ({ ...s, x: s.col * TILE, y: s.row * TILE, timer: Math.random() * 600 }));

/* ─── Lamp positions ─────────────────────────────────────────────── */
const LAMP_POSITIONS = [
  [4, 1], [14, 1], [25, 1],
  [4, 5], [14, 5], [25, 5],
  [4, 17], [14, 17], [25, 17],
  [4, 20], [14, 20], [25, 20],
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function tileAt(col, row) {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return '#';
  return MAP_DATA[row]?.[col] ?? '#';
}
function isWalkable(ch) {
  return ch === '.' || ch === 'G' || ch === 'V' || ch === 'F' || ch === 'X' || ch === '~';
}
function isPoison(ch) { return ch === '~'; }

/* ═══════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════ */
export default function RpgVienna({ player, onComplete }) {
  const canvasRef = useRef(null);
  const toastRef = useRef(null);

  const [localHp, setLocalHp] = useState(player?.hp ?? 55);
  const [localInv, setLocalInv] = useState([]);
  const [localGold, setLocalGold] = useState(0);
  const [danger, setDanger] = useState(0);
  const [poisonFlash, setPoisonFlash] = useState(false);

  const maxHp = player?.maxHp ?? 100;
  const keysRef = useRef({});

  const stateRef = useRef({
    hp: player?.hp ?? 55,
    gold: 0,
    inv: [],
    danger: 0,
    respawns: 0,
    items: JSON.parse(JSON.stringify(INIT_ITEMS)),
    sentinels: JSON.parse(JSON.stringify(INIT_SENTINELS)),
    gameWon: false,
    invincibleUntil: 0,
    poisonInvincible: 0,
    player: {
      col: 1, row: 1,
      x: TILE, y: TILE,
      targetCol: 1, targetRow: 1,
      moving: false,
      speed: 0.19,
    },
    fogBlobs: [],
    poisonFlashUntil: 0,
  });

  // Init fog
  useEffect(() => {
    stateRef.current.fogBlobs = Array.from({ length: 16 }, () => ({
      x: Math.random() * CANVAS_W * 2,
      y: 40 + Math.random() * (CANVAS_H - 80),
      r: 60 + Math.random() * 80,
      speed: 0.002 + Math.random() * 0.005,
      hue: 250 + Math.random() * 60,
    }));
  }, []);

  const showToast = useCallback((msg) => {
    if (!toastRef.current) return;
    toastRef.current.textContent = msg;
    toastRef.current.classList.add('show');
    if (toastRef.current._t) clearTimeout(toastRef.current._t);
    toastRef.current._t = setTimeout(() => {
      toastRef.current?.classList.remove('show');
    }, 1900);
  }, []);

  // Keyboard
  useEffect(() => {
    const kd = (e) => {
      const k = e.key.toLowerCase();
      const c = e.code.toLowerCase();
      keysRef.current[k] = true;
      keysRef.current[c] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "keyw", "keya", "keys", "keyd"].includes(k) || ["keyw", "keya", "keys", "keyd"].includes(c))
        e.preventDefault();
    };
    const ku = (e) => { 
      keysRef.current[e.key.toLowerCase()] = false; 
      keysRef.current[e.code.toLowerCase()] = false; 
    };
    window.addEventListener('keydown', kd, { passive: false });
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, []);

  // ── Game loop ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let lastTime = performance.now();

    /* ── Tile renderers ─────────────────────────────────────────── */

    const drawMarble = (px, py, col, row) => {
      const base = ((col + row) % 2 === 0) ? '#c8c0b4' : '#bdb5a8';
      ctx.fillStyle = base;
      ctx.fillRect(px, py, TILE, TILE);
      // veining
      ctx.strokeStyle = 'rgba(180,170,160,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      ctx.strokeStyle = 'rgba(200,190,175,0.2)';
      ctx.beginPath();
      ctx.moveTo(px + 8, py + 5); ctx.lineTo(px + 28, py + 20);
      ctx.moveTo(px + 20, py + 30); ctx.lineTo(px + 38, py + 42);
      ctx.stroke();
    };

    const drawImperialWall = (px, py, col, row) => {
      if (row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1) {
        // border = smooth imperial stone
        ctx.fillStyle = '#1a1422';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = 'rgba(80,40,120,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
        return;
      }
      // inner = red-gold brick
      ctx.fillStyle = '#6b3030';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      for (let by = 0; by < TILE; by += 8) {
        ctx.beginPath(); ctx.moveTo(px, py + by + 0.5); ctx.lineTo(px + TILE, py + by + 0.5); ctx.stroke();
      }
      const off = (row % 2 === 0) ? 0 : 8;
      for (let bx = -8; bx < TILE; bx += 16) {
        ctx.beginPath(); ctx.moveTo(px + bx + off + 0.5, py); ctx.lineTo(px + bx + off + 0.5, py + TILE); ctx.stroke();
      }
      // shadow overhang
      if (tileAt(col, row - 1) !== '#') {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(px, py, TILE, 6);
      }
      // amber window glow
      if (row > 2 && row < MAP_ROWS - 2) {
        const wg = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 1, px + TILE / 2, py + TILE / 2, TILE / 2);
        wg.addColorStop(0, 'rgba(200,140,80,0.5)');
        wg.addColorStop(1, 'rgba(200,140,80,0)');
        ctx.fillStyle = wg;
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = 'rgba(220,160,90,0.55)';
        ctx.fillRect(px + TILE / 2 - 5, py + TILE / 2 - 4, 10, 9);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + TILE / 2 - 5, py + TILE / 2 - 4, 10, 9);
      }
    };

    const drawPoison = (px, py, t) => {
      const pulse = 0.5 + 0.5 * Math.sin(t / 180 + px * 0.02);
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(px, py, TILE, TILE);
      // glowing veins
      const pg = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 2, px + TILE / 2, py + TILE / 2, TILE * 0.75);
      pg.addColorStop(0, `rgba(140,40,200,${0.5 + 0.3 * pulse})`);
      pg.addColorStop(0.5, `rgba(80,20,140,${0.2 * pulse})`);
      pg.addColorStop(1, 'rgba(40,10,70,0)');
      ctx.fillStyle = pg;
      ctx.fillRect(px - 4, py - 4, TILE + 8, TILE + 8);
      // hex pattern
      ctx.strokeStyle = `rgba(160,60,230,${0.3 + 0.2 * pulse})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 4, py + 4, TILE - 8, TILE - 8);
      ctx.beginPath();
      ctx.moveTo(px + TILE / 2, py + 4);
      ctx.lineTo(px + TILE - 4, py + TILE / 2);
      ctx.lineTo(px + TILE / 2, py + TILE - 4);
      ctx.lineTo(px + 4, py + TILE / 2);
      ctx.closePath();
      ctx.stroke();
    };

    const drawGrandHall = (px, py, col, row) => {
      // Cream marble with gold veins
      ctx.fillStyle = ((col + row) % 2 === 0) ? '#e8e0d0' : '#ddd4c0';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(180,150,80,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      // gold vein
      ctx.strokeStyle = 'rgba(200,160,60,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + col % TILE + 6, py + 4);
      ctx.lineTo(px + 22 + (col % 3) * 3, py + TILE - 6);
      ctx.stroke();
    };

    const drawArchive = (px, py, col, row) => {
      // Dark plum stone
      ctx.fillStyle = ((col + row) % 2 === 0) ? '#2c1840' : '#261438';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(120,60,180,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      // subtle shimmer
      ctx.fillStyle = 'rgba(150,80,220,0.06)';
      ctx.fillRect(px + 4, py + 4, TILE - 8, 5);
    };

    const drawChandelier = (px, py, t) => {
      drawGrandHall(px, py, 13, 8);
      const pulse = 0.6 + 0.4 * Math.sin(t / 220);
      const grd = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 2, px + TILE / 2, py + TILE / 2, TILE * 1.2);
      grd.addColorStop(0, `rgba(255,220,100,${0.7 * pulse})`);
      grd.addColorStop(0.4, `rgba(255,200,60,${0.3 * pulse})`);
      grd.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(px - TILE / 2, py - TILE / 2, TILE * 2, TILE * 2);
      // crystal shape
      ctx.fillStyle = `rgba(255,240,180,${0.7 + 0.2 * pulse})`;
      ctx.beginPath();
      ctx.moveTo(px + TILE / 2, py + 6);
      ctx.lineTo(px + TILE - 8, py + TILE - 6);
      ctx.lineTo(px + TILE / 2, py + TILE - 10);
      ctx.lineTo(px + 8, py + TILE - 6);
      ctx.closePath();
      ctx.fill();
    };

    const drawMirrorPool = (px, py, t) => {
      drawArchive(px, py, 13, 14);
      const pulse = 0.5 + 0.5 * Math.sin(t / 300);
      const mg = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 2, px + TILE / 2, py + TILE / 2, TILE * 0.8);
      mg.addColorStop(0, `rgba(100,40,180,${0.7 * pulse})`);
      mg.addColorStop(1, 'rgba(60,20,120,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = `rgba(180,100,255,${0.5 + 0.3 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2, py + TILE / 2, TILE / 2 - 6, TILE / 2 - 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawGate = (px, py, t) => {
      ctx.fillStyle = '#0e0816';
      ctx.fillRect(px, py, TILE, TILE);
      const pulse = 0.5 + 0.5 * Math.sin(t / 280);
      const gg = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 2, px + TILE / 2, py + TILE / 2, TILE * 1.0);
      gg.addColorStop(0, `rgba(180,100,255,${0.55 + 0.35 * pulse})`);
      gg.addColorStop(1, 'rgba(100,40,180,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(px - TILE, py - TILE, TILE * 3, TILE * 3);
      // bars
      ctx.strokeStyle = '#140e1e';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(px + 8 + i * 14, py + 4); ctx.lineTo(px + 8 + i * 14, py + TILE - 4); ctx.stroke();
      }
      ctx.strokeStyle = '#4a2a6a';
      ctx.lineWidth = 3;
      ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    };

    const drawSideExit = (px, py) => {
      ctx.fillStyle = '#1e1030';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = 'rgba(150,80,220,0.1)';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = '#4a2a6a';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    };

    const drawLamp = (px, py, t) => {
      const bx = px + TILE / 2, by = py + TILE - 4;
      ctx.strokeStyle = '#1a0e28';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - 28); ctx.stroke();
      const pulse = 0.5 + 0.5 * Math.sin(t / 500 + px);
      const lg = ctx.createRadialGradient(bx, by - 32, 1, bx, by - 32, 26);
      lg.addColorStop(0, `rgba(200,160,255,${0.65 * pulse})`);
      lg.addColorStop(1, 'rgba(200,160,255,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(bx - 26, by - 58, 52, 52);
      ctx.fillStyle = '#1e142c';
      ctx.fillRect(bx - 4, by - 36, 8, 8);
      ctx.fillStyle = `rgba(220,180,255,${pulse})`;
      ctx.fillRect(bx - 2, by - 34, 4, 4);
    };

    const drawItem = (it, t, camX, camY) => {
      if (it.collected) return;
      const def = ITEM_TYPES[it.kind];
      const bob = Math.sin(t / 280 + it.col * 2.7 + it.row * 1.3) * 3;
      const px = it.col * TILE + TILE / 2 - camX;
      const py = it.row * TILE + TILE / 2 + bob - camY;
      ctx.save();
      ctx.font = "22px serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowColor = 'rgba(180,100,255,0.7)';
      ctx.shadowBlur = 10;
      ctx.fillText(def.icon, px, py);
      ctx.restore();
    };

    // Phantom sentinel drawing
    const drawSentinel = (s, camX, camY, t, invincible) => {
      const px = s.x - camX + TILE / 2;
      const py = s.y - camY + TILE / 2;
      const pulse = 0.5 + 0.5 * Math.sin(t / 200 + s.x * 0.01);
      // detection aura
      const ag = ctx.createRadialGradient(px, py, 0, px, py, TILE * 2);
      ag.addColorStop(0, `rgba(180,60,220,${0.08 * pulse})`);
      ag.addColorStop(1, 'rgba(180,60,220,0)');
      ctx.fillStyle = ag;
      ctx.fillRect(px - TILE * 2, py - TILE * 2, TILE * 4, TILE * 4);
      // translucent phantom body
      ctx.save();
      ctx.globalAlpha = 0.7 + 0.2 * pulse;
      // shadow
      ctx.fillStyle = 'rgba(80,20,140,0.3)';
      ctx.beginPath(); ctx.ellipse(px, py + 16, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      // robe (flowing, tapering)
      const rg = ctx.createLinearGradient(px, py - 12, px, py + 16);
      rg.addColorStop(0, s.kind === 'hunt' ? 'rgba(220,60,60,0.9)' : 'rgba(140,60,200,0.85)');
      rg.addColorStop(1, s.kind === 'hunt' ? 'rgba(180,20,20,0.4)' : 'rgba(80,20,140,0.4)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(px - 9, py + 16);
      ctx.lineTo(px - 6, py - 8);
      ctx.lineTo(px + 6, py - 8);
      ctx.lineTo(px + 9, py + 16);
      ctx.closePath();
      ctx.fill();
      // glowing skull face
      ctx.fillStyle = `rgba(230,210,255,${0.8 + 0.15 * pulse})`;
      ctx.beginPath(); ctx.arc(px, py - 14, 7, 0, Math.PI * 2); ctx.fill();
      // eye glow
      const eyeColor = s.kind === 'hunt' ? `rgba(255,80,80,${pulse})` : `rgba(180,80,255,${pulse})`;
      ctx.fillStyle = eyeColor;
      ctx.fillRect(px - 4, py - 16, 3, 3);
      ctx.fillRect(px + 1, py - 16, 3, 3);
      ctx.restore();
    };

    const drawPlayer = (px, py, invincible, t) => {
      if (invincible && Math.floor(t / 80) % 2 === 0) { ctx.globalAlpha = 0.35; }
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath(); ctx.ellipse(px, py + 14, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      // coat (dark teal)
      ctx.fillStyle = '#1a3a50';
      ctx.beginPath();
      ctx.moveTo(px - 9, py + 14); ctx.lineTo(px - 7, py - 2);
      ctx.lineTo(px + 7, py - 2); ctx.lineTo(px + 9, py + 14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ddb592';
      ctx.beginPath(); ctx.arc(px, py - 10, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0e1114';
      ctx.fillRect(px - 6, py - 22, 13, 9); ctx.fillRect(px - 8, py - 14, 17, 3);
      ctx.globalAlpha = 1;
    };

    const drawFog = (t) => {
      ctx.save();
      stateRef.current.fogBlobs.forEach(b => {
        const x = ((b.x + t * b.speed) % (CANVAS_W + 200)) - 100;
        const fg = ctx.createRadialGradient(x, b.y, 0, x, b.y, b.r);
        fg.addColorStop(0, `hsla(${b.hue},50%,40%,0.08)`);
        fg.addColorStop(1, `hsla(${b.hue},50%,40%,0)`);
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
      const vg = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_H / 3, CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.85);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    };

    /* ── Logic ─────────────────────────────────────────────────── */

    const desiredDir = () => {
      const k = keysRef.current;
      if (k['arrowup'] || k['w'] || k['keyw']) return [0, -1];
      if (k['arrowdown'] || k['s'] || k['keys']) return [0, 1];
      if (k['arrowleft'] || k['a'] || k['keya']) return [-1, 0];
      if (k['arrowright'] || k['d'] || k['keyd']) return [1, 0];
      return null;
    };

    const tryPickup = (col, row) => {
      const state = stateRef.current;
      const it = state.items.find(i => !i.collected && i.col === col && i.row === row);
      if (!it) return;
      it.collected = true;
      const def = ITEM_TYPES[it.kind];
      if (def.type === "heal") {
        state.hp = Math.min(maxHp, state.hp + 30);
        showToast(`Found: ${def.name} (+30 HP)`);
      } else if (def.type === "gold") {
        state.gold += 1;
        showToast(`Found: ${def.name}`);
      } else {
        state.inv.push(it.kind);
        showToast(`Found: ${def.name}`);
      }
      setLocalHp(state.hp);
      setLocalGold(state.gold);
      setLocalInv([...state.inv]);
    };

    const checkPoison = (col, row, now) => {
      const state = stateRef.current;
      if (!isPoison(tileAt(col, row))) return;
      if (now < state.poisonInvincible) return;
      state.hp = Math.max(0, state.hp - 12);
      state.poisonInvincible = now + 700;
      state.poisonFlashUntil = now + 250;
      if (state.hp <= 0) {
        state.respawns += 1;
        state.hp = player?.maxHp ?? 100;
        state.player.col = 1; state.player.row = 1;
        state.player.x = TILE; state.player.y = TILE;
        state.player.targetCol = 1; state.player.targetRow = 1;
        state.player.moving = false;
        state.danger = Math.max(0, state.danger - 30);
        state.invincibleUntil = now + 2200;
        showToast(`Poisoned! Respawning… (×${state.respawns})`);
      } else {
        showToast('Corrupted data node! (−12 HP)');
      }
      setLocalHp(state.hp);
      setPoisonFlash(true);
      setTimeout(() => setPoisonFlash(false), 260);
    };

    // Sentinel AI: patrol or hunt
    const updateSentinels = (dt, playerX, playerY) => {
      stateRef.current.sentinels.forEach(s => {
        s.timer += dt;
        const interval = s.kind === 'hunt' ? 480 : 700;
        if (s.timer < interval) return;
        s.timer = 0;

        const dist = Math.hypot(playerX - s.x, playerY - s.y);
        const chase = dist < TILE * 4.5;
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        if ((chase && Math.random() < 0.72) || s.kind === 'hunt') {
          // Move toward player
          const dx = playerX - s.x, dy = playerY - s.y;
          const preferred = Math.abs(dx) > Math.abs(dy)
            ? [[Math.sign(dx), 0], [0, Math.sign(dy)], [-Math.sign(dx), 0], [0, -Math.sign(dy)]]
            : [[0, Math.sign(dy)], [Math.sign(dx), 0], [0, -Math.sign(dy)], [-Math.sign(dx), 0]];
          for (const [dc, dr] of preferred) {
            const nc = s.col + dc, nr = s.row + dr;
            const ch = tileAt(nc, nr);
            if (isWalkable(ch) || ch === '~') {
              s.col = nc; s.row = nr;
              s.x = nc * TILE; s.y = nr * TILE;
              break;
            }
          }
        } else {
          // Random walk
          const shuffled = [...dirs].sort(() => Math.random() - 0.5);
          for (const [dc, dr] of shuffled) {
            const nc = s.col + dc, nr = s.row + dr;
            const ch = tileAt(nc, nr);
            if (isWalkable(ch) || ch === '~') {
              s.col = nc; s.row = nr;
              s.x = nc * TILE; s.y = nr * TILE;
              break;
            }
          }
        }
      });
    };

    const checkSentinelCollision = (now) => {
      const state = stateRef.current;
      if (now < state.invincibleUntil) return;
      const px = state.player.x + TILE / 2, py = state.player.y + TILE / 2;
      for (const s of state.sentinels) {
        if (Math.hypot(px - (s.x + TILE / 2), py - (s.y + TILE / 2)) < TILE * 0.8) {
          state.hp = Math.max(0, state.hp - 18);
          state.danger = Math.min(100, state.danger + 28);
          state.invincibleUntil = now + 1100;
          if (state.hp <= 0) {
            state.respawns += 1;
            state.hp = player?.maxHp ?? 100;
            state.player.col = 1; state.player.row = 1;
            state.player.x = TILE; state.player.y = TILE;
            state.player.targetCol = 1; state.player.targetRow = 1;
            state.player.moving = false;
            state.danger = Math.max(0, state.danger - 30);
            state.invincibleUntil = now + 2200;
            showToast(`Caught! Respawning… (×${state.respawns})`);
          } else {
            showToast('Phantom sentinel! (−18 HP)');
          }
          setLocalHp(state.hp);
          setDanger(state.danger);
          break;
        }
      }
    };

    const checkGate = (col, row) => {
      const ch = tileAt(col, row);
      if ((ch === 'E' || ch === 'X') && !stateRef.current.gameWon) {
        stateRef.current.gameWon = true;
        const s = stateRef.current;
        onComplete({ hp: s.hp, gold: s.gold, items: s.inv });
      }
    };

    /* ── Main loop ──────────────────────────────────────────────── */
    const loop = (now) => {
      const dt = now - lastTime;
      lastTime = now;
      const state = stateRef.current;
      const p = state.player;

      if (!state.gameWon) {
        if (!p.moving) {
          const dir = desiredDir();
          if (dir) {
            const nc = p.col + dir[0], nr = p.row + dir[1];
            const ch = tileAt(nc, nr);
            if (isWalkable(ch)) { p.targetCol = nc; p.targetRow = nr; p.moving = true; }
          }
        } else {
          const tx = p.targetCol * TILE, ty = p.targetRow * TILE;
          const dx = tx - p.x, dy = ty - p.y;
          const dist = Math.hypot(dx, dy);
          const step = p.speed * dt;
          if (dist <= step || dist === 0) {
            p.x = tx; p.y = ty; p.col = p.targetCol; p.row = p.targetRow;
            p.moving = false;
            tryPickup(p.col, p.row);
            checkPoison(p.col, p.row, now);
            checkGate(p.col, p.row);
          } else {
            p.x += (dx / dist) * step; p.y += (dy / dist) * step;
          }
        }
        updateSentinels(dt, p.x + TILE / 2, p.y + TILE / 2);
        checkSentinelCollision(now);
      }

      // Camera
      let camX = p.x - CANVAS_W / 2 + TILE / 2;
      let camY = p.y - CANVAS_H / 2 + TILE / 2;
      camX = Math.max(0, Math.min(camX, MAP_COLS * TILE - CANVAS_W));
      camY = Math.max(0, Math.min(camY, MAP_ROWS * TILE - CANVAS_H));

      ctx.fillStyle = '#060408';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const sc = Math.floor(camX / TILE), ec = sc + VIEW_COLS + 1;
      const sr = Math.floor(camY / TILE), er = sr + VIEW_ROWS + 1;

      // Tiles
      for (let row = sr; row <= er; row++) {
        for (let col = sc; col <= ec; col++) {
          if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) continue;
          const px = col * TILE - camX, py = row * TILE - camY;
          const ch = tileAt(col, row);
          if (ch === '#') drawImperialWall(px, py, col, row);
          else if (ch === '~') drawPoison(px, py, now);
          else if (ch === 'G') drawGrandHall(px, py, col, row);
          else if (ch === 'V') drawArchive(px, py, col, row);
          else if (ch === 'F') {
            // Determine context: which zone is this F in?
            const zone = row <= 10 ? 'G' : 'V';
            if (zone === 'G') drawChandelier(px, py, now);
            else drawMirrorPool(px, py, now);
          }
          else if (ch === 'E') drawGate(px, py, now);
          else if (ch === 'X') drawSideExit(px, py);
          else drawMarble(px, py, col, row);
        }
      }

      // Lamps
      LAMP_POSITIONS.forEach(([c, r]) => {
        if (c >= sc && c <= ec && r >= sr && r <= er)
          drawLamp(c * TILE - camX, r * TILE - camY, now);
      });

      // Items
      state.items.forEach(it => {
        if (it.col >= sc && it.col <= ec && it.row >= sr && it.row <= er)
          drawItem(it, now, camX, camY);
      });

      // Sentinels
      state.sentinels.forEach(s => drawSentinel(s, camX, camY, now, now < state.invincibleUntil));

      // Player
      drawPlayer(p.x - camX + TILE / 2, p.y - camY + TILE / 2, now < state.invincibleUntil, now);

      // Poison veil overlay
      if (now < state.poisonFlashUntil) {
        ctx.fillStyle = 'rgba(140,40,200,0.18)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      drawFog(now);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [maxHp, onComplete, showToast]);

  const hpPct = (localHp / maxHp) * 100;
  const hpColor = hpPct > 50 ? undefined : hpPct > 25 ? '#c9a000' : '#e07070';

  return (
    <div className="vienna-root">
      <style>{TOWN_CSS}</style>
      <div className="vienna-header">
        <h1>Vienna, Austria</h1>
        <p>reach the Imperial Archive</p>
      </div>

      <div className="vienna-wrap">
        <div className="vienna-canvas-frame" style={{ outline: poisonFlash ? '4px solid rgba(160,60,255,0.8)' : 'none' }}>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
          <div ref={toastRef} className="vienna-toast" />
        </div>

        <aside className="vienna-panel">
          <div className="vienna-section">
            <h2>Vitals</h2>
            <div className="vienna-hp-bar">
              <div className="vienna-hp-fill" style={{ width: `${hpPct}%`, background: hpColor ? `linear-gradient(90deg, ${hpColor}, ${hpColor})` : undefined }} />
            </div>
            <div className="vienna-stat-text" style={{ color: hpColor }}>{localHp} / {maxHp} HP</div>
          </div>

          <div className="vienna-section">
            <h2>Suspicion</h2>
            <div className="vienna-danger-bar">
              <div className="vienna-danger-fill" style={{ width: `${danger}%` }} />
            </div>
            <div className="vienna-stat-text" style={{ color: danger > 60 ? '#e07070' : undefined }}>
              {danger < 30 ? 'Unseen' : danger < 65 ? 'Suspicious' : '⚠ Hunted'}
            </div>
          </div>

          <div className="vienna-section">
            <h2>Purse</h2>
            <div className="vienna-gold-row">
              <span>🪙</span>
              <span>{(player.credits || 0) + localGold}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>thalers</span>
            </div>
          </div>

          <div className="vienna-section">
            <h2>Satchel</h2>
            <div className="vienna-satchel">
              {Array.from({ length: 10 }).map((_, i) => {
                const combined = [...(player.inventory || []), ...localInv];
                const it = combined[i];
                return (
                  <div key={i} className={`vienna-slot ${it ? 'filled' : ''}`}>
                    {it ? (ITEM_TYPES[it]?.icon ?? '📦') : ''}
                  </div>
                );
              })}
            </div>
            <div className="vienna-stat-text">
              {(player.inventory || []).length + localInv.length} / 10 items
            </div>
          </div>

          <div className="vienna-section">
            <h2>Guidance</h2>
            <ul className="vienna-controls">
              <li><b>Move:</b> Arrow keys / WASD</li>
              <li><b>⚠ Purple tiles:</b> POISON − avoid!</li>
              <li><b>Phantoms:</b> drift toward you</li>
              <li><b>Exit:</b> reach the violet gate</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
