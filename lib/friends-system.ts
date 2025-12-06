import { loadGameState } from "@/lib/game-state"
import {
  searchPlayers as dbSearchPlayers,
  sendFriendRequest as dbSendFriendRequest,
  getFriendsList as dbGetFriendsList,
} from "@/lib/database"

export interface PlayerProfile {
  id: string
  player_id?: string
  nickname: string
  level: number
  status: string
  skin: string
  bio?: string
  faculty?: string
  group?: string
  is_online: boolean
  last_online: string
  total_play_time: number
  achievements: string[]
  cafe_high_score: number
  library_high_score: number
  care_packages_high_score: number
}

export interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  sender?: PlayerProfile
  receiver?: PlayerProfile
}

export interface Friendship {
  id: string
  player1_id: string
  player2_id: string
  friendship_level: number
  created_at: string
  last_interaction: string
  friend?: PlayerProfile
}

// Generate mock players for fallback
function generateMockPlayers(count: number): PlayerProfile[] {
  const nicknames = [
    "Олег_Програміст",
    "Марія_Дизайнерка",
    "Максим_Сусід",
    "Софія_Геймерка",
    "Андрій_Студент",
    "Катерина_Активна",
    "Володимир_Лідер",
    "Ірина_Творча",
  ]
  const statuses = ["Студент", "Програміст", "Дизайнер", "Геймер", "Активіст"]
  const skins = ["default", "cool", "fire", "nature", "cosmic", "golden", "neon", "sunset"]

  return Array.from({ length: count }, (_, i) => ({
    id: `mock-player-${i}`,
    player_id: `STU-${String(i).padStart(5, "0")}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
    nickname: nicknames[i % nicknames.length] + (i > 7 ? `_${i}` : ""),
    level: Math.floor(Math.random() * 20) + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    skin: skins[Math.floor(Math.random() * skins.length)],
    bio: "Привіт! Я граю в EVO STUDENT",
    is_online: Math.random() > 0.5,
    last_online: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_play_time: Math.floor(Math.random() * 1000),
    achievements: [],
    cafe_high_score: Math.floor(Math.random() * 100),
    library_high_score: Math.floor(Math.random() * 100),
    care_packages_high_score: Math.floor(Math.random() * 100),
  }))
}

// Search for players - now uses database
export async function searchPlayers(query: string): Promise<PlayerProfile[]> {
  try {
    const results = await dbSearchPlayers(query)

    if (results.length > 0) {
      return results
    }
  } catch (error) {
    console.error("Database search failed, using mock data")
  }

  // Fallback to mock data
  const mockPlayers = generateMockPlayers(12)

  if (query && query.trim().length > 0) {
    return mockPlayers.filter(
      (p) =>
        p.nickname.toLowerCase().includes(query.toLowerCase()) ||
        (p.player_id && p.player_id.toLowerCase().includes(query.toLowerCase())),
    )
  }

  return mockPlayers
}

// Get recommended players
export async function getRecommendedPlayers(): Promise<PlayerProfile[]> {
  try {
    const results = await dbSearchPlayers("")
    if (results.length > 0) {
      return results.slice(0, 6)
    }
  } catch (error) {
    console.error("Database load failed, using mock data")
  }

  return generateMockPlayers(6)
}

// Get active players
export async function getActivePlayers(): Promise<PlayerProfile[]> {
  try {
    const results = await dbSearchPlayers("")
    if (results.length > 0) {
      return results.slice(0, 8)
    }
  } catch (error) {
    console.error("Database load failed, using mock data")
  }

  return generateMockPlayers(8)
}

// Send friend request - now uses database
export async function sendFriendRequest(receiverId: string): Promise<{ success: boolean; error?: string }> {
  const gameState = await loadGameState()
  if (!gameState?.playerId) {
    return { success: false, error: "Увійдіть в систему" }
  }

  console.log("[v0] Sending friend request via database")
  return await dbSendFriendRequest(gameState.playerId, receiverId)
}

// Get friends list - now uses database
export async function getFriends(): Promise<Friendship[]> {
  const gameState = await loadGameState()
  if (!gameState?.playerId) {
    return []
  }

  try {
    // Try to get user ID and load from database
    const friends = await dbGetFriendsList(gameState.playerId)
    return friends
  } catch (error) {
    console.error("Failed to load friends from database")
    return []
  }
}

// Stub functions that need database implementation
export async function getIncomingRequests(): Promise<FriendRequest[]> {
  return []
}

export async function getOutgoingRequests(): Promise<FriendRequest[]> {
  return []
}

export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Not implemented" }
}

export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Not implemented" }
}

export async function removeFriend(friendshipId: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Not implemented" }
}

export async function areFriends(playerId: string): Promise<boolean> {
  const friends = await getFriends()
  return friends.some((f) => f.player2_id === playerId)
}

export async function searchPlayerByPlayerId(playerId: string): Promise<PlayerProfile | null> {
  console.log("[v0] Searching player by ID:", playerId)
  const results = await dbSearchPlayers(playerId)
  return results.length > 0 ? results[0] : null
}
