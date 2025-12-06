"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useGameModal } from "@/lib/use-game-modal"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { showAlert, showSuccess } = useGameModal()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const storedUsers = JSON.parse(localStorage.getItem("evo_student_users") || "[]")
      const user = storedUsers.find((u: any) => u.email === email && u.password === password)

      if (!user) {
        throw new Error("Невірний email або пароль")
      }

      localStorage.setItem("evo_student_current_user", JSON.stringify(user))

      showSuccess("Успішний вхід! Завантажуємо твою гру...")

      setTimeout(() => {
        router.push("/game")
      }, 800)
    } catch (error: unknown) {
      showAlert(error instanceof Error ? error.message : "Помилка входу. Перевір дані.")
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
              Вхід в акаунт
            </CardTitle>
            <CardDescription className="text-base text-gray-600">Введи свої дані для входу</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                <Label htmlFor="password" className="text-gray-700">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Вхід..." : "Увійти"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-gray-600">Ще немає акаунту? </span>
                <Link href="/auth/signup" className="font-semibold text-indigo-600 hover:underline">
                  Зареєструйся
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
