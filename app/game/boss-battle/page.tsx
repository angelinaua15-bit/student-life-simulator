"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Swords, Lock, Trophy } from "lucide-react"
import { BOSSES, type Boss } from "@/lib/boss-data"
import { loadGameState, type GameState } from "@/lib/game-state"
import Link from "next/link"

export default function BossBattleListPage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }
      setGameState(state)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const renderBoss = (boss: Boss) => {
    const isUnlocked = gameState.stats.level >= boss.level
    const isDefeated = gameState.completedEvents.includes(`boss-${boss.id}`)

    return (
      <div
        key={boss.id}
        className={`bg-card border-2 rounded-xl p-6 transition-all ${
          isDefeated
            ? "border-green-500 bg-green-500/10"
            : isUnlocked
              ? "border-border hover:border-primary/50 hover:shadow-lg"
              : "border-border opacity-50"
        }`}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="text-6xl">{boss.avatar}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {boss.name}
              {isDefeated && <Trophy className="w-5 h-5 text-green-500" />}
              {!isUnlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
            </h3>
            <p className="text-sm text-primary">{boss.title}</p>
            <p className="text-sm text-muted-foreground mt-2">{boss.description}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Рівень боса:</span>
            <span className="font-bold">{boss.level}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>HP боса:</span>
            <span className="font-bold">{boss.maxHp}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Нагорода:</span>
            <span className="font-bold text-accent-foreground">
              +{boss.rewards.money} монет, +{boss.rewards.experience} XP
            </span>
          </div>
        </div>

        {isUnlocked && !isDefeated && (
          <Link href={`/game/boss-battle/${boss.id}`}>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <Swords className="w-4 h-4 mr-2" />
              Кинути виклик!
            </Button>
          </Link>
        )}

        {isDefeated && (
          <Button variant="outline" className="w-full bg-transparent" disabled>
            Переможено!
          </Button>
        )}

        {!isUnlocked && (
          <Button variant="outline" className="w-full bg-transparent" disabled>
            <Lock className="w-4 h-4 mr-2" />
            Потрібен {boss.level} рівень
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-orange-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.back()} className="border-purple-400 text-purple-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            Босс-Баттли
          </h1>
          <div className="w-24" />
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-red-500/50">
          <h2 className="text-xl font-bold mb-2">Як грати?</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Кидай виклик легендарним викладачам у комедійних босс-баттлах! Використовуй різні типи відповідей, щоб
            перемогти боса.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-500" />
              <span>Витрати: 20 енергії</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>Великі нагороди за перемогу!</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">{BOSSES.map(renderBoss)}</div>
      </div>
    </div>
  )
}
