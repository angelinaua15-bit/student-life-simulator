"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, type GameState } from "@/lib/game-state"
import { shadowStudentAI, type ShadowProfile, type ShadowChallenge } from "@/lib/shadow-student-system"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Swords, Trophy, Target, Clock, Zap, User } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useGameModal } from "@/lib/use-game-modal"

export default function ShadowStudentPage() {
  const router = useRouter()
  const { showSuccess, showAlert } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [shadowProfile, setShadowProfile] = useState<ShadowProfile | null>(null)
  const [currentChallenge, setCurrentChallenge] = useState<ShadowChallenge | null>(null)

  useEffect(() => {
    const load = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }

      setGameState(state)

      // Ініціалізація або отримання Shadow профілю
      let shadow = shadowStudentAI.getShadowProfile()
      if (!shadow) {
        shadow = shadowStudentAI.initializeShadow(state)
      }
      setShadowProfile(shadow)
      setCurrentChallenge(shadow.currentChallenge || null)

      setLoading(false)
    }

    load()
  }, [router])

  const handleCreateChallenge = () => {
    if (!gameState) return

    const challenge = shadowStudentAI.createChallenge(gameState)
    setCurrentChallenge(challenge)

    showSuccess("Виклик прийнято! Покажи, на що ти здатний!", "Новий виклик")
  }

  const handleAcceptHint = () => {
    if (!gameState) return

    const encounter = shadowStudentAI.generateEncounter("hint", gameState)
    showAlert(encounter.message, "Підказка від Тіні")
  }

  if (loading || !gameState || !shadowProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const timeUntilDeadline = currentChallenge ? currentChallenge.deadline - Date.now() : 0
  const hoursLeft = Math.floor(timeUntilDeadline / (1000 * 60 * 60))
  const challengeProgress = currentChallenge
    ? Math.min(100, (currentChallenge.progress / Number(currentChallenge.target)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8">
          <Link href="/game">
            <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до Гри
            </Button>
          </Link>

          <div className="text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"
            >
              Твоє Альтер-Его
            </motion.h1>
            <p className="text-gray-400">Зустрінь свою темну версію</p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Player Card */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <GameCard title={gameState.playerName} description="Ти">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <span className="text-sm">Рівень</span>
                  <span className="font-bold text-xl">{gameState.stats.level}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <span className="text-sm">Перемоги</span>
                  <span className="font-bold text-xl">{shadowProfile.challengesLost}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <span className="text-sm">Гроші</span>
                  <span className="font-bold text-xl">{gameState.stats.money} грн</span>
                </div>
              </div>
            </GameCard>
          </motion.div>

          {/* Shadow Card */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <GameCard
              title={shadowProfile.name}
              description={`Особистість: ${shadowProfile.personality}`}
              className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/50 to-black/50"
              glowing
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <span className="text-sm">Рівень</span>
                  <span className="font-bold text-xl">{shadowProfile.level}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <span className="text-sm">Перемоги</span>
                  <span className="font-bold text-xl">{shadowProfile.challengesWon}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                  <span className="text-sm">Виклики</span>
                  <span className="font-bold text-xl">{shadowProfile.challengesIssued}</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-black/50 rounded-lg border border-purple-500/30">
                <div className="text-sm text-gray-400 mb-2">Тіньова Аура</div>
                <div className="flex gap-2">
                  {["dark", "glitch", "mirror", "corrupted"].map((appearance, i) => (
                    <div
                      key={appearance}
                      className={`w-full h-2 rounded-full ${i === 0 ? "bg-purple-500 animate-pulse" : "bg-gray-700"}`}
                    />
                  ))}
                </div>
              </div>
            </GameCard>
          </motion.div>
        </div>

        {/* Current Challenge */}
        {currentChallenge ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <GameCard
              title="Поточний Виклик"
              description="Змагайся зі своєю тінню"
              className="border-2 border-yellow-500/50"
              glowing
            >
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-2">{currentChallenge.description}</div>
                      <div className="text-sm text-gray-400">
                        Тип: <span className="text-white">{currentChallenge.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-sm text-gray-400">Нагорода</div>
                    <div className="font-bold text-xl text-green-400">+{currentChallenge.reward} грн</div>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                    <div className="text-sm text-gray-400">Штраф</div>
                    <div className="font-bold text-xl text-red-400">-{currentChallenge.penalty} грн</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Прогрес</span>
                    <span>
                      {currentChallenge.progress} / {currentChallenge.target}
                    </span>
                  </div>
                  <Progress value={challengeProgress} className="h-3" />
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">Часу залишилось</span>
                  </div>
                  <span className="font-bold">{hoursLeft} годин</span>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 italic text-center">"Побачимо, чи зможеш ти перемогти себе..."</p>
                </div>
              </div>
            </GameCard>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <GameCard title="Немає Активного Виклику" description="Твоя тінь чекає на тебе" className="text-center">
              <div className="py-8 space-y-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <User className="w-12 h-12 text-white" />
                  </div>
                </div>

                <p className="text-gray-400 max-w-md mx-auto">
                  Тінь студента спостерігає за тобою з темряви. Готовий прийняти виклик від свого альтер-его?
                </p>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleCreateChallenge}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    <Swords className="w-5 h-5 mr-2" />
                    Кинути Виклик
                  </Button>

                  <Button onClick={handleAcceptHint} variant="outline" size="lg">
                    <Zap className="w-5 h-5 mr-2" />
                    Отримати Підказку
                  </Button>
                </div>
              </div>
            </GameCard>
          </motion.div>
        )}

        {/* Stats Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <GameCard title="Порівняння Статистики" description="Ти проти твоєї тіні">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Виклики Виграно</span>
                  <span>
                    {shadowProfile.challengesLost} vs {shadowProfile.challengesWon}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div
                    className="h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-l-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      width: `${(shadowProfile.challengesLost / Math.max(1, shadowProfile.challengesIssued)) * 100}%`,
                    }}
                  >
                    {shadowProfile.challengesLost > 0 && shadowProfile.challengesLost}
                  </div>
                  <div
                    className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-r-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      width: `${(shadowProfile.challengesWon / Math.max(1, shadowProfile.challengesIssued)) * 100}%`,
                    }}
                  >
                    {shadowProfile.challengesWon > 0 && shadowProfile.challengesWon}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold">{shadowProfile.challengesLost}</div>
                  <div className="text-xs text-gray-400">Твої Перемоги</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-bold">{shadowProfile.challengesWon}</div>
                  <div className="text-xs text-gray-400">Перемоги Тіні</div>
                </div>
              </div>
            </div>
          </GameCard>
        </motion.div>
      </div>
    </div>
  )
}
