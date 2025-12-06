export type QuestType = "story" | "side" | "daily"
export type QuestStatus = "locked" | "available" | "in-progress" | "completed"

export interface Quest {
  id: string
  type: QuestType
  title: string
  description: string
  icon: string
  requirements: {
    level?: number
    completedQuests?: string[]
    personality?: string[]
  }
  objectives: {
    id: string
    description: string
    target: number
    current?: number
    type: "minigame" | "stat" | "location" | "money" | "custom"
  }[]
  rewards: {
    experience: number
    money: number
    items?: string[]
  }
  timeLimit?: number // in hours for daily quests
}

export const STORY_QUESTS: Quest[] = [
  {
    id: "welcome-to-uni",
    type: "story",
    title: "Ласкаво просимо до універу!",
    description: "Твій перший день у студентському житті. Познайомся з основами гри.",
    icon: "🎓",
    requirements: { level: 1 },
    objectives: [
      { id: "play-cafe", description: "Спробуй міні-гру 'Кафе'", target: 1, type: "minigame" },
      { id: "visit-bank", description: "Відвідай банк", target: 1, type: "location" },
      { id: "meet-mentor", description: "Зустрінься з ментором", target: 1, type: "location" },
    ],
    rewards: {
      experience: 100,
      money: 200,
      items: ["welcome-badge"],
    },
  },
  {
    id: "first-week",
    type: "story",
    title: "Перший тиждень",
    description: "Адаптуйся до студентського життя та знайди свій ритм.",
    icon: "📅",
    requirements: { level: 2, completedQuests: ["welcome-to-uni"] },
    objectives: [
      { id: "reach-happiness", description: "Досягни 80 щастя", target: 80, type: "stat" },
      { id: "earn-money", description: "Заробь 500 монет", target: 500, type: "money" },
      { id: "play-all-games", description: "Спробуй всі 3 міні-ігри", target: 3, type: "custom" },
    ],
    rewards: {
      experience: 250,
      money: 500,
      items: ["survivor-badge"],
    },
  },
  {
    id: "stress-management",
    type: "story",
    title: "Управління стресом",
    description: "Навчись балансувати між роботою та відпочинком.",
    icon: "🧘",
    requirements: { level: 5, completedQuests: ["first-week"] },
    objectives: [
      { id: "reduce-stress", description: "Знизь стрес до 20 або менше", target: 1, type: "custom" },
      { id: "maintain-energy", description: "Підтримуй енергію вище 70 протягом 5 ігор", target: 5, type: "custom" },
    ],
    rewards: {
      experience: 400,
      money: 800,
      items: ["zen-master-trophy"],
    },
  },
]

export const SIDE_QUESTS: Quest[] = [
  {
    id: "library-explorer",
    type: "side",
    title: "Дослідник бібліотеки",
    description: "Знайди найтихіше місце в бібліотеці для навчання.",
    icon: "📚",
    requirements: { level: 3 },
    objectives: [
      { id: "library-score", description: "Набери 50+ очок в бібліотеці", target: 50, type: "minigame" },
      { id: "library-plays", description: "Зіграй 10 раз у бібліотеці", target: 10, type: "minigame" },
    ],
    rewards: {
      experience: 300,
      money: 400,
      items: ["bookworm-badge"],
    },
  },
  {
    id: "packing-pro",
    type: "side",
    title: "Професіонал пакування",
    description: "Збери валізу за рекордний час без помилок.",
    icon: "🎒",
    requirements: { level: 4 },
    objectives: [
      { id: "packages-score", description: "Набери 80+ очок у пакунках", target: 80, type: "minigame" },
      { id: "packages-perfect", description: "Зроби 3 ідеальні гри підряд", target: 3, type: "custom" },
    ],
    rewards: {
      experience: 350,
      money: 600,
      items: ["packing-master-badge"],
    },
  },
  {
    id: "coffee-master",
    type: "side",
    title: "Майстер кави",
    description: "Стань легендою кафе та заробь максимум чайових.",
    icon: "☕",
    requirements: { level: 3 },
    objectives: [
      { id: "cafe-expert", description: "Виконай 3 міні-ігри без помилок", target: 3, type: "minigame" },
      { id: "cafe-earnings", description: "Заробь 1000 монет у кафе", target: 1000, type: "money" },
    ],
    rewards: {
      experience: 400,
      money: 700,
      items: ["barista-badge"],
    },
  },
  {
    id: "financial-guru",
    type: "side",
    title: "Фінансовий гуру",
    description: "Накопич великий капітал в банку.",
    icon: "💰",
    requirements: { level: 6 },
    objectives: [
      { id: "bank-deposit", description: "Поклади 5000 монет в банк", target: 5000, type: "custom" },
      { id: "bank-interest", description: "Отримай 500 монет відсотків", target: 500, type: "custom" },
    ],
    rewards: {
      experience: 500,
      money: 1000,
      items: ["investor-badge"],
    },
  },
  {
    id: "happiness-seeker",
    type: "side",
    title: "Шукач щастя",
    description: "Підвищ хепешку до максимуму та утримуй її.",
    icon: "😊",
    requirements: { level: 5 },
    objectives: [
      { id: "max-happiness", description: "Досягни 100 щастя", target: 100, type: "stat" },
      { id: "maintain-happiness", description: "Утримуй щастя вище 90 протягом 10 хвилин", target: 1, type: "custom" },
    ],
    rewards: {
      experience: 450,
      money: 800,
      items: ["happiness-guru-badge"],
    },
  },
]

export const DAILY_QUESTS: Quest[] = [
  {
    id: "daily-minigames",
    type: "daily",
    title: "Щоденна практика",
    description: "Зіграй у кожну міні-гру принаймні один раз.",
    icon: "🎮",
    requirements: {},
    objectives: [
      { id: "play-cafe-daily", description: "Зіграй в Кафе", target: 1, type: "minigame" },
      { id: "play-library-daily", description: "Зіграй в Бібліотеку", target: 1, type: "minigame" },
      { id: "play-packages-daily", description: "Зіграй в Пакунки", target: 1, type: "minigame" },
    ],
    rewards: {
      experience: 150,
      money: 300,
    },
    timeLimit: 24,
  },
  {
    id: "daily-earnings",
    type: "daily",
    title: "Денний заробіток",
    description: "Заробь 500 монет сьогодні.",
    icon: "💵",
    requirements: {},
    objectives: [{ id: "earn-500", description: "Заробь 500 монет", target: 500, type: "money" }],
    rewards: {
      experience: 100,
      money: 200,
    },
    timeLimit: 24,
  },
  {
    id: "daily-energy",
    type: "daily",
    title: "Енергійний день",
    description: "Підтримуй високий рівень енергії весь день.",
    icon: "⚡",
    requirements: {},
    objectives: [{ id: "energy-check", description: "Утримуй енергію вище 70", target: 1, type: "custom" }],
    rewards: {
      experience: 120,
      money: 250,
    },
    timeLimit: 24,
  },
  {
    id: "daily-mentor",
    type: "daily",
    title: "Мудрість дня",
    description: "Отримай пораду від ментора.",
    icon: "🧙",
    requirements: {},
    objectives: [{ id: "visit-mentor-daily", description: "Відвідай ментора", target: 1, type: "location" }],
    rewards: {
      experience: 80,
      money: 150,
    },
    timeLimit: 24,
  },
]

export function getAvailableQuests(playerLevel: number, completedQuests: string[], personalityType?: string): Quest[] {
  const allQuests = [...STORY_QUESTS, ...SIDE_QUESTS]

  return allQuests.filter((quest) => {
    if (completedQuests.includes(quest.id)) return false

    if (quest.requirements.level && playerLevel < quest.requirements.level) return false

    if (quest.requirements.completedQuests) {
      const hasRequired = quest.requirements.completedQuests.every((reqId) => completedQuests.includes(reqId))
      if (!hasRequired) return false
    }

    if (quest.requirements.personality && personalityType) {
      if (!quest.requirements.personality.includes(personalityType)) return false
    }

    return true
  })
}

export function getDailyQuests(completedToday: string[]): Quest[] {
  return DAILY_QUESTS.filter((quest) => !completedToday.includes(quest.id))
}

export function checkQuestProgress(quest: Quest, gameState: any): Quest {
  const updatedObjectives = quest.objectives.map((obj) => {
    let current = obj.current || 0

    switch (obj.type) {
      case "stat":
        if (obj.id.includes("happiness")) current = gameState.stats.happiness
        if (obj.id.includes("energy")) current = gameState.stats.energy
        if (obj.id.includes("stress")) current = 100 - gameState.stats.stress
        break
      case "money":
        if (obj.id.includes("earn")) {
          // Track total money earned, not current balance
          current = gameState.stats.money + (gameState.stats.bankBalance || 0)
        } else {
          current = gameState.stats.money
        }
        break
      case "minigame":
        // Check if minigame was played based on high scores
        const gameType = obj.id.replace("play-", "").replace("-daily", "")
        if (gameType === "cafe" && gameState.minigameHighScores?.cafe > 0) {
          current = Math.min(obj.target, gameState.minigameHighScores.cafe)
        }
        if (gameType === "library" && gameState.minigameHighScores?.library > 0) {
          current = Math.min(obj.target, gameState.minigameHighScores.library)
        }
        if (gameType === "packages" && gameState.minigameHighScores?.carePackages > 0) {
          current = Math.min(obj.target, gameState.minigameHighScores.carePackages)
        }
        // Check for "play all games" objective
        if (obj.id.includes("play-all-games")) {
          let gamesPlayed = 0
          if (gameState.minigameHighScores?.cafe > 0) gamesPlayed++
          if (gameState.minigameHighScores?.library > 0) gamesPlayed++
          if (gameState.minigameHighScores?.carePackages > 0) gamesPlayed++
          current = gamesPlayed
        }
        break
      case "location":
        // Track location visits in completedEvents
        if (obj.id.includes("bank") && gameState.completedEvents?.includes("visited-bank")) {
          current = 1
        }
        if (obj.id.includes("mentor") && gameState.completedEvents?.includes("visited-mentor")) {
          current = 1
        }
        break
      case "custom":
        // Custom tracking for special objectives
        if (obj.id.includes("reduce-stress") && gameState.stats.stress <= 20) {
          current = 1
        }
        if (obj.id.includes("max-happiness") && gameState.stats.happiness >= 100) {
          current = 1
        }
        if (obj.id.includes("bank-deposit") && gameState.stats.bankBalance >= obj.target) {
          current = gameState.stats.bankBalance
        }
        if (obj.id.includes("maintain-energy")) {
          // This would need time-based tracking in actual implementation
          current = gameState.stats.energy >= 70 ? 1 : 0
        }
        break
    }

    return { ...obj, current }
  })

  return { ...quest, objectives: updatedObjectives }
}

export function isQuestCompleted(quest: Quest): boolean {
  return quest.objectives.every((obj) => (obj.current || 0) >= obj.target)
}
