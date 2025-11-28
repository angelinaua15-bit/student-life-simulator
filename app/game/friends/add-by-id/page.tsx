"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Search, Loader2, UserPlus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PlayerCard } from "@/components/player-card"
import { useGameModal } from "@/lib/use-game-modal"
import { searchPlayerByPlayerId, sendFriendRequest, type PlayerProfile } from "@/lib/friends-system"
import { isValidPlayerId } from "@/lib/player-id-system"

export default function AddFriendByIdPage() {
  const router = useRouter()
  const { showSuccess, showAlert } = useGameModal()
  const [playerId, setPlayerId] = useState("")
  const [searching, setSearching] = useState(false)
  const [player, setPlayer] = useState<PlayerProfile | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const handleSearch = async () => {
    if (!isValidPlayerId(playerId)) {
      showAlert("Невірний формат ID", "Формат ID: STU-XXXXX-XXXXX")
      return
    }

    setSearching(true)
    setNotFound(false)
    setPlayer(null)

    const result = await searchPlayerByPlayerId(playerId)

    setSearching(false)

    if (result) {
      setPlayer(result)
    } else {
      setNotFound(true)
    }
  }

  const handleAddFriend = async () => {
    if (!player) return

    const result = await sendFriendRequest(player.id)
    if (result.success) {
      setRequestSent(true)
      showSuccess("Запит в друзі надіслано!", "Успіх")
    } else {
      showAlert(result.error || "Помилка надсилання запиту")
    }
  }

  const handleInputChange = (value: string) => {
    // Auto-format ID as user types
    let formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, "")

    // Add dashes automatically
    if (formatted.length > 3 && formatted[3] !== "-") {
      formatted = formatted.slice(0, 3) + "-" + formatted.slice(3)
    }
    if (formatted.length > 9 && formatted[9] !== "-") {
      formatted = formatted.slice(0, 9) + "-" + formatted.slice(9)
    }

    // Limit to correct length
    if (formatted.length > 15) {
      formatted = formatted.slice(0, 15)
    }

    setPlayerId(formatted)
    setNotFound(false)
    setPlayer(null)
    setRequestSent(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/game/friends")}
            className="mb-4 rounded-full hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Додати за ID
              </h1>
              <p className="text-muted-foreground mt-1">Введи унікальний ID гравця</p>
            </div>
          </div>
        </motion.div>

        {/* Search Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 shadow-2xl">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Унікальний ID гравця</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="STU-XXXXX-XXXXX"
                    value={playerId}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-2xl font-mono text-center py-6 rounded-2xl border-2 focus:border-primary/50"
                    maxLength={15}
                  />
                  {searching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 animate-spin text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Формат: STU-XXXXX-XXXXX (літери A-Z та цифри 0-9)
                </p>
              </div>

              <Button
                onClick={handleSearch}
                disabled={!isValidPlayerId(playerId) || searching}
                className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                size="lg"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Пошук...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Знайти гравця
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Player Found */}
        {player && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Гравця знайдено!</h2>
              <p className="text-muted-foreground">Додай цього гравця в друзі</p>
            </div>

            <PlayerCard player={player} onAddFriend={handleAddFriend} isPending={requestSent} showFullDetails />
          </motion.div>
        )}

        {/* Not Found */}
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-8 text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-orange-200 dark:border-orange-900">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Гравця не знайдено</h3>
              <p className="text-muted-foreground mb-4">Гравець з таким ID не існує або ще не зареєстрований</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Перевір правильність введеного ID</p>
                <p>Переконайся що ID введено повністю</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-2">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Як знайти ID друга?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Попроси друга відкрити його профіль</li>
              <li>• У профілі відображається унікальний ID</li>
              <li>• Друг може скопіювати ID або показати QR-код</li>
              <li>• Введи скопійований ID в поле вище</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
