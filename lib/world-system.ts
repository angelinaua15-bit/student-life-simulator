export type LocationId =
  | "campus"
  | "dormitory"
  | "cafeteria"
  | "library"
  | "park"
  | "coworking"
  | "deans-office"
  | "computer-lab"

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night"
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
export type Season = "autumn" | "winter" | "spring" | "summer"

export interface Location {
  id: LocationId
  name: string
  description: string
  unlockLevel: number
  activities: string[]
  npcs: string[]
  icon: string
  color: string
}

export interface WorldState {
  currentLocation: LocationId
  currentDay: DayOfWeek
  currentTime: TimeOfDay
  currentSeason: Season
  gameDay: number
  unlockedLocations: LocationId[]
  visitedLocations: LocationId[]
}

export const LOCATIONS: Record<LocationId, Location> = {
  campus: {
    id: "campus",
    name: "Кампус",
    description: "Головна територія університету. Тут завжди кипить життя!",
    unlockLevel: 1,
    activities: ["Прогулятись", "Зустріти друзів", "Подивитись оголошення"],
    npcs: ["mentor", "student1", "student2"],
    icon: "Building2",
    color: "from-blue-500 to-cyan-500",
  },
  dormitory: {
    id: "dormitory",
    name: "Гуртожиток",
    description: "Твоя кімната. Тут можна відпочити та відновити енергію.",
    unlockLevel: 1,
    activities: ["Поспати", "Поїсти", "Погратись"],
    npcs: ["roommate"],
    icon: "Home",
    color: "from-orange-500 to-red-500",
  },
  cafeteria: {
    id: "cafeteria",
    name: "Кафетерій",
    description: "Смачна їжа та затишна атмосфера. Тут збираються студенти.",
    unlockLevel: 2,
    activities: ["Поїсти", "Працювати", "Зустріти друзів"],
    npcs: ["chef", "barista", "student3"],
    icon: "Coffee",
    color: "from-yellow-500 to-orange-500",
  },
  library: {
    id: "library",
    name: "Бібліотека",
    description: "Море книг та тиша. Ідеальне місце для навчання.",
    unlockLevel: 3,
    activities: ["Вчитись", "Читати", "Працювати"],
    npcs: ["librarian", "nerd"],
    icon: "BookOpen",
    color: "from-green-500 to-emerald-500",
  },
  park: {
    id: "park",
    name: "Парк",
    description: "Зелена зона для відпочинку. Тут можна розслабитись.",
    unlockLevel: 4,
    activities: ["Відпочити", "Погуляти", "Позайматись спортом"],
    npcs: ["athlete", "artist"],
    icon: "Trees",
    color: "from-green-400 to-lime-500",
  },
  coworking: {
    id: "coworking",
    name: "Коворкінг",
    description: "Сучасний простір для роботи та творчості.",
    unlockLevel: 5,
    activities: ["Попрацювати", "Навчатись", "Нетворкінг"],
    npcs: ["entrepreneur", "developer"],
    icon: "Laptop",
    color: "from-purple-500 to-pink-500",
  },
  "deans-office": {
    id: "deans-office",
    name: "Деканат",
    description: "Офіційні справи та важливі документи.",
    unlockLevel: 6,
    activities: ["Отримати завдання", "Здати звіт"],
    npcs: ["dean", "secretary"],
    icon: "Building",
    color: "from-gray-500 to-slate-600",
  },
  "computer-lab": {
    id: "computer-lab",
    name: "Комп'ютерна Лабораторія",
    description: "Потужні комп'ютери та високошвидкісний інтернет.",
    unlockLevel: 7,
    activities: ["Програмувати", "Грати", "Вчитись"],
    npcs: ["techie", "gamer"],
    icon: "Monitor",
    color: "from-cyan-500 to-blue-600",
  },
}

export const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: "Понеділок",
  tuesday: "Вівторок",
  wednesday: "Середа",
  thursday: "Четвер",
  friday: "П'ятниця",
  saturday: "Субота",
  sunday: "Неділя",
}

export const TIME_NAMES: Record<TimeOfDay, string> = {
  morning: "Ранок",
  afternoon: "День",
  evening: "Вечір",
  night: "Ніч",
}

export const SEASON_NAMES: Record<Season, string> = {
  autumn: "Осінь",
  winter: "Зима",
  spring: "Весна",
  summer: "Літо",
}

export function getDefaultWorldState(): WorldState {
  return {
    currentLocation: "campus",
    currentDay: "monday",
    currentTime: "morning",
    currentSeason: "autumn",
    gameDay: 1,
    unlockedLocations: ["campus", "dormitory"],
    visitedLocations: ["campus"],
  }
}

export function advanceTime(worldState: WorldState): WorldState {
  const times: TimeOfDay[] = ["morning", "afternoon", "evening", "night"]
  const days: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  const currentTimeIndex = times.indexOf(worldState.currentTime)
  const nextTimeIndex = (currentTimeIndex + 1) % times.length

  let newDay = worldState.currentDay
  let newGameDay = worldState.gameDay

  if (nextTimeIndex === 0) {
    const currentDayIndex = days.indexOf(worldState.currentDay)
    const nextDayIndex = (currentDayIndex + 1) % days.length
    newDay = days[nextDayIndex]
    newGameDay++
  }

  return {
    ...worldState,
    currentTime: times[nextTimeIndex],
    currentDay: newDay,
    gameDay: newGameDay,
  }
}

export function changeLocation(worldState: WorldState, locationId: LocationId): WorldState {
  return {
    ...worldState,
    currentLocation: locationId,
    visitedLocations: Array.from(new Set([...worldState.visitedLocations, locationId])),
  }
}

export function unlockLocation(worldState: WorldState, locationId: LocationId): WorldState {
  return {
    ...worldState,
    unlockedLocations: Array.from(new Set([...worldState.unlockedLocations, locationId])),
  }
}

export function getTimeModifiers(time: TimeOfDay): { energy: number; happiness: number; stress: number } {
  switch (time) {
    case "morning":
      return { energy: 1.2, happiness: 1.1, stress: 0.9 }
    case "afternoon":
      return { energy: 1, happiness: 1, stress: 1 }
    case "evening":
      return { energy: 0.8, happiness: 1.1, stress: 0.8 }
    case "night":
      return { energy: 0.6, happiness: 0.9, stress: 1.2 }
  }
}

export function getSeasonTheme(season: Season) {
  switch (season) {
    case "autumn":
      return {
        bg: "from-orange-100 via-yellow-50 to-red-100",
        text: "text-orange-900",
        accent: "from-orange-500 to-red-600",
      }
    case "winter":
      return {
        bg: "from-blue-100 via-cyan-50 to-slate-100",
        text: "text-blue-900",
        accent: "from-blue-500 to-cyan-600",
      }
    case "spring":
      return {
        bg: "from-green-100 via-lime-50 to-emerald-100",
        text: "text-green-900",
        accent: "from-green-500 to-emerald-600",
      }
    case "summer":
      return {
        bg: "from-yellow-100 via-amber-50 to-orange-100",
        text: "text-yellow-900",
        accent: "from-yellow-500 to-amber-600",
      }
  }
}
