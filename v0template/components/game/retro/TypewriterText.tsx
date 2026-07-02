"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
  showCursor?: boolean
}

/** Types text character-by-character with a blinking block cursor. */
export function TypewriterText({ text, speed = 18, className, showCursor = true }: TypewriterTextProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    if (!text) return
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id)
          return c
        }
        return c + 1
      })
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span className={cn(className)}>
      {text.slice(0, count)}
      {showCursor && <span className="animate-pixel-blink-fast inline-block w-[0.5em]">█</span>}
    </span>
  )
}
