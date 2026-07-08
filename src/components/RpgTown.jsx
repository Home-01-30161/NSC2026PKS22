import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   RPG TOWN (Whitechapel)
   A 2D tile-based exploration phase.
═══════════════════════════════════════════════════════════════════ */

const TOWN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=IM+Fell+English:ital@0;1&family=Cinzel:wght@500;600;700&display=swap');

  .town-root {
    min-height: 100vh;
    background: radial-gradient(ellipse at 50% 0%, #171a20 0%, #0a0b0e 65%);
    color: #e9dfc4;
    font-family: 'IM Fell English', serif;
    display: flex; flex-direction: column; align-items: center;
    padding: 22px 14px 40px;
  }

  .town-header { text-align: center; margin-bottom: 14px; }
  .town-header h1 {
    font-family: 'UnifrakturMaguntia', cursive;
    font-weight: 400; font-size: clamp(30px, 6vw, 52px);
    color: #f0b429; margin: 0 0 2px; letter-spacing: 1px;
    text-shadow: 0 0 18px rgba(240,180,41,0.35), 0 2px 0 #000;
  }
  .town-header p {
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 3px;
    text-transform: uppercase; color: #c9bd9e; margin: 0;
  }

  .town-wrap {
    display: flex; gap: 16px; align-items: flex-start;
    flex-wrap: wrap; justify-content: center; position: relative;
  }

  .town-canvas-frame {
    position: relative;
    border: 10px solid #171008; border-radius: 4px;
    box-shadow: 0 0 0 2px #6b5424, 0 0 0 6px #171008, 0 18px 40px rgba(0,0,0,0.6);
    background: #000;
    overflow: hidden;
  }
  .town-canvas-frame canvas {
    display: block; image-rendering: pixelated; border-radius: 1px;
  }

  .town-toast {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    background: rgba(20,14,8,0.92); border: 1px solid #b9860f;
    color: #e9dfc4; padding: 8px 16px; border-radius: 5px;
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.5px;
    opacity: 0; pointer-events: none;
    transition: opacity .35s ease, transform .35s ease;
    white-space: nowrap; z-index: 20;
  }
  .town-toast.show { opacity: 1; transform: translateX(-50%) translateY(6px); }

  .town-panel {
    width: 250px;
    background: linear-gradient(180deg, #2c2015, #221810);
    border: 2px solid #9a7a35; border-radius: 6px;
    padding: 16px 16px 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.35);
  }
  .town-panel h2 {
    font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 2px;
    text-transform: uppercase; color: #f0b429;
    border-bottom: 1px solid #6b5424; padding-bottom: 6px; margin: 0 0 8px;
  }
  .town-section { margin-bottom: 16px; }

  .town-hp-bar {
    width: 100%; height: 16px; background: #160c0c;
    border: 1px solid #6b5424; border-radius: 8px; overflow: hidden;
  }
  .town-hp-fill {
    height: 100%; background: linear-gradient(90deg, #7c1f1f, #c94b3f);
    transition: width .25s ease;
  }
  .town-stat-text {
    font-size: 13px; margin-top: 4px; color: #c9bd9e;
    font-family: 'Cinzel', serif; letter-spacing: 1px;
  }
  .town-gold-row {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Cinzel', serif; font-size: 15px;
  }

  .town-satchel { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .town-slot {
    aspect-ratio: 1/1; border: 1px solid #6b5424; border-radius: 4px;
    background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;
    font-size: 18px; position: relative;
  }
  .town-slot.filled { background: rgba(240,180,41,0.08); border-color: #b9860f; }

  .town-controls {
    font-size: 14px; line-height: 1.5; color: #c9bd9e; margin: 0; padding-left: 0; list-style: none;
  }
  .town-controls li { margin-bottom: 4px; }
  .town-controls b { color: #f0b429; }
`;

const ITEM_TYPES = {
  tonic: { icon: "🧪", name: "Healing Tonic", type: "heal" },
  coin: { icon: "🪙", name: "Gold Sovereign", type: "gold" },
  watch: { icon: "⌚", name: "Pocket Watch", type: "trinket" },
  key: { icon: "🔑", name: "Brass Key", type: "trinket" },
  letter: { icon: "✉️", name: "Mysterious Letter", type: "trinket" }
};

const MAP_COLS = 30;
const MAP_ROWS = 20;
const TILE = 48;
const VIEW_COLS = 15;
const VIEW_ROWS = 11;
const CANVAS_W = VIEW_COLS * TILE; // 720
const CANVAS_H = VIEW_ROWS * TILE; // 528

const MAP_DATA = [
  "##############################",
  "#.......#............#.......#",
  "#.#####.#####.######.#####.#.#",
  "#.#...#.#...#.#....#.#...#.#.#",
  "#.#.###.#.#.#.#.##.#.#.###.#.#",
  "#.#.......#.#...##...#.....#.#",
  "#.#######.#######.####.#####.#",
  "#.......#.......#.#..........#",
  "#####.#.#######.#.##########.#",
  "#...#.#.........#............#",
  "#.###.###########.##########.#",
  "#.#.............#.#........#.#",
  "#.#.###########.#.#.######.#.#",
  "#.#.#.........#...#.#....#.#.#",
  "#.#.#.#######.#####.#.##.#.#.#",
  "#.#.#.......#.......#..#...#.#",
  "#.#.#######.##########.#####.#",
  "#.#..........................G",
  "#.##########################.#",
  "##############################"
];

const INIT_ITEMS = [
  { col: 3, row: 1, kind: "tonic" },
  { col: 13, row: 1, kind: "coin" },
  { col: 28, row: 1, kind: "watch" },
  { col: 3, row: 3, kind: "coin" },
  { col: 19, row: 3, kind: "tonic" },
  { col: 9, row: 5, kind: "letter" },
  { col: 25, row: 5, kind: "coin" },
  { col: 1, row: 7, kind: "tonic" },
  { col: 15, row: 7, kind: "key" },
  { col: 28, row: 7, kind: "coin" },
  { col: 3, row: 9, kind: "coin" },
  { col: 20, row: 9, kind: "watch" },
  { col: 9, row: 11, kind: "tonic" },
  { col: 27, row: 11, kind: "coin" },
  { col: 3, row: 13, kind: "key" },
  { col: 17, row: 13, kind: "coin" },
  { col: 11, row: 15, kind: "letter" },
  { col: 25, row: 15, kind: "tonic" },
  { col: 3, row: 17, kind: "coin" },
  { col: 20, row: 17, kind: "watch" }
].map(it => ({ ...it, collected: false }));

const LAMP_POSITIONS = [
  [7, 1], [14, 1], [24, 1],
  [1, 7], [11, 7], [22, 7],
  [7, 11], [16, 11], [25, 11],
  [1, 17], [13, 17], [22, 17]
];

function tileAt(col, row) {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return '#';
  return MAP_DATA[row][col];
}
function isBorder(col, row) {
  return row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1;
}
function winGlow(col, row) {
  return ((col * 7 + row * 13) % 3) === 0;
}

export default function RpgTown({ player, onComplete }) {
  const canvasRef = useRef(null);
  const toastRef = useRef(null);

  const [localHp, setLocalHp] = useState(player?.hp ?? 55);
  const maxHp = player?.maxHp ?? 100;
  const [localGold, setLocalGold] = useState(0); // Gold found IN this run
  const [localInv, setLocalInv] = useState([]); // Items found IN this run

  const keysRef = useRef({});
  const stateRef = useRef({
    hp: player?.hp ?? 55,
    gold: 0,
    inv: [],
    items: JSON.parse(JSON.stringify(INIT_ITEMS)), // Deep copy
    gameWon: false,
    player: {
      col: 1, row: 1,
      x: 1 * TILE, y: 1 * TILE,
      targetCol: 1, targetRow: 1,
      moving: false,
      speed: 0.22
    },
    fogBlobs: []
  });

  // Initialize fogBlobs once
  useEffect(() => {
    stateRef.current.fogBlobs = Array.from({ length: 12 }, () => ({
      x: Math.random() * CANVAS_W * 2,
      y: 80 + Math.random() * (CANVAS_H - 160),
      r: 70 + Math.random() * 80,
      speed: 0.006 + Math.random() * 0.01
    }));
  }, []);

  const showToast = useCallback((msg) => {
    if (!toastRef.current) return;
    toastRef.current.textContent = msg;
    toastRef.current.classList.add('show');
    if (toastRef.current.timer) clearTimeout(toastRef.current.timer);
    toastRef.current.timer = setTimeout(() => {
      if (toastRef.current) toastRef.current.classList.remove('show');
    }, 1800);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = performance.now();

    const drawStreetTile = (px, py, col, row) => {
      ctx.fillStyle = ((col + row) % 2 === 0) ? '#4b4b53' : '#454550';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.arc(px + 12, py + 14, 3, 0, 7);
      ctx.arc(px + 34, py + 30, 2.5, 0, 7);
      ctx.arc(px + 22, py + 38, 2, 0, 7);
      ctx.fill();
    };

    const drawWallTile = (px, py, col, row) => {
      if (isBorder(col, row)) {
        ctx.fillStyle = '#33363c';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(px + 4, py + 4, TILE - 8, 6);
      } else {
        ctx.fillStyle = '#5c2e23';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
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
        if (tileAt(col, row - 1) !== '#') {
          ctx.fillStyle = '#2a1a14';
          ctx.fillRect(px, py, TILE, 6);
        }
        if (winGlow(col, row)) {
          ctx.fillStyle = 'rgba(240,180,41,0.55)';
          ctx.fillRect(px + TILE / 2 - 6, py + TILE / 2 - 6, 12, 12);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.strokeRect(px + TILE / 2 - 6, py + TILE / 2 - 6, 12, 12);
        }
      }
    };

    const drawGateTile = (px, py, t) => {
      ctx.fillStyle = '#1b1e24';
      ctx.fillRect(px, py, TILE, TILE);
      const pulse = 0.5 + 0.5 * Math.sin(t / 300);
      const grad = ctx.createRadialGradient(px + TILE / 2, py + TILE / 2, 2, px + TILE / 2, py + TILE / 2, TILE * 0.9);
      grad.addColorStop(0, `rgba(240,180,41,${0.5 + 0.3 * pulse})`);
      grad.addColorStop(1, 'rgba(240,180,41,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(px - TILE, py - TILE, TILE * 3, TILE * 3);
      ctx.strokeStyle = '#151515';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 8 + i * 14, py + 4);
        ctx.lineTo(px + 8 + i * 14, py + TILE - 4);
        ctx.stroke();
      }
      ctx.strokeStyle = '#3a2a12';
      ctx.lineWidth = 3;
      ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
    };

    const drawLamp = (px, py, t) => {
      const bx = px + TILE / 2, by = py + TILE - 6;
      ctx.strokeStyle = '#1c1c1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by - 30);
      ctx.stroke();
      const pulse = 0.6 + 0.4 * Math.sin(t / 400 + px);
      const grad = ctx.createRadialGradient(bx, by - 34, 1, bx, by - 34, 26);
      grad.addColorStop(0, `rgba(240,190,90,${0.65 * pulse})`);
      grad.addColorStop(1, 'rgba(240,190,90,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx - 26, by - 60, 52, 52);
      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(bx - 5, by - 38, 10, 10);
      ctx.fillStyle = `rgba(255,220,140,${pulse})`;
      ctx.fillRect(bx - 3, by - 36, 6, 6);
    };

    const drawItem = (it, t, camX, camY) => {
      if (it.collected) return;
      const def = ITEM_TYPES[it.kind];
      const bob = Math.sin(t / 260 + it.col * 3 + it.row) * 3;
      const px = it.col * TILE + TILE / 2 - camX;
      const py = it.row * TILE + TILE / 2 + bob - camY;
      ctx.save();
      ctx.font = "24px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = 'rgba(240,180,41,0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(def.icon, px, py);
      ctx.restore();
    };

    const drawPlayer = (px, py) => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(px, py + 16, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e2733';
      ctx.beginPath();
      ctx.moveTo(px - 10, py + 16);
      ctx.lineTo(px - 8, py - 2);
      ctx.lineTo(px + 8, py - 2);
      ctx.lineTo(px + 10, py + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e3c19a';
      ctx.beginPath();
      ctx.arc(px, py - 10, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.fillRect(px - 7, py - 22, 14, 8);
      ctx.fillRect(px - 9, py - 15, 18, 3);
    };

    const drawFog = (t) => {
      const { fogBlobs } = stateRef.current;
      ctx.save();
      fogBlobs.forEach(b => {
        const x = ((b.x + t * b.speed) % (CANVAS_W + 200)) - 100;
        const grad = ctx.createRadialGradient(x, b.y, 0, x, b.y, b.r);
        grad.addColorStop(0, 'rgba(180,190,200,0.10)');
        grad.addColorStop(1, 'rgba(180,190,200,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      const vg = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_H / 3, CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.8);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    };

    const desiredDir = () => {
      const k = keysRef.current;
      if (k['arrowup'] || k['w']) return [0, -1];
      if (k['arrowdown'] || k['s']) return [0, 1];
      if (k['arrowleft'] || k['a']) return [-1, 0];
      if (k['arrowright'] || k['d']) return [1, 0];
      return null;
    };

    const tryPickup = (col, row) => {
      const state = stateRef.current;
      const it = state.items.find(i => !i.collected && i.col === col && i.row === row);
      if (!it) return;
      it.collected = true;
      const def = ITEM_TYPES[it.kind];
      if (def.type === "heal") {
        state.hp = Math.min(maxHp, state.hp + 25);
        showToast(`Found: ${def.name} (+25 HP)`);
      } else if (def.type === "gold") {
        state.gold += 1;
        showToast(`Found: ${def.name}`);
      } else {
        showToast(`Found: ${def.name}`);
      }
      if (def.type !== "heal" && def.type !== "gold") {
        state.inv.push(it.kind);
      }
      setLocalHp(state.hp);
      setLocalGold(state.gold);
      setLocalInv([...state.inv]);
    };

    const checkGate = (col, row) => {
      if (tileAt(col, row) === 'G' && !stateRef.current.gameWon) {
        stateRef.current.gameWon = true;
        const state = stateRef.current;
        onComplete({
          hp: state.hp,
          gold: state.gold,
          items: state.inv
        });
      }
    };

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
            if (tileAt(nc, nr) !== '#') {
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
      }

      // Camera logic
      let camX = p.x - CANVAS_W / 2 + TILE / 2;
      let camY = p.y - CANVAS_H / 2 + TILE / 2;
      camX = Math.max(0, Math.min(camX, MAP_COLS * TILE - CANVAS_W));
      camY = Math.max(0, Math.min(camY, MAP_ROWS * TILE - CANVAS_H));

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const startCol = Math.floor(camX / TILE);
      const endCol = startCol + VIEW_COLS + 1;
      const startRow = Math.floor(camY / TILE);
      const endRow = startRow + VIEW_ROWS + 1;

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) continue;
          const px = col * TILE - camX, py = row * TILE - camY;
          const ch = tileAt(col, row);
          if (ch === '#') drawWallTile(px, py, col, row);
          else if (ch === 'G') drawGateTile(px, py, now);
          else drawStreetTile(px, py, col, row);
        }
      }

      LAMP_POSITIONS.forEach(([c, r]) => {
        if (c >= startCol && c <= endCol && r >= startRow && r <= endRow) {
          drawLamp(c * TILE - camX, r * TILE - camY, now);
        }
      });

      state.items.forEach(it => {
        if (it.col >= startCol && it.col <= endCol && it.row >= startRow && it.row <= endRow) {
          drawItem(it, now, camX, camY);
        }
      });

      drawPlayer(p.x - camX + TILE / 2, p.y - camY + TILE / 2);
      drawFog(now);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [maxHp, onComplete, showToast]);

  return (
    <div className="town-root">
      <style>{TOWN_CSS}</style>
      <div className="town-header">
        <h1>Whitechapel, London</h1>
        <p>find your way through the fog</p>
      </div>

      <div className="town-wrap">
        <div className="town-canvas-frame">
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
          <div ref={toastRef} className="town-toast" />
        </div>

        <aside className="town-panel">
          <div className="town-section">
            <h2>Vitals</h2>
            <div className="town-hp-bar"><div className="town-hp-fill" style={{ width: `${(localHp / maxHp) * 100}%` }} /></div>
            <div className="town-stat-text">{localHp} / {maxHp} HP</div>
          </div>
          <div className="town-section">
            <h2>Purse</h2>
            <div className="town-gold-row"><span>🪙</span><span>{player.credits + localGold}</span> sovereigns</div>
          </div>
          <div className="town-section">
            <h2>Satchel</h2>
            <div className="town-satchel">
              {Array.from({ length: 10 }).map((_, i) => {
                // Show player's existing inventory + newly found local inventory
                const combinedInv = [...(player.inventory || []), ...localInv];
                const it = combinedInv[i];
                return (
                  <div key={i} className={`town-slot ${it ? 'filled' : ''}`}>
                    {it ? ITEM_TYPES[it].icon : ''}
                  </div>
                );
              })}
            </div>
            <div className="town-stat-text">{((player.inventory || []).length + localInv.length)} / 10 items found</div>
          </div>
          <div className="town-section">
            <h2>Guidance</h2>
            <ul className="town-controls">
              <li><b>Move:</b> Arrow keys or WASD</li>
              <li><b>Collect:</b> walk over an item</li>
              <li><b>Leave:</b> reach the iron gate</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
