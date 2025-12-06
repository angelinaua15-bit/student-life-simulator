"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, updateStats, addMoney, addExperience } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, ArrowLeftIcon, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useGameModal } from "@/lib/use-game-modal"

const GRID_SIZE = 8
const CELL_SIZE = 40

type Position = { x: number; y: number }

export default function LibraryGame() {
  const router = useRouter()
  const { showAlert, showSuccess, showConfirm } = useGameModal()
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 })
  const [books, setBooks] = useState<Position[]>([])
  const [walls, setWalls] = useState<Position[]>([])
  const [timeLeft, setTimeLeft] = useState(45)
  const [totalBooks, setTotalBooks] = useState(8)

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

  useEffect(() => {
    if (!playing) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [playing])

  const isValidPosition = useCallback(
    (x: number, y: number): boolean => {
      // Check grid boundaries
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
        return false
      }

      // Check if position collides with any wall
      const hasWallCollision = walls.some((w) => w.x === x && w.y === y)

      return !hasWallCollision
    },
    [walls],
  )

  const generateMaze = () => {
    const newWalls: Position[] = []
    const newBooks: Position[] = []

    // Generate random walls with better spacing
    for (let i = 0; i < 15; i++) {
      let attempts = 0
      let x, y

      do {
        x = Math.floor(Math.random() * GRID_SIZE)
        y = Math.floor(Math.random() * GRID_SIZE)
        attempts++
      } while (
        attempts < 50 && // Prevent infinite loop
        ((x === 0 && y === 0) || // Not on player spawn
          (x === 0 && y === 1) || // Not next to player spawn
          (x === 1 && y === 0) ||
          newWalls.some((w) => w.x === x && w.y === y)) // No duplicate walls
      )

      if (attempts < 50) {
        newWalls.push({ x, y })
      }
    }

    // Generate books with collision checking
    for (let i = 0; i < 8; i++) {
      let x, y
      let attempts = 0

      do {
        x = Math.floor(Math.random() * GRID_SIZE)
        y = Math.floor(Math.random() * GRID_SIZE)
        attempts++
      } while (
        attempts < 100 &&
        ((x === 0 && y === 0) ||
          newWalls.some((w) => w.x === x && w.y === y) ||
          newBooks.some((b) => b.x === x && b.y === y))
      )

      if (attempts < 100) {
        newBooks.push({ x, y })
      }
    }

    setWalls(newWalls)
    setBooks(newBooks)
    setTotalBooks(newBooks.length)
  }

  const startGame = () => {
    if (gameState && gameState.stats.energy < 10) {
      showAlert("Недостатньо енергії! Потрібно мінімум 10.", "Мало енергії")
      return
    }

    setPlaying(true)
    setScore(0)
    setTimeLeft(45)
    setPlayerPos({ x: 0, y: 0 })
    generateMaze()

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

    if (gameState) {
      const booksCollected = score
      const allBooksCollected = booksCollected === totalBooks

      let moneyEarned = Math.floor(booksCollected * 5)
      let exp = Math.floor(booksCollected * 3)

      if (allBooksCollected) {
        moneyEarned += 50
        exp += 25
      }

      if (allBooksCollected && timeLeft > 0) {
        const speedBonus = Math.floor(timeLeft * 2)
        moneyEarned += speedBonus
        exp += Math.floor(timeLeft / 2)
      }

      let updated = addMoney(gameState, moneyEarned)
      updated = addExperience(updated, exp)
      updated = updateStats(updated, {
        happiness: Math.min(100, updated.stats.happiness + (allBooksCollected ? 10 : 5)),
        stress: Math.max(0, updated.stats.stress - (allBooksCollected ? 5 : 3)),
      })

      if (score > updated.minigameHighScores.library) {
        updated = {
          ...updated,
          minigameHighScores: {
            ...updated.minigameHighScores,
            library: score,
          },
        }
      }

      setGameState(updated)
      await saveGameState(updated)

      let message = `Книг зібрано: ${booksCollected}/${totalBooks}\nЗаробив: ${moneyEarned} грн\nДосвід: +${exp}`
      if (allBooksCollected) {
        message = `🎉 ВСІ КНИГИ ЗІБРАНО! 🎉\n\n${message}\n\n✨ Бонус за виконання: +50 грн, +25 XP`
        if (timeLeft > 0) {
          message += `\n⚡ Бонус за швидкість: +${Math.floor(timeLeft * 2)} грн`
        }
      }

      showSuccess(message, allBooksCollected ? "Ідеально!" : "Гру завершено!")
    }
  }

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (!playing) return

      const newX = playerPos.x + dx
      const newY = playerPos.y + dy

      // Use improved collision detection
      if (!isValidPosition(newX, newY)) {
        console.log("[v0] Movement blocked - invalid position or wall collision")
        return
      }

      console.log("[v0] Moving player to:", { newX, newY })
      setPlayerPos({ x: newX, y: newY })

      // Check for book collection
      const bookIndex = books.findIndex((b) => b.x === newX && b.y === newY)
      if (bookIndex !== -1) {
        const newBooks = books.filter((_, i) => i !== bookIndex)
        setBooks(newBooks)
        const newScore = score + 1
        setScore(newScore)
        setTimeLeft(timeLeft + 2)

        console.log("[v0] Book collected! Remaining:", newBooks.length)

        // Check if all books collected
        if (newBooks.length === 0) {
          setTimeout(() => {
            endGame()
          }, 500)
        }
      }
    },
    [playing, playerPos, isValidPosition, books, score, timeLeft],
  )

  useEffect(() => {
    if (!playing) return

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          e.preventDefault()
          movePlayer(0, -1)
          break
        case "ArrowDown":
        case "s":
          e.preventDefault()
          movePlayer(0, 1)
          break
        case "ArrowLeft":
        case "a":
          e.preventDefault()
          movePlayer(-1, 0)
          break
        case "ArrowRight":
        case "d":
          e.preventDefault()
          movePlayer(1, 0)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [playing, movePlayer])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!gameState) return null

  // Added exit button in top right corner
  const handleExit = () => {
    if (!playing) {
      router.push("/game")
      return
    }

    showConfirm(
      "Ви впевнені що хочете вийти? Прогрес не збережеться.",
      () => {
        // Reset game state
        setPlaying(false)
        setScore(0)
        setTimeLeft(45)
        setPlayerPos({ x: 0, y: 0 })
        setBooks([])
        setWalls([])

        // Return to dashboard
        router.push("/game")
      },
      "Вийти з гри",
    )
  }

  if (!playing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <Link href="/game">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до Dashboard
            </Button>
          </Link>

          <GameCard title="Бібліотека" description="Збирай книги в лабіринті знань!">
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-bold">Як грати:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Використовуй стрілки або WASD для руху</li>
                  <li>Збирай всі книги в лабіринті</li>
                  <li>Уникай стін (темні клітинки)</li>
                  <li>Кожна книга дає +2 секунди</li>
                  <li>Зібери всі 8 книг якомога швидше для максимальних нагород!</li>
                </ul>
              </div>

              <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                <h3 className="font-bold text-accent-foreground">💰 Нагороди:</h3>
                <ul className="text-sm space-y-1">
                  <li>📚 За кожну книгу: +5 грн, +3 XP</li>
                  <li>🎯 За збір всіх книг: +50 грн, +25 XP</li>
                  <li>⚡ Бонус швидкості: +2 грн за кожну залишену секунду</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold">{gameState.minigameHighScores.library}</div>
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
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleExit}
            variant="destructive"
            size="lg"
            className="h-12 w-12 rounded-full p-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-2 border-red-300/50 backdrop-blur-sm animate-pulse-glow"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="bg-card rounded-lg p-4 mb-4 flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Книги</div>
          </div>
          <div className="text-center flex-1">
            <div
              className={`text-3xl font-bold ${books.length === 0 ? "text-success animate-pulse" : "text-accent-foreground"}`}
            >
              {books.length}
            </div>
            <div className="text-sm text-muted-foreground">Залишилось</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-destructive">{timeLeft}s</div>
            <div className="text-sm text-muted-foreground">Час</div>
          </div>
        </div>

        <GameCard title="Лабіринт">
          <div className="flex justify-center">
            <div
              className="bg-muted/30 border-2 border-border rounded-lg overflow-hidden"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
                position: "relative",
              }}
            >
              {Array.from({ length: GRID_SIZE }).map((_, y) =>
                Array.from({ length: GRID_SIZE }).map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="absolute border border-muted"
                    style={{
                      left: x * CELL_SIZE,
                      top: y * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    }}
                  />
                )),
              )}

              {/* Walls with improved visual feedback */}
              {walls.map((wall, i) => (
                <div
                  key={`wall-${i}`}
                  className="absolute bg-foreground/80 rounded-sm"
                  style={{
                    left: wall.x * CELL_SIZE + 2,
                    top: wall.y * CELL_SIZE + 2,
                    width: CELL_SIZE - 4,
                    height: CELL_SIZE - 4,
                  }}
                />
              ))}

              {/* Books */}
              {books.map((book, i) => (
                <div
                  key={`book-${i}`}
                  className="absolute flex items-center justify-center text-2xl animate-pulse"
                  style={{
                    left: book.x * CELL_SIZE,
                    top: book.y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                >
                  📚
                </div>
              ))}

              {/* Player with improved centering */}
              <div
                className="absolute bg-primary rounded-full transition-all duration-150 flex items-center justify-center text-xl z-10"
                style={{
                  left: playerPos.x * CELL_SIZE + 5,
                  top: playerPos.y * CELL_SIZE + 5,
                  width: CELL_SIZE - 10,
                  height: CELL_SIZE - 10,
                }}
              >
                👤
              </div>
            </div>
          </div>
        </GameCard>

        {/* Mobile controls */}
        <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div />
          <Button onClick={() => movePlayer(0, -1)} variant="outline" size="lg">
            <ArrowUp className="w-6 h-6" />
          </Button>
          <div />
          <Button onClick={() => movePlayer(-1, 0)} variant="outline" size="lg">
            <ArrowLeftIcon className="w-6 h-6" />
          </Button>
          <Button onClick={() => movePlayer(0, 1)} variant="outline" size="lg">
            <ArrowDown className="w-6 h-6" />
          </Button>
          <Button onClick={() => movePlayer(1, 0)} variant="outline" size="lg">
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
