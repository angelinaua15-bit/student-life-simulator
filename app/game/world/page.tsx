"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, type GameState } from "@/lib/game-state"
import {
  LOCATIONS,
  DAY_NAMES,
  TIME_NAMES,
  SEASON_NAMES,
  getDefaultWorldState,
  advanceTime,
  changeLocation,
  unlockLocation,
  getTimeModifiers,
  getSeasonTheme,
  type WorldState,
  type LocationId,
} from "@/lib/world-system"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MapPin, Clock, Calendar, Sun, Moon, CloudRain, Snowflake, Flower, Waves, Lock } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const iconMap: Record<string, any> = {
  Building2: MapPin,
  Home: MapPin,
  Coffee: MapPin,
  BookOpen: MapPin,
  Trees: MapPin,
  Laptop: MapPin,
  Building: MapPin,
  Monitor: MapPin,
}

export default function WorldPage() {
  const router = useRouter()
  const { showAlert, showConfirm } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [worldState, setWorldState] = useState<WorldState>(getDefaultWorldState())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const saved = await loadGameState()
      if (!saved) {
        router.push("/")
        return
      }

      setGameState(saved)

      const savedWorld = localStorage.getItem("evo-student-world")
      if (savedWorld) {
        setWorldState(JSON.parse(savedWorld))
      } else {
        const defaultWorld = getDefaultWorldState()
        localStorage.setItem("evo-student-world", JSON.stringify(defaultWorld))
        setWorldState(defaultWorld)
      }

      setLoading(false)
    }
    loadData()
  }, [router])

  useEffect(() => {
    if (gameState && worldState) {
      // Auto-unlock locations based on level
      let updated = { ...worldState }
      Object.values(LOCATIONS).forEach((location) => {
        if (gameState.stats.level >= location.unlockLevel && !worldState.unlockedLocations.includes(location.id)) {
          updated = unlockLocation(updated, location.id)
        }
      })
      if (JSON.stringify(updated) !== JSON.stringify(worldState)) {
        setWorldState(updated)
        localStorage.setItem("evo-student-world", JSON.stringify(updated))
      }
    }
  }, [gameState, worldState])

  const handleAdvanceTime = async () => {
    if (!gameState) return

    const newWorldState = advanceTime(worldState)
    const modifiers = getTimeModifiers(newWorldState.currentTime)

    const updatedGameState = updateStats(gameState, {
      energy: Math.min(100, gameState.stats.energy * modifiers.energy),
      happiness: Math.min(100, gameState.stats.happiness * modifiers.happiness),
      stress: Math.min(100, gameState.stats.stress * modifiers.stress),
    })

    setWorldState(newWorldState)
    setGameState(updatedGameState)
    localStorage.setItem("evo-student-world", JSON.stringify(newWorldState))
    await saveGameState(updatedGameState)

    showAlert(
      `Час змінився на ${TIME_NAMES[newWorldState.currentTime]}!${
        newWorldState.currentTime === "morning" ? ` Новий день: ${DAY_NAMES[newWorldState.currentDay]}!` : ""
      }`,
      "Зміна часу",
    )
  }

  const handleChangeLocation = async (locationId: LocationId) => {
    if (!gameState) return

    if (!worldState.unlockedLocations.includes(locationId)) {
      const location = LOCATIONS[locationId]
      showAlert(
        `Ця локація відкриється на ${location.unlockLevel} рівні. Твій рівень: ${gameState.stats.level}`,
        "Локація заблокована",
      )
      return
    }

    if (gameState.stats.energy < 5) {
      showAlert("Недостатньо енергії для переміщення! Відпочинь або поїж.", "Мало енергії")
      return
    }

    const newWorldState = changeLocation(worldState, locationId)
    const updatedGameState = updateStats(gameState, {
      energy: gameState.stats.energy - 5,
    })

    setWorldState(newWorldState)
    setGameState(updatedGameState)
    localStorage.setItem("evo-student-world", JSON.stringify(newWorldState))
    await saveGameState(updatedGameState)

    showAlert(`Ти перемістився до: ${LOCATIONS[locationId].name}`, "Нова локація")
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentLocation = LOCATIONS[worldState.currentLocation]
  const seasonTheme = getSeasonTheme(worldState.currentSeason)
  const SeasonIcon =
    worldState.currentSeason === "autumn"
      ? CloudRain
      : worldState.currentSeason === "winter"
        ? Snowflake
        : worldState.currentSeason === "spring"
          ? Flower
          : Waves

  return (
    <div className={`min-h-screen bg-gradient-to-br ${seasonTheme.bg}`}>
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/game">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Світ Гри</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* World Info Panel */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Час доби</div>
                <div className="font-bold">{TIME_NAMES[worldState.currentTime]}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-secondary" />
              <div>
                <div className="text-xs text-muted-foreground">День тижня</div>
                <div className="font-bold">{DAY_NAMES[worldState.currentDay]}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SeasonIcon className="w-8 h-8 text-accent-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Сезон</div>
                <div className="font-bold">{SEASON_NAMES[worldState.currentSeason]}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {worldState.currentTime === "night" || worldState.currentTime === "evening" ? (
                <Moon className="w-8 h-8 text-blue-500" />
              ) : (
                <Sun className="w-8 h-8 text-yellow-500" />
              )}
              <div>
                <div className="text-xs text-muted-foreground">Ігровий день</div>
                <div className="font-bold">{worldState.gameDay}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleAdvanceTime} className="w-full md:w-auto">
              <Clock className="w-4 h-4 mr-2" />
              Прогорнути час
            </Button>
          </div>
        </Card>

        {/* Current Location */}
        <Card className={`p-6 mb-6 bg-gradient-to-r ${currentLocation.color}`}>
          <div className="text-white">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-8 h-8" />
              <div>
                <div className="text-sm opacity-90">Ти зараз тут:</div>
                <h2 className="text-2xl font-bold">{currentLocation.name}</h2>
              </div>
            </div>
            <p className="opacity-90 mb-4">{currentLocation.description}</p>
            <div className="space-y-2">
              <div className="text-sm font-semibold">Доступні активності:</div>
              <div className="flex flex-wrap gap-2">
                {currentLocation.activities.map((activity, index) => (
                  <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* All Locations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Локації на Карті</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(LOCATIONS).map((location) => {
              const isUnlocked = worldState.unlockedLocations.includes(location.id)
              const isCurrent = worldState.currentLocation === location.id
              const isVisited = worldState.visitedLocations.includes(location.id)

              return (
                <Card
                  key={location.id}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    isCurrent ? "ring-2 ring-primary" : ""
                  } ${!isUnlocked ? "opacity-50" : ""}`}
                  onClick={() => !isCurrent && handleChangeLocation(location.id)}
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${location.color} mb-3`}>
                    <div className="flex items-center justify-between text-white">
                      <MapPin className="w-8 h-8" />
                      {!isUnlocked && <Lock className="w-6 h-6" />}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{location.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isUnlocked ? "text-green-600" : "text-muted-foreground"}>
                      {isUnlocked ? "Відкрито" : `Рівень ${location.unlockLevel}`}
                    </span>
                    {isVisited && <span className="text-blue-600">Відвідано</span>}
                    {isCurrent && <span className="text-primary font-bold">Тут зараз</span>}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Progress */}
        <Card className="p-6 mt-6">
          <h3 className="font-bold text-lg mb-3">Прогрес Дослідження Світу</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Відкрито локацій</span>
                <span className="font-bold">
                  {worldState.unlockedLocations.length} / {Object.keys(LOCATIONS).length}
                </span>
              </div>
              <Progress
                value={(worldState.unlockedLocations.length / Object.keys(LOCATIONS).length) * 100}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Відвідано локацій</span>
                <span className="font-bold">
                  {worldState.visitedLocations.length} / {Object.keys(LOCATIONS).length}
                </span>
              </div>
              <Progress
                value={(worldState.visitedLocations.length / Object.keys(LOCATIONS).length) * 100}
                className="h-2"
              />
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
