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

export async function syncPlayerProfile(gameState: GameState): Promise<void> {
  try {
    const supabase = createClient()

    const profileData = {
      player_id: gameState.playerId || "",
      nickname: gameState.playerName,
      skin: gameState.skin || "default",
      level: gameState.stats.level,
      experience: gameState.stats.experience,
      coins: gameState.stats.money,
      bank_balance: gameState.stats.bankBalance,
      energy: gameState.stats.energy,
      happiness: gameState.stats.happiness,
      stress: gameState.stats.stress,
      status: gameState.status || "Новачок",
      bio: gameState.bio || "",
      faculty: gameState.faculty || "",
      group: gameState.group || "",
      social: gameState.social || "",
      achievements: gameState.achievements,
      inventory: gameState.inventory,
      completed_events: gameState.completedEvents,
      unclaimed_rewards: gameState.unclaimedRewards || [],
      cafe_high_score: gameState.minigameHighScores.cafe,
      library_high_score: gameState.minigameHighScores.library,
      care_packages_high_score: gameState.minigameHighScores.carePackages,
      skills: gameState.skills || {},
      friends: gameState.friends || [],
      inner_voice_history: gameState.innerVoiceHistory || [],
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("player_profiles").upsert(profileData, {
      onConflict: "player_id",
    })

    if (error) {
      console.error("Database sync error:", error)
    }
  } catch (err) {
    // Fail silently - game continues with localStorage
  }
}

export async function loadPlayerProfile(playerId: string): Promise<GameState | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("player_profiles").select("*").eq("player_id", playerId).single()

    if (error || !data) return null

    return {
      playerId: data.player_id,
      playerName: data.nickname,
      stats: {
        stress: data.stress,
        happiness: data.happiness,
        energy: data.energy,
        money: data.coins,
        bankBalance: data.bank_balance,
        level: data.level,
        experience: data.experience,
        experienceToNext: Math.floor(100 * Math.pow(1.5, data.level - 1)),
      },
      completedEvents: data.completed_events || [],
      achievements: data.achievements || [],
      inventory: data.inventory || [],
      lastPlayed: Date.now(),
      totalPlayTime: 0,
      minigameHighScores: {
        cafe: data.cafe_high_score || 0,
        library: data.library_high_score || 0,
        carePackages: data.care_packages_high_score || 0,
      },
      skin: data.skin,
      status: data.status,
      bio: data.bio,
      faculty: data.faculty,
      group: data.group,
      social: data.social,
      unclaimedRewards: data.unclaimed_rewards || [],
      skills: data.skills || {},
      friends: data.friends || [],
      innerVoiceHistory: data.inner_voice_history || [],
      shadowStudent: data.shadow_student_initialized
        ? {
            initialized: data.shadow_student_initialized,
            challengesWon: data.shadow_student_challenges_won || 0,
            challengesLost: data.shadow_student_challenges_lost || 0,
            lastEncounter: data.shadow_student_last_encounter || 0,
            currentChallengeId: data.shadow_student_current_challenge_id,
          }
        : undefined,
    } as GameState
  } catch (err) {
    return null
  }
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("player_profiles")
      .select("player_id, nickname, skin, level, experience, coins, status")
      .order("level", { ascending: false })
      .order("experience", { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return data.map((player) => ({
      id: player.player_id,
      nickname: player.nickname,
      skin: player.skin,
      level: player.level,
      experience: player.experience,
      coins: player.coins,
      status: player.status,
      total_score: player.level * 1000 + player.experience,
      updated_at: new Date().toISOString(),
    }))
  } catch (err) {
    return []
  }
}

export async function searchPlayers(query: string): Promise<PlayerProfile[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("player_profiles")
      .select("player_id, nickname, skin, level, status, bio, faculty")
      .or(`nickname.ilike.%${query}%,player_id.ilike.%${query}%`)
      .limit(20)

    if (error || !data) return []

    return data.map((player) => ({
      id: player.player_id,
      name: player.nickname,
      avatar: player.skin,
      level: player.level,
      status: player.status,
      bio: player.bio,
      faculty: player.faculty,
      friendshipLevel: 0,
    }))
  } catch (err) {
    return []
  }
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: "Помилка підключення до бази даних" }
  }
}

export async function getFriendsList(userId: string): Promise<Friendship[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("friendships")
      .select("*, player_profiles!friendships_player2_id_fkey(*)")
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)

    if (error || !data) return []

    return data.map((friendship) => {
      const friendProfile = friendship.player_profiles
      return {
        id: friendship.id,
        playerId: friendship.player2_id,
        playerName: friendProfile.nickname,
        avatar: friendProfile.skin,
        level: friendProfile.level,
        status: friendProfile.status,
        friendshipLevel: friendship.friendship_level || 1,
        lastInteraction: friendship.last_interaction,
      }
    })
  } catch (err) {
    return []
  }
}

export async function getLevelRewards() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("level_rewards").select("*").order("level", { ascending: true })

    if (error || !data) return []

    return data
  } catch (err) {
    return []
  }
}
