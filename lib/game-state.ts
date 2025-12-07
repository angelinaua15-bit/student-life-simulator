"use client"

import { getStatusForLevel } from "@/lib/rewards-data"
import { generatePlayerId } from "./player-id-system"
import { checkAchievements } from "./achievements-tracker"
import { getUserProfile } from "./auth-actions"

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
    try {
      const profile = await getUserProfile()
      if (profile) {
        const state: GameState = {
          playerId: profile.player_id || profile.id,
          playerName: profile.nickname || "Student",
          stats: {
            stress: profile.stress || 30,
            happiness: profile.happiness || 70,
            energy: profile.energy || 80,
            money: profile.coins || 100,
            bankBalance: profile.bank_balance || 0,
            level: profile.level || 1,
            experience: profile.experience || 0,
            experienceToNext: Math.floor(100 * Math.pow(1.5, (profile.level || 1) - 1)),
          },
          completedEvents: profile.completed_events || [],
          achievements: profile.achievements || [],
          inventory: profile.inventory || [],
          lastPlayed: Date.now(),
          totalPlayTime: profile.total_play_time || 0,
          minigameHighScores: {
            cafe: profile.cafe_high_score || 0,
            library: profile.library_high_score || 0,
            carePackages: profile.care_packages_high_score || 0,
          },
          settings: {
            soundEnabled: profile.sound_enabled ?? true,
            musicEnabled: profile.music_enabled ?? true,
            language: profile.language || "ua",
            graphicsQuality: profile.graphics_quality || "high",
          },
          skin: profile.skin || "default",
          status: profile.status || "Новачок",
          bio: profile.bio || "",
          faculty: profile.faculty || "",
          group: profile.group || "",
          social: profile.social || "",
          unclaimedRewards: profile.unclaimed_rewards || [],
          activeBoosters: profile.active_boosters || [],
          personalityType: profile.personality_type || "default",
          eventCompletions: profile.event_completions || {},
          claimedEventRewards: profile.claimed_event_rewards || [],
          polytechnic3DProgress: {
            completedQuests: profile.polytechnic3d_completed_quests || [],
            collectedItems: profile.polytechnic3d_collected_items || [],
            visitedRooms: profile.polytechnic3d_visited_rooms || [],
          },
          skills: profile.skills || {
            charisma: 0,
            communication: 0,
            resilience: 0,
            creativity: 0,
            agility: 0,
            success: 0,
          },
          friends: profile.friends || [],
          innerVoiceHistory: profile.inner_voice_history || [],
          shadowStudent: {
            initialized: profile.shadow_student_initialized || false,
            challengesWon: profile.shadow_student_challenges_won || 0,
            challengesLost: profile.shadow_student_challenges_lost || 0,
            lastEncounter: profile.shadow_student_last_encounter || 0,
            currentChallengeId: profile.shadow_student_current_challenge_id,
          },
          lastInterestClaim: profile.last_interest_claim || undefined,
        }

        localStorage.setItem("evo-student-state", JSON.stringify(state))
        return state
      }
    } catch (error) {
      console.error("[v0] Error loading from Supabase, falling back to localStorage:", error)
    }

    const saved = localStorage.getItem("evo-student-state")
    if (saved) {
      return JSON.parse(saved)
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

  try {
    const { syncGameStateToSupabase } = await import("./database-actions")
    await syncGameStateToSupabase(stateToSave)
  } catch (error) {
    console.error("[v0] Failed to sync to Supabase:", error)
  }
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
