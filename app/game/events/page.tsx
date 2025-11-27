"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Gift, Sparkles, Trophy } from "lucide-react"
import { getActiveEvents, getUpcomingEvents, getTimeRemaining, type GameEvent } from "@/lib/events-data"

export default function EventsPage() {
  const router = useRouter()
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<GameEvent[]>([])
  const [timers, setTimers] = useState<Record<string, any>>({})

  useEffect(() => {
    const updateEvents = () => {
      setActiveEvents(getActiveEvents())
      setUpcomingEvents(getUpcomingEvents())
    }

    updateEvents()
    const interval = setInterval(updateEvents, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, any> = {}
      activeEvents.forEach((event) => {
        newTimers[event.id] = getTimeRemaining(event.endDate)
      })
      setTimers(newTimers)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeEvents])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.back()} className="border-purple-400 text-purple-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Події та Акції
          </h1>
          <div className="w-24" />
        </div>

        {activeEvents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <h2 className="text-2xl font-bold text-white">Активні Події</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {activeEvents.map((event) => (
                <div
                  key={event.id}
                  className={`relative bg-gradient-to-br ${event.backgroundColor} rounded-2xl p-6 border-2 ${event.accentColor} shadow-2xl event-card-glow overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 text-8xl opacity-10">{event.icon}</div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-5xl">{event.icon}</div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white" />
                        <div className="text-white font-mono text-sm">
                          {timers[event.id] && (
                            <>
                              {timers[event.id].days > 0 && `${timers[event.id].days}д `}
                              {timers[event.id].hours.toString().padStart(2, "0")}:
                              {timers[event.id].minutes.toString().padStart(2, "0")}:
                              {timers[event.id].seconds.toString().padStart(2, "0")}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{event.name}</h3>
                    <p className="text-white/90 mb-4">{event.description}</p>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Бонуси:
                      </h4>
                      <div className="space-y-1 text-sm text-white/90">
                        {event.bonuses.xpMultiplier && <div>Досвід ×{event.bonuses.xpMultiplier}</div>}
                        {event.bonuses.moneyMultiplier && <div>Монети ×{event.bonuses.moneyMultiplier}</div>}
                        {event.bonuses.stressReduction && (
                          <div>Стрес -{Math.floor(event.bonuses.stressReduction * 100)}%</div>
                        )}
                        {event.bonuses.energyReduction && (
                          <div>Витрата енергії -{Math.floor(event.bonuses.energyReduction * 100)}%</div>
                        )}
                      </div>
                    </div>

                    {event.specialRewards && (
                      <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/50">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          Особливі Нагороди:
                        </h4>
                        <div className="space-y-1 text-sm text-white/90">
                          {event.specialRewards.coins && <div>+{event.specialRewards.coins} монет</div>}
                          {event.specialRewards.experience && <div>+{event.specialRewards.experience} XP</div>}
                          {event.specialRewards.items && (
                            <div className="text-yellow-300 font-semibold">
                              {event.specialRewards.items.length} унікальних предметів
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Найближчі Події</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {upcomingEvents.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="text-4xl mb-2">{event.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{event.name}</h3>
                  <p className="text-white/70 text-sm mb-3">{event.description}</p>
                  <div className="text-cyan-400 text-sm font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Починається: {event.startDate.toLocaleDateString("uk-UA")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEvents.length === 0 && upcomingEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-white mb-2">Немає активних подій</h3>
            <p className="text-white/70">Слідкуйте за оновленнями, незабаром з'являться нові події!</p>
          </div>
        )}
      </div>
    </div>
  )
}
