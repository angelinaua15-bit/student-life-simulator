"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, ArrowLeft, Loader2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlayerCard } from "@/components/player-card"
import { useGameModal } from "@/lib/use-game-modal"
import { getFriends, removeFriend, type Friendship } from "@/lib/friends-system"

export default function FriendsListPage() {
  const router = useRouter()
  const { showSuccess, showAlert, showConfirm } = useGameModal()
  const [friends, setFriends] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading friends list...")
      const friendsData = await getFriends()
      console.log("[v0] Friends loaded:", friendsData.length)
      setFriends(friendsData)
    } catch (error) {
      console.error("[v0] Error loading friends:", error)
      showAlert("Помилка завантаження друзів")
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (playerId: string) => {
    router.push(`/game/friends/${playerId}`)
  }

  const handleRemoveFriend = async (friendshipId: string, friendName: string) => {
    showConfirm(
      `Ти впевнений що хочеш видалити ${friendName} з друзів?`,
      async () => {
        try {
          const result = await removeFriend(friendshipId)
          if (result.success) {
            showSuccess("Друга видалено зі списку")
            await loadFriends()
          } else {
            showAlert(result.error || "Помилка видалення друга")
          }
        } catch (error) {
          console.error("[v0] Error removing friend:", error)
          showAlert("Виникла помилка при видаленні друга")
        }
      },
      "Видалити друга",
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/game/friends")}
            className="mb-4 rounded-full hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до друзів
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Мої друзі
              </h1>
              <p className="text-muted-foreground mt-1">
                Всього друзів: <span className="font-bold text-purple-600">{friends.length}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : friends.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {friends.map((friendship, index) => (
                <motion.div
                  key={friendship.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PlayerCard
                    player={friendship.friend!}
                    onViewProfile={() => handleViewProfile(friendship.friend!.id)}
                    isFriend={true}
                    onRemoveFriend={() => handleRemoveFriend(friendship.id, friendship.friend!.nickname)}
                    friendshipLevel={friendship.friendship_level}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <UserCheck className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-muted-foreground mb-2">У тебе поки немає друзів</h3>
            <p className="text-muted-foreground mb-6">Знайди гравців та додай їх у друзі</p>
            <Button
              onClick={() => router.push("/game/friends")}
              className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Users className="w-4 h-4 mr-2" />
              Знайти друзів
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
