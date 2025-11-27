"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface StatBarProps {
  label: string
  value: number
  maxValue: number
  color: "stress" | "happiness" | "energy"
  icon?: React.ReactNode
}

const colorClasses = {
  stress: "bg-destructive",
  happiness: "bg-success",
  energy: "bg-warning",
}

export function StatBar({ label, value, maxValue, color, icon }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">
          {Math.round(value)}/{maxValue}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
