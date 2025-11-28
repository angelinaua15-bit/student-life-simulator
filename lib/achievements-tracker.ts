import type { GameState } from "./game-state"
import { ACHIEVEMENTS, type Achievement } from "./achievements-data"

export function checkAchievements(state: GameState): {
  newAchievements: Achievement[]
  updatedState: GameState
} {
  const currentAchievements = state.achievements || []
  const newAchievements: Achievement[] = []
  let totalXpGained = 0
  let totalMoneyGained = 0

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (currentAchievements.includes(achievement.id)) {
      continue
    }

    // Check if condition is met
    if (achievement.condition(state)) {
      newAchievements.push(achievement)
      totalXpGained += achievement.reward.xp
      totalMoneyGained += achievement.reward.money
    }
  }

  if (newAchievements.length === 0) {
    return { newAchievements: [], updatedState: state }
  }

  // Update state with new achievements and rewards
  const updatedState: GameState = {
    ...state,
    achievements: [...currentAchievements, ...newAchievements.map((a) => a.id)],
    stats: {
      ...state.stats,
      experience: state.stats.experience + totalXpGained,
      money: state.stats.money + totalMoneyGained,
    },
  }

  return { newAchievements, updatedState }
}

export function getAchievementProgress(state: GameState): {
  unlocked: Achievement[]
  locked: Achievement[]
  total: number
  unlockedCount: number
  percentage: number
} {
  const currentAchievements = state.achievements || []
  const unlocked: Achievement[] = []
  const locked: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (currentAchievements.includes(achievement.id)) {
      unlocked.push(achievement)
    } else {
      locked.push(achievement)
    }
  }

  return {
    unlocked,
    locked,
    total: ACHIEVEMENTS.length,
    unlockedCount: unlocked.length,
    percentage: Math.round((unlocked.length / ACHIEVEMENTS.length) * 100),
  }
}
