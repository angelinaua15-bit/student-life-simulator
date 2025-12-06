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

export interface FeedbackItem {
  id: string
  player_id: string
  player_name: string
  player_avatar: string
  rating: number
  message: string
  created_at: string
}

// @deprecated Use Server Actions from @/lib/database-actions instead
export async function syncPlayerProfile(gameState: GameState): Promise<void> {
  console.warn("[v0] syncPlayerProfile is deprecated. Database operations disabled to prevent btoa errors.")
  return
}

// @deprecated Use Server Actions from @/lib/database-actions instead
export async function loadPlayerProfile(playerId: string): Promise<GameState | null> {
  console.warn("[v0] loadPlayerProfile is deprecated. Database operations disabled to prevent btoa errors.")
  return null
}

// @deprecated Use getLeaderboardAction from @/lib/database-actions instead
export async function getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
  console.warn("[v0] getLeaderboard is deprecated. Use getLeaderboardAction instead.")
  return []
}

// @deprecated Use searchPlayersAction from @/lib/database-actions instead
export async function searchPlayers(query: string): Promise<PlayerProfile[]> {
  console.warn("[v0] searchPlayers is deprecated. Use searchPlayersAction instead.")
  return []
}

// @deprecated Use Server Actions from @/lib/database-actions instead
export async function getFriendsList(userId: string): Promise<Friendship[]> {
  console.warn("[v0] getFriendsList is deprecated. Database operations disabled to prevent btoa errors.")
  return []
}

// @deprecated Use Server Actions from @/lib/database-actions instead
export async function getLevelRewards() {
  console.warn("[v0] getLevelRewards is deprecated. Database operations disabled to prevent btoa errors.")
  return []
}

// @deprecated Use Server Actions from @/lib/database-actions instead
export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<{ success: boolean; error?: string }> {
  console.warn("[v0] sendFriendRequest is deprecated. Database operations disabled to prevent btoa errors.")
  return { success: false, error: "Database operations disabled" }
}

// @deprecated Use getFeedbackListAction from @/lib/database-actions instead
export async function getFeedbackList(limit = 50): Promise<FeedbackItem[]> {
  console.warn("[v0] getFeedbackList is deprecated. Use getFeedbackListAction instead.")
  return []
}

// @deprecated Use submitFeedbackAction from @/lib/database-actions instead
export async function submitFeedback(feedback: {
  player_id: string
  player_name: string
  player_avatar: string
  rating: number
  message: string
}): Promise<{ success: boolean; error?: string }> {
  console.warn("[v0] submitFeedback is deprecated. Use submitFeedbackAction instead.")
  return { success: false, error: "Database operations disabled" }
}
