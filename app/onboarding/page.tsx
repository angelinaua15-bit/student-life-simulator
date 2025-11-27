"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import {
  getPersonalityQuestions,
  calculatePersonalityType,
  PERSONALITY_TYPES,
  type PersonalityType,
} from "@/lib/personality-types"
import { createNewGame } from "@/lib/game-state"
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [playerName, setPlayerName] = useState("")
  const [selectedSkin, setSelectedSkin] = useState("default")
  const [answers, setAnswers] = useState<PersonalityType[]>([])
  const [personalityType, setPersonalityType] = useState<PersonalityType | null>(null)

  const questions = getPersonalityQuestions()
  const totalSteps = 2 + questions.length + 1 // name + skin + questions + result

  const handleStart = () => {
    if (playerName.trim()) {
      setStep(1)
    }
  }

  const handleSkinSelect = () => {
    setStep(2)
  }

  const handleAnswer = (answerType: PersonalityType) => {
    const newAnswers = [...answers, answerType]
    setAnswers(newAnswers)

    if (newAnswers.length === questions.length) {
      const result = calculatePersonalityType(newAnswers)
      setPersonalityType(result)
      setStep(2 + questions.length)
    } else {
      setStep(step + 1)
    }
  }

  const handleFinish = async () => {
    if (!personalityType) return

    const newGame = await createNewGame(playerName, selectedSkin)

    // Apply personality modifiers
    const personality = PERSONALITY_TYPES[personalityType]
    newGame.stats.happiness += personality.statModifiers.happinessBonus

    if (personalityType === "activist") {
      newGame.stats.energy = 100
    }

    // Save personality type
    if (typeof window !== "undefined") {
      localStorage.setItem("evo-student-personality", personalityType)
      localStorage.setItem("evo-student-state", JSON.stringify(newGame))
    }

    router.push("/game")
  }

  const currentQuestion = step >= 2 && step < 2 + questions.length ? questions[step - 2] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Крок {step + 1} з {totalSteps}
          </p>
        </div>

        {/* Step 0: Name input */}
        {step === 0 && (
          <GameCard title="Вітаємо в Evolution of Student!" description="Розкажи нам трохи про себе" glowing>
            <div className="space-y-6">
              <div className="text-center py-8">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse-glow" />
                <p className="text-muted-foreground mb-6">
                  Ти на порозі неймовірної пригоди студентського життя! Давай познайомимось.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Як тебе звати?</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Введи своє ім'я"
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={20}
                  autoFocus
                />
              </div>

              <Button onClick={handleStart} disabled={!playerName.trim()} className="w-full gap-2" size="lg">
                Почати пригоду
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </GameCard>
        )}

        {/* Step 1: Skin selection */}
        {step === 1 && (
          <GameCard title="Обери свій вигляд" description="Як ти будеш виглядати в грі?">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {["default", "cool", "nerd", "sporty", "artistic", "tech"].map((skin) => (
                  <button
                    key={skin}
                    onClick={() => setSelectedSkin(skin)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedSkin === skin ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl">
                      {skin === "default" && "😊"}
                      {skin === "cool" && "😎"}
                      {skin === "nerd" && "🤓"}
                      {skin === "sporty" && "💪"}
                      {skin === "artistic" && "🎨"}
                      {skin === "tech" && "⚡"}
                    </div>
                    <p className="text-xs font-medium capitalize">{skin}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button onClick={handleSkinSelect} className="flex-1 gap-2">
                  Продовжити
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GameCard>
        )}

        {/* Steps 2-6: Personality questions */}
        {currentQuestion && (
          <GameCard title={`Питання ${step - 1}`} description={currentQuestion.question} glowing>
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(answer.type)}
                  className="w-full p-4 text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all hover:scale-102"
                >
                  <p className="font-medium">{answer.text}</p>
                </button>
              ))}
            </div>
          </GameCard>
        )}

        {/* Final step: Result */}
        {personalityType && step === 2 + questions.length && (
          <GameCard title="Твій тип студента!" description="Ось хто ти насправді" glowing>
            <div className="space-y-6">
              <div className="text-center py-6">
                <div
                  className={`inline-block p-6 rounded-full bg-gradient-to-br ${PERSONALITY_TYPES[personalityType].color} mb-4`}
                >
                  <span className="text-6xl">{PERSONALITY_TYPES[personalityType].emoji}</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{PERSONALITY_TYPES[personalityType].name}</h3>
                <p className="text-muted-foreground mb-4">{PERSONALITY_TYPES[personalityType].description}</p>

                <div className="bg-accent/10 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-2">Спеціальна здібність:</p>
                  <p className="text-primary font-bold">{PERSONALITY_TYPES[personalityType].specialAbility}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-card border rounded-lg p-3">
                    <p className="text-muted-foreground">Навчання</p>
                    <p className="font-bold">{PERSONALITY_TYPES[personalityType].statModifiers.learningSpeed}x</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3">
                    <p className="text-muted-foreground">Заробіток</p>
                    <p className="font-bold">{PERSONALITY_TYPES[personalityType].statModifiers.moneyBonus}x</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleFinish} className="w-full gap-2" size="lg">
                Розпочати гру!
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </GameCard>
        )}
      </div>
    </div>
  )
}
