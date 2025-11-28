"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, UserPlus, UserCheck, UserX, Inbox, Send, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameModal } from "@/lib/use-game-modal"
import {
  getIncomingRequests,
  getOutgoingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  type FriendRequest,
} from "@/lib/friends-system"

export default function FriendRequestsPage() {
  const router = useRouter()
  const { showSuccess, showAlert, showConfirm } = useGameModal()
  const [incoming, setIncoming] = useState<FriendRequest[]>([])
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    const [incomingData, outgoingData] = await Promise.all([getIncomingRequests(), getOutgoingRequests()])
    setIncoming(incomingData)
    setOutgoing(outgoingData)
    setLoading(false)
  }

  const handleAccept = async (requestId: string, senderName: string) => {
    setProcessingId(requestId)
    const result = await acceptFriendRequest(requestId)
    if (result.success) {
      showSuccess(`${senderName} тепер твій друг!`, () => {
        const canvas = document.createElement("canvas")
        canvas.style.position = "fixed"
        canvas.style.top = "0"
        canvas.style.left = "0"
        canvas.style.width = "100%"
        canvas.style.height = "100%"
        canvas.style.pointerEvents = "none"
        canvas.style.zIndex = "9999"
        document.body.appendChild(canvas)

        setTimeout(() => {
          document.body.removeChild(canvas)
        }, 3000)
      })
      await loadRequests()
    } else {
      showAlert(result.error || "Помилка прийняття запиту")
    }
    setProcessingId(null)
  }

  const handleReject = async (requestId: string, senderName: string) => {
    showConfirm(
      `Відхилити запит від ${senderName}?`,
      async () => {
        setProcessingId(requestId)
        const result = await rejectFriendRequest(requestId)
        if (result.success) {
          showSuccess("Запит відхилено")
          await loadRequests()
        } else {
          showAlert(result.error || "Помилка відхилення запиту")
        }
        setProcessingId(null)
      },
      "Відхилення запиту",
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/game")}
            className="mb-4 rounded-full hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до гри
          </Button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 blur-xl opacity-50" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Запити в друзі
              </h1>
              <p className="text-muted-foreground mt-1">Керуй запитами в друзі</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="incoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/30 p-1 shadow-xl">
              <TabsTrigger
                value="incoming"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white font-bold"
              >
                <Inbox className="w-4 h-4 mr-2" />
                Вхідні ({incoming.length})
              </TabsTrigger>
              <TabsTrigger
                value="outgoing"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold"
              >
                <Send className="w-4 h-4 mr-2" />
                Вихідні ({outgoing.length})
              </TabsTrigger>
            </TabsList>

            {/* Incoming requests */}
            <TabsContent value="incoming" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : incoming.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {incoming.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all">
                        {/* Sparkle effect for new requests */}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2">
                          <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                        </motion.div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                            <UserPlus className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate">{request.sender?.nickname}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.sender?.status} • Рівень {request.sender?.level}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id, request.sender?.nickname || "")}
                            disabled={processingId === request.id}
                            className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 transition-all shadow-xl font-bold"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Прийняти
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id, request.sender?.nickname || "")}
                            disabled={processingId === request.id}
                            className="flex-1 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-white/30 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 transition-all shadow-lg font-bold"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Відхилити
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl">
                  <Inbox className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-muted-foreground mb-2">Немає запитів</h3>
                  <p className="text-muted-foreground">Поки що ніхто не надіслав тобі запит у друзі</p>
                </div>
              )}
            </TabsContent>

            {/* Outgoing requests */}
            <TabsContent value="outgoing" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : outgoing.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {outgoing.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
                            <Send className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate">{request.receiver?.nickname}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.receiver?.status} • Рівень {request.receiver?.level}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Очікування відповіді...</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl">
                  <Send className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-muted-foreground mb-2">Немає вихідних запитів</h3>
                  <p className="text-muted-foreground">Ти ще не надіслав жодного запиту в друзі</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
