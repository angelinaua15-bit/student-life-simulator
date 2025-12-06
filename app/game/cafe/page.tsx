"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, addMoney, addExperience } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { Coffee, Cookie, IceCream, X, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"
import type { GameState } from "@/lib/game-state"

const ITEMS = [
  { id: "coffee", name: "Кава", icon: Coffee, color: "text-amber-600" },
  { id: "cookie", name: "Печиво", icon: Cookie, color: "text-orange-500" },
  { id: "icecream", name: "Морозиво", icon: IceCream, color: "text-pink-500" },
]

type Order = {
  items: string[]
  timeLeft: number
}

export default function CafeGame() {
  const router = useRouter()
  const { showAlert, showSuccess } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [combo, setCombo] = useState(0)

  useEffect(() => {
    const init = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }
      setGameState(state)
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (!playing || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [playing, timeLeft])

  useEffect(() => {
    if (!playing || !currentOrder) return

    const orderTimer = setInterval(() => {
      setCurrentOrder((prev) => {
        if (!prev) return null
        const newTimeLeft = prev.timeLeft - 1
        if (newTimeLeft <= 0) {
          setCombo(0)
          setScore((s) => Math.max(0, s - 10))
          generateNewOrder()
          return null
        }
        return { ...prev, timeLeft: newTimeLeft }
      })
    }, 1000)

    return () => clearInterval(orderTimer)
  }, [playing, currentOrder])

  const generateNewOrder = () => {
    const numItems = Math.min(1 + Math.floor(score / 5), 4)
    const items = []
    for (let i = 0; i < numItems; i++) {
      items.push(ITEMS[Math.floor(Math.random() * ITEMS.length)].id)
    }
    setCurrentOrder({
      items,
      timeLeft: Math.max(10 - Math.floor(score / 10), 5),
    })
    setSelectedItems([])
  }

  const startGame = async () => {
    if (!gameState) return

    if (gameState.stats.energy < 10) {
      showAlert("Недостатньо енергії! Потрібно мінімум 10.", "Мало енергії")
      return
    }

    setPlaying(true)
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    generateNewOrder()

    const updated = updateStats(gameState, {
      energy: gameState.stats.energy - 10,
    })
    setGameState(updated)
    await saveGameState(updated)
  }

  const endGame = async () => {
    setPlaying(false)
    setCurrentOrder(null)

    if (!gameState) return

    const moneyEarned = Math.floor(score * 2)
    const exp = Math.floor(score / 2)

    let updated = addMoney(gameState, moneyEarned)
    updated = addExperience(updated, exp)
    updated = updateStats(updated, {
      happiness: Math.min(100, updated.stats.happiness + 5),
      stress: Math.max(0, updated.stats.stress - 5),
    })

    if (score > updated.minigameHighScores.cafe) {
      updated = {
        ...updated,
        minigameHighScores: {
          ...updated.minigameHighScores,
          cafe: score,
        },
      }
    }

    setGameState(updated)
    await saveGameState(updated)

    showSuccess(`Очки: ${score}\nЗаробив: ${moneyEarned} грн\nДосвід: +${exp}`, "Гру завершено!")
  }

  const selectItem = (itemId: string) => {
    if (!currentOrder || !playing) return

    if (selectedItems.length >= currentOrder.items.length) return

    setSelectedItems([...selectedItems, itemId])
  }

  const submitOrder = () => {
    if (!currentOrder || !playing) return

    const correct =
      currentOrder.items.length === selectedItems.length &&
      currentOrder.items.every((item, idx) => item === selectedItems[idx])

    if (correct) {
      const basePoints = currentOrder.items.length * 10
      const comboBonus = combo * 5
      const points = basePoints + comboBonus
      setScore((s) => s + points)
      setCombo((c) => c + 1)
      generateNewOrder()
    } else {
      setCombo(0)
      setScore((s) => Math.max(0, s - 5))
      generateNewOrder()
    }
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження гри...</p>
        </div>
      </div>
    )
  }

  if (!gameState) return null

  if (!playing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10 p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-200/10 to-orange-200/10 rounded-full blur-3xl animate-soft-float" />
          <div className="absolute bottom-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/10 to-rose-200/10 rounded-full blur-3xl animate-soft-float delay-300" />
        </div>

        <div className="container mx-auto max-w-2xl py-8 relative z-10">
          <Link href="/game">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до Dashboard
            </Button>
          </Link>

          <GameCard title="🍵 Кафе" description="Приймай замовлення клієнтів швидко та точно!">
            <div className="space-y-6">
              <Button
                onClick={startGame}
                className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] rounded-2xl"
                disabled={gameState.stats.energy < 10}
              >
                {gameState.stats.energy < 10 ? "Недостатньо енергії (-10 потрібно)" : "🎮 Почати гру (-10 енергії)"}
              </Button>

              <div className="bg-card/80 backdrop-blur-sm border border-border p-4 rounded-2xl space-y-2">
                <h3 className="font-bold text-lg">Як грати:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Запам'ятай замовлення клієнта (показано вгорі)</li>
                  <li>Вибери правильні позиції в правильному порядку</li>
                  <li>Натисни "Подати замовлення" для перевірки</li>
                  <li>Правильне замовлення = очки + комбо!</li>
                  <li>Комбо множить твої очки!</li>
                  <li>Не дай замовленню згоріти (червоний таймер)!</li>
                  <li>Гра триває 60 секунд</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border">
                  <div className="text-3xl font-bold text-foreground">{gameState.minigameHighScores.cafe}</div>
                  <div className="text-sm text-muted-foreground">Твій рекорд</div>
                </div>
                <div className="text-center p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border">
                  <div className="text-3xl font-bold text-foreground">{gameState.stats.energy}</div>
                  <div className="text-sm text-muted-foreground">Енергія</div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Нагороди за гру:</div>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Гроші: 2 грн за очко</li>
                  <li>Досвід: 1 XP за 2 очки</li>
                  <li>+5 щастя, -5 стрес</li>
                </ul>
              </div>
            </div>
          </GameCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10 p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-200/10 to-orange-200/10 rounded-full blur-3xl animate-soft-float" />
        <div className="absolute bottom-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/10 to-rose-200/10 rounded-full blur-3xl animate-soft-float delay-300" />
      </div>

      <div className="container mx-auto max-w-2xl py-8 space-y-4 relative z-10">
        <div className="sticky top-4 z-10 bg-card rounded-lg p-4 shadow-lg border-2 border-primary/10">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">Очки</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-foreground">{combo}x</div>
              <div className="text-xs text-muted-foreground">Комбо</div>
            </div>
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${timeLeft <= 10 ? "text-destructive animate-pulse" : "text-foreground"}`}
              >
                {timeLeft}s
              </div>
              <div className="text-xs text-muted-foreground">Час гри</div>
            </div>
          </div>
        </div>

        {currentOrder && (
          <GameCard title="Замовлення клієнта" className="border-2 border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                {currentOrder.items.map((itemId, idx) => {
                  const item = ITEMS.find((i) => i.id === itemId)
                  if (!item) return null
                  const Icon = item.icon
                  return (
                    <div key={idx} className="text-center animate-bounce" style={{ animationDelay: `${idx * 100}ms` }}>
                      <Icon className={`w-14 h-14 ${item.color}`} />
                      <div className="text-xs mt-1 font-medium">{item.name}</div>
                    </div>
                  )
                })}
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${currentOrder.timeLeft <= 3 ? "text-destructive animate-pulse" : "text-warning-foreground"}`}
                >
                  {currentOrder.timeLeft}s
                </div>
                <div className="text-sm text-muted-foreground">До згорання замовлення</div>
              </div>
            </div>
          </GameCard>
        )}

        <div className="sticky bottom-4 z-10">
          <GameCard title="Твоє замовлення" className="border-2 border-accent/20 shadow-xl">
            <div className="flex items-center justify-center gap-3 p-6 bg-muted/30 rounded-lg min-h-[100px]">
              {selectedItems.length === 0 ? (
                <div className="text-muted-foreground text-center">
                  <div className="text-lg">Вибери позиції внизу ⬇️</div>
                  <div className="text-sm mt-1">Порядок важливий!</div>
                </div>
              ) : (
                selectedItems.map((itemId, idx) => {
                  const item = ITEMS.find((i) => i.id === itemId)
                  if (!item) return null
                  const Icon = item.icon
                  return (
                    <div key={idx} className="text-center relative">
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <Icon className={`w-12 h-12 ${item.color}`} />
                      <div className="text-xs mt-1">{item.name}</div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={clearSelection}
                variant="outline"
                className="flex-1 bg-transparent hover:bg-destructive/10 hover:text-destructive"
                disabled={selectedItems.length === 0}
              >
                <X className="w-4 h-4 mr-2" />
                Очистити
              </Button>
              <Button
                onClick={submitOrder}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={!currentOrder || selectedItems.length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Подати замовлення
              </Button>
            </div>
          </GameCard>
        </div>

        <GameCard title="Меню кафе" className="border-2 border-secondary/20">
          <div className="grid grid-cols-3 gap-4">
            {ITEMS.map((item) => {
              const Icon = item.icon
              const canSelect = currentOrder && selectedItems.length < currentOrder.items.length
              return (
                <Button
                  key={item.id}
                  onClick={() => selectItem(item.id)}
                  variant="outline"
                  className={`h-28 flex-col gap-2 hover:scale-105 transition-transform ${!canSelect ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!canSelect}
                >
                  <Icon className={`w-10 h-10 ${item.color}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Button>
              )
            })}
          </div>
          {currentOrder && selectedItems.length >= currentOrder.items.length && (
            <div className="text-center mt-4 text-sm text-warning-foreground font-medium">
              Замовлення повне! Натисни "Подати" ⬆️
            </div>
          )}
        </GameCard>
      </div>
    </div>
  )
}
