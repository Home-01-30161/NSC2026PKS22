import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   RPG BRUSSELS (Act II)
   Victorian Brussels — escape through the fog-shrouded city.
   Expanded 32×22 tile map with Grand Place, canals, gas lamps.
═══════════════════════════════════════════════════════════════════ */

const TOWN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=IM+Fell+English:ital@0;1&family=Cinzel:wght@500;600;700&display=swap');

  .brussels-root {
    min-height: 100vh;
    background: radial-gradient(ellipse at 50% 0%, #0e1318 0%, #080a0c 70%);
    color: #d8cbb0;
    font-family: 'IM Fell English', serif;
    display: flex; flex-direction: column; align-items: center;
    padding: 22px 14px 40px;
  }

  .brussels-header { text-align: center; margin-bottom: 14px; }
  .brussels-header h1 {
    font-family: 'UnifrakturMaguntia', cursive;
    font-weight: 400; font-size: clamp(28px, 5.5vw, 48px);
    color: #8ecfdc; margin: 0 0 2px; letter-spacing: 1px;
    text-shadow: 0 0 18px rgba(100,190,220,0.35), 0 2px 0 #000;
  }
  .brussels-header p {
    font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 3px;
    text-transform: uppercase; color: #8a9fa8; margin: 0;
  }

  .brussels-wrap {
    display: flex; gap: 16px; align-items: flex-start;
    flex-wrap: wrap; justify-content: center; position: relative;
  }

  .brussels-canvas-frame {
    position: relative;
    border: 10px solid #0c1015; border-radius: 4px;
    box-shadow: 0 0 0 2px #2a4a5a, 0 0 0 6px #0c1015, 0 18px 40px rgba(0,0,0,0.7);
    background: #000;
    overflow: hidden;
  }
  .brussels-canvas-frame canvas {
    display: block; image-rendering: pixelated; border-radius: 1px;
  }

  .brussels-toast {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    background: rgba(8,14,20,0.92); border: 1px solid #2a6080;
    color: #d8cbb0; padding: 8px 16px; border-radius: 5px;
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.5px;
    opacity: 0; pointer-events: none;
    transition: opacity .35s ease, transform .35s ease;
    white-space: nowrap; z-index: 20;
  }
  .brussels-toast.show { opacity: 1; transform: translateX(-50%) translateY(6px); }

  .brussels-panel {
    width: 250px;
    background: linear-gradient(180deg, #0e1820, #0a1018);
    border: 2px solid #2a4a5a; border-radius: 6px;
    padding: 16px 16px 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.35);
  }
  .brussels-panel h2 {
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 2px;
    text-transform: uppercase; color: #8ecfdc;
    border-bottom: 1px solid #1a3a4a; padding-bottom: 6px; margin: 0 0 8px;
  }
  .brussels-section { margin-bottom: 16px; }

  .brussels-hp-bar {
    width: 100%; height: 16px; background: #060c10;
    border: 1px solid #1a3a4a; border-radius: 8px; overflow: hidden;
  }
  .brussels-hp-fill {
    height: 100%; background: linear-gradient(90deg, #1f5c7c, #2a8fbc);
    transition: width .25s ease;
  }
  .brussels-stat-text {
    font-size: 13px; margin-top: 4px; color: #8a9fa8;
    font-family: 'Cinzel', serif; letter-spacing: 1px;
  }
  .brussels-gold-row {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Cinzel', serif; font-size: 15px;
  }
  .brussels-danger-bar {
    width: 100%; height: 10px; background: #060c10;
    border: 1px solid #4a2020; border-radius: 6px; overflow: hidden;
    margin-top: 4px;
  }
  .brussels-danger-fill {
    height: 100%; background: linear-gradient(90deg, #7c1f1f, #c94b3f);
    transition: width .3s ease;
  }

  .brussels-satchel { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .brussels-slot {
    aspect-ratio: 1/1; border: 1px solid #1a3a4a; border-radius: 4px;
    background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .brussels-slot.filled { background: rgba(100,190,220,0.08); border-color: #2a6080; }

  .brussels-controls {
    font-size: 14px; line-height: 1.5; color: #8a9fa8; margin: 0; padding-left: 0; list-style: none;
  }
  .brussels-controls li { margin-bottom: 4px; }
  .brussels-controls b { color: #8ecfdc; }
`;

// ─── Tile & map constants ───────────────────────────────────────────
const MAP_COLS = 32;
const MAP_ROWS = 22;
const TILE = 46;
const VIEW_COLS = 15;
const VIEW_ROWS = 11;
const CANVAS_W = VIEW_COLS * TILE; // 690
const CANVAS_H = VIEW_ROWS * TILE; // 506

// Legend:
// # = wall / building        . = cobblestone street
// ~ = canal water            B = canal bridge
// G = Grand Place grass      P = stone plaza tile
// F = fountain               E = exit gate
// Space in walls = window
const MAP_DATA = [
  "################################",
  "#............................X..#",
  "#.####..####.####..####.####.##.#",
  "#.#..#..#..#.#..#..#..#.#..#...#",
  "#.#..#..#..#.#..#..#..#.#..#.#.#",
  "#.####..####.####..####.#..#.###",
  "#................................",
  "#.######.##.~~.##.##.######.####",
  "#....BB..##.~~.##.##..BB........#",
  "#.######.##.~~.##.##.######.####",
  "#..GGGGGGGGGGGGGGGGGGGGG........#",
  "#..GGGGGPPPPPPPPPPPGGGGG........#",
  "#..GGGGGPPPFPPPPPPPGGGGG..####.##",
  "#..GGGGGPPPPPPPPPPPGGGGG..####.##",
  "#..GGGGGGGGGGGGGGGGGGGGG........#",
  "#................................#",
  "#.####.####.##.##.####.####.####",
  "#.#..#.#..#.~~.~~.#..#.#..#.#..#",
  "#.#..#.#..#.~~.~~.#..#.#..#.#..#",
  "#.####.####.##.##.####.####.####",
  "#............................X..#",
  "###########E####################"
];

// ─── Collectible & enemy definitions ───────────────────────────────
const ITEM_TYPES = {
  franc:   { icon: "🪙", name: "Belgian Franc",       type: "gold"    },
  tonic:   { icon: "🧪", name: "Apothecary Tonic",    type: "heal"    },
  lens:    { icon: "🔍", name: "Jeweller's Lens",      type: "trinket" },
  scroll:  { icon: "📜", name: "Coded Dispatch",       type: "trinket" },
  lace:    { icon: "🎀", name: "Brussels Lace",        type: "trinket" },
  gear:    { icon: "⚙️",  name: "Clockwork Gear",      type: "trinket" },
};

const INIT_ITEMS = [
  { col: 2,  row: 1,  kind: "franc"  },
  { col: 29, row: 1,  kind: "franc"  },
  { col: 5,  row: 6,  kind: "tonic"  },
  { col: 25, row: 6,  kind: "franc"  },
  { col: 2,  row: 10, kind: "lens"   },
  { col: 29, row: 10, kind: "scroll" },
  { col: 13, row: 11, kind: "franc"  },
  { col: 17, row: 11, kind: "franc"  },
  { col: 2,  row: 15, kind: "tonic"  },
  { col: 29, row: 15, kind: "lace"   },
  { col: 7,  row: 15, kind: "franc"  },
  { col: 24, row: 15, kind: "gear"   },
  { col: 15, row: 6,  kind: "tonic"  },
  { col: 15, row: 20, kind: "franc"  },
  { col: 5,  row: 20, kind: "scroll" },
  { col: 25, row: 20, kind: "franc"  },
].map(it => ({ ...it, collected: false }));

// Guard patrol routes (point A ↔ point B)
const INIT_GUARDS = [
  { col: 5,  row: 6,  dir: 1, axis: 'col', min: 2,  max: 10, speed: 0.5 },
  { col: 22, row: 6,  dir:-1, axis: 'col', min: 18, max: 27, speed: 0.4 },
  { col: 5,  row: 15, dir: 1, axis: 'col', min: 2,  max: 10, speed: 0.55},
  { col: 24, row: 15, dir:-1, axis: 'col', min: 18, max: 28, speed: 0.45},
  { col: 15, row: 3,  dir: 1, axis: 'row', min: 1,  max: 5,  speed: 0.4 },
  { col: 15, row: 17, dir: 1, axis: 'row', min: 16, max: 20, speed: 0.45},
];

const LAMP_POSITIONS = [
  [3,1],[13,1],[27,1],
  [3,6],[15,6],[27,6],
  [3,10],[28,10],
  [3,15],[15,15],[27,15],
  [3,20],[13,20],[27,20],
];

function tileAt(col, row) {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return '#';
  return MAP_DATA[row][col];
}
function isWalkable(ch) {
  return ch === '.' || ch === 'G' || ch === 'P' || ch === 'B' || ch === 'X';
}
function isBorder(col, row) {
  return row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1;
}

export default function RpgBrussels({ player, onComplete }) {
  const canvasRef = useRef(null);
  const toastRef  = useRef(null);

  const [localHp,   setLocalHp]   = useState(player?.hp   ?? 55);
  const [localInv,  setLocalInv]  = useState([]);
  const [localGold, setLocalGold] = useState(0);
  const [danger,    setDanger]    = useState(0); // 0-100 alert level

  const maxHp = player?.maxHp ?? 100;

  const keysRef  = useRef({});
  const stateRef = useRef({
    hp: player?.hp ?? 55,
    gold: 0,
    inv: [],
    danger: 0,
    items: JSON.parse(JSON.stringify(INIT_ITEMS)),
    gameWon: false,
    invincibleUntil: 0,
    player: {
      col: 1, row: 1,
      x: 1 * TILE, y: 1 * TILE,
      targetCol: 1, targetRow: 1,
      moving: false,
      speed: 0.20,
    },
    guards: JSON.parse(JSON.stringify(INIT_GUARDS)).map(g => ({
      ...g,
      x: g.col * TILE,
      y: g.row * TILE,
      t: 0,
    })),
    fogBlobs: [],
    canalAnim: 0,
    fountainAnim: 0,
  });

  // Init fog & canal animations
  useEffect(() => {
    stateRef.current.fogBlobs = Array.from({ length: 14 }, () => ({
      x: Math.random() * CANVAS_W * 2,
      y: 60 + Math.random() * (CANVAS_H - 120),
      r: 55 + Math.random() * 70,
      speed: 0.003 + Math.random() * 0.006,
    }));
  }, []);

  const showToast = useCallback((msg) => {
    if (!toastRef.current) return;
    toastRef.current.textContent = msg;
    toastRef.current.classList.add('show');
    if (toastRef.current._timer) clearTimeout(toastRef.current._timer);
    toastRef.current._timer = setTimeout(() => {
      if (toastRef.current) toastRef.current.classList.remove('show');
    }, 1900);
  }, []);

  // Keyboard
  useEffect(() => {
    const kd = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (["arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase()))
        e.preventDefault();
    };
    const ku = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd, { passive: false });
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, []);

  // ── Main game loop ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let lastTime = performance.now();

    // ── Tile drawing helpers ──────────────────────────────────────
    const drawCobble = (px, py, col, row) => {
      ctx.fillStyle = ((col + row) % 2 === 0) ? '#5c5448' : '#554e42';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      // pebble texture
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.arc(px + 10, py + 12, 2.5, 0, 7);
      ctx.arc(px + 30, py + 28, 2, 0, 7);
      ctx.arc(px + 20, py + 36, 2, 0, 7);
      ctx.fill();
    };

    const drawBuilding = (px, py, col, row) => {
      if (isBorder(col, row)) {
        ctx.fillStyle = '#1e2228';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
      } else {
        // Red-brick Belgian row house
        ctx.fillStyle = '#6b3a2a';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let by = 0; by < TILE; by += 8) {
          ctx.beginPath();
          ctx.moveTo(px, py + by + 0.5);
          ctx.lineTo(px + TILE, py + by + 0.5);
          ctx.stroke();
        }
        const offset = (row % 2 === 0) ? 0 : 8;
        for (let bx = -8; bx < TILE; bx += 16) {
          ctx.beginPath();
          ctx.moveTo(px + bx + offset + 0.5, py);
          ctx.lineTo(px + bx + offset + 0.5, py + TILE);
          ctx.stroke();
        }
        // shadow underside
        if (tileAt(col, row - 1) !== '#') {
          ctx.fillStyle = '#2a1510';
          ctx.fillRect(px, py, TILE, 6);
        }
        // windows (warm amber glow)
        if (row > 1 && row < MAP_ROWS - 2) {
          const gx = px + TILE / 2 - 5;
          const gy = py + TILE / 2 - 4;
          const grd = ctx.createRadialGradient(gx + 5, gy + 4, 1, gx + 5, gy + 4, 9);
          grd.addColorStop(0, 'rgba(255,200,100,0.65)');
          grd.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = grd;
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = 'rgba(255,200,100,0.55)';
          ctx.fillRect(gx, gy, 10, 9);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.strokeRect(gx, gy, 10, 9);
        }
      }
    };

    const drawCanal = (px, py, t) => {
      const wave = Math.sin(t / 500 + px * 0.04) * 3;
      ctx.fillStyle = '#1a3845';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = `rgba(100,200,230,${0.15 + 0.08 * Math.sin(t / 300 + px)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 18 + wave);
      ctx.lineTo(px + TILE - 4, py + 18 - wave);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + 4, py + 28 - wave);
      ctx.lineTo(px + TILE - 4, py + 28 + wave);
      ctx.stroke();
      // surface shimmer
      ctx.fillStyle = `rgba(120,220,255,${0.06 + 0.04 * Math.sin(t / 200)})`;
      ctx.fillRect(px, py, TILE, TILE);
    };

    const drawBridge = (px, py) => {
      ctx.fillStyle = '#7a5c3a';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(px + i * 10, py);
        ctx.lineTo(px + i * 10, py + TILE);
        ctx.stroke();
      }
      ctx.strokeStyle = '#4a3020';
      ctx.lineWidth = 3;
      ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
    };

    const drawPlaza = (px, py) => {
      ctx.fillStyle = '#a09080';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
    };

    const drawGrass = (px, py) => {
      ctx.fillStyle = '#3a5a30';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(px, py, TILE, TILE / 2);
    };

    const drawFountain = (px, py, t) => {
      ctx.fillStyle = '#a09080';
      ctx.fillRect(px, py, TILE, TILE);
      const pulse = 0.5 + 0.5 * Math.sin(t / 200);
      // basin
      ctx.fillStyle = '#2a5060';
      ctx.beginPath();
      ctx.ellipse(px + TILE / 2, py + TILE / 2, TILE / 2 - 6, TILE / 2 - 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // water spray glow
      const fg = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2 - 6, 0, px + TILE / 2, py + TILE / 2 - 6, 14);
      fg.addColorStop(0, `rgba(100,210,255,${0.6 * pulse})`);
      fg.addColorStop(1, 'rgba(100,210,255,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(px, py - 6, TILE, TILE);
    };

    const drawGate = (px, py, t) => {
      ctx.fillStyle = '#101418';
      ctx.fillRect(px, py, TILE, TILE);
      const pulse = 0.5 + 0.5 * Math.sin(t / 250);
      const grad = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 2, px + TILE / 2, py + TILE / 2, TILE * 0.95);
      grad.addColorStop(0, `rgba(100,210,255,${0.5 + 0.3 * pulse})`);
      grad.addColorStop(1, 'rgba(100,210,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(px - TILE, py - TILE, TILE * 3, TILE * 3);
      // iron bars
      ctx.strokeStyle = '#1c2028';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 8 + i * 14, py + 4);
        ctx.lineTo(px + 8 + i * 14, py + TILE - 4);
        ctx.stroke();
      }
      ctx.strokeStyle = '#2a4050';
      ctx.lineWidth = 3;
      ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    };

    const drawSideExit = (px, py) => {
      ctx.fillStyle = '#1a2830';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = 'rgba(100,210,255,0.08)';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = '#2a5060';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
    };

    const drawLamp = (px, py, t) => {
      const bx = px + TILE / 2, by = py + TILE - 4;
      ctx.strokeStyle = '#1a1c20';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by - 28);
      ctx.stroke();
      const pulse = 0.55 + 0.45 * Math.sin(t / 450 + px);
      const grd = ctx.createRadialGradient(bx, by - 32, 1, bx, by - 32, 24);
      grd.addColorStop(0, `rgba(180,230,255,${0.6 * pulse})`);
      grd.addColorStop(1, 'rgba(180,230,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(bx - 24, by - 56, 48, 48);
      ctx.fillStyle = '#202428';
      ctx.fillRect(bx - 4, by - 36, 8, 8);
      ctx.fillStyle = `rgba(180,230,255,${pulse})`;
      ctx.fillRect(bx - 2, by - 34, 4, 4);
    };

    const drawItem = (it, t, camX, camY) => {
      if (it.collected) return;
      const def = ITEM_TYPES[it.kind];
      const bob = Math.sin(t / 270 + it.col * 2.5 + it.row * 1.5) * 3;
      const px = it.col * TILE + TILE / 2 - camX;
      const py = it.row * TILE + TILE / 2 + bob - camY;
      ctx.save();
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = 'rgba(100,210,255,0.55)';
      ctx.shadowBlur = 8;
      ctx.fillText(def.icon, px, py);
      ctx.restore();
    };

    const drawGuard = (g, camX, camY, t) => {
      const px = g.x - camX + TILE / 2;
      const py = g.y - camY + TILE / 2;
      // Alert radius (faint)
      const alertGrd = ctx.createRadialGradient(px, py, 0, px, py, TILE * 1.6);
      alertGrd.addColorStop(0, 'rgba(200,60,60,0.07)');
      alertGrd.addColorStop(1, 'rgba(200,60,60,0)');
      ctx.fillStyle = alertGrd;
      ctx.fillRect(px - TILE * 2, py - TILE * 2, TILE * 4, TILE * 4);
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(px, py + 14, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body (dark coat)
      ctx.fillStyle = '#201a28';
      ctx.beginPath();
      ctx.moveTo(px - 9, py + 14);
      ctx.lineTo(px - 7, py - 2);
      ctx.lineTo(px + 7, py - 2);
      ctx.lineTo(px + 9, py + 14);
      ctx.closePath();
      ctx.fill();
      // Head
      ctx.fillStyle = '#c4a077';
      ctx.beginPath();
      ctx.arc(px, py - 10, 6, 0, Math.PI * 2);
      ctx.fill();
      // Top hat
      ctx.fillStyle = '#111114';
      ctx.fillRect(px - 7, py - 22, 14, 9);
      ctx.fillRect(px - 9, py - 14, 18, 3);
      // Lantern
      const lPulse = 0.5 + 0.5 * Math.sin(t / 300 + g.x);
      ctx.fillStyle = `rgba(255,210,120,${0.5 * lPulse})`;
      ctx.beginPath();
      ctx.arc(px + 10, py - 2, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPlayer = (px, py) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(px, py + 14, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // coat (teal-blue)
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.moveTo(px - 9, py + 14);
      ctx.lineTo(px - 7, py - 2);
      ctx.lineTo(px + 7, py - 2);
      ctx.lineTo(px + 9, py + 14);
      ctx.closePath();
      ctx.fill();
      // head
      ctx.fillStyle = '#ddb592';
      ctx.beginPath();
      ctx.arc(px, py - 10, 7, 0, Math.PI * 2);
      ctx.fill();
      // top hat
      ctx.fillStyle = '#0f1114';
      ctx.fillRect(px - 6, py - 22, 13, 9);
      ctx.fillRect(px - 8, py - 14, 17, 3);
    };

    const drawFog = (t) => {
      const { fogBlobs } = stateRef.current;
      ctx.save();
      fogBlobs.forEach(b => {
        const x = ((b.x + t * b.speed) % (CANVAS_W + 180)) - 90;
        const grd = ctx.createRadialGradient(x, b.y, 0, x, b.y, b.r);
        grd.addColorStop(0, 'rgba(140,160,180,0.09)');
        grd.addColorStop(1, 'rgba(140,160,180,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      // Vignette
      const vg = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_H / 3, CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.82);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    };

    // ── Input ───────────────────────────────────────────────────────
    const desiredDir = () => {
      const k = keysRef.current;
      if (k['arrowup']    || k['w']) return [0, -1];
      if (k['arrowdown']  || k['s']) return [0,  1];
      if (k['arrowleft']  || k['a']) return [-1, 0];
      if (k['arrowright'] || k['d']) return [1,  0];
      return null;
    };

    // ── Pickup ──────────────────────────────────────────────────────
    const tryPickup = (col, row) => {
      const state = stateRef.current;
      const it = state.items.find(i => !i.collected && i.col === col && i.row === row);
      if (!it) return;
      it.collected = true;
      const def = ITEM_TYPES[it.kind];
      if (def.type === "heal") {
        state.hp = Math.min(maxHp, state.hp + 28);
        showToast(`Found: ${def.name} (+28 HP)`);
      } else if (def.type === "gold") {
        state.gold += 1;
        showToast(`Found: ${def.name}`);
      } else {
        showToast(`Found: ${def.name}`);
      }
      if (def.type === "trinket") state.inv.push(it.kind);
      setLocalHp(state.hp);
      setLocalGold(state.gold);
      setLocalInv([...state.inv]);
    };

    // ── Guard update ────────────────────────────────────────────────
    const updateGuards = (dt) => {
      stateRef.current.guards.forEach(g => {
        g.t += dt;
        if (g.t < 1000 / 60) return; // clamp step rate
        g.t = 0;
        const step = g.speed;
        if (g.axis === 'col') {
          g.col += g.dir * step / TILE;
          g.x = g.col * TILE;
          if (g.col >= g.max || g.col <= g.min) { g.dir *= -1; g.col = Math.max(g.min, Math.min(g.max, g.col)); }
        } else {
          g.row += g.dir * step / TILE;
          g.y = g.row * TILE;
          if (g.row >= g.max || g.row <= g.min) { g.dir *= -1; g.row = Math.max(g.min, Math.min(g.max, g.row)); }
        }
      });
    };

    // ── Guard collision ──────────────────────────────────────────────
    const checkGuards = (now) => {
      const state = stateRef.current;
      if (now < state.invincibleUntil) return;
      const px = state.player.x + TILE / 2;
      const py = state.player.y + TILE / 2;
      for (const g of state.guards) {
        const gx = g.x + TILE / 2, gy = g.y + TILE / 2;
        const dist = Math.hypot(px - gx, py - gy);
        if (dist < TILE * 0.85) {
          state.hp = Math.max(0, state.hp - 14);
          state.danger = Math.min(100, state.danger + 22);
          state.invincibleUntil = now + 1000;
          showToast('A guard spotted you! (-14 HP)');
          setLocalHp(state.hp);
          setDanger(state.danger);
          break;
        }
      }
    };

    // ── Gate check ───────────────────────────────────────────────────
    const checkGate = (col, row) => {
      const ch = tileAt(col, row);
      if ((ch === 'E' || ch === 'X') && !stateRef.current.gameWon) {
        stateRef.current.gameWon = true;
        const state = stateRef.current;
        onComplete({ hp: state.hp, gold: state.gold, items: state.inv });
      }
    };

    // ── Main loop ───────────────────────────────────────────────────
    const loop = (now) => {
      const dt = now - lastTime;
      lastTime = now;
      const state = stateRef.current;
      const p = state.player;

      if (!state.gameWon) {
        // Player movement
        if (!p.moving) {
          const dir = desiredDir();
          if (dir) {
            const nc = p.col + dir[0], nr = p.row + dir[1];
            const ch = tileAt(nc, nr);
            if (isWalkable(ch)) {
              p.targetCol = nc; p.targetRow = nr;
              p.moving = true;
            }
          }
        } else {
          const tx = p.targetCol * TILE, ty = p.targetRow * TILE;
          const dx = tx - p.x, dy = ty - p.y;
          const dist = Math.hypot(dx, dy);
          const step = p.speed * dt;
          if (dist <= step || dist === 0) {
            p.x = tx; p.y = ty;
            p.col = p.targetCol; p.row = p.targetRow;
            p.moving = false;
            tryPickup(p.col, p.row);
            checkGate(p.col, p.row);
          } else {
            p.x += (dx / dist) * step;
            p.y += (dy / dist) * step;
          }
        }

        updateGuards(dt);
        checkGuards(now);
      }

      // Camera
      let camX = p.x - CANVAS_W / 2 + TILE / 2;
      let camY = p.y - CANVAS_H / 2 + TILE / 2;
      camX = Math.max(0, Math.min(camX, MAP_COLS * TILE - CANVAS_W));
      camY = Math.max(0, Math.min(camY, MAP_ROWS * TILE - CANVAS_H));

      // Draw background
      ctx.fillStyle = '#080a0c';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const startCol = Math.floor(camX / TILE);
      const endCol   = startCol + VIEW_COLS + 1;
      const startRow = Math.floor(camY / TILE);
      const endRow   = startRow + VIEW_ROWS + 1;

      // Tiles
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) continue;
          const px = col * TILE - camX, py = row * TILE - camY;
          const ch = tileAt(col, row);
          if      (ch === '#') drawBuilding(px, py, col, row);
          else if (ch === '~') drawCanal(px, py, now);
          else if (ch === 'B') drawBridge(px, py);
          else if (ch === 'G') drawGrass(px, py);
          else if (ch === 'P') drawPlaza(px, py);
          else if (ch === 'F') drawFountain(px, py, now);
          else if (ch === 'E') drawGate(px, py, now);
          else if (ch === 'X') drawSideExit(px, py);
          else                 drawCobble(px, py, col, row);
        }
      }

      // Lamps
      LAMP_POSITIONS.forEach(([c, r]) => {
        if (c >= startCol && c <= endCol && r >= startRow && r <= endRow)
          drawLamp(c * TILE - camX, r * TILE - camY, now);
      });

      // Items
      state.items.forEach(it => {
        if (it.col >= startCol && it.col <= endCol && it.row >= startRow && it.row <= endRow)
          drawItem(it, now, camX, camY);
      });

      // Guards
      state.guards.forEach(g => {
        if (g.col >= startCol - 1 && g.col <= endCol + 1 && g.row >= startRow - 1 && g.row <= endRow + 1)
          drawGuard(g, camX, camY, now);
      });

      drawPlayer(p.x - camX + TILE / 2, p.y - camY + TILE / 2);
      drawFog(now);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [maxHp, onComplete, showToast]);

  return (
    <div className="brussels-root">
      <style>{TOWN_CSS}</style>
      <div className="brussels-header">
        <h1>Brussels, Belgium</h1>
        <p>1888 — evade the Orchestrator's guards and reach the city gate</p>
      </div>

      <div className="brussels-wrap">
        <div className="brussels-canvas-frame">
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
          <div ref={toastRef} className="brussels-toast" />
        </div>

        <aside className="brussels-panel">
          <div className="brussels-section">
            <h2>Vitals</h2>
            <div className="brussels-hp-bar">
              <div className="brussels-hp-fill" style={{ width: `${(localHp / maxHp) * 100}%` }} />
            </div>
            <div className="brussels-stat-text">{localHp} / {maxHp} HP</div>
          </div>

          <div className="brussels-section">
            <h2>Alert Level</h2>
            <div className="brussels-danger-bar">
              <div className="brussels-danger-fill" style={{ width: `${danger}%` }} />
            </div>
            <div className="brussels-stat-text" style={{ color: danger > 60 ? '#e07070' : undefined }}>
              {danger < 30 ? 'Undetected' : danger < 65 ? 'Suspicious' : 'Hunted'}
            </div>
          </div>

          <div className="brussels-section">
            <h2>Purse</h2>
            <div className="brussels-gold-row">
              <span>🪙</span>
              <span>{(player.credits || 0) + localGold}</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>francs</span>
            </div>
          </div>

          <div className="brussels-section">
            <h2>Satchel</h2>
            <div className="brussels-satchel">
              {Array.from({ length: 10 }).map((_, i) => {
                const combined = [...(player.inventory || []), ...localInv];
                const it = combined[i];
                return (
                  <div key={i} className={`brussels-slot ${it ? 'filled' : ''}`}>
                    {it ? (ITEM_TYPES[it]?.icon ?? '📦') : ''}
                  </div>
                );
              })}
            </div>
            <div className="brussels-stat-text">
              {(player.inventory || []).length + localInv.length} / 10 items
            </div>
          </div>

          <div className="brussels-section">
            <h2>Guidance</h2>
            <ul className="brussels-controls">
              <li><b>Move:</b> Arrow keys / WASD</li>
              <li><b>Collect:</b> walk over items</li>
              <li><b>Avoid:</b> lantern-carrying guards</li>
              <li><b>Exit:</b> reach the blue gate</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
