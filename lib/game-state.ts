"use client"

import { getStatusForLevel } from "@/lib/rewards-data"
import { generatePlayerId } from "./player-id-system"
import { checkAchievements } from "./achievements-tracker"
import { syncPlayerProfile, loadPlayerProfile } from "./database"

export interface GameStats {
  stress: number
  happiness: number
  energy: number
  money: number
  bankBalance: number
  level: number
  experience: number
  experienceToNext: number
}

export interface GameState {
  playerId?: string
  playerName: string
  stats: GameStats
  completedEvents: string[]
  achievements: string[]
  inventory: string[]
  lastPlayed: number
  totalPlayTime: number
  minigameHighScores: {
    cafe: number
    library: number
    carePackages: number
  }
  settings?: {
    soundEnabled: boolean
    musicEnabled: boolean
    language: string
    graphicsQuality: string
  }
  skin?: string
  status?: string
  bio?: string
  faculty?: string
  group?: string
  social?: string
  unclaimedRewards?: number[]
  activeBoosters?: {
    type: string
    multiplier: number
    expiresAt: number
  }[]
  personalityType?: string
  eventCompletions?: Record<string, number>
  claimedEventRewards?: string[]
  polytechnic3DProgress?: {
    completedQuests: string[]
    collectedItems: string[]
    visitedRooms: string[]
  }
  skills?: {
    charisma: number
    communication: number
    resilience: number
    creativity: number
    agility: number
    success: number
  }
  friends?: {
    id: string
    name: string
    friendshipLevel: number
  }[]
  innerVoiceHistory?: Array<{
    id: string
    text: string
    emotion: string
    timestamp: number
  }>
  shadowStudent?: {
    initialized: boolean
    challengesWon: number
    challengesLost: number
    lastEncounter: number
    currentChallengeId?: string
  }
  lastInterestClaim?: number
}

const DEFAULT_STATE: GameState = {
  playerId: undefined,
  playerName: "",
  stats: {
    stress: 30,
    happiness: 70,
    energy: 80,
    money: 100,
    bankBalance: 0,
    level: 1,
    experience: 0,
    experienceToNext: 100,
  },
  completedEvents: [],
  achievements: [],
  inventory: [],
  lastPlayed: Date.now(),
  totalPlayTime: 0,
  minigameHighScores: {
    cafe: 0,
    library: 0,
    carePackages: 0,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    language: "ua",
    graphicsQuality: "high",
  },
  skin: "default",
  status: "Новачок",
  bio: "",
  faculty: "",
  group: "",
  social: "",
  unclaimedRewards: [],
  activeBoosters: [],
  personalityType: "default",
  eventCompletions: {},
  claimedEventRewards: [],
  polytechnic3DProgress: {
    completedQuests: [],
    collectedItems: [],
    visitedRooms: [],
  },
  skills: {
    charisma: 0,
    communication: 0,
    resilience: 0,
    creativity: 0,
    agility: 0,
    success: 0,
  },
  friends: [],
  innerVoiceHistory: [],
  shadowStudent: {
    initialized: false,
    challengesWon: 0,
    challengesLost: 0,
    lastEncounter: 0,
  },
  lastInterestClaim: undefined,
}

export async function loadGameState(): Promise<GameState | null> {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("evo-student-state")
    if (saved) {
      const state = JSON.parse(saved)

      // Try to load from database if available
      try {
        const dbState = await loadPlayerProfile(state.playerId)
        if (dbState) {
          console.log("[v0] Loaded game state from database")
          // Merge with localStorage (localStorage takes priority for recent changes)
          const merged = { ...dbState, ...state }
          localStorage.setItem("evo-student-state", JSON.stringify(merged))
          return merged
        }
      } catch (error) {
        console.log("[v0] Could not load from database, using localStorage")
      }

      return state
    }
  }

  return null
}

export async function saveGameState(state: GameState): Promise<void> {
  const { newAchievements, updatedState } = checkAchievements(state)
  const stateToSave = newAchievements.length > 0 ? updatedState : state

  if (typeof window !== "undefined") {
    localStorage.setItem("evo-student-state", JSON.stringify(stateToSave))
  }

  // Sync to database in background (don't await to avoid blocking)
  syncPlayerProfile(stateToSave).catch((error) => {
    console.log("[v0] Background sync failed, game continues with localStorage")
  })
}

export async function createNewGame(playerName: string, skin = "default"): Promise<GameState> {
  const playerId = generatePlayerId()

  const newState = {
    ...DEFAULT_STATE,
    playerId,
    playerName,
    skin,
    lastPlayed: Date.now(),
    shadowStudent: {
      initialized: false,
      challengesWon: 0,
      challengesLost: 0,
      lastEncounter: 0,
    },
    lastInterestClaim: undefined,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("evo-student-state", JSON.stringify(newState))
  }

  // Sync to database in background
  syncPlayerProfile(newState).catch((error) => {
    console.log("[v0] Initial sync failed, game continues with localStorage")
  })

  return newState
}

export function updateStats(state: GameState, changes: Partial<GameStats>): GameState {
  const newStats = { ...state.stats }

  Object.keys(changes).forEach((key) => {
    const k = key as keyof GameStats
    if (typeof changes[k] === "number") {
      newStats[k] = changes[k] as any
    }
  })

  newStats.stress = Math.max(0, Math.min(100, newStats.stress))
  newStats.happiness = Math.max(0, Math.min(100, newStats.happiness))
  newStats.energy = Math.max(0, Math.min(100, newStats.energy))
  newStats.money = Math.max(0, newStats.money)
  newStats.bankBalance = Math.max(0, newStats.bankBalance)

  let { experience, experienceToNext, level } = newStats
  const oldLevel = level
  const unclaimedRewards = [...(state.unclaimedRewards || [])]

  while (experience >= experienceToNext) {
    experience -= experienceToNext
    level++
    experienceToNext = Math.floor(100 * Math.pow(1.5, level - 1))
    unclaimedRewards.push(level)
  }

  newStats.experience = experience
  newStats.level = level
  newStats.experienceToNext = experienceToNext

  const newStatus = getStatusForLevel(level)

  return {
    ...state,
    stats: newStats,
    status: newStatus,
    unclaimedRewards: unclaimedRewards,
  }
}

export function addExperience(state: GameState, amount: number): GameState {
  return updateStats(state, {
    experience: state.stats.experience + amount,
  })
}

export function addMoney(state: GameState, amount: number): GameState {
  return updateStats(state, {
    money: state.stats.money + amount,
  })
}
