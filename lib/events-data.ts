export interface GameEvent {
  id: string
  name: string
  description: string
  icon: string
  startDate: Date
  endDate: Date
  bonuses: {
    xpMultiplier?: number
    moneyMultiplier?: number
    energyReduction?: number
    stressReduction?: number
  }
  unlockMinigames?: string[]
  specialRewards?: {
    coins?: number
    experience?: number
    items?: string[]
  }
  backgroundColor: string
  accentColor: string
}

export const GAME_EVENTS: GameEvent[] = [
  {
    id: "coffee-week",
    name: "Тиждень Кавоманів",
    description: "Подвійна енергія від кави та бонус до заробітку в Кафе!",
    icon: "☕",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-02-07"),
    bonuses: {
      moneyMultiplier: 2,
      energyReduction: 0.5,
    },
    specialRewards: {
      coins: 500,
      experience: 200,
      items: ["golden-coffee-badge"],
    },
    backgroundColor: "from-amber-600 to-orange-600",
    accentColor: "border-amber-400",
  },
  {
    id: "lab-marathon",
    name: "Марафон Лаб",
    description: "Подвійний XP за всі мініігри та зменшений стрес!",
    icon: "🧪",
    startDate: new Date("2025-02-10"),
    endDate: new Date("2025-02-17"),
    bonuses: {
      xpMultiplier: 2,
      stressReduction: 0.3,
    },
    specialRewards: {
      coins: 800,
      experience: 500,
      items: ["lab-champion-trophy"],
    },
    backgroundColor: "from-blue-600 to-indigo-600",
    accentColor: "border-blue-400",
  },
  {
    id: "antistress-day",
    name: "День Антистресу",
    description: "Стрес не зростає, всі активності відновлюють +20 щастя!",
    icon: "😌",
    startDate: new Date("2025-02-20"),
    endDate: new Date("2025-02-21"),
    bonuses: {
      stressReduction: 1,
    },
    specialRewards: {
      coins: 300,
      experience: 150,
      items: ["zen-master-badge"],
    },
    backgroundColor: "from-green-600 to-teal-600",
    accentColor: "border-green-400",
  },
  {
    id: "night-xp-boost",
    name: "Нічна Акція XP ×2",
    description: "З 21:00 до 6:00 весь досвід подвоюється!",
    icon: "🌙",
    startDate: new Date("2025-03-01"),
    endDate: new Date("2025-03-07"),
    bonuses: {
      xpMultiplier: 2,
    },
    specialRewards: {
      coins: 600,
      experience: 400,
      items: ["night-owl-badge"],
    },
    backgroundColor: "from-purple-600 to-pink-600",
    accentColor: "border-purple-400",
  },
  {
    id: "double-coins-library",
    name: "Лабіринти Подвійних Монет",
    description: "Бібліотечна мініігра дає ×2 монет!",
    icon: "📚",
    startDate: new Date("2025-03-10"),
    endDate: new Date("2025-03-15"),
    bonuses: {
      moneyMultiplier: 2,
    },
    specialRewards: {
      coins: 1000,
      experience: 300,
      items: ["library-master-key"],
    },
    backgroundColor: "from-cyan-600 to-blue-600",
    accentColor: "border-cyan-400",
  },
]

export function getActiveEvents(): GameEvent[] {
  const now = new Date()
  return GAME_EVENTS.filter((event) => event.startDate <= now && event.endDate >= now)
}

export function getUpcomingEvents(): GameEvent[] {
  const now = new Date()
  return GAME_EVENTS.filter((event) => event.startDate > now).sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  )
}

export function getTimeRemaining(endDate: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const total = endDate.getTime() - new Date().getTime()
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}

export function applyEventBonuses(
  amount: number,
  type: "xp" | "money" | "energy" | "stress",
  activeEvents: GameEvent[],
): number {
  let finalAmount = amount

  activeEvents.forEach((event) => {
    if (type === "xp" && event.bonuses.xpMultiplier) {
      finalAmount *= event.bonuses.xpMultiplier
    }
    if (type === "money" && event.bonuses.moneyMultiplier) {
      finalAmount *= event.bonuses.moneyMultiplier
    }
    if (type === "stress" && event.bonuses.stressReduction) {
      finalAmount *= 1 - event.bonuses.stressReduction
    }
  })

  return Math.floor(finalAmount)
}
