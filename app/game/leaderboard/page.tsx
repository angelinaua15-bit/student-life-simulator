"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, Crown, Trophy, Medal, Sparkles } from "lucide-react"
import Link from "next/link"
import { getLeaderboard, type LeaderboardPlayer } from "@/lib/database"
import { loadGameState } from "@/lib/game-state"

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    setLoading(true)
    console.log("[v0] Loading leaderboard from database...")
    const data = await getLeaderboard(50)

    console.log("[v0] Leaderboard data received:", data.length)

    if (data.length === 0) {
      const gameState = await loadGameState()
      if (gameState?.playerId) {
        console.log("[v0] Adding current player to empty leaderboard")
        setPlayers([
          {
            id: gameState.playerId,
            nickname: gameState.playerName,
            skin: gameState.skin || "default",
            level: gameState.stats.level,
            experience: gameState.stats.experience,
            coins: gameState.stats.money,
            status: gameState.status || "Новачок",
            total_score: gameState.stats.level * 1000 + gameState.stats.experience + gameState.stats.money,
            updated_at: new Date().toISOString(),
          },
        ])
      } else {
        setPlayers([])
      }
    } else {
      setPlayers(data)
    }

    setLoading(false)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="text-center">
          <Trophy className="w-16 h-16 animate-bounce mx-auto mb-4 text-primary" />
          <p className="text-xl">Завантаження таблиці лідерів...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/game">
            <Button variant="outline" size="sm" className="rounded-full bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Таблиця Лідерів
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
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm bg-card/80 ${rank <= 3 ? "border-primary/30 shadow-lg" : "border-border"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {rank === 1 && <Crown className="w-6 h-6 text-yellow-500" />}
                      {rank === 2 && <Trophy className="w-6 h-6 text-gray-400" />}
                      {rank === 3 && <Medal className="w-6 h-6 text-orange-600" />}
                      {rank > 3 && <span className="text-lg font-bold text-muted-foreground">#{rank}</span>}
                    </div>

                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ring-2 ring-offset-2 ${rank === 1 ? "ring-yellow-500" : rank === 2 ? "ring-gray-400" : rank === 3 ? "ring-orange-600" : "ring-primary"} bg-gradient-to-br from-primary/20 to-secondary/20`}
                    >
                      {getSkinEmoji(player.skin)}
                    </div>

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
                        <span>{player.coins} грн</span>
                      </div>
                    </div>

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
