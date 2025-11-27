export interface Reward {
  id: string
  level: number
  rewardType: string
  rewardValue: any
  rewardName: string
  rewardDescription: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export const RARITY_COLORS = {
  common: "from-gray-500 to-gray-600",
  rare: "from-blue-500 to-cyan-500",
  epic: "from-purple-500 to-pink-500",
  legendary: "from-yellow-500 to-orange-500",
}

export const RARITY_GLOW = {
  common: "shadow-gray-500/50",
  rare: "shadow-blue-500/50",
  epic: "shadow-purple-500/50",
  legendary: "shadow-yellow-500/50",
}

export const STATUS_TITLES: Record<number, string> = {
  1: "Новачок",
  5: "Студент",
  10: "Старанний",
  15: "Розумник",
  20: "Геній",
  25: "Легенда",
  30: "Бог Студентства",
}

export function getStatusForLevel(level: number): string {
  const levels = Object.keys(STATUS_TITLES)
    .map(Number)
    .sort((a, b) => b - a)

  for (const l of levels) {
    if (level >= l) {
      return STATUS_TITLES[l]
    }
  }

  return STATUS_TITLES[1]
}
