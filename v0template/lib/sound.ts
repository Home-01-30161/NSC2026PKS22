"use client"

/**
 * Chiptune SFX engine — pure Web Audio, no asset files.
 * Square/triangle oscillators with fast envelopes for an 8-bit feel.
 * Sound is ON by default; preference persists to localStorage.
 */

export type SfxName =
  | "select"
  | "attack"
  | "hit"
  | "heal"
  | "rankUp"
  | "ko"
  | "victory"
  | "defeat"
  | "start"
  | "swap"

const STORAGE_KEY = "stack-attack-sound"
const LANDING_AUDIO_SRC = "/audio/sa-open.mp3"
const BATTLE_AUDIO_SRC = "/audio/fight.mp3"

let ctx: AudioContext | null = null
let landingAudio: HTMLAudioElement | null = null
let battleAudio: HTMLAudioElement | null = null
let muted = false
let initialized = false

function ensureInit() {
  if (initialized) return
  initialized = true
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    muted = stored === "muted"
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {})
  }
  return ctx
}

export function isMuted(): boolean {
  ensureInit()
  return muted
}

export function setMuted(value: boolean) {
  ensureInit()
  muted = value
  if (muted) {
    stopLandingTrack()
    stopBattleTrack()
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value ? "muted" : "on")
  }
}

function getLoopingAudio(src: string, volume: number): HTMLAudioElement | null {
  if (typeof window === "undefined") return null
  const audio = new Audio(src)
  audio.loop = true
  audio.volume = volume
  audio.preload = "auto"
  return audio
}

function getLandingAudio(): HTMLAudioElement | null {
  if (!landingAudio) {
    landingAudio = getLoopingAudio(LANDING_AUDIO_SRC, 0.35)
  }
  return landingAudio
}

function getBattleAudio(): HTMLAudioElement | null {
  if (!battleAudio) {
    battleAudio = getLoopingAudio(BATTLE_AUDIO_SRC, 0.4)
  }
  return battleAudio
}

export function playLandingTrack(): Promise<void> {
  ensureInit()
  if (muted) return Promise.resolve()

  const audio = getLandingAudio()
  if (!audio) return Promise.resolve()

  return audio.play()
}

export function stopLandingTrack() {
  if (!landingAudio) return
  landingAudio.pause()
  landingAudio.currentTime = 0
}

export function playBattleTrack(): Promise<void> {
  ensureInit()
  if (muted) return Promise.resolve()

  stopLandingTrack()

  const audio = getBattleAudio()
  if (!audio) return Promise.resolve()

  return audio.play()
}

export function stopBattleTrack() {
  if (!battleAudio) return
  battleAudio.pause()
  battleAudio.currentTime = 0
}

interface Note {
  freq: number
  /** start offset in seconds */
  at: number
  /** duration in seconds */
  dur: number
  type?: OscillatorType
  vol?: number
  /** linear slide to this frequency over the duration */
  slideTo?: number
}

function playNotes(notes: Note[]) {
  ensureInit()
  if (muted) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime

  for (const n of notes) {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = n.type ?? "square"
    osc.frequency.setValueAtTime(n.freq, now + n.at)
    if (n.slideTo) {
      osc.frequency.linearRampToValueAtTime(n.slideTo, now + n.at + n.dur)
    }
    const vol = n.vol ?? 0.08
    gain.gain.setValueAtTime(vol, now + n.at)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.dur)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(now + n.at)
    osc.stop(now + n.at + n.dur + 0.02)
  }
}

function playNoise(at: number, dur: number, vol = 0.1) {
  ensureInit()
  if (muted) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const bufferSize = Math.floor(ac.sampleRate * dur)
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const gain = ac.createGain()
  gain.gain.setValueAtTime(vol, now + at)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + at + dur)
  src.connect(gain)
  gain.connect(ac.destination)
  src.start(now + at)
}

export function playSfx(name: SfxName) {
  switch (name) {
    case "select":
      playNotes([{ freq: 880, at: 0, dur: 0.06, vol: 0.05 }])
      break
    case "attack":
      playNotes([
        { freq: 220, at: 0, dur: 0.08, slideTo: 440, vol: 0.09 },
        { freq: 330, at: 0.06, dur: 0.1, slideTo: 660, vol: 0.07 },
      ])
      break
    case "hit":
      playNotes([{ freq: 160, at: 0, dur: 0.15, slideTo: 60, type: "sawtooth", vol: 0.1 }])
      playNoise(0, 0.12, 0.08)
      break
    case "heal":
      playNotes([
        { freq: 523, at: 0, dur: 0.08, type: "triangle", vol: 0.09 },
        { freq: 659, at: 0.08, dur: 0.08, type: "triangle", vol: 0.09 },
        { freq: 784, at: 0.16, dur: 0.14, type: "triangle", vol: 0.09 },
      ])
      break
    case "rankUp":
      playNotes([
        { freq: 523, at: 0, dur: 0.09, vol: 0.08 },
        { freq: 659, at: 0.09, dur: 0.09, vol: 0.08 },
        { freq: 784, at: 0.18, dur: 0.09, vol: 0.08 },
        { freq: 1047, at: 0.27, dur: 0.2, vol: 0.09 },
      ])
      break
    case "ko":
      playNotes([{ freq: 300, at: 0, dur: 0.5, slideTo: 40, type: "sawtooth", vol: 0.1 }])
      playNoise(0.05, 0.3, 0.07)
      break
    case "victory":
      playNotes([
        { freq: 523, at: 0, dur: 0.12, vol: 0.08 },
        { freq: 523, at: 0.14, dur: 0.08, vol: 0.08 },
        { freq: 523, at: 0.24, dur: 0.08, vol: 0.08 },
        { freq: 659, at: 0.34, dur: 0.16, vol: 0.09 },
        { freq: 784, at: 0.52, dur: 0.3, vol: 0.09 },
        { freq: 1047, at: 0.84, dur: 0.4, vol: 0.1 },
      ])
      break
    case "defeat":
      playNotes([
        { freq: 392, at: 0, dur: 0.2, type: "triangle", vol: 0.09 },
        { freq: 330, at: 0.22, dur: 0.2, type: "triangle", vol: 0.09 },
        { freq: 262, at: 0.44, dur: 0.2, type: "triangle", vol: 0.09 },
        { freq: 196, at: 0.66, dur: 0.5, type: "triangle", vol: 0.1 },
      ])
      break
    case "start":
      playNotes([
        { freq: 440, at: 0, dur: 0.08, vol: 0.08 },
        { freq: 554, at: 0.08, dur: 0.08, vol: 0.08 },
        { freq: 659, at: 0.16, dur: 0.08, vol: 0.08 },
        { freq: 880, at: 0.24, dur: 0.22, vol: 0.09 },
      ])
      break
    case "swap":
      playNotes([
        { freq: 660, at: 0, dur: 0.06, vol: 0.06 },
        { freq: 440, at: 0.07, dur: 0.08, vol: 0.06 },
      ])
      break
  }
}
