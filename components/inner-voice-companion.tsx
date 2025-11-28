"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
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
  const [isOpen, setIsOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<InnerVoiceMessage | null>(null)
  const [emotion, setEmotion] = useState<InnerVoiceMessage["emotion"]>("neutral")

  useEffect(() => {
    if (isOpen) {
      const message = innerVoiceAI.shouldShowMessage(gameState)
      if (message) {
        setCurrentMessage(message)
        setEmotion(message.emotion)
      }
    }
  }, [gameState, isOpen])

  useEffect(() => {
    if (isOpen && !currentMessage) {
      const greeting = innerVoiceAI.generateMessage("greeting", gameState)
      if (greeting) {
        setCurrentMessage(greeting)
        setEmotion(greeting.emotion)
      }
    }
  }, [isOpen])

  const handleClick = () => {
    const triggers: Array<"advice" | "random"> = ["advice", "random"]
    const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)]
    const message = innerVoiceAI.generateMessage(randomTrigger, gameState)

    if (message) {
      setCurrentMessage(message)
      setEmotion(message.emotion)
    }
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-all cursor-pointer group"
        aria-label="Відкрити Міні-Мозок"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 opacity-50 blur-xl animate-pulse" />
        <span className="text-3xl md:text-4xl relative z-10 group-hover:scale-110 transition-transform">
          {EMOTION_FACES[emotion]}
        </span>
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-24 right-6 z-50 w-[340px] md:w-[360px]"
      >
        <div className="relative group">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-2 border-white/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 p-3 flex items-center justify-between border-b border-white/20 animate-gradient">
              <div className="flex items-center gap-2">
                <div
                  onClick={handleClick}
                  className="relative cursor-pointer w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                >
                  <span className="text-2xl">{EMOTION_FACES[emotion]}</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 opacity-50 blur-lg animate-pulse" />
                </div>
                <div>
                  <div className="font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Міні-Мозок
                  </div>
                  <div className="text-xs text-muted-foreground">Твій внутрішній голос</div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-white/30 transition-all"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[200px] md:h-[240px] overflow-y-auto">
              <AnimatePresence mode="wait">
                {currentMessage && (
                  <motion.div
                    key={currentMessage.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="space-y-2"
                  >
                    <div className="relative">
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl bg-gradient-to-r ${EMOTION_COLORS[emotion]} text-white text-sm leading-relaxed shadow-lg max-w-full`}
                      >
                        {currentMessage.text}
                      </div>
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${EMOTION_COLORS[emotion]} opacity-20 blur-md -z-10`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
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
                  className="text-center text-muted-foreground text-sm py-8"
                >
                  <div className="text-5xl mb-2 animate-float-gentle">😊</div>
                  <div className="font-semibold">Клікни на мене для поради!</div>
                </motion.div>
              )}
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 px-4 py-2 border-t border-white/20">
              <div className="text-xs text-center text-muted-foreground">Я аналізую твою гру ✨</div>
            </div>
          </div>
          <div className="absolute -inset-3 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
