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

// === ALL DATABASE FUNCTIONS DISABLED ===
// Game works entirely with localStorage and mock data

export async function syncPlayerProfile(gameState: GameState): Promise<void> {
  return
}

export async function loadPlayerProfile(playerId: string): Promise<GameState | null> {
  return null
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
  return []
}

export async function searchPlayers(query: string): Promise<PlayerProfile[]> {
  return []
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Функція тимчасово недоступна" }
}

export async function getFriendsList(userId: string): Promise<Friendship[]> {
  return []
}

export async function getLevelRewards() {
  return []
}
