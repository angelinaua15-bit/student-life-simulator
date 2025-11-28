import { createClient } from "@/lib/supabase/client"
import { loadGameState } from "@/lib/game-state"

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

// Mock data generator for offline mode
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
    player_id: `player-${i}`,
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

// Get localStorage friends data
function getLocalFriends() {
  if (typeof window === "undefined") return { requests: [], friendships: [] }
  const data = localStorage.getItem("evo_student_friends")
  if (!data) return { requests: [], friendships: [] }
  try {
    return JSON.parse(data)
  } catch {
    return { requests: [], friendships: [] }
  }
}

// Save localStorage friends data
function saveLocalFriends(data: any) {
  if (typeof window === "undefined") return
  localStorage.setItem("evo_student_friends", JSON.stringify(data))
}

// Helper function to safely get user without throwing errors
async function safeGetUser() {
  try {
    const supabase = createClient()
    if (!supabase) return null

    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.log("[v0] Auth error (expected if not logged in):", error.message)
      return null
    }
    return data?.user || null
  } catch (error) {
    console.log("[v0] Failed to get user, continuing without auth")
    return null
  }
}

// Search for players
export async function searchPlayers(query: string): Promise<PlayerProfile[]> {
  console.log("[v0] Searching for:", query)
  const supabase = createClient()

  if (supabase) {
    try {
      const user = await safeGetUser()

      let searchQuery = supabase
        .from("player_profiles")
        .select(
          "id, player_id, nickname, level, status, skin, bio, faculty, group, is_online, last_online, total_play_time, achievements, cafe_high_score, library_high_score, care_packages_high_score",
        )

      // Exclude current user if authenticated
      if (user) {
        searchQuery = searchQuery.neq("id", user.id)
      }

      // Add search filter if query provided
      if (query && query.trim().length > 0) {
        searchQuery = searchQuery.or(`nickname.ilike.%${query}%,player_id.ilike.%${query}%`)
      }

      const { data, error } = await searchQuery
        .order("is_online", { ascending: false })
        .order("last_online", { ascending: false })
        .limit(20)

      if (error) {
        console.error("[v0] Supabase search error:", error)
      } else if (data) {
        console.log("[v0] Found real players from Supabase:", data.length)
        return data
      }
    } catch (error) {
      console.error("[v0] Supabase search failed:", error)
    }
  }

  console.log("[v0] Using mock data for search")
  const mockPlayers = generateMockPlayers(12)

  // Filter by query if provided
  if (query && query.trim().length > 0) {
    const filtered = mockPlayers.filter(
      (p) =>
        p.nickname.toLowerCase().includes(query.toLowerCase()) ||
        (p.player_id && p.player_id.toLowerCase().includes(query.toLowerCase())),
    )
    console.log("[v0] Mock filtered results:", filtered.length)
    return filtered
  }

  // Return all mock players if no query
  console.log("[v0] Returning all mock players:", mockPlayers.length)
  return mockPlayers
}

// Get recommended players (similar level, active)
export async function getRecommendedPlayers(): Promise<PlayerProfile[]> {
  const supabase = createClient()

  if (supabase) {
    try {
      const user = await safeGetUser()

      let query = supabase
        .from("player_profiles")
        .select(
          "id, player_id, nickname, level, status, skin, bio, faculty, group, is_online, last_online, total_play_time, achievements, cafe_high_score, library_high_score, care_packages_high_score",
        )
        .order("total_play_time", { ascending: false })
        .limit(10)

      if (user) {
        // Get current user level for similar level matching
        const { data: currentUser } = await supabase.from("player_profiles").select("level").eq("id", user.id).single()

        if (currentUser) {
          query = query
            .neq("id", user.id)
            .gte("level", Math.max(1, currentUser.level - 5))
            .lte("level", currentUser.level + 5)
        } else {
          query = query.neq("id", user.id)
        }
      }

      const { data, error } = await query

      if (!error && data && data.length > 0) {
        console.log("[v0] Found recommended players from Supabase:", data.length)
        return data
      }
    } catch (error) {
      console.log("[v0] Supabase recommended failed:", error)
    }
  }

  // Fallback to mock data
  console.log("[v0] Using mock data for recommendations")
  return generateMockPlayers(6)
}

// Get active players (most recent)
export async function getActivePlayers(): Promise<PlayerProfile[]> {
  const supabase = createClient()

  if (supabase) {
    try {
      const user = await safeGetUser()

      let query = supabase
        .from("player_profiles")
        .select(
          "id, player_id, nickname, level, status, skin, bio, faculty, group, is_online, last_online, total_play_time, achievements, cafe_high_score, library_high_score, care_packages_high_score",
        )
        .order("last_online", { ascending: false })
        .limit(12)

      if (user) {
        query = query.neq("id", user.id)
      }

      const { data, error } = await query

      if (!error && data && data.length > 0) {
        console.log("[v0] Found active players from Supabase:", data.length)
        return data
      }
    } catch (error) {
      console.log("[v0] Supabase active players failed:", error)
    }
  }

  // Fallback to mock data
  console.log("[v0] Using mock data for active players")
  return generateMockPlayers(8)
}

// Send friend request
export async function sendFriendRequest(receiverId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Try Supabase first
  if (supabase) {
    try {
      const user = await safeGetUser()
      if (user) {
        // Check if request already exists
        const { data: existing } = await supabase
          .from("friend_requests")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`,
          )
          .single()

        if (existing) {
          return { success: false, error: "Запит вже існує" }
        }

        const { error } = await supabase.from("friend_requests").insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: "pending",
        })

        if (!error) return { success: true }
      }
    } catch (error: any) {
      console.log("[v0] Supabase send request failed, using localStorage")
    }
  }

  const localData = getLocalFriends()
  const gameState = await loadGameState()
  const currentUserId = gameState?.profile?.nickname || "local-user"

  // Check if request already exists
  const existing = localData.requests.find(
    (r: any) =>
      (r.sender_id === currentUserId && r.receiver_id === receiverId) ||
      (r.sender_id === receiverId && r.receiver_id === currentUserId),
  )

  if (existing) {
    return { success: false, error: "Запит вже існує" }
  }

  localData.requests.push({
    id: `req-${Date.now()}`,
    sender_id: currentUserId,
    receiver_id: receiverId,
    status: "pending",
    created_at: new Date().toISOString(),
  })

  saveLocalFriends(localData)
  return { success: true }
}

// Get incoming friend requests
export async function getIncomingRequests(): Promise<FriendRequest[]> {
  const supabase = createClient()

  // Try Supabase first
  if (supabase) {
    try {
      const user = await safeGetUser()
      if (user) {
        const { data, error } = await supabase
          .from("friend_requests")
          .select(`
            *,
            sender:player_profiles!friend_requests_sender_id_fkey(id, nickname, level, status, skin, is_online, last_online)
          `)
          .eq("receiver_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (!error && data) return data
      }
    } catch (error) {
      console.log("[v0] Supabase incoming requests failed, using localStorage")
    }
  }

  // Fallback to localStorage with mock data
  return []
}

// Get outgoing friend requests
export async function getOutgoingRequests(): Promise<FriendRequest[]> {
  const supabase = createClient()
  if (!supabase) return []

  try {
    const user = await safeGetUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("friend_requests")
      .select(`
        *,
        receiver:player_profiles!friend_requests_receiver_id_fkey(id, nickname, level, status, skin, is_online, last_online)
      `)
      .eq("sender_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error getting outgoing requests:", error)
    return []
  }
}

// Accept friend request
export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Try Supabase first
  if (supabase) {
    try {
      const user = await safeGetUser()
      if (user) {
        const { data: request, error: requestError } = await supabase
          .from("friend_requests")
          .select("*")
          .eq("id", requestId)
          .eq("receiver_id", user.id)
          .single()

        if (!requestError && request) {
          await supabase
            .from("friend_requests")
            .update({ status: "accepted", updated_at: new Date().toISOString() })
            .eq("id", requestId)

          const [player1, player2] = [request.sender_id, user.id].sort()
          await supabase.from("friendships").insert({
            player1_id: player1,
            player2_id: player2,
            friendship_level: 1,
          })

          return { success: true }
        }
      }
    } catch (error: any) {
      console.log("[v0] Supabase accept failed, using localStorage")
    }
  }

  const localData = getLocalFriends()
  const request = localData.requests.find((r: any) => r.id === requestId)

  if (request) {
    request.status = "accepted"
    localData.friendships.push({
      id: `friend-${Date.now()}`,
      player1_id: request.sender_id,
      player2_id: request.receiver_id,
      friendship_level: 1,
      created_at: new Date().toISOString(),
      last_interaction: new Date().toISOString(),
    })
    saveLocalFriends(localData)
    return { success: true }
  }

  return { success: false, error: "Запит не знайдено" }
}

// Reject friend request
export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  try {
    const user = await safeGetUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .eq("receiver_id", user.id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error rejecting friend request:", error)
    return { success: false, error: error.message }
  }
}

// Get friends list
export async function getFriends(): Promise<Friendship[]> {
  console.log("[v0] Getting friends list...")
  const supabase = createClient()

  if (supabase) {
    try {
      const user = await safeGetUser()

      if (user) {
        console.log("[v0] Fetching friends for user:", user.id)
        const { data, error } = await supabase
          .from("friendships")
          .select(`
            *,
            player1:player_profiles!friendships_player1_id_fkey(id, player_id, nickname, level, status, skin, bio, is_online, last_online),
            player2:player_profiles!friendships_player2_id_fkey(id, player_id, nickname, level, status, skin, bio, is_online, last_online)
          `)
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .order("last_interaction", { ascending: false })

        if (error) {
          console.error("[v0] Supabase friends error:", error)
        } else if (data) {
          console.log("[v0] Found friends from Supabase:", data.length)
          // Map to include the friend profile
          return data.map((friendship: any) => ({
            ...friendship,
            friend: friendship.player1_id === user.id ? friendship.player2 : friendship.player1,
          }))
        }
      } else {
        console.log("[v0] No authenticated user")
      }
    } catch (error) {
      console.error("[v0] Error getting friends from Supabase:", error)
    }
  } else {
    console.log("[v0] Supabase not configured")
  }

  console.log("[v0] Using localStorage for friends")
  const localData = getLocalFriends()
  const gameState = await loadGameState()
  const currentUserId = gameState?.profile?.nickname || "local-user"

  // Generate mock friends for demo
  const mockFriends = localData.friendships
    .filter((f: any) => f.player1_id === currentUserId || f.player2_id === currentUserId)
    .map((f: any, index: number) => {
      const mockPlayers = generateMockPlayers(1)
      return {
        ...f,
        friend: mockPlayers[0],
      }
    })

  console.log("[v0] Returning mock friends:", mockFriends.length)
  return mockFriends
}

// Remove friend
export async function removeFriend(friendshipId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  try {
    const user = await safeGetUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error removing friend:", error)
    return { success: false, error: error.message }
  }
}

// Check if players are friends
export async function areFriends(playerId: string): Promise<boolean> {
  const supabase = createClient()

  // Try Supabase first
  if (supabase) {
    try {
      const user = await safeGetUser()
      if (user) {
        const [player1, player2] = [user.id, playerId].sort()

        const { data, error } = await supabase
          .from("friendships")
          .select("id")
          .eq("player1_id", player1)
          .eq("player2_id", player2)
          .maybeSingle()

        // If error or no data, they're not friends
        if (error) {
          console.log("[v0] Error checking friendship:", error.message)
          return false
        }

        return !!data
      }
    } catch (error) {
      console.log("[v0] Exception checking friendship:", error)
      return false
    }
  }

  // Fallback to localStorage
  const localData = getLocalFriends()
  const gameState = await loadGameState()
  const currentUserId = gameState?.profile?.nickname || "local-user"

  return localData.friendships.some(
    (f: any) =>
      (f.player1_id === currentUserId && f.player2_id === playerId) ||
      (f.player1_id === playerId && f.player2_id === currentUserId),
  )
}

export async function searchPlayerByPlayerId(playerId: string): Promise<PlayerProfile | null> {
  const supabase = createClient()

  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("player_profiles")
        .select(
          "id, player_id, nickname, level, status, skin, bio, faculty, group, is_online, last_online, total_play_time, achievements, cafe_high_score, library_high_score, care_packages_high_score",
        )
        .eq("player_id", playerId)
        .single()

      if (!error && data) return data
    } catch (error) {
      console.log("[v0] Supabase search by ID failed")
    }
  }

  // Fallback to mock data for demo
  const mockPlayers = generateMockPlayers(1)
  if (mockPlayers.length > 0) {
    return { ...mockPlayers[0], player_id: playerId }
  }

  return null
}
