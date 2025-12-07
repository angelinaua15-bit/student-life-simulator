"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, type GameState, updateStats } from "@/lib/game-state"
import { GameCard } from "@/components/game-card"
import { Button } from "@/components/ui/button"
import { EventBanner } from "@/components/event-banner"
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
  Gift,
  Target,
  MapPin,
  Users,
  Lightbulb,
  Award,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"
import { checkAchievements } from "@/lib/achievements-tracker"
import { getCurrentUser, getUserProfile } from "@/lib/auth-actions"

export default function GameDashboard() {
  const router = useRouter()
  const { showConfirm, showAlert } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAndAutoSave = async () => {
      console.log("[v0] Loading game state...")

      const user = await getCurrentUser()
      const profile = await getUserProfile()

      if (!user || !profile) {
        console.log("[v0] No user logged in, redirecting to login")
        router.push("/auth/login")
        return
      }

      const gameStateFromProfile: GameState = {
        playerId: profile.player_id || profile.id,
        playerName: profile.nickname || "Student",
        stats: {
          stress: profile.stress || 30,
          happiness: profile.happiness || 70,
          energy: profile.energy || 80,
          money: profile.coins || 100,
          bankBalance: profile.bank_balance || 0,
          level: profile.level || 1,
          experience: profile.experience || 0,
          experienceToNext: Math.floor(100 * Math.pow(1.5, (profile.level || 1) - 1)),
        },
        completedEvents: profile.completed_events || [],
        achievements: profile.achievements || [],
        inventory: profile.inventory || [],
        lastPlayed: Date.now(),
        totalPlayTime: profile.total_play_time || 0,
        minigameHighScores: {
          cafe: profile.cafe_high_score || 0,
          library: profile.library_high_score || 0,
          carePackages: profile.care_packages_high_score || 0,
        },
        settings: {
          soundEnabled: profile.sound_enabled ?? true,
          musicEnabled: profile.music_enabled ?? true,
          language: profile.language || "ua",
          graphicsQuality: profile.graphics_quality || "high",
        },
        skin: profile.skin || "default",
        status: profile.status || "Новачок",
        bio: profile.bio || "",
        faculty: profile.faculty || "",
        group: profile.group || "",
        social: profile.social || "",
        unclaimedRewards: profile.unclaimed_rewards || [],
        activeBoosters: profile.active_boosters || [],
        personalityType: profile.personality_type || "default",
        eventCompletions: profile.event_completions || {},
        claimedEventRewards: profile.claimed_event_rewards || [],
        polytechnic3DProgress: {
          completedQuests: profile.polytechnic3d_completed_quests || [],
          collectedItems: profile.polytechnic3d_collected_items || [],
          visitedRooms: profile.polytechnic3d_visited_rooms || [],
        },
        skills: profile.skills || {
          charisma: 0,
          communication: 0,
          resilience: 0,
          creativity: 0,
          agility: 0,
          success: 0,
        },
        friends: profile.friends || [],
        innerVoiceHistory: profile.inner_voice_history || [],
        shadowStudent: {
          initialized: profile.shadow_student_initialized || false,
          challengesWon: profile.shadow_student_challenges_won || 0,
          challengesLost: profile.shadow_student_challenges_lost || 0,
          lastEncounter: profile.shadow_student_last_encounter || 0,
          currentChallengeId: profile.shadow_student_current_challenge_id,
        },
        lastInterestClaim: profile.last_interest_claim || undefined,
      }

      console.log("[v0] Game state loaded from Supabase:", {
        level: gameStateFromProfile.stats.level,
        money: gameStateFromProfile.stats.money,
      })

      

      setLoading(false)

      const interval = setInterval(async () => {
        const current = await loadGameState()
        if (current) {
          let updated = updateStats(current, {
            energy: Math.min(100, current.stats.energy + 0.5),
            stress: Math.max(0, current.stats.stress - 0.3),
          })

         
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Завантаження гри...</p>
        </div>
      </div>
    )
  }

  const { playerName, stats } = gameState
  const expPercentage = (stats.experience / stats.experienceToNext) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/15 to-cyan-200/15 rounded-full blur-3xl animate-soft-float" />
        <div className="absolute bottom-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/15 to-pink-200/15 rounded-full blur-3xl animate-soft-float delay-300" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-amber-200/10 to-orange-200/10 rounded-full blur-3xl animate-soft-float delay-500" />
      </div>

      <header className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400/90 via-purple-400/90 to-pink-400/90 p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              </div>

              <div>
                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {playerName}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-sm text-purple-700 dark:text-purple-300">
                      {gameState.status || "Новачок"} • Рівень {stats.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 backdrop-blur-xl px-6 py-3 rounded-full border border-amber-200 dark:border-amber-700 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <Coins className="w-6 h-6 text-amber-500" />
                  <span className="font-extrabold text-2xl text-amber-600 dark:text-amber-400">{stats.money}</span>
                </div>
              </div>

              <div>
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
              </div>

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

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-purple-700 dark:text-purple-300">Досвід</span>
              <span className="text-purple-700 dark:text-purple-300">
                {stats.experience} / {stats.experienceToNext}
              </span>
            </div>
            <div className="relative">
              <div className="h-4 bg-gradient-to-r from-slate-200/50 to-slate-300/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
                  style={{ width: `${expPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-sm opacity-60" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <EventBanner />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="relative group">
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
            </div>

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
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
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
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1.5 shadow-2xl animate-gradient">
                        <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center">
                          <User className="w-12 h-12 text-primary" />
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
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

            <div>
              <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-pink-500" />
                Друзі та соціальне
              </div>
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

            <div>
              <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Міні-ігри
              </div>
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

                <GameCard title="Більше незабаром" description="Нові міні-ігри в розробці" className="opacity-50">
                  <div className="flex items-center justify-center py-4">
                    <Sparkles className="w-12 h-12 text-muted-foreground" />
                  </div>
                </GameCard>
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-secondary" />
                Локації
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
      </main>
    </div>
  )
}
