"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { loadGameState, type GameState } from "@/lib/game-state"
import { createClient } from "@/lib/supabase/client"
import {
  Play,
  Plus,
  LogIn,
  SettingsIcon,
  Info,
  LogOut,
  Volume2,
  Music,
  Globe,
  Monitor,
  Sparkles,
  MessageCircle,
  Trophy,
  Gift,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useGameModal } from "@/lib/use-game-modal"

export default function HomePage() {
  const router = useRouter()
  const { showConfirm, showSuccess, showAlert } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showNewGame, setShowNewGame] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [mentorVisible, setMentorVisible] = useState(false)

  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState([70])
  const [musicVolume, setMusicVolume] = useState([50])
  const [language, setLanguage] = useState("ua")
  const [graphics, setGraphics] = useState("high")

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()

      if (!supabase) {
        setIsAuthenticated(false)
        // Check localStorage for saved game
        const saved = await loadGameState()
        setGameState(saved)
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)
        const saved = await loadGameState()
        setGameState(saved)
      } else {
        setIsAuthenticated(false)
        // Check localStorage fallback
        const saved = await loadGameState()
        setGameState(saved)
      }

      setLoading(false)
    }

    checkAuth()

    const timer = setTimeout(() => setMentorVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleNewGame = async () => {
    if (newPlayerName.trim()) {
      router.push("/onboarding")
    }
  }

  const handleContinue = () => {
    router.push("/game")
  }

  const handleLogout = async () => {
    showConfirm(
      "Ти впевнений, що хочеш вийти з акаунту?",
      async () => {
        const supabase = createClient()
        if (supabase) {
          await supabase.auth.signOut()
        }
        setIsAuthenticated(false)
        setGameState(null)
        showSuccess("Ти вийшов з акаунту. До зустрічі!")
      },
      "Вихід з акаунту",
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-cyan-500 to-yellow-400 animate-gradient">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white mx-auto"></div>
          <p className="text-white text-2xl font-bold animate-pulse">Loading EVO STUDENT...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-cyan-500 to-yellow-400 animate-gradient">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-56 h-56 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-1500"></div>
      </div>

      {/* Main Menu Container */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-2xl space-y-8 animate-scale-in">
          {/* Logo */}
          <div className="text-center space-y-4">
            <h1 className="text-7xl md:text-8xl font-black text-white animate-float drop-shadow-2xl">EVO STUDENT</h1>
            <p className="text-white/90 text-xl font-medium drop-shadow-lg">Твоя студентська пригода починається тут</p>
          </div>

          {/* Menu Card */}
          <Card className="backdrop-blur-xl bg-white/90 shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-8 space-y-4">
              {isAuthenticated ? (
                <>
                  {gameState && (
                    <Button
                      onClick={handleContinue}
                      className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Play className="mr-2 h-6 w-6" />
                      Продовжити гру
                    </Button>
                  )}

                  <Button
                    onClick={() => router.push("/onboarding")}
                    variant={gameState ? "outline" : "default"}
                    className={`w-full h-14 text-lg font-bold transition-all hover:scale-105 ${
                      !gameState
                        ? "bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white shadow-lg"
                        : ""
                    }`}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    {gameState ? "Нова гра" : "Почати гру"}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => router.push("/game/leaderboard")}
                      variant="outline"
                      className="h-14 font-semibold border-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:scale-105 transition-all"
                    >
                      <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
                      Лідери
                    </Button>

                    <Button
                      onClick={() => router.push("/game/rewards")}
                      variant="outline"
                      className="h-14 font-semibold border-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:scale-105 transition-all relative"
                    >
                      <Gift className="mr-2 h-5 w-5 text-purple-600" />
                      Нагороди
                      {gameState?.unclaimedRewards && gameState.unclaimedRewards.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {gameState.unclaimedRewards.length}
                        </span>
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="w-full h-14 text-lg font-semibold border-2 hover:bg-secondary/10 hover:scale-105 transition-all"
                  >
                    <SettingsIcon className="mr-2 h-5 w-5" />
                    Налаштування
                  </Button>

                  <Button
                    onClick={() => setShowAbout(true)}
                    variant="outline"
                    className="w-full h-14 text-lg font-semibold border-2 hover:bg-accent/10 hover:scale-105 transition-all"
                  >
                    <Info className="mr-2 h-5 w-5" />
                    Про гру
                  </Button>

                  <Button
                    onClick={() => router.push("/game/feedback")}
                    variant="outline"
                    className="w-full h-14 text-lg font-semibold border-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:scale-105 transition-all"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Відгуки
                  </Button>

                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full h-12 text-base font-medium text-muted-foreground hover:text-destructive hover:scale-105 transition-all"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Вийти з акаунту
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/auth/login")}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <LogIn className="mr-2 h-6 w-6" />
                    Увійти
                  </Button>

                  <Button
                    onClick={() => router.push("/auth/signup")}
                    variant="outline"
                    className="w-full h-14 text-lg font-bold border-2 hover:bg-primary/10 hover:scale-105 transition-all"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Створити акаунт
                  </Button>

                  <Button
                    onClick={() => setShowAbout(true)}
                    variant="outline"
                    className="w-full h-14 text-lg font-semibold border-2 hover:bg-accent/10 hover:scale-105 transition-all"
                  >
                    <Info className="mr-2 h-5 w-5" />
                    Про гру
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {gameState && isAuthenticated && (
            <div className="flex justify-center gap-6 text-white text-center animate-fade-in">
              <div className="backdrop-blur-md bg-white/20 rounded-xl px-6 py-3">
                <div className="text-2xl font-bold">{gameState.stats.level}</div>
                <div className="text-sm opacity-90">Рівень</div>
              </div>
              <div className="backdrop-blur-md bg-white/20 rounded-xl px-6 py-3">
                <div className="text-2xl font-bold">{gameState.stats.money}₴</div>
                <div className="text-sm opacity-90">Гроші</div>
              </div>
              <div className="backdrop-blur-md bg-white/20 rounded-xl px-6 py-3">
                <div className="text-2xl font-bold">{gameState.stats.energy}%</div>
                <div className="text-sm opacity-90">Енергія</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mentor Character */}
      {mentorVisible && (
        <div className="fixed bottom-8 right-8 animate-slide-in-right z-50">
          <div className="relative">
            {/* Speech bubble */}
            <div className="absolute bottom-full right-0 mb-4 mr-4 bg-white rounded-2xl px-6 py-4 shadow-2xl max-w-xs animate-bounce-in">
              <p className="text-sm font-medium text-gray-800">
                {isAuthenticated
                  ? gameState
                    ? "Привіт знову! Готовий продовжити свій шлях?"
                    : "Створи свою гру і почнемо пригоду!"
                  : "Увійди або зареєструйся, щоб почати грати!"}
              </p>
              <div className="absolute bottom-0 right-8 translate-y-1/2 w-4 h-4 bg-white rotate-45"></div>
            </div>

            {/* Mentor avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full blur-xl opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full p-1 shadow-2xl">
                <div className="bg-white rounded-full p-4 w-24 h-24 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showNewGame} onOpenChange={setShowNewGame}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Нова гра</DialogTitle>
            <DialogDescription>Почни свою студентську пригоду з персоналізацією!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center py-6">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-muted-foreground">
                Тебе чекає захоплююча подорож! Спочатку ти пройдеш тест особистості, який визначить твій унікальний
                стиль студента.
              </p>
            </div>
            <Button onClick={() => router.push("/onboarding")} className="w-full h-12 text-lg font-bold">
              Розпочати пригоду
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Налаштування</DialogTitle>
            <DialogDescription>Налаштуй гру під себе</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Звук
              </h3>
              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled">Увімкнути звуки</Label>
                  <Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
                {soundEnabled && (
                  <div className="space-y-2">
                    <Label>Гучність звуків: {soundVolume[0]}%</Label>
                    <Slider value={soundVolume} onValueChange={setSoundVolume} max={100} step={1} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Music className="h-5 w-5" />
                Музика
              </h3>
              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-enabled">Увімкнути музику</Label>
                  <Switch id="music-enabled" checked={musicEnabled} onCheckedChange={setMusicEnabled} />
                </div>
                {musicEnabled && (
                  <div className="space-y-2">
                    <Label>Гучність музики: {musicVolume[0]}%</Label>
                    <Slider value={musicVolume} onValueChange={setMusicVolume} max={100} step={1} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Мова
              </h3>
              <div className="pl-7">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="ua">Українська</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Графіка
              </h3>
              <div className="pl-7">
                <select
                  value={graphics}
                  onChange={(e) => setGraphics(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="low">Низька</option>
                  <option value="medium">Середня</option>
                  <option value="high">Висока</option>
                  <option value="ultra">Ультра</option>
                </select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Про EVO STUDENT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">EVO STUDENT</strong> — це симулятор студентського життя, де ти
                керуєш персонажем-студентом, виконуєш завдання, граєш у міні-ігри та розвиваєшся.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Працюй у кафе, досліджуй бібліотеку-лабіринт, розбирай посилки з речами, керуй фінансами в банку,
                випробуй удачу в лотереї та отримуй мудрі поради від свого наставника.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Слідкуй за своїм рівнем стресу, щастя та енергії. Заробляй гроші, підвищуй рівень та відкривай нові
                можливості!
              </p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Версія:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Жанр:</span>
                <span className="font-medium">Симулятор життя</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Платформа:</span>
                <span className="font-medium">Web (Next.js + Supabase)</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setShowAbout(false)}>
              Зрозуміло
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
