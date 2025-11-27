"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, addMoney, addExperience } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, RotateCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const GRID_WIDTH = 6
const GRID_HEIGHT = 12
const CELL_SIZE = 35

type Block = { x: number; y: number; color: string }
type Piece = { blocks: { x: number; y: number }[]; color: string }

const PIECES: Piece[] = [
  {
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
    color: "bg-cyan-500",
  }, // I
  {
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    color: "bg-yellow-500",
  }, // O
  {
    blocks: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    color: "bg-purple-500",
  }, // T
  {
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    color: "bg-green-500",
  }, // S
  {
    blocks: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    color: "bg-red-500",
  }, // Z
]

export default function CarePackagesGame() {
  const router = useRouter()
  const { showAlert, showSuccess } = useGameModal()
  const [gameState, setGameState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(null)),
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [piecePos, setPiecePos] = useState({ x: 2, y: 0 })
  const [gameSpeed, setGameSpeed] = useState(800)
  const [linesCleared, setLinesCleared] = useState(0)

  useEffect(() => {
    const loadState = async () => {
      const state = await loadGameState()
      if (!state) {
        router.push("/")
        return
      }
      setGameState(state)
      setLoading(false)
    }
    loadState()
  }, [router])

  const spawnNewPiece = useCallback(() => {
    const piece = PIECES[Math.floor(Math.random() * PIECES.length)]
    const newPos = { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 }

    if (checkCollision(piece, newPos, grid)) {
      endGame()
      return
    }

    setCurrentPiece(piece)
    setPiecePos(newPos)
  }, [grid])

  useEffect(() => {
    if (!playing) return

    const interval = setInterval(() => {
      movePieceDown()
    }, gameSpeed)

    return () => clearInterval(interval)
  }, [playing, gameSpeed, currentPiece, piecePos, grid])

  const checkCollision = (piece: Piece, pos: { x: number; y: number }, currentGrid: (string | null)[][]): boolean => {
    return piece.blocks.some((block) => {
      const x = pos.x + block.x
      const y = pos.y + block.y
      return x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT || (y >= 0 && currentGrid[y][x] !== null)
    })
  }

  const movePieceDown = () => {
    if (!currentPiece) return

    const newPos = { ...piecePos, y: piecePos.y + 1 }

    if (checkCollision(currentPiece, newPos, grid)) {
      const newGrid = grid.map((row) => [...row])
      currentPiece.blocks.forEach((block) => {
        const x = piecePos.x + block.x
        const y = piecePos.y + block.y
        if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
          newGrid[y][x] = currentPiece.color
        }
      })

      let cleared = 0
      for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (newGrid[y].every((cell) => cell !== null)) {
          newGrid.splice(y, 1)
          newGrid.unshift(Array(GRID_WIDTH).fill(null))
          cleared++
          y++
        }
      }

      if (cleared > 0) {
        const points = cleared * cleared * 10
        setScore(score + points)
        setLinesCleared(linesCleared + cleared)
        setGameSpeed(Math.max(200, 800 - linesCleared * 30))
      }

      setGrid(newGrid)
      spawnNewPiece()
    } else {
      setPiecePos(newPos)
    }
  }

  const movePiece = useCallback(
    (dx: number) => {
      if (!currentPiece || !playing) return

      const newPos = { x: piecePos.x + dx, y: piecePos.y }
      if (!checkCollision(currentPiece, newPos, grid)) {
        setPiecePos(newPos)
      }
    },
    [currentPiece, piecePos, grid, playing],
  )

  const rotatePiece = useCallback(() => {
    if (!currentPiece || !playing) return

    const rotated = {
      ...currentPiece,
      blocks: currentPiece.blocks.map((block) => ({
        x: -block.y,
        y: block.x,
      })),
    }

    if (!checkCollision(rotated, piecePos, grid)) {
      setCurrentPiece(rotated)
    }
  }, [currentPiece, piecePos, grid, playing])

  const dropPiece = useCallback(() => {
    if (!currentPiece || !playing) return

    const newPos = { ...piecePos }
    while (!checkCollision(currentPiece, { ...newPos, y: newPos.y + 1 }, grid)) {
      newPos.y++
    }
    setPiecePos(newPos)
    setTimeout(() => movePieceDown(), 50)
  }, [currentPiece, piecePos, grid, playing])

  useEffect(() => {
    if (!playing) return

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          e.preventDefault()
          movePiece(-1)
          break
        case "ArrowRight":
        case "d":
          e.preventDefault()
          movePiece(1)
          break
        case "ArrowDown":
        case "s":
          e.preventDefault()
          movePieceDown()
          break
        case "ArrowUp":
        case "w":
        case " ":
          e.preventDefault()
          rotatePiece()
          break
        case "Shift":
          e.preventDefault()
          dropPiece()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [playing, movePiece, rotatePiece, dropPiece])

  const startGame = () => {
    if (gameState && gameState.stats.energy < 10) {
      showAlert("Недостатньо енергії! Потрібно мінімум 10.", "Мало енергії")
      return
    }

    setPlaying(true)
    setScore(0)
    setLinesCleared(0)
    setGameSpeed(800)
    setGrid(
      Array(GRID_HEIGHT)
        .fill(null)
        .map(() => Array(GRID_WIDTH).fill(null)),
    )
    spawnNewPiece()

    if (gameState) {
      const updated = updateStats(gameState, {
        energy: gameState.stats.energy - 10,
      })
      setGameState(updated)
      saveGameState(updated)
    }
  }

  const endGame = async () => {
    setPlaying(false)
    setCurrentPiece(null)

    if (gameState) {
      const moneyEarned = Math.floor(score / 5)
      const exp = Math.floor(linesCleared * 3)

      let updated = addMoney(gameState, moneyEarned)
      updated = addExperience(updated, exp)
      updated = updateStats(updated, {
        happiness: Math.min(100, updated.stats.happiness + 3),
      })

      if (score > updated.minigameHighScores.carePackages) {
        updated = {
          ...updated,
          minigameHighScores: {
            ...updated.minigameHighScores,
            carePackages: score,
          },
        }
      }

      setGameState(updated)
      await saveGameState(updated)

      showSuccess(
        `Очки: ${score}\nЛіній: ${linesCleared}\nЗаробив: ${moneyEarned} грн\nДосвід: +${exp}`,
        "Гру завершено!",
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Завантаження гри...</p>
        </div>
      </div>
    )
  }

  if (!gameState) return null

  if (!playing && !currentPiece) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <Link href="/game">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до Dashboard
            </Button>
          </Link>

          <GameCard title="Пакунки від мами" description="Складай речі в багажник Tetris-стилем!">
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-bold">Як грати:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Стрілки ліво/право або A/D - рух фігури</li>
                  <li>Стрілка вгору, W або Пробіл - обертання</li>
                  <li>Стрілка вниз або S - прискорення падіння</li>
                  <li>Shift - миттєве падіння</li>
                  <li>Заповнюй лінії повністю, щоб очистити їх</li>
                  <li>Більше ліній = більше очок!</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold">{gameState.minigameHighScores.carePackages}</div>
                  <div className="text-sm text-muted-foreground">Рекорд</div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold">{gameState.stats.energy}</div>
                  <div className="text-sm text-muted-foreground">Енергія</div>
                </div>
              </div>

              <Button
                onClick={startGame}
                className="w-full h-12 text-lg font-bold"
                disabled={gameState.stats.energy < 10}
              >
                {gameState.stats.energy < 10 ? "Недостатньо енергії" : "Почати гру"}
              </Button>
            </div>
          </GameCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="bg-card rounded-lg p-4 mb-4 flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Очки</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-secondary">{linesCleared}</div>
            <div className="text-sm text-muted-foreground">Лінії</div>
          </div>
        </div>

        <GameCard title="Багажник">
          <div className="flex justify-center">
            <div
              className="bg-muted/30 border-4 border-border rounded-lg overflow-hidden relative"
              style={{
                width: GRID_WIDTH * CELL_SIZE,
                height: GRID_HEIGHT * CELL_SIZE,
              }}
            >
              {grid.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`absolute border border-muted/50 ${cell || ""}`}
                    style={{
                      left: x * CELL_SIZE,
                      top: y * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    }}
                  />
                )),
              )}

              {currentPiece &&
                currentPiece.blocks.map((block, i) => {
                  const x = piecePos.x + block.x
                  const y = piecePos.y + block.y
                  if (y < 0) return null
                  return (
                    <div
                      key={`piece-${i}`}
                      className={`absolute ${currentPiece.color} border-2 border-white/30`}
                      style={{
                        left: x * CELL_SIZE,
                        top: y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                      }}
                    />
                  )
                })}
            </div>
          </div>
        </GameCard>

        <div className="mt-4 space-y-2">
          <div className="flex gap-2 justify-center">
            <Button onClick={rotatePiece} variant="outline" size="lg">
              <RotateCw className="w-6 h-6" />
            </Button>
            <Button onClick={dropPiece} variant="outline" size="lg" className="flex-1 bg-transparent">
              Скинути
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <Button onClick={() => movePiece(-1)} variant="outline" size="lg">
              ←
            </Button>
            <Button onClick={movePieceDown} variant="outline" size="lg">
              ↓
            </Button>
            <Button onClick={() => movePiece(1)} variant="outline" size="lg">
              →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
