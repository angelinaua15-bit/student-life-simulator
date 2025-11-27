"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, type GameState } from "@/lib/game-state"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Gift, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { RARITY_COLORS, RARITY_GLOW, type Reward } from "@/lib/rewards-data"

export default function RewardsPage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const state = await loadGameState()
    if (!state) {
      router.push("/")
      return
    }
    setGameState(state)

    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("level_rewards").select("*").order("level", { ascending: true })

      if (error) {
        console.error("[v0] Error loading rewards:", error)
      } else {
        const formattedRewards: Reward[] = (data || []).map((r: any) => ({
          id: r.id,
          level: r.level,
          rewardType: r.reward_type,
          rewardValue: typeof r.reward_value === "string" ? JSON.parse(r.reward_value) : r.reward_value,
          rewardName: r.reward_name,
          rewardDescription: r.reward_description,
          rarity: r.rarity,
        }))
        setRewards(formattedRewards)
      }
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  function getRewardIcon(type: string) {
    switch (type) {
      case "coins":
        return "💰"
      case "skin":
        return "👕"
      case "booster":
        return "⚡"
      case "location":
        return "🏢"
      case "badge":
        return "🏅"
      case "effect":
        return "✨"
      default:
        return "🎁"
    }
  }

  function getRewardStatus(level: number) {
    if (!gameState) return "locked"
    if (gameState.stats.level >= level) {
      if (gameState.unclaimedRewards?.includes(level)) {
        return "unclaimed"
      }
      return "claimed"
    }
    return "locked"
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/game">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            🎁 Нагороди за Рівні 🎁
          </h1>
          <p className="text-xl text-muted-foreground">Твій прогрес: Рівень {gameState.stats.level}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => {
              const status = getRewardStatus(reward.level)
              const isLocked = status === "locked"
              const isUnclaimed = status === "unclaimed"
              const isClaimed = status === "claimed"

              return (
                <div
                  key={reward.id}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                    isLocked ? "opacity-50 grayscale" : "hover:scale-105"
                  } ${
                    isUnclaimed ? "animate-pulse-glow shadow-2xl" : ""
                  } bg-gradient-to-br ${RARITY_COLORS[reward.rarity]} ${RARITY_GLOW[reward.rarity]} backdrop-blur-sm`}
                >
                  {/* Level badge */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg">
                    {reward.level}
                  </div>

                  {/* Status badge */}
                  <div className="absolute -top-3 -left-3">
                    {isLocked && (
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center shadow-lg">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {isUnclaimed && (
                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg animate-bounce">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {isClaimed && (
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Reward content */}
                  <div className="mt-4 text-center">
                    <div className="text-6xl mb-4">{getRewardIcon(reward.rewardType)}</div>
                    <h3 className="text-xl font-bold mb-2 text-white">{reward.rewardName}</h3>
                    <p className="text-sm text-white/80 mb-4">{reward.rewardDescription}</p>

                    {/* Rarity badge */}
                    <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-xs font-bold uppercase text-white">
                        {reward.rarity === "common" && "⚪ Звичайний"}
                        {reward.rarity === "rare" && "🔵 Рідкісний"}
                        {reward.rarity === "epic" && "🟣 Епічний"}
                        {reward.rarity === "legendary" && "🟡 Легендарний"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
