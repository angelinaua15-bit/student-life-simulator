import { createClient } from "@/lib/supabase/client"
import type { GameState } from "@/lib/game-state"
import type { PlayerProfile, Friendship } from "@/lib/friends-system"

export interface LeaderboardPlayer {
  id: string
  nickname: string
  skin: string
  level: number
  experience: number
  coins: number
  status: string
  total_score: number
  updated_at: string
}

function generateUUIDFromString(str: string): string {
  // Use TextEncoder to safely handle UTF-8 characters (including Cyrillic)
  const encoder = new TextEncoder()
  const data = encoder.encode(str)

  // Create hash from UTF-8 bytes
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data[i]) | 0
  }

  // Convert to hex and create UUID format
  const hex = Math.abs(hash).toString(16).padStart(32, "0")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

async function getCurrentUserId(): Promise<string | null> {
  if (typeof window === "undefined") return null

  // Try to get authenticated user from Supabase
  const supabase = createClient()
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) {
        console.log("[v0] Using authenticated user ID:", user.id)
        return user.id
      }
    } catch (error) {
      console.log("[v0] No authenticated user, using localStorage")
    }
  }

  // Fallback to localStorage playerId
  const state = localStorage.getItem("evo-student-state")
  if (!state) return null

  try {
    const parsed = JSON.parse(state)
    if (parsed.playerId) {
      const uuid = generateUUIDFromString(parsed.playerId)
      console.log("[v0] Generated UUID from playerId:", uuid)
      return uuid
    }
  } catch (error) {
    console.error("[v0] Error parsing localStorage state:", error)
  }

  return null
}

// === PLAYER PROFILE OPERATIONS ===

export async function syncPlayerProfile(gameState: GameState): Promise<void> {
  const supabase = createClient()
  if (!supabase) {
    console.log("[v0] Supabase client not available, skipping sync")
    return
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      console.log("[v0] No user ID available, skipping profile sync")
      return
    }

    console.log("[v0] Syncing profile for user:", userId)

    const profileData = {
      id: userId,
      player_id: gameState.playerId || "unknown",
      nickname: gameState.playerName,
      skin: gameState.skin || "default",
      bio: gameState.bio || "",
      faculty: gameState.faculty || "",
      group: gameState.group || "",
      social: gameState.social || "",
      level: gameState.stats.level,
      experience: gameState.stats.experience,
      coins: gameState.stats.money,
      bank_balance: gameState.stats.bankBalance,
      energy: gameState.stats.energy,
      happiness: gameState.stats.happiness,
      stress: gameState.stats.stress,
      status: gameState.status || "Новачок",
      personality_type: gameState.personalityType || "default",
      achievements: gameState.achievements || [],
      inventory: gameState.inventory || [],
      completed_events: gameState.completedEvents || [],
      claimed_event_rewards: gameState.claimedEventRewards || [],
      polytechnic3d_completed_quests: gameState.polytechnic3DProgress?.completedQuests || [],
      polytechnic3d_collected_items: gameState.polytechnic3DProgress?.collectedItems || [],
      polytechnic3d_visited_rooms: gameState.polytechnic3DProgress?.visitedRooms || [],
      cafe_high_score: gameState.minigameHighScores?.cafe || 0,
      library_high_score: gameState.minigameHighScores?.library || 0,
      care_packages_high_score: gameState.minigameHighScores?.carePackages || 0,
      sound_enabled: gameState.settings?.soundEnabled ?? true,
      music_enabled: gameState.settings?.musicEnabled ?? true,
      language: gameState.settings?.language || "ua",
      graphics_quality: gameState.settings?.graphicsQuality || "high",
      total_play_time: gameState.totalPlayTime || 0,
      skills: gameState.skills || {},
      friends: gameState.friends || [],
      inner_voice_history: gameState.innerVoiceHistory || [],
      shadow_student_initialized: gameState.shadowStudent?.initialized ?? false,
      shadow_student_challenges_won: gameState.shadowStudent?.challengesWon || 0,
      shadow_student_challenges_lost: gameState.shadowStudent?.challengesLost || 0,
      shadow_student_last_encounter: gameState.shadowStudent?.lastEncounter || 0,
      shadow_student_current_challenge_id: gameState.shadowStudent?.currentChallengeId || null,
      last_interest_claim: gameState.lastInterestClaim || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("player_profiles").upsert(profileData, { onConflict: "id" })

    if (error) {
      console.error("[v0] Error syncing profile:", error.message)
      // Don't throw - let game continue with localStorage
    } else {
      console.log("[v0] Profile synced successfully")
    }
  } catch (error: any) {
    console.error("[v0] Error in syncPlayerProfile:", error?.message || error)
    // Don't throw - let game continue
  }
}

export async function loadPlayerProfile(playerId: string): Promise<GameState | null> {
  const supabase = createClient()
  if (!supabase) {
    console.log("[v0] Supabase client not available")
    return null
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      console.log("[v0] No user ID available for loading profile")
      return null
    }

    console.log("[v0] Loading profile for user:", userId)

    const { data, error } = await supabase.from("player_profiles").select("*").eq("id", userId).single()

    if (error) {
      console.log("[v0] No profile found in database:", error.message)
      return null
    }

    if (!data) {
      console.log("[v0] No profile data returned")
      return null
    }

    console.log("[v0] Profile loaded from database")

    // Convert database format to GameState
    return {
      playerId: data.player_id,
      playerName: data.nickname,
      skin: data.skin,
      status: data.status,
      bio: data.bio,
      faculty: data.faculty,
      group: data.group,
      social: data.social,
      stats: {
        level: data.level,
        experience: data.experience,
        experienceToNext: Math.floor(100 * Math.pow(1.5, data.level - 1)),
        money: data.coins,
        bankBalance: data.bank_balance,
        energy: data.energy,
        happiness: data.happiness,
        stress: data.stress,
      },
      completedEvents: data.completed_events || [],
      achievements: data.achievements || [],
      inventory: data.inventory || [],
      lastPlayed: Date.now(),
      totalPlayTime: data.total_play_time || 0,
      minigameHighScores: {
        cafe: data.cafe_high_score || 0,
        library: data.library_high_score || 0,
        carePackages: data.care_packages_high_score || 0,
      },
      settings: {
        soundEnabled: data.sound_enabled ?? true,
        musicEnabled: data.music_enabled ?? true,
        language: data.language || "ua",
        graphicsQuality: data.graphics_quality || "high",
      },
      personalityType: data.personality_type,
      unclaimedRewards: [],
      activeBoosters: [],
      eventCompletions: data.event_completions || {},
      claimedEventRewards: data.claimed_event_rewards || [],
      polytechnic3DProgress: {
        completedQuests: data.polytechnic3d_completed_quests || [],
        collectedItems: data.polytechnic3d_collected_items || [],
        visitedRooms: data.polytechnic3d_visited_rooms || [],
      },
      skills: data.skills || {
        charisma: 0,
        communication: 0,
        resilience: 0,
        creativity: 0,
        agility: 0,
        success: 0,
      },
      friends: data.friends || [],
      innerVoiceHistory: data.inner_voice_history || [],
      shadowStudent: {
        initialized: data.shadow_student_initialized ?? false,
        challengesWon: data.shadow_student_challenges_won || 0,
        challengesLost: data.shadow_student_challenges_lost || 0,
        lastEncounter: data.shadow_student_last_encounter || 0,
        currentChallengeId: data.shadow_student_current_challenge_id,
      },
      lastInterestClaim: data.last_interest_claim,
    }
  } catch (error: any) {
    console.error("[v0] Error loading profile:", error?.message || error)
    return null
  }
}

// === LEADERBOARD OPERATIONS ===

export async function getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
  const supabase = createClient()
  if (!supabase) {
    console.log("[v0] No Supabase client, returning empty leaderboard")
    return []
  }

  try {
    console.log("[v0] Fetching leaderboard from database...")
    const { data, error } = await supabase
      .from("player_profiles")
      .select("id, nickname, skin, level, experience, coins, status")
      .order("level", { ascending: false })
      .order("experience", { ascending: false })
      .order("coins", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error loading leaderboard:", error)
      return []
    }

    console.log("[v0] Leaderboard data fetched:", data?.length || 0, "players")

    return (
      data?.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        skin: p.skin,
        level: p.level,
        experience: p.experience,
        coins: p.coins,
        status: p.status,
        total_score: p.level * 1000 + p.experience + p.coins,
        updated_at: new Date().toISOString(),
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error in getLeaderboard:", error)
    return []
  }
}

// === FRIENDS OPERATIONS ===

export async function searchPlayers(query: string): Promise<PlayerProfile[]> {
  const supabase = createClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from("player_profiles")
      .select("id, player_id, nickname, skin, level, status, bio")
      .ilike("nickname", `%${query}%`)
      .limit(10)

    if (error) {
      console.error("[v0] Error searching players:", error)
      return []
    }

    return (
      data?.map((p) => ({
        id: p.id,
        playerId: p.player_id,
        name: p.nickname,
        skin: p.skin,
        level: p.level,
        status: p.status,
        bio: p.bio || "",
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error in searchPlayers:", error)
    return []
  }
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { success: false, error: "Database not available" }
  }

  try {
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error sending friend request:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error in sendFriendRequest:", error)
    return { success: false, error: error?.message || "Unknown error" }
  }
}

export async function getFriendsList(userId: string): Promise<Friendship[]> {
  const supabase = createClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from("friendships")
      .select("*, player_profiles!friendships_player2_id_fkey(nickname, skin, level)")
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)

    if (error) {
      console.error("[v0] Error loading friends:", error)
      return []
    }

    return (
      data?.map((f: any) => ({
        id: f.id,
        player1Id: f.player1_id,
        player2Id: f.player2_id,
        friendshipLevel: f.friendship_level,
        lastInteraction: f.last_interaction,
        player2Name: f.player_profiles?.nickname || "Unknown",
        player2Skin: f.player_profiles?.skin || "default",
        player2Level: f.player_profiles?.level || 1,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error in getFriendsList:", error)
    return []
  }
}

// === REWARDS OPERATIONS ===

export async function getLevelRewards() {
  const supabase = createClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase.from("level_rewards").select("*").order("level", { ascending: true })

    if (error) {
      console.error("[v0] Error loading rewards:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getLevelRewards:", error)
    return []
  }
}
