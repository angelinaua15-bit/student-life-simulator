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
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)
  const router = useRouter()
  const { showAlert, showSuccess } = useGameModal()

  useEffect(() => {
    const supabase = createClient()
    setSupabaseAvailable(supabase !== null)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (supabaseAvailable) {
        const supabase = createClient()
        if (!supabase) throw new Error("Supabase не налаштований")

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      } else {
        const storedUsers = JSON.parse(localStorage.getItem("evo_student_users") || "[]")
        const user = storedUsers.find((u: any) => u.email === email && u.password === password)

        if (!user) {
          throw new Error("Невірний email або пароль")
        }

        localStorage.setItem("evo_student_current_user", JSON.stringify(user))
      }

      showSuccess("Успішний вхід! Завантажуємо твою гру...")
      setTimeout(() => router.push("/game"), 1000)
    } catch (error: unknown) {
      showAlert(error instanceof Error ? error.message : "Помилка входу. Перевір дані.")
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
              Вхід в акаунт
            </CardTitle>
            <CardDescription className="text-base">Введи свої дані для входу</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
                disabled={isLoading}
              >
                {isLoading ? "Вхід..." : "Увійти"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Ще немає акаунту? </span>
                <Link href="/auth/signup" className="font-semibold text-purple-600 hover:underline">
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
