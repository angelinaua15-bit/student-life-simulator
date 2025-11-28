"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Zap, Shirt } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"
import confetti from "canvas-confetti"

const getBoosterDuration = (type: string): number => {
  const cleanType = type.replace("booster_", "")
  const durations: Record<string, number> = {
    xp_boost: 1,
    money_boost: 2,
    energy_boost: 3,
    stress_relief: 4,
    happiness_boost: 5,
  }
  return durations[cleanType] || 1
}

export default function InventoryPage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"skins" | "boosters" | "effects">("skins")
  const { showSuccess, showConfirm, showAlert } = useGameModal()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const state = await loadGameState()
    if (!state) {
      router.push("/")
      return
    }
    setGameState(state)
    setLoading(false)
  }

  async function equipSkin(skin: string) {
    if (!gameState) return

    const confirmed = await new Promise<boolean>((resolve) => {
      showConfirm(`Ви хочете використати ${getSkinName(skin)}?`, () => resolve(true), "Екіпірувати скін?")
      // Timeout to handle if user closes modal without action
      setTimeout(() => resolve(false), 30000)
    })

    if (!confirmed) return

    const cleanSkin = skin.replace("skin_", "")
    const updatedState = { ...gameState, skin: cleanSkin }
    await saveGameState(updatedState)
    setGameState(updatedState)

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    showSuccess("Скін екіпіровано!", `Тепер ви використовуєте ${getSkinName(skin)}`)
  }

  async function activateBooster(boosterType: string) {
    if (!gameState) return

    const cleanType = boosterType.replace("booster_", "")

    // Check if booster already active
    const isActive = gameState.activeBoosters?.some((b) => b.type === cleanType && b.expiresAt > Date.now())

    if (isActive) {
      showAlert("Бустер вже активний!", "Цей бустер вже працює. Почекайте до його закінчення.")
      return
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      showConfirm(
        `${getBoosterName(boosterType)}\n\nБонус: x${getBoosterMultiplier(boosterType)} до ${getBoosterEffect(boosterType)}\nТривалість: ${getBoosterDuration(boosterType)} год`,
        () => resolve(true),
        "Активувати бустер?",
      )
      setTimeout(() => resolve(false), 30000)
    })

    if (!confirmed) return

    const updatedState = { ...gameState }

    if (!updatedState.activeBoosters) {
      updatedState.activeBoosters = []
    }

    updatedState.activeBoosters.push({
      type: cleanType,
      multiplier: getBoosterMultiplier(boosterType),
      expiresAt: Date.now() + getBoosterDuration(boosterType) * 60 * 60 * 1000,
    })

    await saveGameState(updatedState)
    setGameState(updatedState)

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#d97706"],
    })

    showSuccess("Бустер активовано!", `${getBoosterName(boosterType)} тепер активний!`)
  }

  function getSkinName(skin: string): string {
    const cleanSkin = skin.replace("skin_", "")
    const skins: Record<string, string> = {
      default: "Звичайний Студент",
      hoodie: "Студент у Худі",
      formal: "Діловий Студент",
      sport: "Спортивний Студент",
      nerd: "Розумник",
      rebel: "Бунтар",
      gamer: "Геймер",
      artist: "Художник",
    }
    return skins[cleanSkin] || cleanSkin
  }

  function getSkinEmoji(skin: string): string {
    const cleanSkin = skin.replace("skin_", "")
    const emojis: Record<string, string> = {
      default: "👨‍🎓",
      hoodie: "🧥",
      formal: "👔",
      sport: "⚽",
      nerd: "🤓",
      rebel: "🎸",
      gamer: "🎮",
      artist: "🎨",
    }
    return emojis[cleanSkin] || "👕"
  }

  function getBoosterName(type: string): string {
    const cleanType = type.replace("booster_", "")
    const names: Record<string, string> = {
      xp_boost: "Подвійний XP",
      money_boost: "Подвійні Гроші",
      energy_boost: "Нескінченна Енергія",
      stress_relief: "Антистрес",
      happiness_boost: "Щастя х2",
    }
    return names[cleanType] || cleanType
  }

  function getBoosterMultiplier(type: string): number {
    return 2
  }

  function getBoosterEffect(type: string): string {
    const cleanType = type.replace("booster_", "")
    const effects: Record<string, string> = {
      xp_boost: "досвіду",
      money_boost: "грошей",
      energy_boost: "енергії",
      stress_relief: "зменшення стресу",
      happiness_boost: "щастя",
    }
    return effects[cleanType] || "ефекту"
  }

  function getBoosterEmoji(type: string): string {
    const cleanType = type.replace("booster_", "")
    const emojis: Record<string, string> = {
      xp_boost: "⭐",
      money_boost: "💰",
      energy_boost: "⚡",
      stress_relief: "🧘",
      happiness_boost: "😊",
    }
    return emojis[cleanType] || "⚡"
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const inventory = gameState.inventory || []

  const skins = inventory.filter((item) => {
    const itemStr = typeof item === "string" ? item : String(item)
    return (
      itemStr.startsWith("skin_") || ["hoodie", "formal", "sport", "nerd", "rebel", "gamer", "artist"].includes(itemStr)
    )
  })

  const boosters = inventory.filter((item) => {
    const itemStr = typeof item === "string" ? item : String(item)
    return itemStr.startsWith("booster_")
  })

  const effects = inventory.filter((item) => {
    const itemStr = typeof item === "string" ? item : String(item)
    return itemStr.startsWith("effect_")
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/game">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            📦 Інвентар 📦
          </h1>
          <p className="text-xl text-muted-foreground">Керуй своїми предметами та бонусами</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 justify-center">
            <Button
              variant={activeTab === "skins" ? "default" : "outline"}
              onClick={() => setActiveTab("skins")}
              className="flex-1 max-w-xs"
            >
              <Shirt className="w-5 h-5 mr-2" />
              Скіни ({skins.length})
            </Button>
            <Button
              variant={activeTab === "boosters" ? "default" : "outline"}
              onClick={() => setActiveTab("boosters")}
              className="flex-1 max-w-xs"
            >
              <Zap className="w-5 h-5 mr-2" />
              Бустери ({boosters.length})
            </Button>
            <Button
              variant={activeTab === "effects" ? "default" : "outline"}
              onClick={() => setActiveTab("effects")}
              className="flex-1 max-w-xs"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ефекти ({effects.length})
            </Button>
          </div>

          {/* Active Boosters */}
          {gameState.activeBoosters && gameState.activeBoosters.length > 0 && (
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50">
              <h3 className="text-xl font-bold mb-4">⚡ Активні Бустери</h3>
              <div className="grid gap-4">
                {gameState.activeBoosters
                  .filter((b) => b.expiresAt > Date.now())
                  .map((booster, index) => {
                    const timeLeft = Math.floor((booster.expiresAt - Date.now()) / 1000 / 60)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/10 backdrop-blur"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getBoosterEmoji(booster.type)}</span>
                          <div>
                            <p className="font-bold">{getBoosterName(booster.type)}</p>
                            <p className="text-sm text-muted-foreground">x{booster.multiplier} множник</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-yellow-500">{timeLeft} хв</p>
                          <p className="text-xs text-muted-foreground">залишилось</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === "skins" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {skins.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">У вас поки немає скінів</p>
                  <p className="text-sm text-muted-foreground mt-2">Отримуйте нагороди за рівні!</p>
                </div>
              )}
              {skins.map((skin) => {
                const cleanSkin = typeof skin === "string" ? skin.replace("skin_", "") : String(skin)
                const isEquipped = gameState.skin === cleanSkin
                return (
                  <div
                    key={skin}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      isEquipped
                        ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500"
                        : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">{getSkinEmoji(cleanSkin)}</div>
                      <h3 className="text-xl font-bold mb-2">{getSkinName(cleanSkin)}</h3>
                      {isEquipped ? (
                        <div className="inline-block px-4 py-2 rounded-full bg-green-500 text-white font-bold">
                          ✓ Екіпіровано
                        </div>
                      ) : (
                        <Button onClick={() => equipSkin(skin)} className="w-full">
                          Екіпірувати
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === "boosters" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {boosters.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">У вас поки немає бустерів</p>
                  <p className="text-sm text-muted-foreground mt-2">Отримуйте нагороди за рівні!</p>
                </div>
              )}
              {boosters.map((booster) => {
                const cleanBooster = typeof booster === "string" ? booster.replace("booster_", "") : String(booster)
                const isActive = gameState.activeBoosters?.some(
                  (b) => b.type === cleanBooster && b.expiresAt > Date.now(),
                )
                return (
                  <div
                    key={booster}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      isActive
                        ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500 animate-pulse-glow"
                        : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">{getBoosterEmoji(cleanBooster)}</div>
                      <h3 className="text-xl font-bold mb-2">{getBoosterName(cleanBooster)}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        x{getBoosterMultiplier(cleanBooster)} до {getBoosterEffect(cleanBooster)}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Тривалість: {getBoosterDuration(cleanBooster)} год
                      </p>
                      {isActive ? (
                        <div className="inline-block px-4 py-2 rounded-full bg-yellow-500 text-white font-bold">
                          ⚡ Активний
                        </div>
                      ) : (
                        <Button
                          onClick={() => activateBooster(booster)}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        >
                          Активувати
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === "effects" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {effects.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">У вас поки немає ефектів</p>
                  <p className="text-sm text-muted-foreground mt-2">Отримуйте нагороди за рівні!</p>
                </div>
              )}
              {effects.map((effect) => (
                <div
                  key={effect}
                  className="p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/50"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-xl font-bold mb-2">{effect}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Декоративний ефект</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Переглянути
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
