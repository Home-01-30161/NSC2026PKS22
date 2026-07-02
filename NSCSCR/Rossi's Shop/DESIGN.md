---
name: Steam-Code Chronicle
colors:
  surface: '#fff8f5'
  surface-dim: '#e3d8d1'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf1ea'
  surface-container: '#f7ece5'
  surface-container-high: '#f2e6df'
  surface-container-highest: '#ece0d9'
  on-surface: '#201b17'
  on-surface-variant: '#51443a'
  inverse-surface: '#352f2b'
  inverse-on-surface: '#faeee7'
  outline: '#847469'
  outline-variant: '#d6c3b6'
  surface-tint: '#855324'
  primary: '#552c00'
  on-primary: '#ffffff'
  primary-container: '#704214'
  on-primary-container: '#f1b179'
  inverse-primary: '#fbb980'
  secondary: '#8c4f10'
  on-secondary: '#ffffff'
  secondary-container: '#fdad67'
  on-secondary-container: '#763f00'
  tertiary: '#003b4a'
  on-tertiary: '#ffffff'
  tertiary-container: '#005467'
  on-tertiary-container: '#88c7dd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc1'
  primary-fixed-dim: '#fbb980'
  on-primary-fixed: '#2e1500'
  on-primary-fixed-variant: '#693c0e'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77b'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#b5ebff'
  tertiary-fixed-dim: '#91d0e6'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e5f'
  background: '#fff8f5'
  on-background: '#201b17'
  surface-variant: '#ece0d9'
  aged-cream: '#F5F2E7'
  sepia-ink: '#3D2B1F'
  monokai-green: '#A6E22E'
  monokai-pink: '#F92672'
  monokai-orange: '#FD971F'
  terminal-bg: '#272822'
typography:
  headline-xl:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-page: 2rem
  gutter-panel: 1.5rem
  component-gap: 1rem
  unit: 4px
---

## Brand & Style

This design system establishes a "Victorian Steampunk-lite" aesthetic, merging the tactile, mechanical world of 19th-century innovation with the digital precision of early 20th-century terminal logic. It targets a sophisticated, curious audience engaged in educational gaming. 

The style is a hybrid of **Tactile Skeuomorphism** and **High-Contrast Terminal** design. The base environment feels like an explorer’s field journal—warm, organic, and hand-crafted—while the functional AI interfaces erupt as vibrant, neon-monochromatic overlays. This juxtaposition represents the "MARI.EXE" system bleeding into a historical timeline. Every interaction should feel like operating a brass-bound machine that unexpectedly hums with modern electricity.

Key visual pillars:
- **Mechanical Schematics:** Borders and containers utilize thin, technical line-work resembling copper pipes and blueprints.
- **The Journal Base:** A consistent parchment texture serves as the canvas for all "world" elements.
- **The Terminal Glitch:** Neon accents and monospaced grids appear when interacting with AI/LLM mechanics.

## Colors

The palette is divided into two distinct emotional zones: the **Historical Base** and the **Terminal Overlay**.

- **Historical Base:** Dominated by `aged-cream` and `sepia-ink`. This provides a low-strain, readable background for long story segments. `Copper/Bronze` (#B87333) is used for structural UI elements like buttons, progress bar housings, and decorative trim.
- **Terminal Overlay:** Specifically for the "Overwrite" mode and AI-specific panels. These utilize a dark `terminal-bg` to force high contrast against the cream background. Functional highlights use a neon triad: `green` for success/cleared states, `pink` for errors/risk, and `orange` for warnings or active system prompts.

The default mode is **Light**, with **Dark** regions reserved for specific technical components.

## Typography

Typography acts as the primary signal for shifting contexts. 

- **Narrative Content:** Uses *Libre Caslon Text* for headings to evoke Victorian publishing and *Source Serif 4* for body text to ensure modern legibility with a classic feel. Headlines should use a high-contrast sepia color.
- **System/Technical Content:** Uses *JetBrains Mono*. This monospaced font is applied to "Phase Badges," damage numbers, and all AI input fields.
- **Emphasis:** Technical labels should be in all-caps monospaced text to simulate stamped metal or printed telegraph labels. Use high-contrast neon colors for these labels only when they appear within a Terminal Overlay.

## Layout & Spacing

The design follows a **Fixed Grid** philosophy within a "Context Window" container. The layout mimics the structured nature of a mechanical blueprint.

- **Grid:** A 12-column grid system with generous gutters (24px) to prevent the information-dense technical elements from feeling cluttered.
- **Margins:** Page margins are wide (32px+) to reinforce the "journal page" look, ensuring the UI feels like an object on a desk rather than a digital screen.
- **Responsive Behavior:** 
  - **Desktop:** Side-by-side view with Battle Logs on the right and Action Panels on the left.
  - **Tablet:** Stacked panels with a persistent "Status Bar" at the top.
  - **Mobile:** Single-panel view focusing on the QTE/Action area, with logs and world map accessible via copper-styled tabs.

## Elevation & Depth

This system rejects soft ambient shadows in favor of **Tonal Layers** and **Physical Stacking**.

- **Surfaces:** Depth is created by layering textures. A "base" journal page sits at the bottom. Technical panels are "bolted" on top, using thin, 1px sepia borders and slightly darker cream fills.
- **AI Panels:** These use a "glass" effect but with a dark tint (Glassmorphism), creating a visual "cut-out" in the page that looks into the system's core. 
- **Borders:** Instead of shadows, use double-line borders or "rivet" accents in the corners of containers to indicate elevation. Active elements (like the current Phase Badge) use a copper-colored stroke to stand out.

## Shapes

The shape language is **Soft and Geometric**. While the Victorian aesthetic often uses flourishes, the "lite" steampunk approach here favors the precision of early industrial parts.

- **Primary Radius:** A subtle 4px (Soft) radius is used for most cards and input fields to mimic cut metal or heavy cardstock.
- **Pills:** Used exclusively for "Status Effect Tags" and "Currency Badges."
- **Terminal Input:** Strict 0px radius (Sharp) for the code entry areas to emphasize the digital, unyielding nature of the terminal.
- **Decorative:** 45-degree chamfered corners are encouraged for primary action buttons to evoke the look of a nameplate on a boiler.

## Components

- **Buttons:** Primary buttons look like copper nameplates with centered, all-caps monospaced text. Use a 2px inset border to simulate a stamped effect.
- **Input Fields (Terminal):** Large text areas with `terminal-bg` and `monokai-green` cursor. No borders; use a "scanning line" animation to indicate focus.
- **Input Fields (Standard):** Underlined style using a `sepia` stroke, resembling a line in a notebook.
- **Cards/Nodes:** Map nodes are circular icons with a hand-drawn sketch style. A "cleared" node gains a green glowing ring; a "locked" node is a simple sepia outline.
- **Progress Bars (Integrity/HP):** The "housing" is a copper pipe (linear gradient). The "fill" is a solid block of color (green for HP, pink for Hallucination Risk) without gradients.
- **Chips/Tags:** Small, pill-shaped elements with a monospaced font. `Weakness Tags` should pulse slightly in a neon hue when scanned.
- **QTE Bar:** A horizontal brass rail. The "Hit Zone" is a high-contrast neon-green segment that contrasts sharply with the copper rail.