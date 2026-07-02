"use client"

import { cn } from "@/lib/utils"
import { playSfx } from "@/lib/sound"
import type { ButtonHTMLAttributes } from "react"

type Variant = "default" | "primary" | "danger" | "ghost"

const variantClass: Record<Variant, string> = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground border-amber-300",
  danger: "bg-destructive text-destructive-foreground border-red-300",
  ghost: "bg-transparent text-foreground",
}

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  silent?: boolean
}

export function PixelButton({
  variant = "default",
  silent = false,
  className,
  children,
  onClick,
  ...rest
}: PixelButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "pixel-btn rounded-none px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer select-none",
        "disabled:cursor-not-allowed",
        variantClass[variant],
        className,
      )}
      onClick={(e) => {
        if (!silent) playSfx("select")
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
