"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, type GameState, updateStats, addExperience } from "@/lib/game-state"
import { NPCS, getNPCAtLocation, getRandomDialogue, type NPC } from "@/lib/npc-system"
import { getDefaultWorldState, type WorldState } from "@/lib/world-system"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, User, MessageCircle, Heart } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

export default function NPCsPage() {
  const router = useRouter()
  const { showAlert } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [worldState, setWorldState] = useState<WorldState>(getDefaultWorldState())
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null)
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
      }

      setLoading(false)
    }
    loadData()
  }, [router])

  const handleTalkToNPC = async (npc: NPC) => {
    if (!gameState) return

    setSelectedNPC(npc)
    const greeting = getRandomDialogue(npc, "greeting")
    const casual = getRandomDialogue(npc, "casual")

    showAlert(`${npc.name}: "${greeting}"\n\n"${casual}"`, `Розмова з ${npc.name}`)

    const updatedState = updateStats(gameState, {
      happiness: gameState.stats.happiness + 2,
      stress: gameState.stats.stress - 1,
    })

    setGameState(updatedState)
    await saveGameState(updatedState)
  }

  const handleBefriend = async (npc: NPC) => {
    if (!gameState || !npc.canBeFriend) return

    const existingFriend = gameState.friends?.find((f) => f.id === npc.id)
    if (existingFriend) {
      showAlert("Ви вже друзі з цією людиною!", "Вже друзі")
      return
    }

    const newFriend = {
      id: npc.id,
      name: npc.name,
      friendshipLevel: 10,
    }

    const updatedState = {
      ...gameState,
      friends: [...(gameState.friends || []), newFriend],
    }

    const withXP = addExperience(updatedState, 50)
    setGameState(withXP)
    await saveGameState(withXP)

    showAlert(`${npc.name} тепер твій друг! Ви отримали 50 XP та можете разом виконувати квести.`, "Новий друг!")
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const npcsAtCurrentLocation = getNPCAtLocation(worldState.currentLocation, worldState.currentTime)
  const allNPCs = Object.values(NPCS)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/game">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Персонажі</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Зараз поруч з тобою:</h2>
          {npcsAtCurrentLocation.length === 0 ? (
            <p className="text-muted-foreground">Тут нікого немає зараз. Спробуй в інший час або локацію.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {npcsAtCurrentLocation.map((npc) => {
                const isFriend = gameState.friends?.some((f) => f.id === npc.id)
                return (
                  <Card key={npc.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${npc.avatarColor} flex items-center justify-center`}
                      >
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{npc.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{npc.role}</p>
                        <p className="text-xs text-muted-foreground italic mb-3">{npc.personality}</p>
                        {isFriend && (
                          <div className="flex items-center gap-2 text-pink-600 text-sm mb-2">
                            <Heart className="w-4 h-4 fill-current" />
                            <span>Друг</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleTalkToNPC(npc)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Поговорити
                          </Button>
                          {npc.canBeFriend && !isFriend && (
                            <Button size="sm" variant="outline" onClick={() => handleBefriend(npc)}>
                              <Heart className="w-4 h-4 mr-2" />
                              Додати в друзі
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">Всі персонажі:</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allNPCs.map((npc) => {
              const isFriend = gameState.friends?.some((f) => f.id === npc.id)
              const isNearby = npcsAtCurrentLocation.some((n) => n.id === npc.id)

              return (
                <Card key={npc.id} className={`p-4 ${isNearby ? "ring-2 ring-primary" : "opacity-70"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${npc.avatarColor} flex items-center justify-center`}
                    >
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{npc.name}</h3>
                      <p className="text-xs text-muted-foreground">{npc.role}</p>
                    </div>
                  </div>
                  {isFriend && (
                    <div className="flex items-center gap-2 text-pink-600 text-sm mb-2">
                      <Heart className="w-4 h-4 fill-current" />
                      <span>Друг</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Ранок: {npc.routines.morning}</div>
                    <div>День: {npc.routines.afternoon}</div>
                    <div>Вечір: {npc.routines.evening}</div>
                    <div>Ніч: {npc.routines.night}</div>
                  </div>
                  {isNearby && <div className="mt-3 text-xs text-primary font-bold">Зараз поруч</div>}
                </Card>
              )
            })}
          </div>
        </div>

        {gameState.friends && gameState.friends.length > 0 && (
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Твої Друзі ({gameState.friends.length}):</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {gameState.friends.map((friend) => {
                const npc = NPCS[friend.id]
                if (!npc) return null

                return (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${npc.avatarColor} flex items-center justify-center`}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold">{friend.name}</h3>
                        <p className="text-xs text-muted-foreground">{npc.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Дружба</span>
                        <span className="font-bold">{friend.friendshipLevel}%</span>
                      </div>
                      <Progress value={friend.friendshipLevel} className="h-2" />
                    </div>
                  </Card>
                )
              })}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
