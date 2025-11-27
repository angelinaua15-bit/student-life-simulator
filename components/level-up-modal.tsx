"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Gift, Trophy } from "lucide-react"
import confetti from "canvas-confetti"
import { type Reward, RARITY_COLORS } from "@/lib/rewards-data"

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  oldLevel: number
  newLevel: number
  reward?: Reward
}

export function LevelUpModal({ isOpen, onClose, oldLevel, newLevel, reward }: LevelUpModalProps) {
  const [showReward, setShowReward] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Confetti explosion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#06b6d4", "#fbbf24"],
      })

      // Show reward after delay
      setTimeout(() => setShowReward(true), 1000)
    } else {
      setShowReward(false)
    }
  }, [isOpen])

  function getRewardIcon(type?: string) {
    if (!type) return "🎁"
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 backdrop-blur-xl border-2 border-primary/50">
        <div className="text-center py-6">
          {/* Level up animation */}
          <div className="mb-6">
            <h2 className="text-6xl font-bold mb-4 animate-bounce bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              LEVEL UP!
            </h2>

            <div className="flex items-center justify-center gap-4 text-4xl font-bold mb-4">
              <span className="text-muted-foreground">{oldLevel}</span>
              <Sparkles className="w-8 h-8 text-primary animate-spin" />
              <span className="text-primary animate-pulse-glow">{newLevel}</span>
            </div>

            <Trophy className="w-16 h-16 mx-auto text-yellow-500 animate-pulse-glow" />
          </div>

          {/* Reward reveal */}
          {showReward && reward && (
            <div className="animate-scale-in">
              <h3 className="text-2xl font-bold mb-4 text-primary">Нова Нагорода!</h3>

              <div
                className={`p-6 rounded-xl bg-gradient-to-br ${RARITY_COLORS[reward.rarity]} shadow-2xl border-2 border-white/50 mb-6`}
              >
                <div className="text-6xl mb-4">{getRewardIcon(reward.rewardType)}</div>
                <h4 className="text-2xl font-bold text-white mb-2">{reward.rewardName}</h4>
                <p className="text-white/90">{reward.rewardDescription}</p>

                <div className="mt-4">
                  <span className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold uppercase text-sm">
                    {reward.rarity === "common" && "⚪ Звичайний"}
                    {reward.rarity === "rare" && "🔵 Рідкісний"}
                    {reward.rarity === "epic" && "🟣 Епічний"}
                    {reward.rarity === "legendary" && "🟡 Легендарний"}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-bold"
              >
                <Gift className="w-5 h-5 mr-2" />
                Отримати!
              </Button>
            </div>
          )}

          {!reward && showReward && (
            <Button
              size="lg"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-bold"
            >
              Продовжити
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
