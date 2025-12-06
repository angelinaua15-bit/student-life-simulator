"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, addMoney, addExperience, type GameState } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, Sparkles, Trophy, MessageCircle, Zap, Heart, Info } from "lucide-react"
import Link from "next/link"
import { type MentorEvent, getRandomEvent } from "@/lib/mentor-events"
import { useGameModal } from "@/lib/use-game-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const MOTIVATIONAL_PHRASES = [
  "Ти молодець, продовжуй!",
  "Сьогодні чудовий день для прогресу.",
  "Не хвилюйся, ми впораємось.",
  "Крок за кроком ти стаєш сильнішим.",
  "Віра в себе - твоя найкраща зброя!",
  "Кожна помилка - це урок, а не невдача.",
  "Ти вже пройшов стільки - пишаюся тобою!",
  "Настрій визначає результат. Будь позитивним!",
]

const getMentorMood = (gameState: GameState | null) => {
  if (!gameState) return "neutral"
  const { energy, stress, happiness, level } = gameState.stats

  if (energy < 30) return "concerned"
  if (stress > 70) return "supportive"
  if (happiness > 80) return "proud"
  if (level >= 10) return "amazed"
  return "happy"
}

const getMentorMessage = (mood: string) => {
  switch (mood) {
    case "concerned":
      return "Бачу, ти трохи втомився. Відпочинь, енергія важлива!"
    case "supportive":
      return "Стрес наростає? Давай разом з ним впораємось!"
    case "proud":
      return "Дивлюсь на тебе - і серце переповнює гордість!"
    case "amazed":
      return "Wow! Ти досяг неймовірних висот! Легенда!"
    default:
      return "Радий тебе бачити! Готовий до нових пригод?"
  }
}

export default function MentorPage() {
  const router = useRouter()
  const { showAlert } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentEvent, setCurrentEvent] = useState<MentorEvent | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedOption, setSelectedOption] = useState<MentorEvent["options"][0] | null>(null)
  const [currentPhrase, setCurrentPhrase] = useState("")
  const [showPhrase, setShowPhrase] = useState(false)
  const [avatarPulse, setAvatarPulse] = useState(false)

  const [interactionsThisLevel, setInteractionsThisLevel] = useState(0)
  const MAX_INTERACTIONS_PER_LEVEL = 3

  useEffect(() => {
    async function initGameState() {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }
      setGameState(state)

      const mentorEventsThisLevel = state.completedEvents.filter(
        (id) => id.startsWith("mentor-") && id.includes(`-level-${state.stats.level}`),
      ).length
      setInteractionsThisLevel(mentorEventsThisLevel)

      setLoading(false)
    }
    initGameState()
  }, [router])

  useEffect(() => {
    if (gameState && gameState.stats.level > 1) {
      setAvatarPulse(true)
      setTimeout(() => setAvatarPulse(false), 3000)
    }
  }, [gameState])

  const handleAvatarClick = () => {
    const randomPhrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]
    setCurrentPhrase(randomPhrase)
    setShowPhrase(true)
    setTimeout(() => setShowPhrase(false), 3000)
  }

  const generateNewEvent = () => {
    if (!gameState) return

    if (interactionsThisLevel >= MAX_INTERACTIONS_PER_LEVEL) {
      showAlert(
        `Ви вже використали всі поради ментора на цьому рівні (${MAX_INTERACTIONS_PER_LEVEL}/${MAX_INTERACTIONS_PER_LEVEL}).\nПідвищ рівень, щоб отримати нові поради!`,
        "Ліміт вичерпано",
      )
      return
    }

    const event = getRandomEvent(gameState.stats.level, gameState.completedEvents)

    if (!event) {
      showAlert("Поки що немає нових подій! Підвищуй рівень та повертайся пізніше.", "Немає нових подій")
      return
    }

    setCurrentEvent(event)
    setShowResult(false)
    setSelectedOption(null)
  }

  const handleChoice = async (option: MentorEvent["options"][0]) => {
    if (!gameState || !currentEvent) return

    setSelectedOption(option)
    setShowResult(true)

    let updated = gameState

    if (option.effects.stress) {
      updated = updateStats(updated, { stress: updated.stats.stress + option.effects.stress })
    }
    if (option.effects.happiness) {
      updated = updateStats(updated, { happiness: updated.stats.happiness + option.effects.happiness })
    }
    if (option.effects.energy) {
      updated = updateStats(updated, { energy: updated.stats.energy + option.effects.energy })
    }
    if (option.effects.money) {
      updated = addMoney(updated, option.effects.money)
    }
    if (option.effects.experience) {
      updated = addExperience(updated, option.effects.experience)
    }

    const levelSpecificEventId = `${currentEvent.id}-level-${gameState.stats.level}`
    updated = {
      ...updated,
      completedEvents: [...updated.completedEvents, levelSpecificEventId],
    }

    setInteractionsThisLevel((prev) => prev + 1)

    setGameState(updated)
    await saveGameState(updated)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "advice":
        return MessageCircle
      case "challenge":
        return Zap
      case "story":
        return Sparkles
      case "reward":
        return Trophy
      default:
        return Heart
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "advice":
        return "text-secondary"
      case "challenge":
        return "text-warning"
      case "story":
        return "text-primary"
      case "reward":
        return "text-success"
      default:
        return "text-foreground"
    }
  }

  const getTypeBg = (type: string) => {
    switch (type) {
      case "advice":
        return "bg-secondary/10"
      case "challenge":
        return "bg-warning/10"
      case "story":
        return "bg-primary/10"
      case "reward":
        return "bg-success/10"
      default:
        return "bg-muted"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (!gameState) return null

  const mentorMood = getMentorMood(gameState)
  const mentorMessage = getMentorMessage(mentorMood)
  const remainingInteractions = MAX_INTERACTIONS_PER_LEVEL - interactionsThisLevel

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <Link href="/game">
          <Button variant="outline" className="mb-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до Dashboard
          </Button>
        </Link>

        <div className="mb-6">
          <GameCard
            title=""
            className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-2xl opacity-50 animate-pulse-glow" />

            <div className="relative z-10 text-center py-8">
              <div className="relative inline-block mb-6">
                <div
                  onClick={handleAvatarClick}
                  className={`relative cursor-pointer transition-transform hover:scale-110 ${
                    avatarPulse ? "animate-bounce-in" : ""
                  }`}
                >
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 -m-6 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-2xl opacity-50 animate-pulse-glow" />

                  {/* Avatar container */}
                  <div className="relative w-32 h-32 bg-gradient-to-br from-primary via-secondary to-accent rounded-full p-1 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      {/* Simple cartoon mentor face */}
                      <svg viewBox="0 0 100 100" className="w-28 h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Head */}
                        <circle cx="50" cy="50" r="35" fill="url(#mentor-gradient)" />

                        {/* Halo/Light aura */}
                        <circle cx="50" cy="30" r="8" fill="#FFD700" opacity="0.7">
                          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                        </circle>

                        {/* Eyes */}
                        <circle cx="40" cy="45" r="3" fill="#8B5CF6" />
                        <circle cx="60" cy="45" r="3" fill="#8B5CF6" />

                        {/* Smile */}
                        <path
                          d="M 35 55 Q 50 65 65 55"
                          stroke="#8B5CF6"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                        />

                        {/* Light rays */}
                        <g opacity="0.5">
                          <line x1="50" y1="15" x2="50" y2="10" stroke="#FFD700" strokeWidth="2">
                            <animate attributeName="y2" values="10;5;10" dur="1.5s" repeatCount="indefinite" />
                          </line>
                          <line x1="70" y1="25" x2="75" y2="20" stroke="#FFD700" strokeWidth="2">
                            <animate attributeName="x2" values="75;80;75" dur="1.5s" repeatCount="indefinite" />
                          </line>
                          <line x1="30" y1="25" x2="25" y2="20" stroke="#FFD700" strokeWidth="2">
                            <animate attributeName="x2" values="25;20;25" dur="1.5s" repeatCount="indefinite" />
                          </line>
                        </g>

                        <defs>
                          <linearGradient id="mentor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E0C3FC" />
                            <stop offset="50%" stopColor="#C3E0FC" />
                            <stop offset="100%" stopColor="#FCE0C3" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Sparkle particles */}
                  {avatarPulse && (
                    <>
                      <div className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-full animate-ping" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 bg-secondary rounded-full animate-ping animation-delay-500" />
                      <div className="absolute top-1/2 right-0 w-2 h-2 bg-primary rounded-full animate-ping animation-delay-1000" />
                    </>
                  )}
                </div>

                {/* Motivational phrase bubble */}
                {showPhrase && (
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-64 bg-white border-2 border-primary rounded-2xl p-3 shadow-xl animate-bounce-in">
                    <div className="text-sm font-medium text-primary text-center">{currentPhrase}</div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white border-r-2 border-b-2 border-primary" />
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3 animate-gradient">
                Стильний Ментор
              </h1>

              <div className="max-w-md mx-auto mb-4">
                <p className="text-lg font-medium text-muted-foreground italic">"{mentorMessage}"</p>
              </div>

              <p className="text-sm text-muted-foreground mb-4">Твій особистий гід у студентському житті</p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Info className="w-4 h-4" />
                    Хто я?
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Історія Ментора
                    </DialogTitle>
                    <DialogDescription className="space-y-4 text-left pt-4">
                      <div>Вітаю! Я - Стильний Ментор, твій духовний провідник у всесвіті студентського життя.</div>
                      <div>
                        Моя місія - допомогти тобі знайти баланс між навчанням, відпочинком та особистим розвитком. Я
                        з'явився з енергії тисяч студентів, які пройшли цей шлях до тебе.
                      </div>
                      <div>
                        Я тут, щоб:
                        <br />• Давати мудрі поради у складних ситуаціях
                        <br />• Підтримувати тебе у важкі моменти
                        <br />• Святкувати твої перемоги
                        <br />• Нагадувати про важливість балансу
                      </div>
                      <div className="font-medium text-primary">
                        Пам'ятай: я завжди поруч, готовий допомогти. Віра в себе - твоя найсильніша зброя!
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </GameCard>
        </div>

        <div className="mb-6">
          <GameCard title="Взаємодії з ментором">
            <div className="text-center space-y-3">
              <div className="text-5xl font-bold text-primary">
                {remainingInteractions}/{MAX_INTERACTIONS_PER_LEVEL}
              </div>
              <p className="text-sm text-muted-foreground">
                {remainingInteractions > 0
                  ? `Залишилось порад на цьому рівні: ${remainingInteractions}`
                  : "Підвищ рівень для нових порад!"}
              </p>
            </div>
          </GameCard>
        </div>

        <div className="mb-6">
          <GameCard title="Твій прогрес">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
                <div className="relative text-center p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border-2 border-primary/30 transition-all hover:scale-105 hover:shadow-lg">
                  <Trophy className="w-6 h-6 text-primary mx-auto mb-2 animate-float" />
                  <div className="text-3xl font-bold text-primary mb-1 transition-all">{gameState.stats.level}</div>
                  <div className="text-xs font-medium text-primary/80">Рівень</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/50 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
                <div className="relative text-center p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl border-2 border-secondary/30 transition-all hover:scale-105 hover:shadow-lg">
                  <Sparkles className="w-6 h-6 text-secondary mx-auto mb-2 animate-pulse" />
                  <div className="text-3xl font-bold text-secondary mb-1 transition-all">
                    {gameState.completedEvents.length}
                  </div>
                  <div className="text-xs font-medium text-secondary/80">Подій пройдено</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/50 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
                <div className="relative text-center p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl border-2 border-accent/30 transition-all hover:scale-105 hover:shadow-lg">
                  <Zap className="w-6 h-6 text-accent-foreground mx-auto mb-2 animate-bounce-slow" />
                  <div className="text-3xl font-bold text-accent-foreground mb-1 transition-all">
                    {gameState.stats.money}
                  </div>
                  <div className="text-xs font-medium text-accent-foreground/80">Гроші</div>
                </div>
              </div>
            </div>
          </GameCard>
        </div>

        {!currentEvent ? (
          <GameCard title="Поговоримо?" glowing={remainingInteractions > 0}>
            <div className="text-center space-y-6 py-8">
              <div className="text-6xl animate-float">💬</div>
              <p className="text-lg text-muted-foreground">
                {remainingInteractions > 0
                  ? "Ментор готовий поділитися мудрістю та порадами"
                  : "Ментор чекає на твій новий рівень!"}
              </p>
              <Button
                onClick={generateNewEvent}
                className="w-full h-14 text-lg font-bold"
                size="lg"
                disabled={remainingInteractions <= 0}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {remainingInteractions > 0
                  ? `Поговорити з ментором (${remainingInteractions} доступно)`
                  : "Взаємодії вичерпано на цьому рівні"}
              </Button>
            </div>
          </GameCard>
        ) : (
          <div className="space-y-4">
            <GameCard title={currentEvent.title} className={getTypeBg(currentEvent.type)}>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {(() => {
                    const Icon = getTypeIcon(currentEvent.type)
                    return <Icon className={`w-6 h-6 mt-1 ${getTypeColor(currentEvent.type)}`} />
                  })()}
                  <p className="text-pretty leading-relaxed">{currentEvent.description}</p>
                </div>

                {!showResult && (
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-bold text-sm text-muted-foreground">Вибери відповідь:</h3>
                    {currentEvent.options.map((option, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleChoice(option)}
                        variant="outline"
                        className="w-full justify-start h-auto py-3 px-4 text-left"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{option.text}</div>
                          {Object.keys(option.effects).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                              {option.effects.happiness && (
                                <span className="text-success">
                                  Щастя: {option.effects.happiness > 0 ? "+" : ""}
                                  {option.effects.happiness}
                                </span>
                              )}
                              {option.effects.stress && (
                                <span className="text-destructive">
                                  Стрес: {option.effects.stress > 0 ? "+" : ""}
                                  {option.effects.stress}
                                </span>
                              )}
                              {option.effects.energy && (
                                <span className="text-warning">
                                  Енергія: {option.effects.energy > 0 ? "+" : ""}
                                  {option.effects.energy}
                                </span>
                              )}
                              {option.effects.money && (
                                <span className="text-accent-foreground">
                                  Гроші: {option.effects.money > 0 ? "+" : ""}
                                  {option.effects.money}
                                </span>
                              )}
                              {option.effects.experience && (
                                <span className="text-primary">Досвід: +{option.effects.experience}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {showResult && selectedOption && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <h3 className="font-bold text-success mb-2">Результат:</h3>
                      <p className="text-sm">Ти вибрав: "{selectedOption.text}"</p>
                      {Object.keys(selectedOption.effects).length > 0 && (
                        <div className="mt-3 space-y-1 text-sm">
                          {selectedOption.effects.happiness && (
                            <div className="text-success">
                              Щастя: {selectedOption.effects.happiness > 0 ? "+" : ""}
                              {selectedOption.effects.happiness}
                            </div>
                          )}
                          {selectedOption.effects.stress && (
                            <div className="text-destructive">
                              Стрес: {selectedOption.effects.stress > 0 ? "+" : ""}
                              {selectedOption.effects.stress}
                            </div>
                          )}
                          {selectedOption.effects.energy && (
                            <div className="text-warning">
                              Енергія: {selectedOption.effects.energy > 0 ? "+" : ""}
                              {selectedOption.effects.energy}
                            </div>
                          )}
                          {selectedOption.effects.money && (
                            <div className="text-accent-foreground">
                              Гроші: {selectedOption.effects.money > 0 ? "+" : ""}
                              {selectedOption.effects.money}
                            </div>
                          )}
                          {selectedOption.effects.experience && (
                            <div className="text-primary">Досвід: +{selectedOption.effects.experience}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button onClick={() => setCurrentEvent(null)} className="w-full">
                      Продовжити
                    </Button>
                  </div>
                )}
              </div>
            </GameCard>
          </div>
        )}
      </div>
    </div>
  )
}
