"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"

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

export async function getFeedbackListAction(limit = 50): Promise<FeedbackItem[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      return []
    }

    return data as FeedbackItem[]
  } catch (err) {
    return []
  }
}

export async function submitFeedbackAction(feedback: {
  player_id: string
  player_name: string
  player_avatar: string
  rating: number
  message: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("feedback").insert({
      player_id: feedback.player_id,
      player_name: feedback.player_name,
      player_avatar: feedback.player_avatar,
      rating: feedback.rating,
      message: feedback.message,
      created_at: new Date().toISOString(),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: "Помилка підключення до бази даних" }
  }
}

export async function getLeaderboardAction(limit = 50): Promise<LeaderboardPlayer[]> {
  try {
    const supabase = await createServerClient()

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

export async function searchPlayersAction(query: string) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("player_profiles")
      .select("id, player_id, nickname, skin, level, status, bio, faculty, is_online, last_online")
      .or(`username_lowercase.ilike.%${query.toLowerCase()}%,player_id.ilike.%${query}%`)
      .limit(20)

    if (error || !data) return []

    return data.map((player) => ({
      id: player.id,
      player_id: player.player_id,
      nickname: player.nickname,
      level: player.level,
      status: player.status || "Студент",
      skin: player.skin || "default",
      bio: player.bio || "",
      faculty: player.faculty || "",
      group: "",
      is_online: player.is_online || false,
      last_online: player.last_online || new Date().toISOString(),
      total_play_time: 0,
      achievements: [],
      cafe_high_score: 0,
      library_high_score: 0,
      care_packages_high_score: 0,
    }))
  } catch (err) {
    return []
  }
}
