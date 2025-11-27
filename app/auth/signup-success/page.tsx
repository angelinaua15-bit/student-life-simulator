"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Mail, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-cyan-500 to-yellow-400 animate-gradient p-6">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/95 shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="h-20 w-20 text-purple-600" />
              <CheckCircle className="h-8 w-8 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Майже готово!</CardTitle>
          <CardDescription className="text-base">Підтверди свій email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Ми відправили лист на твою пошту. Перейди за посиланням у листі, щоб активувати акаунт і почати грати в EVO
            STUDENT!
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Важливо:</strong> Не забудь перевірити папку "Спам", якщо не бачиш листа у вхідних.
            </p>
          </div>
          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
          >
            Перейти до входу
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
