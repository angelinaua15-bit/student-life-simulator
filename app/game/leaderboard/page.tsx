"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, Crown, Trophy, Medal, Sparkles } from "lucide-react"
import Link from "next/link"

interface LeaderboardPlayer {
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

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    const supabase = createClient()

    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("leaderboard").select("*").limit(50)

      if (error) {
        console.error("[v0] Error loading leaderboard:", error)
      } else {
        setPlayers(data || [])
      }
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  function getRankDisplay(rank: number) {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 animate-pulse-glow" />
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  function getRankCardClass(rank: number) {
    if (rank === 1)
      return "border-yellow-500 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 shadow-xl shadow-yellow-500/50"
    if (rank === 2)
      return "border-gray-400 bg-gradient-to-r from-gray-400/20 to-gray-500/20 shadow-lg shadow-gray-400/30"
    if (rank === 3)
      return "border-orange-600 bg-gradient-to-r from-orange-600/20 to-orange-700/20 shadow-lg shadow-orange-600/30"
    return ""
  }

  function getSkinEmoji(skin: string) {
    const skins: Record<string, string> = {
      default: "🎓",
      casual: "👕",
      geek: "🤓",
      rich: "💼",
      business: "🎩",
      legend: "⭐",
      champion: "🏆",
      god_mode: "👑",
    }
    return skins[skin] || "🎓"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/game">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
            🏆 Таблиця Лідерів 🏆
          </h1>
          <p className="text-xl text-muted-foreground">Найкращі студенти EVO STUDENT</p>
        </div>

        {players.length === 0 ? (
          <div className="text-center">
            <GameCard title="Поки що порожньо" description="Стань першим в таблиці лідерів!">
              <div className="flex items-center justify-center py-8">
                <Sparkles className="w-16 h-16 text-muted-foreground" />
              </div>
            </GameCard>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {players.map((player, index) => {
              const rank = index + 1

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm bg-card/80 ${getRankCardClass(rank)} animate-slide-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">{getRankDisplay(rank)}</div>

                    {/* Avatar */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${rank <= 3 ? "ring-4 ring-offset-2" : "ring-2 ring-offset-1"} ${rank === 1 ? "ring-yellow-500" : rank === 2 ? "ring-gray-400" : rank === 3 ? "ring-orange-600" : "ring-primary"} bg-gradient-to-br from-primary/30 to-secondary/30`}
                    >
                      {getSkinEmoji(player.skin)}
                    </div>

                    {/* Player info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{player.nickname}</h3>
                        {rank <= 3 && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                            ТОП {rank}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">{player.status}</span>
                        <span>Рівень {player.level}</span>
                        <span>{player.coins} монет</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Очки</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {player.total_score}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
