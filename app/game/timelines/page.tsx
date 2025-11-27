"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state"
import {
  initDualTimeline,
  getDualTimeline,
  type Timeline,
  type TimelineChoice,
  type CrossTimelineEvent,
} from "@/lib/dual-timeline-system"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RefreshCw, Zap, Heart, Brain, Coins, Lock, Unlock, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useGameModal } from "@/lib/use-game-modal"

export default function DualTimelinesPage() {
  const router = useRouter()
  const { showSuccess, showConfirm } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTimeline, setActiveTimeline] = useState<Timeline | null>(null)
  const [otherTimeline, setOtherTimeline] = useState<Timeline | null>(null)
  const [recentChoices, setRecentChoices] = useState<TimelineChoice[]>([])
  const [crossEvents, setCrossEvents] = useState<CrossTimelineEvent[]>([])

  useEffect(() => {
    const load = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }

      setGameState(state)

      // Ініціалізація системи
      const timeline = initDualTimeline(state)
      setActiveTimeline(timeline.getActiveTimeline())
      setOtherTimeline(timeline.getOtherTimeline())
      setRecentChoices(timeline.getRecentChoices())
      setCrossEvents(timeline.getCrossTimelineEvents())

      setLoading(false)
    }

    load()
  }, [router])

  const handleSwitch = async () => {
    const timeline = getDualTimeline()
    if (!timeline || !gameState) return

    showConfirm(
      "Ти впевнений, що хочеш перемістись в інший семестр? Це може змінити багато речей.",
      async () => {
        const result = timeline.switchTimeline()

        // Оновити стейт
        const newGameState = timeline.applyTimelineToGameState(gameState)
        await saveGameState(newGameState)
        setGameState(newGameState)

        setActiveTimeline(timeline.getActiveTimeline())
        setOtherTimeline(timeline.getOtherTimeline())
        setCrossEvents(timeline.getCrossTimelineEvents())

        showSuccess(result.message, "Переміщення успішне!")
      },
      "Перемістити в інший семестр",
    )
  }

  if (loading || !gameState || !activeTimeline || !otherTimeline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = getDualTimeline()?.getTimelineStats()

  return (
    <div className={`min-h-screen p-4 ${activeTimeline.theme.background} ${activeTimeline.theme.textColor}`}>
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8">
          <Link href="/game">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до Гри
            </Button>
          </Link>

          <div className="text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl font-bold bg-gradient-to-r ${activeTimeline.theme.primary} bg-clip-text text-transparent`}
            >
              Паралельні Семестри
            </motion.h1>
            <p className="text-muted-foreground">Два світи, один студент, нескінченні можливості</p>
          </div>
        </header>

        {/* Active Timeline */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <GameCard
            title={activeTimeline.name}
            description="Поточний семестр"
            className={`border-2 bg-gradient-to-r ${activeTimeline.theme.primary} border-opacity-50`}
            glowing
          >
            <div className="space-y-4">
              <p className="text-sm opacity-90">{activeTimeline.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-white/20 dark:bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs">Енергія</span>
                  </div>
                  <div className="font-bold text-xl">{activeTimeline.stats.energy}</div>
                  <Progress value={activeTimeline.stats.energy} className="h-1 mt-1" />
                </div>

                <div className="p-3 bg-white/20 dark:bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">Щастя</span>
                  </div>
                  <div className="font-bold text-xl">{activeTimeline.stats.happiness}</div>
                  <Progress value={activeTimeline.stats.happiness} className="h-1 mt-1" />
                </div>

                <div className="p-3 bg-white/20 dark:bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4" />
                    <span className="text-xs">Стрес</span>
                  </div>
                  <div className="font-bold text-xl">{activeTimeline.stats.stress}</div>
                  <Progress value={activeTimeline.stats.stress} className="h-1 mt-1" />
                </div>

                <div className="p-3 bg-white/20 dark:bg-black/20 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4" />
                    <span className="text-xs">Гроші</span>
                  </div>
                  <div className="font-bold text-xl">{activeTimeline.stats.money}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 dark:border-black/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-75">Квестів виконано</div>
                    <div className="font-bold text-2xl">{activeTimeline.questsCompleted.length}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Модифікатор складності</div>
                    <div className="font-bold text-2xl">×{activeTimeline.difficultyModifier}</div>
                  </div>
                </div>
              </div>
            </div>
          </GameCard>
        </motion.div>

        {/* Switch Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleSwitch}
            size="lg"
            className={`bg-gradient-to-r ${activeTimeline.theme.primary} hover:opacity-90 transition-opacity text-white shadow-lg`}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Перемістись в {otherTimeline.name}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Other Timeline Preview */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <GameCard
              title={otherTimeline.name}
              description="Альтернативний семестр"
              className="opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{otherTimeline.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Енергія</div>
                    <div className="font-bold">{otherTimeline.stats.energy}</div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Щастя</div>
                    <div className="font-bold">{otherTimeline.stats.happiness}</div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Стрес</div>
                    <div className="font-bold">{otherTimeline.stats.stress}</div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Гроші</div>
                    <div className="font-bold">{otherTimeline.stats.money}</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  Квестів: {otherTimeline.questsCompleted.length}
                </div>
              </div>
            </GameCard>
          </motion.div>

          {/* Statistics */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <GameCard title="Статистика Переміщень" description="Твоя активність у світах">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Всього переміщень</div>
                  <div className="font-bold text-3xl">{stats?.totalSwitches || 0}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Зроблено виборів</div>
                    <div className="font-bold text-xl">{stats?.totalChoices || 0}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground">Відкрито подій</div>
                    <div className="font-bold text-xl">{stats?.unlockedEvents || 0}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-center text-muted-foreground">Твої вибори формують обидва світи</div>
                </div>
              </div>
            </GameCard>
          </motion.div>
        </div>

        {/* Cross-Timeline Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <GameCard title="Міжсвітові Події" description="Унікальні досягнення між семестрами" glowing>
            <div className="space-y-3">
              {crossEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg border-2 ${
                    event.unlocked
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50"
                      : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {event.unlocked ? (
                        <Unlock className="w-6 h-6 text-green-500" />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{event.title}</h3>
                        {event.unlocked && <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="text-xs">
                        <div className="text-muted-foreground">Умова: {event.requirement}</div>
                        {event.unlocked && (
                          <div className="text-green-600 dark:text-green-400 font-medium mt-1">
                            Нагорода: {event.reward}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GameCard>
        </motion.div>

        {/* Recent Choices */}
        {recentChoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <GameCard title="Останні Вибори" description="Твої рішення формують обидва світи">
              <div className="space-y-3">
                <AnimatePresence>
                  {recentChoices.map((choice, index) => (
                    <motion.div
                      key={choice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-muted rounded-lg"
                    >
                      <div className="text-sm font-medium mb-2">{choice.description}</div>
                      <div className="grid md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/30">
                          <div className="font-medium text-blue-600 dark:text-blue-400 mb-1">Успішний результат:</div>
                          <div className="text-muted-foreground">{choice.successOutcome}</div>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded border border-purple-500/30">
                          <div className="font-medium text-purple-600 dark:text-purple-400 mb-1">
                            Хаотичний результат:
                          </div>
                          <div className="text-muted-foreground">{choice.chaosOutcome}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Вплив на інший світ: {Math.round(choice.impactOnOtherTimeline * 100)}%
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GameCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}
