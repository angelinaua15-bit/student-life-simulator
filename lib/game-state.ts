"use client"

import { createClient } from "@/lib/supabase/client"
import { getStatusForLevel } from "@/lib/rewards-data"
import { generatePlayerId } from "./player-id-system"
import { checkAchievements } from "./achievements-tracker"

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
}

export async function loadGameState(): Promise<GameState | null> {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("evo-student-state")
    if (saved) {
      return JSON.parse(saved)
    }
  }

  return null
}

async function syncWithSupabase(): Promise<void> {
  const supabase = createClient()

  if (!supabase) {
    return
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    const { data: profile, error } = await supabase.from("player_profiles").select("*").eq("id", user.id).single()

    if (error || !profile) {
      return
    }

    // Update localStorage with Supabase data if it's newer
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("evo-student-state")
      if (saved) {
        const localState = JSON.parse(saved)
        const supabaseTime = new Date(profile.updated_at).getTime()
        if (supabaseTime > localState.lastPlayed) {
          // Supabase data is newer, update localStorage
          const syncedState: GameState = {
            playerId: profile.id,
            playerName: profile.nickname,
            stats: {
              stress: profile.stress,
              happiness: profile.happiness,
              energy: profile.energy,
              money: profile.coins,
              bankBalance: profile.bank_balance,
              level: profile.level,
              experience: profile.experience,
              experienceToNext: Math.floor(100 * Math.pow(1.5, profile.level - 1)),
            },
            completedEvents: profile.completed_events || [],
            achievements: profile.achievements || [],
            inventory: profile.inventory || [],
            lastPlayed: supabaseTime,
            totalPlayTime: profile.total_play_time,
            minigameHighScores: {
              cafe: profile.cafe_high_score,
              library: profile.library_high_score,
              carePackages: profile.care_packages_high_score,
            },
            settings: {
              soundEnabled: profile.sound_enabled,
              musicEnabled: profile.music_enabled,
              language: profile.language,
              graphicsQuality: profile.graphics_quality,
            },
            skin: profile.skin,
            status: profile.status,
            bio: profile.bio,
            faculty: profile.faculty,
            group: profile.group,
            social: profile.social,
            unclaimedRewards: profile.unclaimed_rewards,
            activeBoosters: profile.active_boosters,
            personalityType: profile.personality_type,
            eventCompletions: profile.event_completions,
            claimedEventRewards: profile.claimed_event_rewards,
            polytechnic3DProgress: {
              completedQuests: profile.polytechnic3d_completed_quests || [],
              collectedItems: profile.polytechnic3d_collected_items || [],
              visitedRooms: profile.polytechnic3d_visited_rooms || [],
            },
            skills: profile.skills,
            friends: profile.friends,
            innerVoiceHistory: profile.inner_voice_history || [],
            shadowStudent: {
              initialized: profile.shadow_student_initialized ?? false,
              challengesWon: profile.shadow_student_challenges_won ?? 0,
              challengesLost: profile.shadow_student_challenges_lost ?? 0,
              lastEncounter: profile.shadow_student_last_encounter ?? 0,
              currentChallengeId: profile.shadow_student_current_challenge_id,
            },
          }
          localStorage.setItem("evo-student-state", JSON.stringify(syncedState))
        }
      }
    }
  } catch (error: any) {
    // Silently fail - localStorage is the primary data source
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  const { newAchievements, updatedState } = checkAchievements(state)
  const stateToSave = newAchievements.length > 0 ? updatedState : state

  if (typeof window !== "undefined") {
    localStorage.setItem("evo-student-state", JSON.stringify(stateToSave))
  }

  const supabase = createClient()
  if (!supabase) {
    return
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser().catch(() => ({
      data: { user: null },
      error: new Error("Auth unavailable"),
    }))

    if (userError || !user) {
      return
    }

    const { error } = await supabase
      .from("player_profiles")
      .update({
        nickname: stateToSave.playerName,
        stress: Math.round(stateToSave.stats.stress * 100) / 100,
        happiness: Math.round(stateToSave.stats.happiness * 100) / 100,
        energy: Math.round(stateToSave.stats.energy * 100) / 100,
        coins: Math.floor(stateToSave.stats.money),
        bank_balance: Math.floor(stateToSave.stats.bankBalance),
        level: Math.floor(stateToSave.stats.level),
        experience: Math.floor(stateToSave.stats.experience),
        completed_events: stateToSave.completedEvents,
        achievements: stateToSave.achievements,
        inventory: stateToSave.inventory,
        total_play_time: Math.floor(stateToSave.totalPlayTime),
        cafe_high_score: Math.floor(stateToSave.minigameHighScores.cafe),
        library_high_score: Math.floor(stateToSave.minigameHighScores.library),
        care_packages_high_score: Math.floor(stateToSave.minigameHighScores.carePackages),
        sound_enabled: stateToSave.settings?.soundEnabled ?? true,
        music_enabled: stateToSave.settings?.musicEnabled ?? true,
        language: stateToSave.settings?.language ?? "ua",
        graphics_quality: stateToSave.settings?.graphicsQuality ?? "high",
        skin: stateToSave.skin ?? "default",
        status: stateToSave.status,
        bio: stateToSave.bio,
        faculty: stateToSave.faculty,
        group: stateToSave.group,
        social: stateToSave.social,
        unclaimed_rewards: stateToSave.unclaimedRewards,
        active_boosters: stateToSave.activeBoosters,
        personality_type: stateToSave.personalityType ?? "default",
        event_completions: stateToSave.eventCompletions,
        claimed_event_rewards: stateToSave.claimedEventRewards,
        polytechnic3d_completed_quests: stateToSave.polytechnic3DProgress?.completedQuests,
        polytechnic3d_collected_items: stateToSave.polytechnic3DProgress?.collectedItems,
        polytechnic3d_visited_rooms: stateToSave.polytechnic3DProgress?.visitedRooms,
        skills: stateToSave.skills,
        friends: stateToSave.friends,
        inner_voice_history: stateToSave.innerVoiceHistory,
        shadow_student_initialized: stateToSave.shadowStudent?.initialized ?? false,
        shadow_student_challenges_won: stateToSave.shadowStudent?.challengesWon ?? 0,
        shadow_student_challenges_lost: stateToSave.shadowStudent?.challengesLost ?? 0,
        shadow_student_last_encounter: stateToSave.shadowStudent?.lastEncounter ?? 0,
        shadow_student_current_challenge_id: stateToSave.shadowStudent?.currentChallengeId,
      })
      .eq("id", user.id)
  } catch (error: any) {
    // Silently ignore all errors
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
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("evo-student-state", JSON.stringify(newState))
  }

  const supabase = createClient()
  if (!supabase) {
    return newState
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser().catch(() => ({
      data: { user: null },
    }))

    if (user) {
      await supabase
        .from("player_profiles")
        .update({
          nickname: playerName,
          skin: skin,
          status: newState.status,
          unclaimed_rewards: newState.unclaimedRewards,
          active_boosters: newState.activeBoosters,
          personality_type: newState.personalityType,
          event_completions: newState.eventCompletions,
          claimed_event_rewards: newState.claimedEventRewards,
          polytechnic3d_completed_quests: newState.polytechnic3DProgress?.completedQuests,
          polytechnic3d_collected_items: newState.polytechnic3DProgress?.collectedItems,
          polytechnic3d_visited_rooms: newState.polytechnic3DProgress?.visitedRooms,
          skills: newState.skills,
          friends: newState.friends,
          inner_voice_history: newState.innerVoiceHistory,
          shadow_student_initialized: newState.shadowStudent?.initialized ?? false,
          shadow_student_challenges_won: newState.shadowStudent?.challengesWon ?? 0,
          shadow_student_challenges_lost: newState.shadowStudent?.challengesLost ?? 0,
          shadow_student_last_encounter: newState.shadowStudent?.lastEncounter ?? 0,
          shadow_student_current_challenge_id: newState.shadowStudent?.currentChallengeId,
          bio: newState.bio,
          faculty: newState.faculty,
          group: newState.group,
          social: newState.social,
        })
        .eq("id", user.id)
    }
  } catch (error) {
    // Silently ignore - localStorage is the source of truth
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
