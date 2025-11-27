"use client"

import { useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import { getActiveEvents, getTimeRemaining } from "@/lib/events-data"
import { useRouter } from "next/navigation"

export function EventBanner() {
  const router = useRouter()
  const [activeEvents, setActiveEvents] = useState(getActiveEvents())
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      const events = getActiveEvents()
      setActiveEvents(events)

      if (events.length > 0) {
        setCurrentEventIndex((prev) => (prev + 1) % events.length)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeEvents.length > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(activeEvents[currentEventIndex].endDate))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [activeEvents, currentEventIndex])

  if (activeEvents.length === 0 || !isVisible) return null

  const currentEvent = activeEvents[currentEventIndex]

  return (
    <div
      className={`relative bg-gradient-to-r ${currentEvent.backgroundColor} border-2 ${currentEvent.accentColor} rounded-xl p-3 mb-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg event-banner-pulse overflow-hidden`}
      onClick={() => router.push("/game/events")}
    >
      <div className="absolute inset-0 bg-white/10 animate-pulse" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl animate-bounce">{currentEvent.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <h3 className="text-white font-bold">{currentEvent.name}</h3>
            </div>
            <p className="text-white/90 text-sm">{currentEvent.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {timeRemaining && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white font-mono text-sm">
              {timeRemaining.days > 0 && `${timeRemaining.days}д `}
              {timeRemaining.hours.toString().padStart(2, "0")}:{timeRemaining.minutes.toString().padStart(2, "0")}:
              {timeRemaining.seconds.toString().padStart(2, "0")}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsVisible(false)
            }}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {activeEvents.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {activeEvents.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === currentEventIndex ? "bg-white" : "bg-white/30"
              } transition-all`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
