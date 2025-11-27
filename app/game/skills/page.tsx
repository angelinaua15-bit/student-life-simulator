"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state"
import { SKILLS, getSkillLevel, getSkillProgress, addSkillXP } from "@/lib/skills-system"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Star, MessageCircle, Shield, Lightbulb, Zap, Trophy } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const iconMap: Record<string, any> = {
  Star: Star,
  MessageCircle: MessageCircle,
  Shield: Shield,
  Lightbulb: Lightbulb,
  Zap: Zap,
  Trophy: Trophy,
}

export default function SkillsPage() {
  const router = useRouter()
  const { showAlert, showConfirm } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const saved = await loadGameState()
      if (!saved) {
        router.push("/")
        return
      }

      // Initialize skills if not present
      if (!saved.skills) {
        saved.skills = {
          charisma: 0,
          communication: 0,
          resilience: 0,
          creativity: 0,
          agility: 0,
          success: 0,
        }
        await saveGameState(saved)
      }

      setGameState(saved)
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleTrainSkill = async (skillId: string) => {
    if (!gameState) return

    const cost = 50
    if (gameState.stats.money < cost) {
      showAlert("Недостатньо грошей для тренування! Потрібно 50 грн.", "Мало грошей")
      return
    }

    if (gameState.stats.energy < 20) {
      showAlert("Недостатньо енергії! Потрібно 20 енергії.", "Мало енергії")
      return
    }

    showConfirm(
      `Тренування навичку "${SKILLS[skillId].name}" коштує 50 грн та 20 енергії. Продовжити?`,
      async () => {
        if (!gameState.skills) return

        const currentXP = gameState.skills[skillId as keyof typeof gameState.skills] || 0
        const newXP = addSkillXP(currentXP, 25)
        const oldLevel = getSkillLevel(skillId, currentXP)
        const newLevel = getSkillLevel(skillId, newXP)

        const updatedState = {
          ...gameState,
          skills: {
            ...gameState.skills,
            [skillId]: newXP,
          },
          stats: {
            ...gameState.stats,
            money: gameState.stats.money - cost,
            energy: gameState.stats.energy - 20,
          },
        }

        setGameState(updatedState)
        await saveGameState(updatedState)

        if (newLevel > oldLevel) {
          showAlert(`Вітаємо! "${SKILLS[skillId].name}" досягнув рівня ${newLevel}!`, "Новий рівень навички!")
        } else {
          showAlert(`Ти отримав +25 XP до "${SKILLS[skillId].name}"!`, "Тренування завершено")
        }
      },
      "Тренування навички",
    )
  }

  if (loading || !gameState || !gameState.skills) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/game">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Навички</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Система Навичок RPG</h2>
          <p className="text-muted-foreground">
            Прокачуй свої навички, щоб отримати унікальні бонуси та відкрити нові можливості!
          </p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(SKILLS).map((skill) => {
            const currentXP = gameState.skills![skill.id as keyof typeof gameState.skills] || 0
            const level = getSkillLevel(skill.id, currentXP)
            const progress = getSkillProgress(currentXP)
            const Icon = iconMap[skill.icon]

            return (
              <Card key={skill.id} className="p-6">
                <div className={`p-4 rounded-lg bg-gradient-to-br ${skill.color} mb-4`}>
                  <div className="flex items-center justify-between text-white">
                    <Icon className="w-8 h-8" />
                    <div className="text-right">
                      <div className="text-2xl font-bold">Рівень {level}</div>
                      <div className="text-xs opacity-90">/ {skill.maxLevel}</div>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-2">{skill.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span>Прогрес</span>
                    <span className="font-bold">{progress} / 100 XP</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="text-xs font-semibold mb-2">Бонуси:</div>
                  <ul className="text-xs space-y-1">
                    {skill.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleTrainSkill(skill.id)}
                  disabled={level >= skill.maxLevel}
                >
                  {level >= skill.maxLevel ? "Макс. рівень" : "Тренувати (50 грн, 20 енергії)"}
                </Button>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
