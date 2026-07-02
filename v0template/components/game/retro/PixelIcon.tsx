import { cn } from "@/lib/utils"

export type PixelIconName =
  | "sword"
  | "shield"
  | "bolt"
  | "heart"
  | "star"
  | "skull"
  | "coin"
  | "swap"
  | "scroll"
  | "reset"
  | "speaker"
  | "speaker-off"
  | "trophy"

interface PixelIconProps {
  name: PixelIconName
  className?: string
}

/**
 * Chunky pixel-art icons drawn on an 8x8 grid using SVG rects.
 * shapeRendering crispEdges keeps them sharp at any size.
 */
const GRIDS: Record<PixelIconName, string[]> = {
  sword: [
    ".......X",
    "......XX",
    ".....XX.",
    "....XX..",
    "X..XX...",
    ".XXX....",
    ".XX.....",
    "X..X....",
  ],
  shield: [
    ".XXXXXX.",
    "X.XXXX.X",
    "X.XXXX.X",
    "X.XXXX.X",
    ".X.XX.X.",
    ".X.XX.X.",
    "..X..X..",
    "...XX...",
  ],
  bolt: [
    "...XXX..",
    "..XXX...",
    ".XXX....",
    "XXXXXX..",
    "..XXXX..",
    "...XXX..",
    "..XXX...",
    ".XX.....",
  ],
  heart: [
    ".XX..XX.",
    "XXXXXXXX",
    "XXXXXXXX",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    "...XX...",
    "........",
  ],
  star: [
    "...XX...",
    "...XX...",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    ".XX..XX.",
    "X......X",
    "........",
  ],
  skull: [
    ".XXXXXX.",
    "XXXXXXXX",
    "X.XXXX.X",
    "X.XXXX.X",
    "XXXXXXXX",
    ".XX.X.X.",
    ".XXXXXX.",
    ".X.X.X..",
  ],
  coin: [
    "..XXXX..",
    ".X....X.",
    "X..XX..X",
    "X.X..X.X",
    "X.X..X.X",
    "X..XX..X",
    ".X....X.",
    "..XXXX..",
  ],
  swap: [
    "..X.....",
    ".XXXXXX.",
    "..X.....",
    "........",
    ".....X..",
    ".XXXXXX.",
    ".....X..",
    "........",
  ],
  scroll: [
    ".XXXXXX.",
    "X......X",
    "X.XXXX.X",
    "X......X",
    "X.XXXX.X",
    "X......X",
    "X.XXX..X",
    ".XXXXXX.",
  ],
  reset: [
    "..XXXX..",
    ".X....X.",
    "X......X",
    "X...XXXX",
    "X....XX.",
    "X...X.X.",
    ".X......",
    "..XXXX..",
  ],
  speaker: [
    "....X...",
    "...XX.X.",
    ".XXXX..X",
    ".XXXX.XX",
    ".XXXX.XX",
    ".XXXX..X",
    "...XX.X.",
    "....X...",
  ],
  "speaker-off": [
    "....X...",
    "...XX...",
    ".XXXX.XX",
    ".XXXX.X.",
    ".XXXX.X.",
    ".XXXX.XX",
    "...XX...",
    "....X...",
  ],
  trophy: [
    "XXXXXXXX",
    "X.XXXX.X",
    "X.XXXX.X",
    ".X.XX.X.",
    "..XXXX..",
    "...XX...",
    "...XX...",
    ".XXXXXX.",
  ],
}

export function PixelIcon({ name, className }: PixelIconProps) {
  const grid = GRIDS[name]
  return (
    <svg
      viewBox="0 0 8 8"
      className={cn("w-4 h-4 shrink-0", className)}
      shapeRendering="crispEdges"
      aria-hidden="true"
      fill="currentColor"
    >
      {grid.flatMap((row, y) =>
        row.split("").map((cell, x) => (cell === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)),
      )}
    </svg>
  )
}
