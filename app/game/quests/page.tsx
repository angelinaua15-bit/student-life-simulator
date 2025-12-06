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
      try {
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
      } catch (error) {
        console.error("[v0] Error loading quests:", error)
        setLoading(false)
      }
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

    let { experience, level, experienceToNext } = updatedState.stats
    const oldLevel = level

    while (experience >= experienceToNext) {
      experience -= experienceToNext
      level++
      experienceToNext = Math.floor(100 * Math.pow(1.5, level - 1))
    }

    updatedState.stats.experience = experience
    updatedState.stats.level = level
    updatedState.stats.experienceToNext = experienceToNext

    await saveGameState(updatedState)
    setGameState(updatedState)

    showSuccess(
      `Квест завершено!\n+${quest.rewards.experience} XP\n+${quest.rewards.money} монет${
        quest.rewards.items ? `\n+${quest.rewards.items.length} предметів` : ""
      }${level > oldLevel ? `\n🎉 Новий рівень: ${level}!` : ""}`,
      "Нагорода отримана!",
    )

    const available = getAvailableQuests(
      updatedState.stats.level,
      updatedState.completedEvents,
      updatedState.personalityType,
    )
    setStoryQuests(available.filter((q) => q.type === "story").map((q) => checkQuestProgress(q, updatedState)))
    setSideQuests(available.filter((q) => q.type === "side").map((q) => checkQuestProgress(q, updatedState)))
  }

  const renderQuest = (quest: Quest) => {
    const completed = isQuestCompleted(quest)
    const claimed = gameState?.completedEvents.includes(quest.id)
    const totalProgress = quest.objectives.reduce((sum, obj) => sum + (obj.current || 0), 0)
    const totalTarget = quest.objectives.reduce((sum, obj) => sum + obj.target, 0)
    const progressPercent = totalTarget > 0 ? (totalProgress / totalTarget) * 100 : 0

    return (
      <div
        key={quest.id}
        className={`bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-6 transition-all ${
          claimed
            ? "border-green-400 bg-green-50/50 opacity-75"
            : completed
              ? "border-green-400 bg-green-50/50 shadow-lg shadow-green-200"
              : "border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{quest.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{quest.title}</h3>
              <p className="text-sm text-gray-600">{quest.description}</p>
            </div>
          </div>
          {claimed && <CheckCircle className="w-8 h-8 text-green-500" />}
        </div>

        <div className="space-y-3 mb-4">
          {quest.objectives.map((obj) => {
            const objCompleted = (obj.current || 0) >= obj.target
            return (
              <div key={obj.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={objCompleted ? "text-green-600 line-through font-medium" : "text-gray-700"}>
                    {obj.description}
                  </span>
                  <span className="font-mono text-gray-600 font-semibold">
                    {obj.current || 0} / {obj.target}
                  </span>
                </div>
                <Progress value={((obj.current || 0) / obj.target) * 100} className="h-2" />
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1 text-purple-600">
              <Star className="w-4 h-4" />
              <span>+{quest.rewards.experience} XP</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600">
              <Gift className="w-4 h-4" />
              <span>+{quest.rewards.money} монет</span>
            </div>
            {quest.rewards.items && (
              <div className="flex items-center gap-1 text-blue-600">
                <Trophy className="w-4 h-4" />
                <span>+{quest.rewards.items.length} предмет(ів)</span>
              </div>
            )}
          </div>

          {completed && !claimed && (
            <Button
              onClick={() => handleClaimReward(quest)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
            >
              <Gift className="w-4 h-4 mr-2" />
              Отримати нагороду
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            📋 Журнал Квестів
          </h1>
          <Button
            variant="outline"
            onClick={() => router.push("/game")}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/80 backdrop-blur-sm"
          >
            Вийти
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "story" ? "default" : "outline"}
            onClick={() => setActiveTab("story")}
            className={`flex-1 ${
              activeTab === "story"
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                : "bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-purple-50"
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Сюжетні ({storyQuests.length})
          </Button>
          <Button
            variant={activeTab === "side" ? "default" : "outline"}
            onClick={() => setActiveTab("side")}
            className={`flex-1 ${
              activeTab === "side"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                : "bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50"
            }`}
          >
            <Target className="w-4 h-4 mr-2" />
            Побічні ({sideQuests.length})
          </Button>
          <Button
            variant={activeTab === "daily" ? "default" : "outline"}
            onClick={() => setActiveTab("daily")}
            className={`flex-1 ${
              activeTab === "daily"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                : "bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-amber-50"
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Щоденні ({dailyQuests.length})
          </Button>
        </div>

        <div className="space-y-4">
          {activeTab === "story" && storyQuests.length === 0 && (
            <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Всі сюжетні квести завершені!</h3>
              <p className="text-gray-600">Чекай на нові оновлення</p>
            </div>
          )}
          {activeTab === "story" && storyQuests.map(renderQuest)}

          {activeTab === "side" && sideQuests.length === 0 && (
            <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl">
              <Target className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Немає доступних побічних квестів</h3>
              <p className="text-gray-600">Підвищ рівень, щоб розблокувати більше</p>
            </div>
          )}
          {activeTab === "side" && sideQuests.map(renderQuest)}

          {activeTab === "daily" && dailyQuests.length === 0 && (
            <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl">
              <Clock className="w-16 h-16 mx-auto mb-4 text-amber-400" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Всі щоденні квести завершені!</h3>
              <p className="text-gray-600">Повертайся завтра за новими</p>
            </div>
          )}
          {activeTab === "daily" && dailyQuests.map(renderQuest)}
        </div>
      </div>
    </div>
  )
}
