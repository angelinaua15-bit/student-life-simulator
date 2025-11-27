export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  color: string
  maxLevel: number
  benefits: string[]
}

export const SKILLS: Record<string, Skill> = {
  charisma: {
    id: "charisma",
    name: "Харизма",
    description: "Здатність впливати на інших та залучати людей",
    icon: "Star",
    color: "from-yellow-500 to-orange-500",
    maxLevel: 10,
    benefits: ["Кращі діалоги з NPC", "Більше друзів", "Знижки в магазинах", "Доступ до ексклюзивних квестів"],
  },
  communication: {
    id: "communication",
    name: "Комунікація",
    description: "Вміння ефективно спілкуватись і розуміти інших",
    icon: "MessageCircle",
    color: "from-blue-500 to-cyan-500",
    maxLevel: 10,
    benefits: ["Легший пошук друзів", "Швидше виконання групових завдань", "Бонус до щастя від спілкування"],
  },
  resilience: {
    id: "resilience",
    name: "Стресостійкість",
    description: "Здатність справлятись зі стресом та залишатись спокійним",
    icon: "Shield",
    color: "from-green-500 to-emerald-500",
    maxLevel: 10,
    benefits: ["Менше стресу від завдань", "Повільніше виснаження енергії", "Стійкість до невдач"],
  },
  creativity: {
    id: "creativity",
    name: "Креативність",
    description: "Здатність мислити нестандартно та знаходити нові рішення",
    icon: "Lightbulb",
    color: "from-purple-500 to-pink-500",
    maxLevel: 10,
    benefits: ["Унікальні варіанти у квестах", "Більше XP за творчі завдання", "Доступ до креативних проектів"],
  },
  agility: {
    id: "agility",
    name: "Спритність",
    description: "Швидкість реакції та фізична активність",
    icon: "Zap",
    color: "from-orange-500 to-red-500",
    maxLevel: 10,
    benefits: [
      "Кращі результати в міні-іграх",
      "Менше витрат енергії на переміщення",
      "Швидше виконання фізичних завдань",
    ],
  },
  success: {
    id: "success",
    name: "Успішність",
    description: "Здатність досягати цілей та перемагати",
    icon: "Trophy",
    color: "from-amber-500 to-yellow-500",
    maxLevel: 10,
    benefits: ["Більше грошей за завдання", "Кращі шанси у лотереї", "Престижні досягнення"],
  },
}

export function getSkillLevel(skillId: string, experience: number): number {
  return Math.floor(experience / 100) + 1
}

export function getSkillProgress(experience: number): number {
  return experience % 100
}

export function addSkillXP(currentXP: number, amount: number): number {
  return Math.min(1000, currentXP + amount) // Max 1000 XP = level 10
}
