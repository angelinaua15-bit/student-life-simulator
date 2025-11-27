"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, CheckCircle, Clock, Star, Gift, Target } from "lucide-react"
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state"
import { getAvailableQuests, getDailyQuests, checkQuestProgress, isQuestCompleted, type Quest } from "@/lib/quests-data"
import { useGameModal } from "@/lib/use-game-modal"
import { Progress } from "@/components/ui/progress"

export default function QuestsPage() {
  const router = useRouter()
  const { showSuccess } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"story" | "side" | "daily">("story")
  const [storyQuests, setStoryQuests] = useState<Quest[]>([])
  const [sideQuests, setSideQuests] = useState<Quest[]>([])
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([])

  useEffect(() => {
    const load = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }
      setGameState(state)

      const available = getAvailableQuests(state.stats.level, state.completedEvents, state.personalityType)
      setStoryQuests(available.filter((q) => q.type === "story").map((q) => checkQuestProgress(q, state)))
      setSideQuests(available.filter((q) => q.type === "side").map((q) => checkQuestProgress(q, state)))

      const daily = getDailyQuests(state.completedEvents.filter((id) => id.startsWith("daily-")))
      setDailyQuests(daily.map((q) => checkQuestProgress(q, state)))

      setLoading(false)
    }
    load()
  }, [router])

  const handleClaimReward = async (quest: Quest) => {
    if (!gameState || !isQuestCompleted(quest)) return

    const updatedState = {
      ...gameState,
      stats: {
        ...gameState.stats,
        experience: gameState.stats.experience + quest.rewards.experience,
        money: gameState.stats.money + quest.rewards.money,
      },
      completedEvents: [...gameState.completedEvents, quest.id],
      inventory: quest.rewards.items ? [...gameState.inventory, ...quest.rewards.items] : gameState.inventory,
    }

    await saveGameState(updatedState)
    setGameState(updatedState)

    showSuccess(
      `Квест завершено!\n+${quest.rewards.experience} XP\n+${quest.rewards.money} монет${
        quest.rewards.items ? `\n+${quest.rewards.items.length} предметів` : ""
      }`,
      "Нагорода отримана!",
    )

    // Refresh quests
    const available = getAvailableQuests(
      updatedState.stats.level,
      updatedState.completedEvents,
      updatedState.personalityType,
    )
    setStoryQuests(available.filter((q) => q.type === "story"))
    setSideQuests(available.filter((q) => q.type === "side"))
  }

  const renderQuest = (quest: Quest) => {
    const completed = isQuestCompleted(quest)
    const totalProgress = quest.objectives.reduce((sum, obj) => sum + (obj.current || 0), 0)
    const totalTarget = quest.objectives.reduce((sum, obj) => sum + obj.target, 0)
    const progressPercent = totalTarget > 0 ? (totalProgress / totalTarget) * 100 : 0

    return (
      <div
        key={quest.id}
        className={`bg-card border-2 rounded-xl p-6 transition-all ${
          completed ? "border-green-500 bg-green-500/10" : "border-border hover:border-primary/50 hover:shadow-lg"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{quest.icon}</div>
            <div>
              <h3 className="text-xl font-bold">{quest.title}</h3>
              <p className="text-sm text-muted-foreground">{quest.description}</p>
            </div>
          </div>
          {completed && <CheckCircle className="w-8 h-8 text-green-500" />}
        </div>

        <div className="space-y-3 mb-4">
          {quest.objectives.map((obj) => {
            const objCompleted = (obj.current || 0) >= obj.target
            return (
              <div key={obj.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={objCompleted ? "text-green-500 line-through" : ""}>{obj.description}</span>
                  <span className="font-mono">
                    {obj.current || 0} / {obj.target}
                  </span>
                </div>
                <Progress value={((obj.current || 0) / obj.target) * 100} className="h-1" />
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-4 h-4" />
              <span>+{quest.rewards.experience} XP</span>
            </div>
            <div className="flex items-center gap-1 text-accent-foreground">
              <Gift className="w-4 h-4" />
              <span>+{quest.rewards.money} монет</span>
            </div>
            {quest.rewards.items && <div className="text-purple-500">+{quest.rewards.items.length} предметів</div>}
          </div>

          {completed && (
            <Button onClick={() => handleClaimReward(quest)} className="bg-green-600 hover:bg-green-700">
              Отримати нагороду
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.back()} className="border-purple-400 text-purple-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Журнал Квестів
          </h1>
          <div className="w-24" />
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "story" ? "default" : "outline"}
            onClick={() => setActiveTab("story")}
            className="flex-1"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Сюжетні ({storyQuests.length})
          </Button>
          <Button
            variant={activeTab === "side" ? "default" : "outline"}
            onClick={() => setActiveTab("side")}
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            Побічні ({sideQuests.length})
          </Button>
          <Button
            variant={activeTab === "daily" ? "default" : "outline"}
            onClick={() => setActiveTab("daily")}
            className="flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            Щоденні ({dailyQuests.length})
          </Button>
        </div>

        <div className="space-y-4">
          {activeTab === "story" && storyQuests.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold text-white mb-2">Всі сюжетні квести завершені!</h3>
              <p className="text-white/70">Чекай на нові оновлення</p>
            </div>
          )}
          {activeTab === "story" && storyQuests.map(renderQuest)}

          {activeTab === "side" && sideQuests.length === 0 && (
            <div className="text-center py-20">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold text-white mb-2">Немає доступних побічних квестів</h3>
              <p className="text-white/70">Підвищ рівень, щоб розблокувати більше</p>
            </div>
          )}
          {activeTab === "side" && sideQuests.map(renderQuest)}

          {activeTab === "daily" && dailyQuests.length === 0 && (
            <div className="text-center py-20">
              <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold text-white mb-2">Всі щоденні квести завершені!</h3>
              <p className="text-white/70">Повертайся завтра за новими</p>
            </div>
          )}
          {activeTab === "daily" && dailyQuests.map(renderQuest)}
        </div>
      </div>
    </div>
  )
}
