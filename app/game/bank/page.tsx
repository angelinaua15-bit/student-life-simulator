"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, TrendingUp, TrendingDown, Building2, Coins, Loader2, Clock } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const INTEREST_RATE = 0.05
const INTEREST_COOLDOWN_MS = 24 * 60 * 60 * 1000

export default function BankPage() {
  const router = useRouter()
  const { showAlert, showSuccess } = useGameModal()
  const [gameState, setGameState] = useState<Awaited<ReturnType<typeof loadGameState>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>("")
  const [canClaimInterest, setCanClaimInterest] = useState(true)

  useEffect(() => {
    const loadState = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }
      setGameState(state)
      setLoading(false)
    }
    loadState()
  }, [router])

  useEffect(() => {
    if (!gameState) return

    const updateCountdown = () => {
      const now = Date.now()
      const lastClaim = gameState.lastInterestClaim || 0
      const timeSinceLastClaim = now - lastClaim
      const timeRemaining = INTEREST_COOLDOWN_MS - timeSinceLastClaim

      if (timeRemaining <= 0) {
        setCanClaimInterest(true)
        setTimeUntilNextClaim("")
      } else {
        setCanClaimInterest(false)
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        setTimeUntilNextClaim(`${hours} год ${minutes} хв`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [gameState])

  const handleDeposit = async () => {
    if (!gameState) return

    const amount = Number.parseInt(depositAmount)

    if (isNaN(amount) || amount <= 0) {
      showAlert("Введи коректну суму більше 0!", "Помилка")
      return
    }

    if (amount > gameState.stats.money) {
      showAlert(`Недостатньо готівки! У тебе тільки ${gameState.stats.money} грн.`, "Помилка")
      return
    }

    const updated = updateStats(gameState, {
      money: gameState.stats.money - amount,
      bankBalance: gameState.stats.bankBalance + amount,
    })

    setGameState(updated)
    await saveGameState(updated)
    setDepositAmount("")
    showSuccess(`Успішно поклав ${amount} грн в банк!`, "Успіх")
  }

  const handleWithdraw = async () => {
    if (!gameState) return

    const amount = Number.parseInt(withdrawAmount)

    if (isNaN(amount) || amount <= 0) {
      showAlert("Введи коректну суму більше 0!", "Помилка")
      return
    }

    if (amount > gameState.stats.bankBalance) {
      showAlert(`Недостатньо коштів на рахунку! У тебе тільки ${gameState.stats.bankBalance} грн.`, "Помилка")
      return
    }

    const updated = updateStats(gameState, {
      money: gameState.stats.money + amount,
      bankBalance: gameState.stats.bankBalance - amount,
    })

    setGameState(updated)
    await saveGameState(updated)
    setWithdrawAmount("")
    showSuccess(`Успішно зняв ${amount} грн!`, "Успіх")
  }

  const handleClaimInterest = async () => {
    if (!gameState) return

    if (gameState.stats.bankBalance < 100) {
      showAlert("Мінімальний баланс для відсотків: 100 грн", "Недостатньо коштів")
      return
    }

    if (!canClaimInterest) {
      showAlert(`Ти вже отримав відсотки сьогодні!\nНаступне отримання через: ${timeUntilNextClaim}`, "Зачекай")
      return
    }

    const interest = Math.floor(gameState.stats.bankBalance * INTEREST_RATE)

    const updated = {
      ...updateStats(gameState, {
        bankBalance: gameState.stats.bankBalance + interest,
        happiness: Math.min(100, gameState.stats.happiness + 5),
      }),
      lastInterestClaim: Date.now(),
    }

    setGameState(updated)
    await saveGameState(updated)

    showSuccess(
      `Отримано відсотки: ${interest} грн! 💰\nТвій новий баланс: ${updated.stats.bankBalance} грн`,
      "Вітаємо!",
    )
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    )
  }

  const projectedInterest = Math.floor(gameState.stats.bankBalance * INTEREST_RATE)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10 p-4 relative overflow-hidden">
      {/* Soft 3D floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/15 to-cyan-200/15 rounded-full blur-3xl animate-soft-float" />
        <div className="absolute bottom-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-green-200/15 to-emerald-200/15 rounded-full blur-3xl animate-soft-float delay-300" />
      </div>

      <div className="container mx-auto max-w-3xl py-8 relative z-10">
        <Link href="/game">
          <Button variant="outline" className="mb-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до Dashboard
          </Button>
        </Link>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400/90 to-cyan-400/90 rounded-2xl mb-4 shadow-xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Студентський Банк
          </h1>
          <p className="text-muted-foreground">Зберігай гроші та отримуй відсотки</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <GameCard title="Твої фінанси">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">Готівка</span>
                </div>
                <span className="text-2xl font-bold">{gameState.stats.money} грн</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">На рахунку</span>
                </div>
                <span className="text-2xl font-bold">{gameState.stats.bankBalance} грн</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50/50 dark:bg-green-900/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Очікувані відсотки</span>
                </div>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">{projectedInterest} грн</span>
              </div>
            </div>
          </GameCard>

          <GameCard title="Відсотки">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl space-y-2">
                <h3 className="font-bold text-center text-4xl text-green-600 dark:text-green-400">
                  {INTEREST_RATE * 100}%
                </h3>
                <p className="text-center text-sm text-muted-foreground">Відсоткова ставка</p>
              </div>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Отримуй {INTEREST_RATE * 100}% від балансу</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Мінімальний баланс: 100 грн</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Забирай відсотки 1 раз на день</span>
                </li>
              </ul>

              {!canClaimInterest && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <Clock className="w-4 h-4" />
                    <span>Наступне отримання через: {timeUntilNextClaim}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleClaimInterest}
                className="w-full transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-lg"
                disabled={gameState.stats.bankBalance < 100 || !canClaimInterest}
                style={{
                  opacity: gameState.stats.bankBalance < 100 || !canClaimInterest ? 0.5 : 1,
                }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {canClaimInterest ? "Отримати відсотки" : "Відсотки отримано"}
              </Button>
            </div>
          </GameCard>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GameCard title="Поповнити рахунок" glowing={gameState.stats.money > 500}>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center mb-2">
                Доступно готівки:{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">{gameState.stats.money} грн</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Сума (грн)</label>
                <Input
                  type="number"
                  placeholder="Введи суму..."
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  max={gameState.stats.money}
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(String(Math.min(100, gameState.stats.money)))}
                  className="rounded-full"
                >
                  100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(String(Math.min(500, gameState.stats.money)))}
                  className="rounded-full"
                >
                  500
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(String(gameState.stats.money))}
                  className="rounded-full"
                >
                  Все
                </Button>
              </div>
              <Button
                onClick={handleDeposit}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl shadow-lg"
                disabled={!depositAmount || gameState.stats.money === 0}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Покласти в банк
              </Button>
            </div>
          </GameCard>

          <GameCard title="Зняти з рахунку">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center mb-2">
                На рахунку:{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">{gameState.stats.bankBalance} грн</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Сума (грн)</label>
                <Input
                  type="number"
                  placeholder="Введи суму..."
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={gameState.stats.bankBalance}
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(Math.min(100, gameState.stats.bankBalance)))}
                  className="rounded-full"
                >
                  100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(Math.min(500, gameState.stats.bankBalance)))}
                  className="rounded-full"
                >
                  500
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(gameState.stats.bankBalance))}
                  className="rounded-full"
                >
                  Все
                </Button>
              </div>
              <Button
                onClick={handleWithdraw}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg"
                disabled={!withdrawAmount || gameState.stats.bankBalance === 0}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Зняти готівку
              </Button>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  )
}
