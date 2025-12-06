"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, addMoney } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, Sparkles, Coins, Trophy, Zap, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const FIXED_BETS = [5, 10, 25, 50]
const MIN_BET = Math.min(...FIXED_BETS)

// Prize structure now scales with bet amount
const calculatePrizes = (betAmount: number) => [
  { name: "Джекпот", multiplier: 10, chance: 0.02, icon: Trophy, color: "text-yellow-400" },
  { name: "Великий виграш", multiplier: 4, chance: 0.08, icon: Sparkles, color: "text-purple-400" },
  { name: "Виграш", multiplier: 2, chance: 0.15, icon: Coins, color: "text-blue-400" },
  { name: "Повернення", multiplier: 1, chance: 0.25, icon: Zap, color: "text-green-400" },
]

export default function LotteryPage() {
  const router = useRouter()
  const { showAlert } = useGameModal()
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const [selectedBet, setSelectedBet] = useState<number | null>(FIXED_BETS[0])
  const [customBet, setCustomBet] = useState("")
  const [betError, setBetError] = useState("")

  useEffect(() => {
    const initGameState = async () => {
      try {
        const state = await loadGameState()
        if (!state) {
          router.push("/")
          return
        }
        setGameState(state)
      } catch (error) {
        console.log("[v0] Error loading game state in lottery:", error)
        // Try to load from localStorage directly as fallback
        try {
          const localData = localStorage.getItem("studentLifeGameState")
          if (localData) {
            const state = JSON.parse(localData)
            setGameState(state)
          } else {
            router.push("/")
            return
          }
        } catch {
          router.push("/")
          return
        }
      } finally {
        setLoading(false)
      }
    }
    initGameState()
  }, [router])

  const handleCustomBetChange = (value: string) => {
    setCustomBet(value)
    setSelectedBet(null) // Deselect fixed bets when typing custom

    if (value === "") {
      setBetError("")
      return
    }

    const num = Number.parseFloat(value)
    if (isNaN(num) || num < 0) {
      setBetError("Введіть коректне число")
      return
    }

    if (num < MIN_BET) {
      setBetError(`Мінімальна ставка — ${MIN_BET} грн`)
      return
    }

    if (!gameState) {
      setBetError("")
      return
    }

    if (num > gameState.stats.money) {
      setBetError("Недостатньо грошей")
      return
    }

    setBetError("")
  }

  const getCurrentBet = (): number | null => {
    if (selectedBet !== null) return selectedBet

    const custom = Number.parseFloat(customBet)
    if (!isNaN(custom) && custom >= MIN_BET && (!gameState || custom <= gameState.stats.money)) {
      return custom
    }

    return null
  }

  const playLottery = async () => {
    if (!gameState) return

    const betAmount = getCurrentBet()
    if (!betAmount) {
      showAlert("Оберіть або введіть коректну ставку", "Невірна ставка")
      return
    }

    if (gameState.stats.money < betAmount) {
      showAlert(`Недостатньо грошей! Потрібно ${betAmount} грн.`, "Мало грошей")
      return
    }

    setSpinning(true)
    setResult(null)

    // Deduct bet amount
    let updated = updateStats(gameState, {
      money: gameState.stats.money - betAmount,
      stress: Math.min(100, gameState.stats.stress + 3),
    })

    setTimeout(async () => {
      // Determine prize with bet scaling
      const prizes = calculatePrizes(betAmount)
      const random = Math.random()
      let cumulative = 0
      let prize = null

      for (const p of prizes) {
        cumulative += p.chance
        if (random < cumulative) {
          prize = { ...p, amount: Math.floor(betAmount * p.multiplier) }
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
        setHistory([{ prize: prize.name, amount: prize.amount, bet: betAmount }, ...history].slice(0, 5))
      } else {
        // Lose
        setResult({ name: "Нічого", amount: 0, chance: 0, icon: Zap, color: "text-muted-foreground" })
        setHistory([{ prize: "Програш", amount: 0, bet: betAmount }, ...history].slice(0, 5))
      }

      setGameState(updated)
      await saveGameState(updated)
      setSpinning(false)
    }, 2500)
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

  const currentBet = getCurrentBet()
  const canPlay = currentBet !== null && currentBet >= MIN_BET && currentBet <= gameState.stats.money && !spinning

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-500/5 via-purple-500/5 to-pink-500/5 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Link href="/game">
          <Button variant="outline" className="mb-4 bg-background/50 backdrop-blur">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до Dashboard
          </Button>
        </Link>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse-glow shadow-lg shadow-yellow-500/50">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            Студентська Лотерея
          </h1>
          <p className="text-muted-foreground text-lg">Спробуй удачу та виграй великий приз!</p>
        </div>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
            <Coins className="w-5 h-5 text-green-400" />
            <span className="text-lg font-semibold">Твоя готівка:</span>
            <span className="text-2xl font-bold text-green-400">{gameState.stats.money} грн</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <GameCard title="Обери ставку" glowing>
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FIXED_BETS.map((bet) => (
                    <button
                      key={bet}
                      onClick={() => {
                        setSelectedBet(bet)
                        setCustomBet("")
                        setBetError("")
                      }}
                      disabled={spinning || gameState.stats.money < bet}
                      className={`
                        relative p-4 rounded-xl font-bold text-lg transition-all duration-300
                        ${
                          selectedBet === bet
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-105 shadow-lg shadow-yellow-500/50"
                            : "bg-muted/50 hover:bg-muted hover:scale-105"
                        }
                        ${gameState.stats.money < bet ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="text-2xl font-black">{bet}</div>
                      <div className="text-xs opacity-80">грн</div>
                      {selectedBet === bet && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg -z-10 blur-xl" />
                  <div className="bg-background/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      Або введіть свою ставку:
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={MIN_BET}
                        max={gameState.stats.money}
                        value={customBet}
                        onChange={(e) => handleCustomBetChange(e.target.value)}
                        placeholder={`Мінімум ${MIN_BET} грн`}
                        disabled={spinning}
                        className="text-lg font-semibold h-12 pr-12 bg-background/50"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">грн</div>
                    </div>
                    {betError && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span>{betError}</span>
                      </div>
                    )}
                    {!betError && customBet && Number.parseFloat(customBet) >= MIN_BET && (
                      <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                        <span>✓</span>
                        <span>Ставка коректна</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GameCard>

            {/* Game area */}
            <GameCard title="Гральний автомат" glowing={!spinning} className="text-center">
              <div className="py-8">
                {spinning ? (
                  <div className="space-y-4">
                    <div className="text-8xl animate-spin">🎰</div>
                    <p className="text-2xl font-bold text-primary animate-pulse">Крутимо барабан...</p>
                    <p className="text-muted-foreground">Ставка: {currentBet} грн</p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {result.amount > 0 ? (
                      <>
                        <div className={`text-6xl ${result.color}`}>
                          {result.icon && <result.icon className="w-24 h-24 mx-auto animate-bounce" />}
                        </div>
                        <p className="text-3xl font-bold">{result.name}!</p>
                        <p className="text-5xl font-black text-green-400 animate-pulse">+{result.amount} грн</p>
                        <p className="text-sm text-muted-foreground">Множник: x{result.multiplier}</p>
                      </>
                    ) : (
                      <>
                        <div className="text-8xl">😢</div>
                        <p className="text-3xl font-bold text-muted-foreground">Не пощастило</p>
                        <p className="text-xl text-destructive">-{history[0]?.bet || 0} грн</p>
                        <p className="text-sm text-muted-foreground">Спробуй ще раз!</p>
                      </>
                    )}
                    <Button onClick={() => setResult(null)} variant="outline" className="mt-4">
                      Зіграти ще раз
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-8xl animate-float">🎰</div>
                    <p className="text-2xl font-medium">Готовий до гри?</p>
                    {currentBet && (
                      <p className="text-lg text-muted-foreground">
                        Обрана ставка: <span className="font-bold text-foreground">{currentBet} грн</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!result && (
                <div className="space-y-4">
                  <Button
                    onClick={playLottery}
                    disabled={!canPlay}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {spinning ? "Крутимо..." : !currentBet ? "Оберіть ставку" : <>Грати за {currentBet} грн</>}
                  </Button>
                </div>
              )}
            </GameCard>
          </div>

          <div className="space-y-6">
            <GameCard title="Призи">
              <div className="space-y-3">
                {calculatePrizes(currentBet || MIN_BET).map((prize, idx) => {
                  const Icon = prize.icon
                  const amount = currentBet ? Math.floor(currentBet * prize.multiplier) : MIN_BET * prize.multiplier
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-muted/30 hover:border-muted/50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${prize.color}`} />
                        <div>
                          <div className="font-medium text-sm">{prize.name}</div>
                          <div className="text-xs text-muted-foreground">{(prize.chance * 100).toFixed(0)}% шанс</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{amount} грн</div>
                        <div className="text-xs text-muted-foreground">x{prize.multiplier}</div>
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xl">💔</span>
                    <div>
                      <div className="font-medium text-sm">Нічого</div>
                      <div className="text-xs text-muted-foreground">
                        {((1 - calculatePrizes(1).reduce((sum, p) => sum + p.chance, 0)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-muted-foreground text-sm">0 грн</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-xs text-center text-muted-foreground">
                  💡 Виграші збільшуються пропорційно вашій ставці
                </p>
              </div>
            </GameCard>

            {history.length > 0 && (
              <GameCard title="Історія ігор">
                <div className="space-y-2">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-muted/20 rounded-lg text-sm hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <div className={item.amount > 0 ? "text-green-400 font-medium" : "text-muted-foreground"}>
                          {item.prize}
                        </div>
                        <div className="text-xs text-muted-foreground">Ставка: {item.bet} грн</div>
                      </div>
                      <span className={`font-bold text-lg ${item.amount > 0 ? "text-green-400" : "text-destructive"}`}>
                        {item.amount > 0 ? "+" : "-"}
                        {item.amount === 0 ? item.bet : item.amount} грн
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
