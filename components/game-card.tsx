import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GameCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  glowing?: boolean
}

export function GameCard({ title, description, children, className, glowing }: GameCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl",
        glowing && "shadow-[0_0_30px_rgba(139,92,246,0.3)] border-purple-400/40",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-balance text-lg font-bold">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
