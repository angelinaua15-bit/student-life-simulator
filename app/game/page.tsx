"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, type GameState, updateStats } from "@/lib/game-state"
import { GameCard } from "@/components/game-card"
import { Button } from "@/components/ui/button"
import { EventBanner } from "@/components/event-banner"
import { InnerVoiceCompanion } from "@/components/inner-voice-companion"
import { RefreshCw, UserPlus, Award } from "lucide-react"
import { motion } from "framer-motion"
import {
  Zap,
  Heart,
  Brain,
  Coins,
  Coffee,
  BookOpen,
  Package,
  Building2,
  Sparkles,
  TrendingUp,
  User,
  MessageCircle,
  Trophy,
  Gift,
  Calendar,
  Target,
  Swords,
  MapPin,
  Users,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"
import { checkAchievements } from "@/lib/achievements-tracker"

export default function GameDashboard() {
  const router = useRouter()
  const { showConfirm, showAlert } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAndAutoSave = async () => {
      const saved = await loadGameState()
      if (!saved) {
        router.push("/")
        return
      }

      const { newAchievements, updatedState } = checkAchievements(saved)
      if (newAchievements.length > 0) {
        // Show notification for new achievements
        for (const achievement of newAchievements) {
          setTimeout(() => {
            showAlert(
              `🎉 Досягнення розблоковано!\n\n${achievement.icon} ${achievement.title}\n${achievement.description}\n\n+${achievement.reward.xp} XP, +${achievement.reward.money} грн`,
              "Нове Досягнення!",
            )
          }, 500)
        }
        setGameState(updatedState)
        await saveGameState(updatedState)
      } else {
        setGameState(saved)
      }

      setLoading(false)

      // Auto-save every 5 seconds
      const interval = setInterval(async () => {
        const current = await loadGameState()
        if (current) {
          // Passive energy recovery
          let updated = updateStats(current, {
            energy: Math.min(100, current.stats.energy + 0.5),
            stress: Math.max(0, current.stats.stress - 0.3),
          })

          const { newAchievements: newAch, updatedState: achState } = checkAchievements(updated)
          if (newAch.length > 0) {
            updated = achState
            for (const achievement of newAch) {
              showAlert(
                `🎉 Досягнення розблоковано!\n\n${achievement.icon} ${achievement.title}\n${achievement.description}\n\n+${achievement.reward.xp} XP, +${achievement.reward.money} грн`,
                "Нове Досягнення!",
              )
            }
          }

          setGameState(updated)
          await saveGameState(updated)
        }
      }, 5000)

      return () => clearInterval(interval)
    }

    loadAndAutoSave()
  }, [router, showAlert])

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { playerName, stats } = gameState
  const expPercentage = (stats.experience / stats.experienceToNext) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-purple-950/20 dark:to-cyan-950/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      </div>

      <header className="border-b border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Збільшений аватар з м'яким світінням та анімацією */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1 shadow-2xl animate-gradient">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
              </motion.div>

              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {playerName}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 mt-1"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-sm text-purple-700 dark:text-purple-300">
                      {gameState.status || "Новачок"} • Рівень {stats.level}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-xl px-6 py-3 rounded-full border border-yellow-400/30 shadow-xl hover:shadow-2xl transition-all cursor-pointer">
                  <Coins className="w-6 h-6 text-yellow-600 animate-pulse" />
                  <span className="font-extrabold text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {stats.money}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    showConfirm(
                      "Вийти з гри? Прогрес збережено.",
                      () => {
                        router.push("/")
                      },
                      "Вихід з гри",
                    )
                  }}
                  className="rounded-full px-6 py-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-white/30 hover:bg-white/70 hover:scale-110 transition-all shadow-xl font-bold"
                >
                  Меню
                </Button>
              </motion.div>

              {/* Added Stats button to navigation */}
              <Link href="/game/stats" className="block">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 py-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-white/30 hover:bg-white/70 hover:scale-110 transition-all shadow-xl font-bold"
                >
                  Статистика
                </Button>
              </Link>

              <Link href="/game/achievements" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:scale-105 transition-transform bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20"
                >
                  <Award className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                    <div className="font-bold">Досягнення</div>
                    <div className="text-xs text-muted-foreground">Твої трофеї та успіхи</div>
                  </div>
                  {gameState.achievements && gameState.achievements.length > 0 && (
                    <div className="ml-auto px-2 py-1 bg-amber-500/20 rounded-full text-amber-600 text-xs font-bold">
                      {gameState.achievements.length}
                    </div>
                  )}
                </Button>
              </Link>

              <Link href="/game/rewards" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:scale-105 transition-transform bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20"
                >
                  <Gift className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-bold">Мої Нагороди</div>
                    <div className="text-xs text-muted-foreground">Твої винагороди</div>
                  </div>
                  {gameState.unclaimedRewards && gameState.unclaimedRewards.length > 0 && (
                    <div className="ml-auto w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      {gameState.unclaimedRewards.length}
                    </div>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 space-y-2"
          >
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-purple-700 dark:text-purple-300">Досвід</span>
              <span className="text-purple-700 dark:text-purple-300">
                {stats.experience} / {stats.experienceToNext}
              </span>
            </div>
            <div className="relative">
              <div className="h-4 bg-gradient-to-r from-slate-200/50 to-slate-300/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-sm opacity-60" />
                </motion.div>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <EventBanner />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <GameCard
                title="Твій стан"
                description="Слідкуй за показниками"
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white/40 shadow-2xl rounded-3xl"
              >
                <div className="space-y-6">
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl">
                        <Zap className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-lg">Енергія</span>
                          <span className="font-bold text-lg text-yellow-600">{Math.round(stats.energy)}%</span>
                        </div>
                        <div className="relative h-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${stats.energy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl">
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-lg">Щастя</span>
                          <span className="font-bold text-lg text-green-600">{Math.round(stats.happiness)}%</span>
                        </div>
                        <div className="relative h-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${stats.happiness}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-xl">
                        <Brain className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-lg">Стрес</span>
                          <span className="font-bold text-lg text-red-600">{Math.round(stats.stress)}%</span>
                        </div>
                        <div className="relative h-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-500"
                            style={{ width: `${stats.stress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-red-400/20 to-rose-400/20 rounded-2xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </GameCard>
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl -z-10" />
            </motion.div>

            <GameCard title="Фінанси">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                  <span className="text-sm font-medium">Готівка</span>
                  <span className="font-bold text-lg">{stats.money} грн</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                  <span className="text-sm font-medium">В банку</span>
                  <span className="font-bold text-lg">{stats.bankBalance} грн</span>
                </div>
              </div>
            </GameCard>

            <div className="space-y-3">
              <Link href="/game/quests" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:scale-105 transition-transform bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20"
                >
                  <Target className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-bold">Квести</div>
                    <div className="text-xs text-muted-foreground">Виконуй завдання</div>
                  </div>
                </Button>
              </Link>

              <Link href="/game/events" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:scale-105 transition-transform bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20"
                >
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-bold">Події та Акції</div>
                    <div className="text-xs text-muted-foreground">Спеціальні бонуси</div>
                  </div>
                </Button>
              </Link>

              <Link href="/game/leaderboard" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:scale-105 transition-transform bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20"
                >
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-bold">Таблиця Лідерів</div>
                    <div className="text-xs text-muted-foreground">Переглянь найкращих</div>
                  </div>
                </Button>
              </Link>

              <Link href="/game/rewards" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-4 hover:scale-105 transition-transform bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20"
                >
                  <Gift className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-bold">Мої Нагороди</div>
                    <div className="text-xs text-muted-foreground">Твої досягнення</div>
                  </div>
                  {gameState.unclaimedRewards && gameState.unclaimedRewards.length > 0 && (
                    <div className="ml-auto w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      {gameState.unclaimedRewards.length}
                    </div>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                Мій Профіль
              </h2>
              <Link href="/game/profile">
                <div className="relative group cursor-pointer">
                  <GameCard
                    className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-2 border-white/40 hover:border-purple-400/60 transition-all duration-500 hover:scale-105 rounded-3xl shadow-2xl overflow-hidden"
                    glowing
                  >
                    <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                    <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping animation-delay-500" />
                    <div className="absolute top-6 right-20 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-1000" />

                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1.5 shadow-2xl animate-gradient">
                            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                              <User className="w-12 h-12 text-primary" />
                            </div>
                          </div>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-40 blur-2xl animate-pulse" />
                        </div>
                        <div>
                          <div className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {playerName}
                          </div>
                          <div className="text-lg text-muted-foreground mt-1">
                            Рівень {stats.level} • {gameState.status || "Новачок"}
                          </div>
                          <Button variant="outline" size="sm" className="mt-3 rounded-full font-bold bg-transparent">
                            Редагувати профіль
                          </Button>
                        </div>
                      </div>
                      <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
                    </div>
                  </GameCard>
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>

            {/* Friends Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-pink-500" />
                Друзі та соціальне
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/game/friends">
                  <GameCard
                    title="Знайти друзів"
                    description="Шукай інших гравців та додавай у друзі"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <div className="relative">
                        <Users className="w-12 h-12 text-pink-500 animate-pulse" />
                        <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                      </div>
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/friends/requests">
                  <GameCard
                    title="Запити в друзі"
                    description="Переглядай та керуй запитами"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <UserPlus className="w-12 h-12 text-green-500 animate-pulse" />
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/friends/list">
                  <GameCard
                    title="Мої друзі"
                    description="Список твоїх друзів"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <Heart className="w-12 h-12 text-red-500 animate-pulse" />
                    </div>
                  </GameCard>
                </Link>
              </div>
            </div>

            {/* Mini-games Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Міні-ігри
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/game/cafe">
                  <GameCard
                    title="Кафе"
                    description="Приймай замовлення та заробляй чайові"
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <Coffee className="w-12 h-12 text-primary" />
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Рекорд</div>
                        <div className="font-bold">{gameState.minigameHighScores.cafe} очок</div>
                      </div>
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/library">
                  <GameCard
                    title="Бібліотека"
                    description="Збирай книги в лабіринті знань"
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <BookOpen className="w-12 h-12 text-secondary" />
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Рекорд</div>
                        <div className="font-bold">{gameState.minigameHighScores.library} очок</div>
                      </div>
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/care-packages">
                  <GameCard
                    title="Пакунки"
                    description="Складай речі в багажник"
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <Package className="w-12 h-12 text-accent-foreground" />
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Рекорд</div>
                        <div className="font-bold">{gameState.minigameHighScores.carePackages} очок</div>
                      </div>
                    </div>
                  </GameCard>
                </Link>
              </div>
            </div>

            {/* Feedback Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-secondary" />
                Зворотний зв'язок
              </h2>
              <Link href="/game/feedback">
                <GameCard
                  title="Відгуки"
                  description="Залиш свою думку про гру та допоможи нам стати кращими"
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-12 h-12 text-secondary" />
                      <div>
                        <div className="text-sm font-medium">Твоя думка важлива</div>
                        <div className="text-xs text-muted-foreground">Поділись враженнями</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Написати
                    </Button>
                  </div>
                </GameCard>
              </Link>
            </div>

            {/* Mini-games Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Міні-ігри
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/game/polytechnic-3d">
                  <GameCard
                    title="3D Пригода Політехніки"
                    description="Досліджуй університет у 3D!"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <div className="relative">
                        <Building2 className="w-12 h-12 text-cyan-500 animate-pulse" />
                        <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-spin" />
                      </div>
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/world">
                  <GameCard
                    title="Світ Гри"
                    description="Досліджуй локації та переміщайся містом"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <MapPin className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/npcs">
                  <GameCard
                    title="Персонажі (NPC)"
                    description="Спілкуйся та дружи з іншими"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <Users className="w-12 h-12 text-secondary animate-pulse" />
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/skills">
                  <GameCard
                    title="Навички RPG"
                    description="Прокачуй свої здібності"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <Lightbulb className="w-12 h-12 text-accent-foreground animate-pulse" />
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/shadow">
                  <GameCard
                    title="Альтер-Его"
                    description="Зустрінь свою темну версію"
                    className="cursor-pointer hover:scale-105 transition-transform border-2 border-purple-500/50"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <div className="relative">
                        <User className="w-12 h-12 text-purple-500 animate-pulse" />
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl animate-pulse" />
                      </div>
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/timelines">
                  <GameCard
                    title="Паралельні Семестри"
                    description="Досліджуй два світи одночасно"
                    className="cursor-pointer hover:scale-105 transition-transform border-2 border-cyan-500/50"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <div className="relative">
                        <RefreshCw
                          className="w-12 h-12 text-cyan-500 animate-spin"
                          style={{ animationDuration: "3s" }}
                        />
                        <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                      </div>
                    </div>
                  </GameCard>
                </Link>

                <GameCard title="Більше незабаром" description="Нові міні-ігри в розробці" className="opacity-50">
                  <div className="flex items-center justify-center py-4">
                    <Sparkles className="w-12 h-12 text-muted-foreground" />
                  </div>
                </GameCard>
              </div>
            </div>

            {/* Locations Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-secondary" />
                Локації
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/game/boss-battle">
                  <GameCard
                    title="Босс-Баттл"
                    description="Кидай виклик викладачам!"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <Swords className="w-12 h-12 text-red-500 animate-pulse" />
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/bank">
                  <GameCard
                    title="Банк"
                    description="Керуй своїми фінансами"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing={stats.money > 1000}
                  >
                    <div className="flex items-center justify-center py-2">
                      <Building2 className="w-12 h-12 text-secondary" />
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/lottery">
                  <GameCard
                    title="Лотерея"
                    description="Спробуй удачу та виграй!"
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center justify-center py-2">
                      <Sparkles className="w-12 h-12 text-accent-foreground" />
                    </div>
                  </GameCard>
                </Link>

                <Link href="/game/mentor">
                  <GameCard
                    title="Ментор"
                    description="Поради від стильного сенсея"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    glowing
                  >
                    <div className="flex items-center justify-center py-2">
                      <User className="w-12 h-12 text-primary animate-pulse-glow" />
                    </div>
                  </GameCard>
                </Link>

                <GameCard title="Магазин" description="Купуй бусти та покращення" className="opacity-50">
                  <div className="flex items-center justify-center py-2">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                </GameCard>
              </div>
            </div>
          </div>
        </div>

        {/* Inner Voice Companion */}
        {gameState && <InnerVoiceCompanion gameState={gameState} />}
      </main>
    </div>
  )
}
