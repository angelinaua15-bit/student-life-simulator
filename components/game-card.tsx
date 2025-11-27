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
        "transition-all duration-300 hover:shadow-lg",
        glowing && "animate-pulse-glow border-primary",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-balance">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
