"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Lock, Star, Award, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { loadGameState } from "@/lib/game-state"
import { getAchievementProgress } from "@/lib/achievements-tracker"
import {
  ACHIEVEMENTS,
  type Achievement,
  getCategoryColor,
  getRarityColor,
  getCategoryName,
} from "@/lib/achievements-data"

export default function AchievementsPage() {
  const [progress, setProgress] = useState<ReturnType<typeof getAchievementProgress> | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      const state = await loadGameState()
      if (state) {
        const prog = getAchievementProgress(state)
        setProgress(prog)
      }
      setLoading(false)
    }
    loadProgress()
  }, [])

  if (loading || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 animate-bounce mx-auto mb-4 text-primary" />
          <p className="text-xl">Завантаження досягнень...</p>
        </div>
      </div>
    )
  }

  const categories = ["all", ...new Set(ACHIEVEMENTS.map((a) => a.category))]

  const filteredUnlocked =
    selectedCategory === "all" ? progress.unlocked : progress.unlocked.filter((a) => a.category === selectedCategory)

  const filteredLocked =
    selectedCategory === "all" ? progress.locked : progress.locked.filter((a) => a.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-8">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/game">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до гри
            </Button>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-primary animate-pulse" />
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Досягнення
              </h1>
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg">Відстежуй свій прогрес та отримуй нагороди</p>
          </motion.div>

          {/* Progress Overview */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-background backdrop-blur-sm border-2 border-primary/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-center sm:text-left">
                <p className="text-3xl font-bold text-primary">
                  {progress.unlockedCount} / {progress.total}
                </p>
                <p className="text-muted-foreground">Досягнень розблоковано</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{progress.percentage}%</div>
                <p className="text-muted-foreground">Завершення</p>
              </div>
            </div>
            <Progress value={progress.percentage} className="h-3" />
          </Card>
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="w-full flex flex-wrap justify-start gap-2 h-auto p-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Всі
            </TabsTrigger>
            {categories.slice(1).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-2">
                {getCategoryName(cat as Achievement["category"])}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Unlocked Achievements */}
        {filteredUnlocked.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Розблоковані ({filteredUnlocked.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUnlocked.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className={`p-6 bg-gradient-to-br ${getCategoryColor(achievement.category)} backdrop-blur-sm border-2 border-primary/30 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{achievement.title}</h3>
                          <span className={`text-xs ${getRarityColor(achievement.rarity)}`}>✦</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="px-2 py-1 bg-primary/20 rounded-full">+{achievement.reward.xp} XP</span>
                          <span className="px-2 py-1 bg-green-500/20 rounded-full">
                            +{achievement.reward.money} грн
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {filteredLocked.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
              <Lock className="w-6 h-6" />
              Заблоковані ({filteredLocked.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLocked.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-6 bg-card/30 backdrop-blur-sm border-2 border-muted/20 opacity-60 hover:opacity-80 transition-opacity">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl grayscale">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-bold text-lg text-muted-foreground">???</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-muted/20 rounded-full">+{achievement.reward.xp} XP</span>
                          <span className="px-2 py-1 bg-muted/20 rounded-full">+{achievement.reward.money} грн</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filteredUnlocked.length === 0 && filteredLocked.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl font-bold mb-2">Досягнень не знайдено</p>
            <p className="text-muted-foreground">Спробуй іншу категорію</p>
          </Card>
        )}
      </div>
    </div>
  )
}
