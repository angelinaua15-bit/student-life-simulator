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
  // Simple hash-based UUID generation without btoa
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  const hex = Math.abs(hash).toString(16).padStart(32, "0")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

async function getCurrentUserId(): Promise<string | null> {
  if (typeof window === "undefined") return null

  const supabase = createClient()
  if (!supabase) {
    // Generate consistent UUID from localStorage playerId
    const state = localStorage.getItem("evo-student-state")
    if (state) {
      try {
        const parsed = JSON.parse(state)
        if (parsed.playerId) {
          return generateUUIDFromString(parsed.playerId)
        }
      } catch (error) {
        // Silent fail
      }
    }
    return null
  }

  // This code won't run since supabase is null, but keeping for future
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.id) return user.id
  } catch (error) {
    // Silent fail
  }

  return null
}

// === PLAYER PROFILE OPERATIONS ===

export async function syncPlayerProfile(gameState: GameState): Promise<void> {
  return

  /* Database sync disabled - game works with localStorage only
  const supabase = createClient()
  if (!supabase) return

  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    const profileData = {
      id: userId,
      player_id: gameState.playerId || "unknown",
      nickname: gameState.playerName,
      // ... rest of profile data
    }

    await supabase.from("player_profiles").upsert(profileData, { onConflict: "id" })
  } catch (error) {
    // Silent fail
  }
  */
}

export async function loadPlayerProfile(playerId: string): Promise<GameState | null> {
  return null

  /* Database loading disabled
  const supabase = createClient()
  if (!supabase) return null
  // ... rest of loading logic
  */
}

// === LEADERBOARD OPERATIONS ===

export async function getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
  const supabase = createClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from("player_profiles")
      .select("id, nickname, skin, level, experience, coins, status")
      .order("level", { ascending: false })
      .order("experience", { ascending: false })
      .order("coins", { ascending: false })
      .limit(limit)

    if (error) return []

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
    return []
  }
}

// === FRIENDS OPERATIONS ===

export async function searchPlayers(query: string): Promise<PlayerProfile[]> {
  return []
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Database not available" }
}

export async function getFriendsList(userId: string): Promise<Friendship[]> {
  return []
}

// === REWARDS OPERATIONS ===

export async function getLevelRewards() {
  return []
}
