"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Search, TrendingUp, ArrowLeft, Loader2, Heart, Award as IdCard, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerCard } from "@/components/player-card"
import { useGameModal } from "@/lib/use-game-modal"
import Link from "next/link"
import {
  searchPlayers,
  getRecommendedPlayers,
  getActivePlayers,
  sendFriendRequest,
  areFriends,
  getFriends,
  removeFriend,
  type PlayerProfile,
  type Friendship,
} from "@/lib/friends-system"

export default function FriendsSearchPage() {
  const router = useRouter()
  const { showSuccess, showAlert, showConfirm } = useGameModal()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PlayerProfile[]>([])
  const [recommended, setRecommended] = useState<PlayerProfile[]>([])
  const [active, setActive] = useState<PlayerProfile[]>([])
  const [friends, setFriends] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const [friendsList, setFriendsList] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("search")

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading players...")
      const [recommendedData, activeData, friendsData] = await Promise.all([
        getRecommendedPlayers().catch((err) => {
          console.error("[v0] Error loading recommended:", err)
          return []
        }),
        getActivePlayers().catch((err) => {
          console.error("[v0] Error loading active:", err)
          return []
        }),
        getFriends().catch((err) => {
          console.error("[v0] Error loading friends:", err)
          return []
        }),
      ])

      console.log("[v0] Loaded data:", {
        recommended: recommendedData.length,
        active: activeData.length,
        friends: friendsData.length,
      })

      setRecommended(recommendedData)
      setActive(activeData)
      setFriends(friendsData)

      const allPlayers = [...recommendedData, ...activeData]
      if (allPlayers.length > 0) {
        const friendsChecks = await Promise.all(
          allPlayers.map((player) =>
            areFriends(player.id).catch((err) => {
              console.error("[v0] Error checking friendship:", err)
              return false
            }),
          ),
        )
        const friendsSet = new Set<string>()
        allPlayers.forEach((player, index) => {
          if (friendsChecks[index]) {
            friendsSet.add(player.id)
          }
        })
        setFriendsList(friendsSet)
      }
    } catch (error) {
      console.error("[v0] Error in loadPlayers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setLoading(true)
    try {
      const results = await searchPlayers(query)
      console.log("[v0] Search results received:", results.length)
      setSearchResults(results)
    } catch (error) {
      console.error("[v0] Search error:", error)
      setSearchResults([])
    }
    setLoading(false)
  }

  const handleAddFriend = async (playerId: string) => {
    const result = await sendFriendRequest(playerId)
    if (result.success) {
      setPendingRequests((prev) => new Set([...prev, playerId]))
      showSuccess("Запит в друзі надіслано!")
    } else {
      showAlert(result.error || "Помилка надсилання запиту")
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
            // Reload friends list
            const friendsData = await getFriends()
            setFriends(friendsData)
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
            onClick={() => router.push("/game")}
            className="mb-4 rounded-full hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до гри
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
                Друзі
              </h1>
              <p className="text-muted-foreground mt-1">Шукай гравців та спілкуйся з друзями</p>
            </div>
            <Link href="/game/friends/add-by-id">
              <Button
                size="lg"
                className="rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <IdCard className="w-5 h-5 mr-2" />
                Додати за ID
              </Button>
            </Link>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2">
            <TabsTrigger
              value="friends"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Мої друзі ({friends.length})
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Знайти друзів
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
              </div>
            ) : friends.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-blue-500" />
                  Твої друзі
                </h2>
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
                <p className="text-muted-foreground mb-6">Перейди на вкладку "Знайти друзів" щоб додати нових друзів</p>
                <Button
                  onClick={() => setActiveTab("search")}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Знайти друзів
                </Button>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="search">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Введи ім'я гравця..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/30 focus:border-purple-500/50 shadow-xl"
                />
                {loading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-purple-500" />
                )}
              </div>
            </motion.div>

            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Search className="w-6 h-6 text-primary" />
                  Результати пошуку
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PlayerCard
                        player={player}
                        onAddFriend={() => handleAddFriend(player.id)}
                        onViewProfile={() => handleViewProfile(player.id)}
                        isPending={pendingRequests.has(player.id)}
                        isFriend={friendsList.has(player.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {recommended.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  Рекомендовані друзі
                </h2>
                <p className="text-muted-foreground mb-4">Гравці з схожим рівнем та активністю</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommended.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PlayerCard
                        player={player}
                        onAddFriend={() => handleAddFriend(player.id)}
                        onViewProfile={() => handleViewProfile(player.id)}
                        isPending={pendingRequests.has(player.id)}
                        isFriend={friendsList.has(player.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {active.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  Найактивніші гравці
                </h2>
                <p className="text-muted-foreground mb-4">Гравці що нещодавно були онлайн</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {active.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PlayerCard
                        player={player}
                        onAddFriend={() => handleAddFriend(player.id)}
                        onViewProfile={() => handleViewProfile(player.id)}
                        isPending={pendingRequests.has(player.id)}
                        isFriend={friendsList.has(player.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && searchResults.length === 0 && recommended.length === 0 && active.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                <Users className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-muted-foreground mb-2">Гравців не знайдено</h3>
                <p className="text-muted-foreground">
                  Спробуй ввести інше ім'я або зачекай, поки з'являться нові гравці
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
