import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Завантаження списку друзів...</p>
      </div>
    </div>
  )
}
