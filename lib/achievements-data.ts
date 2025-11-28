export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "progress" | "minigames" | "social" | "special" | "skills" | "events"
  rarity: "common" | "rare" | "epic" | "legendary"
  condition: (state: any) => boolean
  reward: {
    xp: number
    money: number
  }
}

export const ACHIEVEMENTS: Achievement[] = [
  // Progress Achievements
  {
    id: "first_steps",
    title: "Перші Кроки",
    description: "Досягни 2 рівня",
    icon: "🎓",
    category: "progress",
    rarity: "common",
    condition: (state) => state.stats.level >= 2,
    reward: { xp: 50, money: 50 },
  },
  {
    id: "rising_star",
    title: "Зірка, що Сходить",
    description: "Досягни 5 рівня",
    icon: "⭐",
    category: "progress",
    rarity: "common",
    condition: (state) => state.stats.level >= 5,
    reward: { xp: 100, money: 100 },
  },
  {
    id: "expert_student",
    title: "Експерт Студент",
    description: "Досягни 10 рівня",
    icon: "🏆",
    category: "progress",
    rarity: "rare",
    condition: (state) => state.stats.level >= 10,
    reward: { xp: 300, money: 200 },
  },
  {
    id: "master_scholar",
    title: "Майстер Науки",
    description: "Досягни 15 рівня",
    icon: "👑",
    category: "progress",
    rarity: "epic",
    condition: (state) => state.stats.level >= 15,
    reward: { xp: 500, money: 500 },
  },
  {
    id: "legendary_student",
    title: "Легендарний Студент",
    description: "Досягни 20 рівня",
    icon: "💎",
    category: "progress",
    rarity: "legendary",
    condition: (state) => state.stats.level >= 20,
    reward: { xp: 1000, money: 1000 },
  },

  // Money Achievements
  {
    id: "first_hundred",
    title: "Перша Сотня",
    description: "Накопич 100 грн",
    icon: "💰",
    category: "progress",
    rarity: "common",
    condition: (state) => state.stats.money + state.stats.bankBalance >= 100,
    reward: { xp: 50, money: 25 },
  },
  {
    id: "entrepreneur",
    title: "Підприємець",
    description: "Накопич 500 грн",
    icon: "💵",
    category: "progress",
    rarity: "rare",
    condition: (state) => state.stats.money + state.stats.bankBalance >= 500,
    reward: { xp: 150, money: 100 },
  },
  {
    id: "rich_student",
    title: "Багатий Студент",
    description: "Накопич 1000 грн",
    icon: "💸",
    category: "progress",
    rarity: "epic",
    condition: (state) => state.stats.money + state.stats.bankBalance >= 1000,
    reward: { xp: 300, money: 250 },
  },

  // Minigame Achievements
  {
    id: "coffee_novice",
    title: "Баріста Новачок",
    description: "Набери 10+ балів в Кафе",
    icon: "☕",
    category: "minigames",
    rarity: "common",
    condition: (state) => state.minigameHighScores?.cafe >= 10,
    reward: { xp: 50, money: 30 },
  },
  {
    id: "coffee_master",
    title: "Майстер Баріста",
    description: "Набери 20+ балів в Кафе",
    icon: "☕",
    category: "minigames",
    rarity: "rare",
    condition: (state) => state.minigameHighScores?.cafe >= 20,
    reward: { xp: 150, money: 100 },
  },
  {
    id: "library_explorer",
    title: "Дослідник Бібліотеки",
    description: "Зібери всі 8 книг в Бібліотеці",
    icon: "📚",
    category: "minigames",
    rarity: "common",
    condition: (state) => state.minigameHighScores?.library >= 8,
    reward: { xp: 100, money: 50 },
  },
  {
    id: "package_collector",
    title: "Збирач Посилок",
    description: "Відкрий 5+ пакунків за раз",
    icon: "📦",
    category: "minigames",
    rarity: "common",
    condition: (state) => state.minigameHighScores?.carePackages >= 5,
    reward: { xp: 75, money: 40 },
  },

  // Social Achievements
  {
    id: "first_friend",
    title: "Перший Друг",
    description: "Додай першого друга",
    icon: "👥",
    category: "social",
    rarity: "common",
    condition: (state) => state.friends && state.friends.length >= 1,
    reward: { xp: 50, money: 25 },
  },
  {
    id: "social_butterfly",
    title: "Соціальний Метелик",
    description: "Додай 5 друзів",
    icon: "🦋",
    category: "social",
    rarity: "rare",
    condition: (state) => state.friends && state.friends.length >= 5,
    reward: { xp: 150, money: 100 },
  },
  {
    id: "popular_student",
    title: "Популярний Студент",
    description: "Додай 10 друзів",
    icon: "🌟",
    category: "social",
    rarity: "epic",
    condition: (state) => state.friends && state.friends.length >= 10,
    reward: { xp: 300, money: 200 },
  },

  // Skills Achievements
  {
    id: "skilled_beginner",
    title: "Навчений Початківець",
    description: "Підвищ будь-яку навичку до рівня 3",
    icon: "📈",
    category: "skills",
    rarity: "common",
    condition: (state) => {
      if (!state.skills) return false
      return Object.values(state.skills).some((level: any) => level >= 3)
    },
    reward: { xp: 75, money: 50 },
  },
  {
    id: "jack_of_trades",
    title: "Майстер на Всі Руки",
    description: "Підвищ 3 різні навички до рівня 5",
    icon: "🎯",
    category: "skills",
    rarity: "rare",
    condition: (state) => {
      if (!state.skills) return false
      const highSkills = Object.values(state.skills).filter((level: any) => level >= 5)
      return highSkills.length >= 3
    },
    reward: { xp: 200, money: 150 },
  },

  // Events Achievements
  {
    id: "event_participant",
    title: "Учасник Подій",
    description: "Візьми участь у 1 події",
    icon: "🎪",
    category: "events",
    rarity: "common",
    condition: (state) => state.completedEvents && state.completedEvents.length >= 1,
    reward: { xp: 50, money: 30 },
  },
  {
    id: "event_enthusiast",
    title: "Ентузіаст Подій",
    description: "Візьми участь у 5 подіях",
    icon: "🎉",
    category: "events",
    rarity: "rare",
    condition: (state) => state.completedEvents && state.completedEvents.length >= 5,
    reward: { xp: 200, money: 150 },
  },

  // Special Achievements
  {
    id: "explorer",
    title: "Дослідник",
    description: "Відкрий 5 локацій в 3D грі",
    icon: "🗺️",
    category: "special",
    rarity: "rare",
    condition: (state) => state.polytechnic3DProgress && state.polytechnic3DProgress.visitedRooms.length >= 5,
    reward: { xp: 150, money: 100 },
  },
  {
    id: "shadow_challenger",
    title: "Виклик Тіні",
    description: "Перемож Тіньового Студента 3 рази",
    icon: "🌑",
    category: "special",
    rarity: "epic",
    condition: (state) => state.shadowStudent && state.shadowStudent.challengesWon >= 3,
    reward: { xp: 300, money: 250 },
  },
  {
    id: "personality_discovered",
    title: "Особистість Розкрита",
    description: "Пройди тест особистості",
    icon: "🧠",
    category: "special",
    rarity: "common",
    condition: (state) => state.personalityType && state.personalityType !== "default",
    reward: { xp: 100, money: 50 },
  },
  {
    id: "inventory_collector",
    title: "Колекціонер",
    description: "Зібери 10 предметів в інвентарі",
    icon: "🎒",
    category: "special",
    rarity: "rare",
    condition: (state) => state.inventory && state.inventory.length >= 10,
    reward: { xp: 150, money: 100 },
  },
  {
    id: "perfect_balance",
    title: "Ідеальний Баланс",
    description: "Досягни 80+ щастя та енергії одночасно",
    icon: "⚖️",
    category: "special",
    rarity: "epic",
    condition: (state) => state.stats.happiness >= 80 && state.stats.energy >= 80,
    reward: { xp: 250, money: 200 },
  },
  {
    id: "stress_free",
    title: "Без Стресу",
    description: "Знизь стрес до 10 або менше",
    icon: "😌",
    category: "special",
    rarity: "rare",
    condition: (state) => state.stats.stress <= 10,
    reward: { xp: 150, money: 100 },
  },
]

export function getCategoryColor(category: Achievement["category"]): string {
  const colors = {
    progress: "from-blue-500/20 to-blue-600/20",
    minigames: "from-purple-500/20 to-purple-600/20",
    social: "from-pink-500/20 to-pink-600/20",
    skills: "from-green-500/20 to-green-600/20",
    events: "from-orange-500/20 to-orange-600/20",
    special: "from-yellow-500/20 to-yellow-600/20",
  }
  return colors[category]
}

export function getRarityColor(rarity: Achievement["rarity"]): string {
  const colors = {
    common: "text-gray-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-yellow-400",
  }
  return colors[rarity]
}

export function getCategoryName(category: Achievement["category"]): string {
  const names = {
    progress: "Прогрес",
    minigames: "Міні-ігри",
    social: "Соціальне",
    skills: "Навички",
    events: "Події",
    special: "Спеціальні",
  }
  return names[category]
}
