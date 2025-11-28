"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Trophy,
  Clock,
  Coins,
  Target,
  Users,
  TrendingUp,
  Zap,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Star,
  ArrowLeft,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { loadGameState, type GameState } from "@/lib/game-state"
import { calculateStatistics, type DetailedStatistics } from "@/lib/statistics-tracker"

export default function StatsPage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [stats, setStats] = useState<DetailedStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const state = await loadGameState()
      if (state) {
        setGameState(state)
        const detailedStats = calculateStatistics(state)
        setStats(detailedStats)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-purple-700">Завантаження статистики...</p>
        </div>
      </div>
    )
  }

  if (!gameState || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Не вдалося завантажити статистику</p>
          <Button onClick={() => router.push("/game")} className="mt-4">
            Повернутися до гри
          </Button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      icon: TrendingUp,
      label: "Рівень",
      value: stats.level,
      subValue: `${stats.experience} / ${stats.experienceToNext} XP`,
      color: "from-blue-500 to-cyan-500",
      progress: stats.experiencePercentage,
    },
    {
      icon: Coins,
      label: "Загальні гроші",
      value: `${stats.totalMoney} грн`,
      subValue: `Готівка: ${stats.cash} | Банк: ${stats.bankBalance}`,
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Clock,
      label: "Час у грі",
      value: `${stats.totalPlayTimeHours}г ${stats.totalPlayTimeMinutes % 60}хв`,
      subValue: `Останній візит: ${stats.lastPlayed.toLocaleDateString("uk-UA")}`,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Target,
      label: "Зіграно ігор",
      value: stats.totalGamesPlayed,
      subValue: `Найкращі результати у міні-іграх`,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Calendar,
      label: "Подій завершено",
      value: stats.completedEvents,
      subValue: "Спеціальні події та акції",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Award,
      label: "Досягнення",
      value: stats.totalAchievements,
      subValue: "Отримано нагород",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: BookOpen,
      label: "Предметів у інвентарі",
      value: stats.unlockedItems,
      subValue: "Розблоковані предмети",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: Users,
      label: "Друзі",
      value: stats.totalFriends,
      subValue: "Соціальні зв'язки",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Zap,
      label: "Навички",
      value: stats.totalSkillPoints,
      subValue: `Найкраща: ${stats.highestSkill.name} (${stats.highestSkill.value})`,
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: Sparkles,
      label: "Активні бустери",
      value: stats.activeBoosters,
      subValue: "Поточні посилення",
      color: "from-violet-500 to-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-purple-950/20 dark:to-cyan-950/20 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/game")}
                className="rounded-full px-6 bg-white/50 backdrop-blur-xl border-white/30 hover:bg-white/70 hover:scale-110 transition-all shadow-xl font-bold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Статистика
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{gameState.playerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <span className="font-bold text-sm text-purple-700 dark:text-purple-300">{stats.currentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ваші досягнення
              </h2>
              <p className="text-sm text-muted-foreground">Детальна статистика вашого прогресу</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="relative group"
              >
                <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-xl`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Label */}
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">{card.label}</h3>

                  {/* Value */}
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                    {card.value}
                  </div>

                  {/* Sub value */}
                  <p className="text-sm text-muted-foreground">{card.subValue}</p>

                  {/* Progress bar if available */}
                  {card.progress !== undefined && (
                    <div className="mt-4">
                      <Progress value={card.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(card.progress)}%</p>
                    </div>
                  )}

                  {/* Glow effect */}
                  <div
                    className={`absolute -inset-1 bg-gradient-to-br ${card.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity -z-10`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Mini-games High Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Рекорди міні-ігор
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">Кафе</span>
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats.cafeHighScore}
              </div>
              <p className="text-sm text-muted-foreground mt-2">найкращий результат</p>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">Бібліотека</span>
                <Star className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stats.libraryHighScore}
              </div>
              <p className="text-sm text-muted-foreground mt-2">найкращий результат</p>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">Пакунки</span>
                <Star className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.carePackagesHighScore}
              </div>
              <p className="text-sm text-muted-foreground mt-2">найкращий результат</p>
            </div>
          </div>
        </motion.div>

        {/* Personality Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Про вас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm font-semibold text-muted-foreground">Тип особистості</span>
              <p className="text-2xl font-bold mt-1">{stats.personalityType}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-muted-foreground">Поточний статус</span>
              <p className="text-2xl font-bold mt-1">{stats.currentStatus}</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
