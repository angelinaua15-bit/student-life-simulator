"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, addMoney } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, Sparkles, Coins, Trophy, Zap } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const TICKET_PRICE = 50
const PRIZES = [
  { name: "Джекпот", amount: 500, chance: 0.02, icon: Trophy, color: "text-accent-foreground" },
  { name: "Великий виграш", amount: 200, chance: 0.08, icon: Sparkles, color: "text-primary" },
  { name: "Виграш", amount: 100, chance: 0.15, icon: Coins, color: "text-secondary" },
  { name: "Повернення", amount: 50, chance: 0.25, icon: Zap, color: "text-success" },
]

export default function LotteryPage() {
  const router = useRouter()
  const { showAlert } = useGameModal()
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const initGameState = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }
      setGameState(state)
      setLoading(false)
    }
    initGameState()
  }, [router])

  const playLottery = async () => {
    if (!gameState) return

    if (gameState.stats.money < TICKET_PRICE) {
      showAlert("Недостатньо грошей! Потрібно 50 грн.", "Мало грошей")
      return
    }

    setSpinning(true)
    setResult(null)

    // Deduct ticket price
    let updated = updateStats(gameState, {
      money: gameState.stats.money - TICKET_PRICE,
      stress: Math.min(100, gameState.stats.stress + 5),
    })

    setTimeout(async () => {
      // Determine prize
      const random = Math.random()
      let cumulative = 0
      let prize = null

      for (const p of PRIZES) {
        cumulative += p.chance
        if (random < cumulative) {
          prize = p
          break
        }
      }

      if (prize) {
        // Win
        updated = addMoney(updated, prize.amount)
        updated = updateStats(updated, {
          happiness: Math.min(100, updated.stats.happiness + 10),
        })
        setResult(prize)
        setHistory([{ prize: prize.name, amount: prize.amount }, ...history].slice(0, 5))
      } else {
        // Lose
        setResult({ name: "Нічого", amount: 0, chance: 0, icon: Zap, color: "text-muted-foreground" })
        setHistory([{ prize: "Програш", amount: 0 }, ...history].slice(0, 5))
      }

      setGameState(updated)
      await saveGameState(updated)
      setSpinning(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (!gameState) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <Link href="/game">
          <Button variant="outline" className="mb-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до Dashboard
          </Button>
        </Link>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-accent/50 rounded-full mb-4 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Студентська Лотерея</h1>
          <p className="text-muted-foreground">Спробуй удачу та виграй великий приз!</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <GameCard title="Спробуй удачу" glowing={!spinning} className="text-center">
              <div className="py-8">
                {spinning ? (
                  <div className="space-y-4">
                    <div className="text-6xl animate-spin">🎰</div>
                    <p className="text-xl font-bold text-primary">Крутимо барабан...</p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {result.amount > 0 ? (
                      <>
                        <div className={`text-6xl ${result.color}`}>
                          {result.icon && <result.icon className="w-20 h-20 mx-auto" />}
                        </div>
                        <p className="text-2xl font-bold">{result.name}!</p>
                        <p className="text-4xl font-black text-success">+{result.amount} грн</p>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl">😢</div>
                        <p className="text-2xl font-bold text-muted-foreground">Не пощастило</p>
                        <p className="text-sm text-muted-foreground">Спробуй ще раз!</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl animate-float">🎰</div>
                    <p className="text-xl font-medium">Готовий до гри?</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-lg">
                  <Coins className="w-5 h-5 text-accent-foreground" />
                  <span className="font-medium">Ціна квитка:</span>
                  <span className="font-bold">{TICKET_PRICE} грн</span>
                </div>
                <Button
                  onClick={playLottery}
                  disabled={spinning || gameState.stats.money < TICKET_PRICE}
                  className="w-full h-14 text-lg font-bold"
                  size="lg"
                >
                  {spinning ? "Крутимо..." : "Купити квиток"}
                </Button>
                <p className="text-sm text-muted-foreground">Твоя готівка: {gameState.stats.money} грн</p>
              </div>
            </GameCard>
          </div>

          <div className="space-y-6">
            <GameCard title="Призи">
              <div className="space-y-3">
                {PRIZES.map((prize, idx) => {
                  const Icon = prize.icon
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${prize.color}`} />
                        <div>
                          <div className="font-medium text-sm">{prize.name}</div>
                          <div className="text-xs text-muted-foreground">{(prize.chance * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <span className="font-bold">{prize.amount} грн</span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">💔</span>
                    <div>
                      <div className="font-medium text-sm">Нічого</div>
                      <div className="text-xs text-muted-foreground">
                        {((1 - PRIZES.reduce((sum, p) => sum + p.chance, 0)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-muted-foreground">0 грн</span>
                </div>
              </div>
            </GameCard>

            {history.length > 0 && (
              <GameCard title="Історія">
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted/20 rounded text-sm">
                      <span className={item.amount > 0 ? "text-success" : "text-muted-foreground"}>{item.prize}</span>
                      <span className={`font-bold ${item.amount > 0 ? "text-success" : "text-destructive"}`}>
                        {item.amount > 0 ? "+" : ""}
                        {item.amount === 0 ? "-50" : item.amount} грн
                      </span>
                    </div>
                  ))}
                </div>
              </GameCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
