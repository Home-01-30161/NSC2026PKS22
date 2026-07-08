const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove imports
content = content.replace(/import \{ Send, Menu, X, Settings2 \} from 'lucide-react';\s*import CharacterSprite from '\.\/components\/CharacterSprite';\s*import TitleScreen from '\.\/components\/TitleScreen';/, "import TitleScreen from './components/TitleScreen';");
content = content.replace(/import \{ streamChatCompletion, parseApiError \} from '\.\/services\/llmApi';\s*/, "");

// 2. Remove Greetings and Bow SVG
content = content.replace(/\/\* ─── Seraphine persona greeting lines ───.*?\/\* ═══════════════════════════════════════════════════════════════════ \*\//s, "/* ═══════════════════════════════════════════════════════════════════ */");

// 3. Remove Sidebar/Chat state and hooks
content = content.replace(/\/\* ── Settings sidebar ──.*?\/\* ── Inline styles ──.*?\n/s, "/* ── Game phases are handled by early returns below ── */\n");

// 4. Remove S object and InkDots
content = content.replace(/  const S = \{.*?\};\s*\/\* ── Ink bounce dots ──.*?\);\s*/s, "");

// 5. Replace final return with return null
content = content.replace(/  return \(\s*<div style=\{S\.root\}>.*?\);\s*\}\s*$/s, "  return null;\n}\n");

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx cleaned');
