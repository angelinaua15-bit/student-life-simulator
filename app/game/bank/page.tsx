"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, TrendingUp, TrendingDown, Building2, Coins, Loader2 } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const INTEREST_RATE = 0.05 // 5% per day

export default function BankPage() {
  const router = useRouter()
  const { showAlert, showSuccess } = useGameModal()
  const [gameState, setGameState] = useState<Awaited<ReturnType<typeof loadGameState>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

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

  const handleDeposit = async () => {
    if (!gameState) return

    const amount = Number.parseInt(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      showAlert("Введи коректну суму!", "Помилка")
      return
    }

    if (amount > gameState.stats.money) {
      showAlert("Недостатньо готівки!", "Помилка")
      return
    }

    const updated = updateStats(gameState, {
      money: gameState.stats.money - amount,
      bankBalance: gameState.stats.bankBalance + amount,
    })

    setGameState(updated)
    await saveGameState(updated)
    setDepositAmount("")
  }

  const handleWithdraw = async () => {
    if (!gameState) return

    const amount = Number.parseInt(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      showAlert("Введи коректну суму!", "Помилка")
      return
    }

    if (amount > gameState.stats.bankBalance) {
      showAlert("Недостатньо коштів на рахунку!", "Помилка")
      return
    }

    const updated = updateStats(gameState, {
      money: gameState.stats.money + amount,
      bankBalance: gameState.stats.bankBalance - amount,
    })

    setGameState(updated)
    await saveGameState(updated)
    setWithdrawAmount("")
  }

  const handleClaimInterest = async () => {
    if (!gameState) return

    if (gameState.stats.bankBalance < 100) {
      showAlert("Мінімальний баланс для відсотків: 100 грн", "Недостатньо коштів")
      return
    }

    const interest = Math.floor(gameState.stats.bankBalance * INTEREST_RATE)

    const updated = updateStats(gameState, {
      bankBalance: gameState.stats.bankBalance + interest,
      happiness: Math.min(100, gameState.stats.happiness + 5),
    })

    setGameState(updated)
    await saveGameState(updated)

    showSuccess(`Отримано відсотки: ${interest} грн! 💰`, "Вітаємо!")
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    )
  }

  const projectedInterest = Math.floor(gameState.stats.bankBalance * INTEREST_RATE)

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary to-secondary/50 rounded-full mb-4">
            <Building2 className="w-10 h-10 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Студентський Банк</h1>
          <p className="text-muted-foreground">Зберігай гроші та отримуй відсотки</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <GameCard title="Твої фінанси">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent-foreground" />
                  <span className="font-medium">Готівка</span>
                </div>
                <span className="text-2xl font-bold">{gameState.stats.money} грн</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-secondary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-secondary" />
                  <span className="font-medium">На рахунку</span>
                </div>
                <span className="text-2xl font-bold">{gameState.stats.bankBalance} грн</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="font-medium">Очікувані відсотки</span>
                </div>
                <span className="text-xl font-bold text-success">{projectedInterest} грн</span>
              </div>
            </div>
          </GameCard>

          <GameCard title="Відсотки">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-bold text-center text-4xl text-success">{INTEREST_RATE * 100}%</h3>
                <p className="text-center text-sm text-muted-foreground">Відсоткова ставка</p>
              </div>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Отримуй {INTEREST_RATE * 100}% від балансу</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Мінімальний баланс: 100 грн</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Забирай відсотки коли завгодно</span>
                </li>
              </ul>
              <Button onClick={handleClaimInterest} className="w-full" disabled={gameState.stats.bankBalance < 100}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Отримати відсотки
              </Button>
            </div>
          </GameCard>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GameCard title="Поповнити рахунок" glowing={gameState.stats.money > 500}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Сума (грн)</label>
                <Input
                  type="number"
                  placeholder="Введи суму..."
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  max={gameState.stats.money}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(String(Math.min(100, gameState.stats.money)))}
                >
                  100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(String(Math.min(500, gameState.stats.money)))}
                >
                  500
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDepositAmount(String(gameState.stats.money))}>
                  Все
                </Button>
              </div>
              <Button
                onClick={handleDeposit}
                className="w-full"
                disabled={!depositAmount || gameState.stats.money === 0}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Покласти в банк
              </Button>
            </div>
          </GameCard>

          <GameCard title="Зняти з рахунку">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Сума (грн)</label>
                <Input
                  type="number"
                  placeholder="Введи суму..."
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={gameState.stats.bankBalance}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(Math.min(100, gameState.stats.bankBalance)))}
                >
                  100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(Math.min(500, gameState.stats.bankBalance)))}
                >
                  500
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(gameState.stats.bankBalance))}
                >
                  Все
                </Button>
              </div>
              <Button
                onClick={handleWithdraw}
                className="w-full"
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
