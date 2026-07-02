"use client"

import type { LogEntry } from "@/lib/game/types"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import { TypewriterText } from "./retro/TypewriterText"

interface GameLogProps {
  logs: LogEntry[]
}

export function GameLog({ logs }: GameLogProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" })
  }, [logs])

  const latestId = logs.length > 0 ? logs[logs.length - 1].id : null

  return (
    <div className="pixel-panel rounded-none flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b-2 border-border flex items-center justify-between">
        <div className="font-pixel text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Battle Log
        </div>
        <div className="font-pixel text-[10px] text-muted-foreground">{logs.length}</div>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 text-base">
        {logs.map((l) => {
          const toneClass = cn(
            l.tone === "system" && "text-foreground font-semibold",
            l.tone === "damage" && "text-destructive",
            l.tone === "heal" && "text-[var(--heal)]",
            l.tone === "player" && "text-[var(--player)]",
            l.tone === "opponent" && "text-[var(--opponent)]",
            l.tone === "info" && "text-muted-foreground",
          )
          return (
            <div key={l.id} className={cn("leading-snug", toneClass)}>
              <span className="text-muted-foreground mr-2">T{l.turn}</span>
              {l.id === latestId ? <TypewriterText text={l.text} /> : l.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}
