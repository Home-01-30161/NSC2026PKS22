import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

type Variant = "default" | "gold" | "player" | "enemy" | "danger" | "teal"

const variantClass: Record<Variant, string> = {
  default: "pixel-panel",
  gold: "pixel-panel pixel-panel-gold",
  player: "pixel-panel pixel-panel-player",
  enemy: "pixel-panel pixel-panel-enemy",
  danger: "pixel-panel pixel-panel-danger",
  teal: "pixel-panel pixel-panel-teal",
}

interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
}

export function PixelPanel({ variant = "default", className, children, ...rest }: PixelPanelProps) {
  return (
    <div className={cn(variantClass[variant], "rounded-none", className)} {...rest}>
      {children}
    </div>
  )
}
