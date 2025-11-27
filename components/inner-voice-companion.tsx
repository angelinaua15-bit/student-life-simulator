"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Volume2, VolumeX } from "lucide-react"
import { innerVoiceAI, type InnerVoiceMessage } from "@/lib/inner-voice-system"
import { Button } from "@/components/ui/button"

interface InnerVoiceCompanionProps {
  gameState: any
  onTrigger?: (trigger: "greeting" | "achievement" | "warning" | "advice") => void
}

const EMOTION_COLORS = {
  neutral: "from-gray-400 to-gray-600",
  happy: "from-green-400 to-emerald-600",
  worried: "from-orange-400 to-red-600",
  excited: "from-purple-400 to-pink-600",
  tired: "from-blue-400 to-indigo-600",
  motivated: "from-yellow-400 to-orange-600",
}

const EMOTION_FACES = {
  neutral: "😊",
  happy: "😄",
  worried: "😟",
  excited: "🤩",
  tired: "😴",
  motivated: "💪",
}

export function InnerVoiceCompanion({ gameState, onTrigger }: InnerVoiceCompanionProps) {
  const [currentMessage, setCurrentMessage] = useState<InnerVoiceMessage | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [emotion, setEmotion] = useState<InnerVoiceMessage["emotion"]>("neutral")

  useEffect(() => {
    // Перевірка повідомлень кожні 30 секунд
    const interval = setInterval(() => {
      if (!isMuted) {
        const message = innerVoiceAI.shouldShowMessage(gameState)
        if (message) {
          setCurrentMessage(message)
          setEmotion(message.emotion)
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [gameState, isMuted])

  // Вітання при завантаженні
  useEffect(() => {
    const greeting = innerVoiceAI.generateMessage("greeting", gameState)
    if (greeting) {
      setCurrentMessage(greeting)
      setEmotion(greeting.emotion)
    }
  }, [])

  const handleClick = () => {
    // Випадкова репліка при кліку
    const triggers: Array<"advice" | "random"> = ["advice", "random"]
    const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)]
    const message = innerVoiceAI.generateMessage(randomTrigger, gameState)

    if (message) {
      setCurrentMessage(message)
      setEmotion(message.emotion)
    }
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
        onClick={() => setIsMinimized(false)}
      >
        <div className="relative group cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-all animate-gradient">
            <span className="text-5xl animate-bounce">{EMOTION_FACES[emotion]}</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 opacity-40 blur-2xl group-hover:opacity-70 transition-opacity animate-pulse" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed bottom-6 right-6 z-50 w-96"
    >
      <div className="relative group">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-2 border-white/40 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 p-4 flex items-center justify-between border-b border-white/20 animate-gradient">
            <div className="flex items-center gap-3">
              <div
                onClick={handleClick}
                className="relative cursor-pointer w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center shadow-xl hover:scale-110 transition-all"
              >
                <span className="text-3xl animate-bounce">{EMOTION_FACES[emotion]}</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 opacity-50 blur-xl animate-pulse" />
              </div>
              <div>
                <div className="font-extrabold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Міні-Мозок
                </div>
                <div className="text-sm text-muted-foreground">Твій внутрішній голос</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full hover:bg-white/30 transition-all"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full hover:bg-white/30 transition-all"
                onClick={() => setIsMinimized(true)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 min-h-[160px] max-h-[240px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentMessage && (
                <motion.div
                  key={currentMessage.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <div
                      className={`inline-block px-6 py-4 rounded-3xl bg-gradient-to-r ${EMOTION_COLORS[emotion]} text-white text-base leading-relaxed shadow-xl max-w-full`}
                    >
                      {currentMessage.text}
                    </div>
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${EMOTION_COLORS[emotion]} opacity-30 blur-lg -z-10`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {new Date(currentMessage.timestamp).toLocaleTimeString("uk-UA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!currentMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground text-sm py-12"
              >
                <div className="text-6xl mb-3 animate-float-gentle">😊</div>
                <div className="font-semibold">Клікни на мене для поради!</div>
              </motion.div>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 px-6 py-3 border-t border-white/20">
            <div className="text-xs text-center text-muted-foreground font-medium">
              Я аналізую твою гру та даю персональні поради ✨
            </div>
          </div>
        </div>
        <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  )
}
