"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { loadGameState } from "@/lib/game-state"
import { getFeedbackListAction, submitFeedbackAction } from "@/lib/database-actions"
import { ArrowLeft, Star, Send, Heart, Sparkles, MessageCircle, TrendingUp } from "lucide-react"
import { useGameModal } from "@/lib/use-game-modal"

interface Feedback {
  id: string
  player_name: string
  player_avatar: string
  rating: number
  message: string
  created_at: string
}

export default function FeedbackPage() {
  const router = useRouter()
  const { showSuccess, showAlert } = useGameModal()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState("")
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [playerName, setPlayerName] = useState("")

  const maxChars = 500

  useEffect(() => {
    loadFeedbacks()
    loadPlayerInfo()
  }, [])

  const loadPlayerInfo = async () => {
    const state = await loadGameState()
    if (state) {
      setPlayerName(state.playerName)
    }
  }

  const loadFeedbacks = async () => {
    setLoading(true)
    try {
      const data = await getFeedbackListAction(50)
      setFeedbacks(data as Feedback[])
    } catch (err) {
      console.error("Failed to load feedback:", err)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!rating || !message.trim()) {
      showAlert("Будь ласка, постав оцінку та напиши відгук!")
      return
    }

    if (message.trim().length < 10) {
      showAlert("Відгук має бути довшим ніж 10 символів")
      return
    }

    setSubmitting(true)

    try {
      const state = await loadGameState()
      if (!state) {
        showAlert("Не вдалось завантажити дані гравця")
        return
      }

      const result = await submitFeedbackAction({
        player_id: state.playerId,
        player_name: state.playerName,
        player_avatar: state.skin || "default",
        rating,
        message: message.trim(),
      })

      if (result.success) {
        showSuccess("Дякуємо за відгук! 🎉")
        setRating(0)
        setMessage("")
        await loadFeedbacks()
      } else {
        showAlert(result.error || "Не вдалось надіслати відгук")
      }
    } catch (err) {
      showAlert("Помилка відправки відгуку")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Щойно"
    if (diffMins < 60) return `${diffMins} хв тому`
    if (diffHours < 24) return `${diffHours} год тому`
    if (diffDays < 7) return `${diffDays} дн тому`

    return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })
  }

  const getAvatarGradient = (avatar: string) => {
    const gradients = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-yellow-500 to-orange-500",
    ]
    const index = avatar.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-yellow-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-cyan-900/20">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-purple-200/50 dark:border-purple-500/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Назад
            </Button>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{feedbacks.length} відгуків</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section with animated title */}
        <div className="text-center mb-12 animate-scale-in">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-cyan-500 to-yellow-500 bg-clip-text text-transparent animate-gradient mb-4">
              Залиш свій відгук
            </h1>
            <div className="absolute -top-6 -right-6 animate-bounce-slow">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="absolute -top-4 -left-4 animate-bounce-slow animation-delay-500">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium mt-2 flex items-center justify-center gap-2">
            Твоя думка допомагає покращувати гру
            <TrendingUp className="w-5 h-5 text-green-500" />
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="mb-12 overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 animate-slide-up">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-3">
                <label className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Твоя оцінка
                </label>
                <div className="flex gap-2 justify-center md:justify-start">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="group transition-all duration-200 hover:scale-125 active:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 transition-all duration-200 ${
                          star <= (hoverRating || rating)
                            ? "text-yellow-500 fill-yellow-500 drop-shadow-lg"
                            : "text-gray-300 dark:text-gray-600"
                        } group-hover:rotate-12`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center md:text-left text-sm font-medium text-purple-600 dark:text-purple-400 animate-fade-in">
                    {rating === 5 && "Вау! Супер! ⭐"}
                    {rating === 4 && "Дуже добре! 🎉"}
                    {rating === 3 && "Непогано 👍"}
                    {rating === 2 && "Є що покращити 🔧"}
                    {rating === 1 && "Допоможи нам стати кращими 💪"}
                  </p>
                )}
              </div>

              {/* Message Input */}
              <div className="space-y-3">
                <label className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-500" />
                  Твій відгук
                </label>
                <div className="relative">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                    placeholder="Розкажи, що тобі сподобалось або що можна покращити... 💭"
                    className="min-h-[150px] text-base resize-none border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50 dark:focus:ring-purple-500/30 transition-all duration-300 rounded-2xl shadow-lg bg-white dark:bg-gray-800"
                    maxLength={maxChars}
                  />
                  <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {message.length} / {maxChars}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!rating || !message.trim() || submitting}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 hover:from-purple-700 hover:via-cyan-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-gradient bg-[length:200%_100%]"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Відправляємо...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Надіслати відгук
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks List */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Відгуки гравців
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-700 border-t-purple-600 dark:border-t-purple-400"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10">
              <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                Поки що немає відгуків. Стань першим! 🌟
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <Card
                  key={feedback.id}
                  className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0 bg-white dark:bg-gray-800 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarGradient(
                          feedback.player_avatar,
                        )} flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white dark:ring-gray-800`}
                      >
                        {feedback.player_name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{feedback.player_name}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(feedback.created_at)}
                          </span>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex gap-1 mb-3">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < feedback.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Message */}
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                          {feedback.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
