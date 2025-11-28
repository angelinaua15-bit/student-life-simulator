import type { GameState } from "./game-state"

export interface DetailedStatistics {
  // Basic info
  level: number
  experience: number
  experienceToNext: number
  experiencePercentage: number

  // Financial
  totalMoney: number
  cash: number
  bankBalance: number

  // Time
  totalPlayTimeMinutes: number
  totalPlayTimeHours: number
  lastPlayed: Date

  // Games
  totalGamesPlayed: number
  cafeHighScore: number
  libraryHighScore: number
  carePackagesHighScore: number

  // Progress
  completedEvents: number
  totalAchievements: number
  unlockedItems: number

  // Skills
  totalSkillPoints: number
  highestSkill: { name: string; value: number }

  // Social
  totalFriends: number

  // Other
  personalityType: string
  currentStatus: string
  activeBoosters: number
}

export function calculateStatistics(gameState: GameState): DetailedStatistics {
  // Calculate experience percentage
  const expPercentage = (gameState.stats.experience / gameState.stats.experienceToNext) * 100

  // Total money
  const totalMoney = gameState.stats.money + gameState.stats.bankBalance

  // Play time
  const totalPlayTimeMinutes = Math.floor(gameState.totalPlayTime / 60)
  const totalPlayTimeHours = Math.floor(totalPlayTimeMinutes / 60)

  // Total games played (sum of high scores as proxy - will be updated when games are played)
  const totalGamesPlayed =
    (gameState.minigameHighScores.cafe > 0 ? 1 : 0) +
    (gameState.minigameHighScores.library > 0 ? 1 : 0) +
    (gameState.minigameHighScores.carePackages > 0 ? 1 : 0)

  // Skills
  const skills = gameState.skills || {}
  const skillValues = Object.values(skills)
  const totalSkillPoints = skillValues.reduce((sum, val) => sum + val, 0)

  const skillEntries = Object.entries(skills)
  const highestSkillEntry = skillEntries.reduce((max, [name, value]) => (value > max.value ? { name, value } : max), {
    name: "немає",
    value: 0,
  })

  const skillNames: Record<string, string> = {
    charisma: "Харизма",
    communication: "Комунікація",
    resilience: "Стресостійкість",
    creativity: "Креативність",
    agility: "Спритність",
    success: "Успішність",
  }

  return {
    level: gameState.stats.level,
    experience: gameState.stats.experience,
    experienceToNext: gameState.stats.experienceToNext,
    experiencePercentage: expPercentage,

    totalMoney,
    cash: gameState.stats.money,
    bankBalance: gameState.stats.bankBalance,

    totalPlayTimeMinutes,
    totalPlayTimeHours,
    lastPlayed: new Date(gameState.lastPlayed),

    totalGamesPlayed,
    cafeHighScore: gameState.minigameHighScores.cafe,
    libraryHighScore: gameState.minigameHighScores.library,
    carePackagesHighScore: gameState.minigameHighScores.carePackages,

    completedEvents: gameState.completedEvents?.length || 0,
    totalAchievements: gameState.achievements?.length || 0,
    unlockedItems: gameState.inventory?.length || 0,

    totalSkillPoints,
    highestSkill: {
      name: skillNames[highestSkillEntry.name] || highestSkillEntry.name,
      value: highestSkillEntry.value,
    },

    totalFriends: gameState.friends?.length || 0,

    personalityType: gameState.personalityType || "Не визначено",
    currentStatus: gameState.status || "Новачок",
    activeBoosters: gameState.activeBoosters?.length || 0,
  }
}

// Helper function to update play time
export function updatePlayTime(gameState: GameState): GameState {
  const now = Date.now()
  const sessionTime = Math.floor((now - gameState.lastPlayed) / 1000) // seconds

  return {
    ...gameState,
    totalPlayTime: gameState.totalPlayTime + sessionTime,
    lastPlayed: now,
  }
}
