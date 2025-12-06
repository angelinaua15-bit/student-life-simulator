"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, type GameState } from "@/lib/game-state"
import {
  LOCATIONS,
  REGIONS,
  DAY_NAMES,
  TIME_NAMES,
  SEASON_NAMES,
  getDefaultWorldState,
  advanceTime,
  changeLocation,
  unlockLocation,
  getTimeModifiers,
  getSeasonTheme,
  selectRegion,
  type WorldState,
  type LocationId,
  type RegionId,
} from "@/lib/world-system"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Flower,
  Waves,
  Lock,
  Sparkles,
} from "lucide-react"
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
  const { showConfirm } = useGameModal()
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

    // The time change happens silently now - player can see it in the UI
  }

  const handleChangeLocation = async (locationId: LocationId) => {
    if (!gameState) return

    if (!worldState.unlockedLocations.includes(locationId)) {
      const location = LOCATIONS[locationId]
      showConfirm(
        `Ця локація відкриється на ${location.unlockLevel} рівні. Твій рівень: ${gameState.stats.level}`,
        () => {},
        "Локація заблокована",
      )
      return
    }

    if (gameState.stats.energy < 5) {
      showConfirm("Недостатньо енергії для переміщення! Відпочинь або поїж.", () => {}, "Мало енергії")
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

    // Location change is visible in the UI without popup
  }

  const handleSelectRegion = async (regionId: RegionId) => {
    if (!gameState) return

    showConfirm(
      `Обрати ${REGIONS[regionId].name}? Це дасть тобі бонус: ${REGIONS[regionId].bonus}`,
      async () => {
        const newWorldState = selectRegion(worldState, regionId)
        setWorldState(newWorldState)
        localStorage.setItem("evo-student-world", JSON.stringify(newWorldState))
      },
      "Вибір регіону",
    )
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

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-sm border-2">
          <div className="flex items-start gap-4">
            <Sparkles className="w-10 h-10 text-purple-500 animate-pulse flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Світ гри — твій персональний студентський всесвіт
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Обраний регіон впливає на атмосферу кампусу, складність подій та унікальні бонуси. Кожен регіон дає свої
                переваги і створює особливий стиль проходження.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Досліджуй локації, вибирай свій регіон та створюй унікальну історію студентського життя!
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Оберіть свій регіон
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(REGIONS).map((region) => {
              const isSelected = worldState.selectedRegion === region.id

              return (
                <Card
                  key={region.id}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    isSelected ? "ring-4 ring-primary shadow-2xl" : ""
                  }`}
                  onClick={() => !isSelected && handleSelectRegion(region.id)}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${region.color} opacity-20 group-hover:opacity-30 transition-opacity`}
                  />

                  <div className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-5xl">{region.icon}</span>
                      {isSelected && (
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          Обрано
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-1">{region.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{region.shortDesc}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{region.description}</p>
                    </div>

                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${region.color} bg-opacity-10 border-2 border-current/20`}
                    >
                      <div className="text-xs font-semibold text-muted-foreground mb-1">Бонус:</div>
                      <div className="font-bold text-sm">{region.bonus}</div>
                    </div>

                    {!isSelected && (
                      <Button className="w-full bg-transparent" size="sm" variant="outline">
                        Обрати цей регіон
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {worldState.selectedRegion && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <span className="font-semibold">Активний регіон:</span>{" "}
                  <span className="text-primary font-bold">{REGIONS[worldState.selectedRegion].name}</span>
                  <span className="text-muted-foreground ml-2">— {REGIONS[worldState.selectedRegion].bonus}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* World Info Panel */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Поточний стан світу</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* ... existing time/day/season display ... */}
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
        <Card className={`p-6 bg-gradient-to-r ${currentLocation.color}`}>
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
                  <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
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
                  className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isCurrent ? "ring-2 ring-primary shadow-xl" : ""
                  } ${!isUnlocked ? "opacity-50 grayscale" : ""}`}
                  onClick={() => !isCurrent && handleChangeLocation(location.id)}
                >
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${location.color} mb-3 transition-transform group-hover:scale-105`}
                  >
                    <div className="flex items-center justify-between text-white">
                      <MapPin className="w-8 h-8" />
                      {!isUnlocked && <Lock className="w-6 h-6" />}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{location.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isUnlocked ? "text-green-600 font-semibold" : "text-muted-foreground"}>
                      {isUnlocked ? "✓ Відкрито" : `🔒 Рівень ${location.unlockLevel}`}
                    </span>
                    {isVisited && <span className="text-blue-600">👁️ Відвідано</span>}
                    {isCurrent && <span className="text-primary font-bold animate-pulse">📍 Тут зараз</span>}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Progress */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Прогрес Дослідження Світу
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Відкрито локацій</span>
                <span className="font-bold text-primary">
                  {worldState.unlockedLocations.length} / {Object.keys(LOCATIONS).length}
                </span>
              </div>
              <Progress
                value={(worldState.unlockedLocations.length / Object.keys(LOCATIONS).length) * 100}
                className="h-3"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Відвідано локацій</span>
                <span className="font-bold text-blue-600">
                  {worldState.visitedLocations.length} / {Object.keys(LOCATIONS).length}
                </span>
              </div>
              <Progress
                value={(worldState.visitedLocations.length / Object.keys(LOCATIONS).length) * 100}
                className="h-3"
              />
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
