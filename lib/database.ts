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
  // Create a simple hash-based UUID v4-like string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }

  // Convert to hex and pad to create UUID format
  const hex = Math.abs(hash).toString(16).padStart(32, "0")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

// Get current user ID from localStorage
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null
  const state = localStorage.getItem("evo-student-state")
  if (!state) return null
  try {
    const parsed = JSON.parse(state)
    return parsed.playerId ? generateUUIDFromString(parsed.playerId) : null
  } catch {
    return null
  }
}

// === PLAYER PROFILE OPERATIONS ===

export async function syncPlayerProfile(gameState: GameState): Promise<void> {
  console.log("[v0] Database sync disabled - game works with localStorage only")
  return
}

export async function loadPlayerProfile(playerId: string): Promise<GameState | null> {
  console.log("[v0] Database loading disabled - game works with localStorage only")
  return null
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
  console.log("[v0] Database player search disabled - using mock data only")
  return []
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Database friend requests disabled - using local data only")
  return { success: false, error: "Database operations disabled" }
}

export async function getFriendsList(userId: string): Promise<Friendship[]> {
  console.log("[v0] Database friends loading disabled - using local data only")
  return []
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
