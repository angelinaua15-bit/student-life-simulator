"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, User, Shirt } from "lucide-react"

const AVAILABLE_SKINS = [
  { id: "default", name: "Класичний", icon: "👤" },
  { id: "cool", name: "Крутий", icon: "😎" },
  { id: "smart", name: "Розумний", icon: "🤓" },
  { id: "sport", name: "Спортивний", icon: "🏃" },
  { id: "artist", name: "Художник", icon: "🎨" },
  { id: "gamer", name: "Геймер", icon: "🎮" },
]

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [selectedSkin, setSelectedSkin] = useState("default")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Паролі не співпадають!")
      return
    }

    if (password.length < 6) {
      setError("Пароль має бути не менше 6 символів!")
      return
    }

    if (nickname.trim().length < 2) {
      setError("Нікнейм має бути не менше 2 символів!")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/game`,
          data: {
            nickname: nickname.trim(),
            skin: selectedSkin,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        router.push("/auth/signup-success")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Помилка реєстрації")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-700 hover:bg-white/50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <Card className="backdrop-blur-xl bg-white/90 shadow-xl border-0 rounded-3xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Реєстрація
            </CardTitle>
            <CardDescription className="text-base text-gray-600">Створи свій акаунт студента</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname" className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4" />
                  Нікнейм
                </Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Як тебе звати?"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-12 rounded-xl border-gray-200"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Shirt className="h-4 w-4" />
                  Обери свій скін
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SKINS.map((skin) => (
                    <button
                      key={skin.id}
                      type="button"
                      onClick={() => setSelectedSkin(skin.id)}
                      className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedSkin === skin.id
                          ? "border-indigo-500 bg-indigo-50 shadow-lg"
                          : "border-gray-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div className="text-3xl mb-1">{skin.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{skin.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Мінімум 6 символів"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Підтвердження паролю
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повтори пароль"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Створення акаунту..." : "Зареєструватися"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Вже маєш акаунт? </span>
                <Link href="/auth/login" className="font-semibold text-indigo-600 hover:underline">
                  Увійди
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
