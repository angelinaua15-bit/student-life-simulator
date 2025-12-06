"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls, PointerLockControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Package, Map, MessageCircle, X, Navigation, LogOut, Compass } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Player } from "@/components/polytechnic-3d/player"
import { PolytechnicWorld } from "@/components/polytechnic-3d/world"
import { NPCs } from "@/components/polytechnic-3d/npcs"
import { InteractiveObjects } from "@/components/polytechnic-3d/interactive-objects"
import { PostProcessingEffects } from "@/components/polytechnic-3d/effects"
import { Minimap } from "@/components/polytechnic-3d/minimap"
import { loadGameState, saveGameState, addMoney, addExperience } from "@/lib/game-state"
import type { GameState } from "@/lib/game-state"
import { initialQuests, type QuestItem } from "@/lib/polytechnic-3d-data"
import { useGameModal } from "@/lib/use-game-modal"
import * as THREE from "three"

export default function Polytechnic3DGame() {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [quests, setQuests] = useState<QuestItem[]>(initialQuests)
  const [inventory, setInventory] = useState<string[]>([])
  const [showInventory, setShowInventory] = useState(false)
  const [showQuests, setShowQuests] = useState(false)
  const [showDialogue, setShowDialogue] = useState(false)
  const [currentDialogue, setCurrentDialogue] = useState<string[]>([])
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null)
  const [controlsLocked, setControlsLocked] = useState(false)
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1.6, -25))
  const [showMinimap, setShowMinimap] = useState(true)
  const [playerDirection, setPlayerDirection] = useState<string>("N")
  const [coinsCollected, setCoinsCollected] = useState(0)
  const { showSuccess, showConfirm } = useGameModal()

  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await loadGameState()
        if (saved) {
          setGameState(saved)
          setInventory(saved.inventory || [])
        }
      } catch (error) {
        console.log("[v0] Failed to load game state, using defaults:", error)
        // Use default state if loading fails
      }
    }
    loadState()
  }, [])

  const handleExit = () => {
    showConfirm(
      "Ти впевнений що хочеш вийти? Весь прогрес буде збережено.",
      () => {
        router.push("/game")
      },
      "Вийти з 3D пригоди",
    )
  }

  const handleQuestComplete = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId)
    if (!quest || quest.isCompleted) return

    const updatedQuests = quests.map((q) => (q.id === questId ? { ...q, isCompleted: true } : q))
    setQuests(updatedQuests)

    if (gameState) {
      let updatedState = addMoney(gameState, quest.reward.money)
      updatedState = addExperience(updatedState, quest.reward.experience)
      updatedState = {
        ...updatedState,
        completedEvents: [...updatedState.completedEvents, `3d-quest-${questId}`],
      }

      if (quest.reward.items) {
        quest.reward.items.forEach((item) => {
          if (!inventory.includes(item)) {
            setInventory((prev) => [...prev, item])
            updatedState.inventory.push(item)
          }
        })
      }

      setGameState(updatedState)
      await saveGameState(updatedState)

      showSuccess(
        `Квест виконано! +${quest.reward.money} грн, +${quest.reward.experience} XP${
          quest.reward.items ? `, отримано: ${quest.reward.items.join(", ")}` : ""
        }`,
        "Квест завершено!",
      )
    }
  }

  const handleItemCollect = (itemId: string) => {
    if (!inventory.includes(itemId)) {
      setInventory((prev) => [...prev, itemId])

      if (itemId === "coin") {
        setCoinsCollected((prev) => prev + 1)
        if (gameState) {
          const updatedState = addMoney(gameState, 10)
          setGameState(updatedState)
          saveGameState(updatedState)
        }
      }

      const updatedQuests = quests.map((quest) => {
        const updatedObjectives = quest.objectives.map((obj) => {
          if (obj.type === "collect_items" && obj.target === itemId && obj.current < obj.required) {
            return { ...obj, current: obj.current + 1 }
          }
          return obj
        })

        const isComplete = updatedObjectives.every((obj) => obj.current >= obj.required)
        if (isComplete && !quest.isCompleted) {
          setTimeout(() => handleQuestComplete(quest.id), 500)
        }

        return { ...quest, objectives: updatedObjectives }
      })

      setQuests(updatedQuests)
    }
  }

  const handleInteraction = (type: string, id: string) => {
    const updatedQuests = quests.map((quest) => {
      const updatedObjectives = quest.objectives.map((obj) => {
        if (obj.type === "interact" && obj.target === id && obj.current < obj.required) {
          return { ...obj, current: obj.current + 1 }
        }
        return obj
      })

      const isComplete = updatedObjectives.every((obj) => obj.current >= obj.required)
      if (isComplete && !quest.isCompleted) {
        setTimeout(() => handleQuestComplete(quest.id), 500)
      }

      return { ...quest, objectives: updatedObjectives }
    })

    setQuests(updatedQuests)
  }

  const handleNPCDialogue = (dialogue: string[]) => {
    setCurrentDialogue(dialogue)
    setDialogueIndex(0)
    setShowDialogue(true)
    setControlsLocked(true)
  }

  const nextDialogue = () => {
    if (dialogueIndex < currentDialogue.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    } else {
      setShowDialogue(false)
      setControlsLocked(false)
    }
  }

  const activeQuests = quests.filter((q) => !q.isCompleted)
  const completedQuests = quests.filter((q) => q.isCompleted)

  const questMarkers = activeQuests.map((quest) => ({
    position: new THREE.Vector3(-25, 0, 17),
    label: quest.title,
  }))

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gradient-to-b from-blue-200 via-purple-100 to-pink-100">
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "KeyW"] },
          { name: "backward", keys: ["ArrowDown", "KeyS"] },
          { name: "left", keys: ["ArrowLeft", "KeyA"] },
          { name: "right", keys: ["ArrowRight", "KeyD"] },
          { name: "jump", keys: ["Space"] },
          { name: "run", keys: ["ShiftLeft"] },
          { name: "interact", keys: ["KeyE"] },
        ]}
      >
        <Canvas
          shadows
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          className="h-full w-full"
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={["#87ceeb"]} />
            <ambientLight intensity={0.6} />
            <directionalLight
              castShadow
              position={[50, 100, 25]}
              intensity={1.5}
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-far={200}
              shadow-camera-left={-80}
              shadow-camera-right={80}
              shadow-camera-top={80}
              shadow-camera-bottom={-80}
              shadow-bias={-0.0001}
              color="#ffeaa7"
            />
            <directionalLight position={[-50, 60, -25]} intensity={0.5} color="#74b9ff" />
            <hemisphereLight args={["#74b9ff", "#55efc4", 0.7]} />
            <pointLight position={[0, 20, 0]} intensity={1.5} color="#fff9e6" distance={60} decay={2} />
            <spotLight position={[0, 30, -15]} angle={0.6} penumbra={0.5} intensity={1.2} castShadow color="#ffffff" />
            <fog attach="fog" args={["#b0d4f1", 100, 180]} />

            <PolytechnicWorld />
            <Player
              controlsLocked={controlsLocked}
              onInteractionPrompt={setInteractionPrompt}
              onPlayerMove={setPlayerPosition}
              onDirectionChange={setPlayerDirection}
            />
            <NPCs onDialogue={handleNPCDialogue} onInteractionPrompt={setInteractionPrompt} />
            <InteractiveObjects
              onCollect={handleItemCollect}
              onInteract={handleInteraction}
              onInteractionPrompt={setInteractionPrompt}
              collectedItems={inventory}
            />

            <PointerLockControls />

            <PostProcessingEffects />
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10">
        <div className="flex justify-between items-start">
          <Link href="/game" className="pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/95 backdrop-blur-md border-2 border-purple-500 hover:bg-purple-50 shadow-lg font-bold text-base transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </Button>
          </Link>

          <div className="flex gap-2">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md border-2 border-blue-500 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span className="font-black text-blue-700 text-base">{playerDirection}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMinimap(!showMinimap)}
              className="pointer-events-auto gap-2 bg-white/95 backdrop-blur-md border-2 border-cyan-500 hover:bg-cyan-50 shadow-lg font-bold text-base transition-all hover:scale-105"
            >
              <Navigation className="w-5 h-5" />
              Карта
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInventory(!showInventory)}
              className="pointer-events-auto gap-2 bg-white/95 backdrop-blur-md border-2 border-yellow-500 hover:bg-yellow-50 shadow-lg font-bold text-base transition-all hover:scale-105"
            >
              <Package className="w-5 h-5" />
              Інвентар ({inventory.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuests(!showQuests)}
              className="pointer-events-auto gap-2 bg-white/95 backdrop-blur-md border-2 border-green-500 hover:bg-green-50 shadow-lg font-bold text-base transition-all hover:scale-105"
            >
              <Map className="w-5 h-5" />
              Квести ({activeQuests.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExit}
              className="pointer-events-auto gap-2 bg-red-500/95 backdrop-blur-md border-2 border-red-600 hover:bg-red-600 text-white shadow-lg font-bold text-base transition-all hover:scale-105 animate-pulse-glow"
            >
              <LogOut className="w-5 h-5" />
              Вийти
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute top-20 left-4 bg-gradient-to-br from-purple-500/95 to-cyan-500/95 backdrop-blur-md text-white p-4 rounded-2xl text-sm pointer-events-none border-4 border-white/50 shadow-2xl z-10">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-6 h-6 text-yellow-300" />
          <span className="font-black text-xl">{coinsCollected} монет зібрано</span>
        </div>
      </div>

      {interactionPrompt && !showDialogue && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
          <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-2xl border-4 border-white shadow-2xl animate-pulse">
            <p
              className="text-lg font-black uppercase tracking-wide"
              style={{
                textShadow:
                  "0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6), 2px 2px 4px rgba(0,0,0,1), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              }}
            >
              Натисни E щоб {interactionPrompt}
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-gradient-to-br from-white/95 to-purple-100/95 backdrop-blur-md text-gray-900 p-5 rounded-2xl text-sm pointer-events-none border-4 border-purple-500 shadow-2xl z-10">
        <h3
          className="font-black text-purple-700 mb-3 text-lg uppercase tracking-wide"
          style={{
            textShadow: "0 0 10px rgba(139, 92, 246, 0.5), 2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Керування
        </h3>
        <div className="space-y-1.5">
          <p className="font-bold">
            <strong className="text-cyan-600 font-black text-base">WASD</strong>
            <span className="text-gray-700 ml-2">- Рух</span>
          </p>
          <p className="font-bold">
            <strong className="text-cyan-600 font-black text-base">Пробіл</strong>
            <span className="text-gray-700 ml-2">- Стрибок (2x)</span>
          </p>
          <p className="font-bold">
            <strong className="text-cyan-600 font-black text-base">Shift + S</strong>
            <span className="text-gray-700 ml-2">- Ковзання</span>
          </p>
          <p className="font-bold">
            <strong className="text-cyan-600 font-black text-base">Shift</strong>
            <span className="text-gray-700 ml-2">- Біг</span>
          </p>
          <p className="font-bold">
            <strong className="text-cyan-600 font-black text-base">E</strong>
            <span className="text-gray-700 ml-2">- Взаємодія</span>
          </p>
          <p className="font-bold">
            <strong className="text-cyan-600 font-black text-base">Миша</strong>
            <span className="text-gray-700 ml-2">- Огляд</span>
          </p>
        </div>
      </div>

      {showMinimap && <Minimap playerPosition={playerPosition} questMarkers={questMarkers} />}

      {showInventory && (
        <div className="absolute top-20 right-4 w-80 bg-white/95 backdrop-blur-md border-4 border-yellow-500 rounded-2xl p-5 pointer-events-auto shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3
              className="font-black text-2xl text-yellow-700"
              style={{
                textShadow: "0 0 10px rgba(234, 179, 8, 0.3), 1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              Інвентар
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInventory(false)}
              className="hover:bg-yellow-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {inventory.length === 0 ? (
              <p className="text-base text-gray-600 text-center py-8 font-semibold">Інвентар порожній</p>
            ) : (
              inventory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-yellow-100 rounded-xl border-2 border-yellow-400 shadow-md"
                >
                  <Package className="w-5 h-5 text-yellow-700" />
                  <span className="text-base capitalize font-bold text-gray-800">{item.replace(/-/g, " ")}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showQuests && (
        <div className="absolute top-20 right-4 w-96 bg-white/95 backdrop-blur-md border-4 border-green-500 rounded-2xl p-5 pointer-events-auto max-h-[80vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3
              className="font-black text-2xl text-green-700"
              style={{
                textShadow: "0 0 10px rgba(34, 197, 94, 0.3), 1px 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              Квести
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuests(false)}
              className="hover:bg-green-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {activeQuests.length > 0 && (
              <div>
                <h4 className="font-black text-base text-purple-700 mb-3 uppercase tracking-wide">Активні</h4>
                {activeQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="mb-3 p-4 bg-purple-100 rounded-xl border-3 border-purple-400 shadow-lg"
                  >
                    <h5 className="font-black text-base text-gray-900">{quest.title}</h5>
                    <p className="text-sm text-gray-700 mt-2 font-semibold">{quest.description}</p>
                    <div className="mt-3 space-y-2">
                      {quest.objectives.map((obj, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm font-bold">
                            <span className="capitalize text-gray-800">
                              {obj.type.replace(/_/g, " ")}: {obj.target.replace(/-/g, " ")}
                            </span>
                            <span className="text-purple-700 font-black">
                              {obj.current}/{obj.required}
                            </span>
                          </div>
                          <Progress value={(obj.current / obj.required) * 100} className="h-2 mt-1" />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-cyan-700 mt-3 font-bold">
                      Нагорода: {quest.reward.money} грн, {quest.reward.experience} XP
                    </p>
                  </div>
                ))}
              </div>
            )}

            {completedQuests.length > 0 && (
              <div>
                <h4 className="font-black text-base text-green-600 mb-3 uppercase tracking-wide">Виконані</h4>
                {completedQuests.map((quest) => (
                  <div key={quest.id} className="mb-2 p-3 bg-green-100 rounded-xl border-3 border-green-400 shadow-md">
                    <h5 className="font-black text-base text-gray-900">{quest.title}</h5>
                    <p className="text-sm text-green-700 font-bold mt-1">✓ Виконано</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showDialogue && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[600px] pointer-events-auto z-30">
          <div className="bg-white/95 backdrop-blur-md border-4 border-purple-500 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p
                  className="text-base leading-relaxed font-semibold text-gray-900"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {currentDialogue[dialogueIndex]}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <Button
                onClick={nextDialogue}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold text-base px-6 shadow-lg"
              >
                {dialogueIndex < currentDialogue.length - 1 ? "Далі →" : "Закрити"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
