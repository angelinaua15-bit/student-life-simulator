"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, Zap, Shield, Swords } from "lucide-react"
import { getBossById, type Boss } from "@/lib/boss-data"
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state"
import { useGameModal } from "@/lib/use-game-modal"

export default function BossBattlePage() {
  const router = useRouter()
  const params = useParams()
  const { showSuccess } = useGameModal()
  const [boss, setBoss] = useState<Boss | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerHp, setPlayerHp] = useState(100)
  const [bossHp, setBossHp] = useState(0)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [battleStarted, setBattleStarted] = useState(false)
  const [battleEnded, setBattleEnded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const bossId = params.bossId as string
      const foundBoss = getBossById(bossId)
      if (!foundBoss) {
        router.push("/game/boss-battle")
        return
      }

      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }

      setBoss(foundBoss)
      setBossHp(foundBoss.maxHp)
      setGameState(state)

      // Boss intro
      const intro = foundBoss.dialogue.intro[Math.floor(Math.random() * foundBoss.dialogue.intro.length)]
      setBattleLog([`${foundBoss.name}: "${intro}"`])
    }
    load()
  }, [params, router])

  const startBattle = () => {
    if (!gameState || !boss) return

    if (gameState.stats.energy < 20) {
      showSuccess("Недостатньо енергії! Потрібно 20 енергії.", "Замало енергії")
      return
    }

    setBattleStarted(true)
    addLog("Битва почалася!")
  }

  const addLog = (message: string) => {
    setBattleLog((prev) => [message, ...prev].slice(0, 10))
  }

  const playerAttack = (attackType: "light" | "medium" | "heavy") => {
    if (!boss || !isPlayerTurn || battleEnded) return

    let damage = 0
    let attackName = ""

    switch (attackType) {
      case "light":
        damage = Math.floor(Math.random() * 10) + 10
        attackName = "Швидка відповідь"
        break
      case "medium":
        damage = Math.floor(Math.random() * 15) + 15
        attackName = "Продумана відповідь"
        break
      case "heavy":
        damage = Math.floor(Math.random() * 20) + 20
        attackName = "Ідеальна відповідь"
        break
    }

    const newBossHp = Math.max(0, bossHp - damage)
    setBossHp(newBossHp)
    addLog(`Ти використав "${attackName}"! ${boss.name} отримав ${damage} шкоди!`)

    if (boss.dialogue.damaged.length > 0) {
      const damagedQuote = boss.dialogue.damaged[Math.floor(Math.random() * boss.dialogue.damaged.length)]
      addLog(`${boss.name}: "${damagedQuote}"`)
    }

    if (newBossHp === 0) {
      endBattle(true)
      return
    }

    setIsPlayerTurn(false)
    setTimeout(bossAttack, 1500)
  }

  const bossAttack = () => {
    if (!boss || battleEnded) return

    const attack = boss.attacks[Math.floor(Math.random() * boss.attacks.length)]
    const damage = Math.floor(attack.damage * (0.8 + Math.random() * 0.4))

    const newPlayerHp = Math.max(0, playerHp - damage)
    setPlayerHp(newPlayerHp)
    addLog(`${boss.name} використав "${attack.name}"! Ти отримав ${damage} шкоди!`)

    const attackQuote = boss.dialogue.attacking[Math.floor(Math.random() * boss.dialogue.attacking.length)]
    addLog(`${boss.name}: "${attackQuote}"`)

    if (newPlayerHp === 0) {
      endBattle(false)
      return
    }

    setIsPlayerTurn(true)
  }

  const endBattle = async (playerWon: boolean) => {
    if (!boss || !gameState) return

    setBattleEnded(true)

    if (playerWon) {
      addLog(`${boss.name}: "${boss.dialogue.defeated}"`)
      addLog("Перемога!")

      const updatedState = {
        ...gameState,
        stats: {
          ...gameState.stats,
          experience: gameState.stats.experience + boss.rewards.experience,
          money: gameState.stats.money + boss.rewards.money,
          energy: gameState.stats.energy - 20,
          happiness: Math.min(100, gameState.stats.happiness + 15),
          stress: Math.max(0, gameState.stats.stress - 10),
        },
        completedEvents: [...gameState.completedEvents, `boss-${boss.id}`],
        inventory: boss.rewards.items ? [...gameState.inventory, ...boss.rewards.items] : gameState.inventory,
      }

      await saveGameState(updatedState)

      setTimeout(() => {
        showSuccess(
          `Бос переможений!\n+${boss.rewards.experience} XP\n+${boss.rewards.money} монет${
            boss.rewards.items ? `\n+${boss.rewards.items.length} предметів` : ""
          }`,
          "Перемога!",
        )
        router.push("/game/boss-battle")
      }, 2000)
    } else {
      addLog("Поразка... Спробуй ще раз!")

      const updatedState = {
        ...gameState,
        stats: {
          ...gameState.stats,
          energy: gameState.stats.energy - 10,
          stress: Math.min(100, gameState.stats.stress + 15),
        },
      }

      await saveGameState(updatedState)

      setTimeout(() => {
        router.push("/game/boss-battle")
      }, 2000)
    }
  }

  if (!boss || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const playerHpPercent = (playerHp / 100) * 100
  const bossHpPercent = (bossHp / boss.maxHp) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/game/boss-battle")}
            className="border-purple-400 text-purple-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Втекти
          </Button>
          <h1 className="text-2xl font-bold text-white">Босс-Баттл</h1>
          <div className="w-24" />
        </div>

        {/* Battle Arena */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Player */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">🎓</div>
              <h3 className="text-xl font-bold">{gameState.playerName}</h3>
              <p className="text-sm text-muted-foreground">Рівень {gameState.stats.level}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>HP</span>
                <span>{playerHp} / 100</span>
              </div>
              <Progress value={playerHpPercent} className="h-4 bg-red-900">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${playerHpPercent}%` }}
                />
              </Progress>
            </div>
          </div>

          {/* Boss */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border-2 border-red-500">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{boss.avatar}</div>
              <h3 className="text-xl font-bold">{boss.name}</h3>
              <p className="text-sm text-muted-foreground">{boss.title}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>HP</span>
                <span>
                  {bossHp} / {boss.maxHp}
                </span>
              </div>
              <Progress value={bossHpPercent} className="h-4 bg-green-900">
                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${bossHpPercent}%` }} />
              </Progress>
            </div>
          </div>
        </div>

        {/* Battle Actions */}
        {!battleStarted && (
          <div className="bg-card rounded-xl p-8 text-center">
            <p className="text-lg mb-4">{boss.description}</p>
            <p className="text-sm text-muted-foreground mb-6">Витрати енергії: 20</p>
            <Button onClick={startBattle} size="lg" className="bg-red-600 hover:bg-red-700">
              <Swords className="w-5 h-5 mr-2" />
              Почати битву!
            </Button>
          </div>
        )}

        {battleStarted && !battleEnded && (
          <div className="bg-card rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-center">{isPlayerTurn ? "Твій хід!" : "Хід боса..."}</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => playerAttack("light")}
                disabled={!isPlayerTurn}
                className="h-auto py-4 flex flex-col gap-2"
                variant="outline"
              >
                <Zap className="w-6 h-6" />
                <div>
                  <div className="font-bold">Швидка</div>
                  <div className="text-xs">10-20 шкоди</div>
                </div>
              </Button>
              <Button
                onClick={() => playerAttack("medium")}
                disabled={!isPlayerTurn}
                className="h-auto py-4 flex flex-col gap-2"
                variant="outline"
              >
                <Shield className="w-6 h-6" />
                <div>
                  <div className="font-bold">Продумана</div>
                  <div className="text-xs">15-30 шкоди</div>
                </div>
              </Button>
              <Button
                onClick={() => playerAttack("heavy")}
                disabled={!isPlayerTurn}
                className="h-auto py-4 flex flex-col gap-2"
                variant="outline"
              >
                <Heart className="w-6 h-6" />
                <div>
                  <div className="font-bold">Ідеальна</div>
                  <div className="text-xs">20-40 шкоди</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Battle Log */}
        <div className="bg-card rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Журнал битви</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {battleLog.map((log, index) => (
              <div
                key={index}
                className="text-sm p-2 bg-muted/50 rounded animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
