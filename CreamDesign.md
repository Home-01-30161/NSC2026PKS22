# Hermes Agent — UI Redesign Prompt
## Theme: Ink & Cream · Analog Lolita Dashboard

> Redesign the Hermes Agent dashboard to match the aesthetic of a hand-drawn anime character in Victorian/Lolita style — warm, elegant, and analog. Every harsh digital element should be softened into its handcrafted equivalent.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background Primary | `#F5F0E8` | Aged cream paper |
| Background Secondary | `#EDE8DC` | Paper shadow / sidebar |
| Accent Ink | `#5C3D2E` | Dark sepia — replaces neon green |
| Accent Rose | `#B07B6E` | Dusty mauve — active states, badges |
| Accent Tan | `#8B7355` | Warm borders, dividers |
| Text Primary | `#2C1A0E` | Near-black ink |
| Text Secondary | `#7A5C44` | Faded ink / muted labels |
| Status Online | `#7A9E7E` | Muted sage green — soft, not neon |

---

## Typography

- **Headings** — serif or handwriting font: *Playfair Display*, *Lora*, or *Caveat*
- **Body / Labels** — lightweight serif or clean sans-serif
- **Remove ALL CAPS** everywhere — use Title Case or sentence case instead
- **Monospace** reserved for code/terminal output only, never for navigation

---

## Texture & Decoration

- **Sidebar background** — faint horizontal ruled lines like notebook paper, 24px spacing, `#D9D0C0` at 40% opacity
- **Page background** — subtle paper grain or very light crosshatch texture
- **Section dividers** — hand-drawn style: `border-bottom: 1px dashed #8B7355`
- **Active sidebar item** — small ribbon/bookmark tab on the left edge, filled `#B07B6E`
- **"Connected" badge** — replace green rectangle with a small wax-seal circle motif + checkmark inside

---

## Component Specs

### Sidebar
- Background: `#EDE8DC` with ruled-line texture
- Width: `220px`
- Right border: `1px solid #C9BBA8` (soft sepia)
- Active item: left ribbon accent `4px solid #B07B6E`

### Session Cards
- Background: `#FAF7F2`
- Border: `1px solid #C9BBA8`
- Border radius: `8px`
- Active state: left border `4px solid #B07B6E`

### Buttons (CLI / ACP tags)
- Replace dark rectangle → ribbon-style pill
- Background: `#5C3D2E`
- Text: `#F5F0E8`
- Border radius: `4px`
- Font size: `11px`

### Search Bar
- Parchment-colored input field
- Ink underline style — no harsh outer border

### Logo / Wordmark
- Render "HERMES AGENT" in serif stamp/seal aesthetic
- Replace current bold sans-serif entirely

---

## Micro-details

- **Section heading icons** — replace radio/clock icons with a small bow or ribbon SVG motif `❧` or `◈`
- **System status dot** — replace `●` with a small ink-stamp circle
- **"RUNNING" label** — soft sage pill: background `#D4E6D4`, text `#3A5C3A`
- **Version number** — footnote style: `font-size: 11px`, italic, pencil-written look

---

## Overall Feel

> The UI should feel like a **Victorian girl's personal journal** turned into a dashboard — organized, elegant, slightly whimsical, with the warmth of handwritten ink on cream paper.

Reference character: hand-drawn anime girl in Lolita/Victorian outfit — long braided hair, ruffled blouse, suspender skirt with bow details. The UI should evoke the same mood: **soft, classical, handcrafted**.