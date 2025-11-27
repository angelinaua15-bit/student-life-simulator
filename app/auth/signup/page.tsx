"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useGameModal } from "@/lib/use-game-modal"
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
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)
  const router = useRouter()
  const { showAlert, showSuccess } = useGameModal()

  useEffect(() => {
    const supabase = createClient()
    setSupabaseAvailable(supabase !== null)
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showAlert("Паролі не співпадають!")
      return
    }

    if (password.length < 6) {
      showAlert("Пароль має бути не менше 6 символів!")
      return
    }

    if (nickname.trim().length < 2) {
      showAlert("Нікнейм має бути не менше 2 символів!")
      return
    }

    setIsLoading(true)

    try {
      if (supabaseAvailable) {
        const supabase = createClient()
        if (!supabase) throw new Error("Supabase не налаштований")

        const { error } = await supabase.auth.signUp({
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

        showSuccess("Акаунт створено! Перевір свою пошту для підтвердження.")
        setTimeout(() => router.push("/auth/signup-success"), 1500)
      } else {
        const storedUsers = JSON.parse(localStorage.getItem("evo_student_users") || "[]")

        // Check if email already exists
        if (storedUsers.some((u: any) => u.email === email)) {
          throw new Error("Цей email вже зареєстрований")
        }

        const newUser = {
          id: Date.now().toString(),
          email,
          password, // In production, this should be hashed!
          nickname: nickname.trim(),
          skin: selectedSkin,
          createdAt: new Date().toISOString(),
        }

        storedUsers.push(newUser)
        localStorage.setItem("evo_student_users", JSON.stringify(storedUsers))
        localStorage.setItem("evo_student_current_user", JSON.stringify(newUser))

        showSuccess("Акаунт створено успішно! Переходимо в гру...")
        setTimeout(() => router.push("/game"), 1500)
      }
    } catch (error: unknown) {
      showAlert(error instanceof Error ? error.message : "Помилка реєстрації")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-cyan-500 to-yellow-400 animate-gradient p-6">
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" onClick={() => router.push("/")} className="text-white hover:bg-white/20">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              Реєстрація
            </CardTitle>
            <CardDescription className="text-base">Створи свій акаунт студента</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname" className="flex items-center gap-2">
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
                  className="h-12"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shirt className="h-4 w-4" />
                  Обери свій скін
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SKINS.map((skin) => (
                    <button
                      key={skin.id}
                      type="button"
                      onClick={() => setSelectedSkin(skin.id)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedSkin === skin.id
                          ? "border-purple-500 bg-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="text-3xl mb-1">{skin.icon}</div>
                      <div className="text-xs font-medium">{skin.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Мінімум 6 символів"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Підтвердження паролю</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повтори пароль"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
                disabled={isLoading}
              >
                {isLoading ? "Створення акаунту..." : "Зареєструватися"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Вже маєш акаунт? </span>
                <Link href="/auth/login" className="font-semibold text-purple-600 hover:underline">
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
