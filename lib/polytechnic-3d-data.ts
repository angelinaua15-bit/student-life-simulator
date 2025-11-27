export interface QuestItem {
  id: string
  name: string
  type: "story" | "collection" | "timed" | "puzzle" | "interaction"
  title: string
  description: string
  objectives: {
    type: "find_room" | "collect_items" | "interact" | "assemble"
    target: string
    current: number
    required: number
  }[]
  reward: {
    money: number
    experience: number
    items?: string[]
  }
  isCompleted: boolean
}

export interface InteractiveObject {
  id: string
  type: "door" | "light" | "projector" | "book" | "chest" | "npc" | "item"
  name: string
  position: [number, number, number]
  roomId: string
  isInteractable: boolean
  requiresItem?: string
  givesItem?: string
  dialogue?: string[]
  questId?: string
}

export interface NPCCharacter {
  id: string
  name: string
  role: "student" | "professor" | "admin"
  position: [number, number, number]
  roomId: string
  dialogue: string[]
  questGiver?: boolean
  questId?: string
  patrolPath?: [number, number, number][]
}

export interface Room {
  id: string
  name: string
  type: "hallway" | "lecture" | "lab" | "library" | "office" | "outdoor"
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
  }
  doors: {
    position: [number, number, number]
    leadsTo: string
    isLocked: boolean
    requiresKey?: string
  }[]
}

export const initialQuests: QuestItem[] = [
  {
    id: "find-auditorium",
    name: "Знайди правильну аудиторію",
    type: "story",
    title: "Перший день",
    description: "Викладач Петренко чекає на тебе в аудиторії 301. Знайди її!",
    objectives: [
      {
        type: "find_room",
        target: "lecture-301",
        current: 0,
        required: 1,
      },
    ],
    reward: {
      money: 50,
      experience: 100,
    },
    isCompleted: false,
  },
  {
    id: "fetch-book",
    name: "Принеси викладачу книгу",
    type: "story",
    title: "Книжковий квест",
    description: "Викладач Коваль просить принести підручник з бібліотеки.",
    objectives: [
      {
        type: "collect_items",
        target: "textbook",
        current: 0,
        required: 1,
      },
      {
        type: "interact",
        target: "professor-koval",
        current: 0,
        required: 1,
      },
    ],
    reward: {
      money: 75,
      experience: 150,
    },
    isCompleted: false,
  },
  {
    id: "tea-collection",
    name: "Збери чайний набір",
    type: "timed",
    title: "Чайна лихоманка",
    description: "Знайди 5 пакетиків чаю розкиданих по корпусу за 3 хвилини!",
    objectives: [
      {
        type: "collect_items",
        target: "tea-bag",
        current: 0,
        required: 5,
      },
    ],
    reward: {
      money: 100,
      experience: 200,
      items: ["golden-tea-cup"],
    },
    isCompleted: false,
  },
  {
    id: "schedule-puzzle",
    name: "Склади розклад",
    type: "puzzle",
    title: "Загублений розклад",
    description: "Знайди всі частини розкладу та склади їх правильно.",
    objectives: [
      {
        type: "collect_items",
        target: "schedule-piece",
        current: 0,
        required: 4,
      },
      {
        type: "assemble",
        target: "schedule-board",
        current: 0,
        required: 1,
      },
    ],
    reward: {
      money: 120,
      experience: 250,
    },
    isCompleted: false,
  },
  {
    id: "projector-setup",
    name: "Активуй проектор",
    type: "interaction",
    title: "Технічна підтримка",
    description: "Допоможи налаштувати проектор у лекційній залі.",
    objectives: [
      {
        type: "interact",
        target: "projector-main",
        current: 0,
        required: 1,
      },
    ],
    reward: {
      money: 60,
      experience: 120,
    },
    isCompleted: false,
  },
]

export const rooms: Room[] = [
  {
    id: "main-entrance",
    name: "Головний вхід",
    type: "outdoor",
    bounds: { minX: -20, maxX: 20, minZ: -30, maxZ: -10 },
    doors: [{ position: [0, 0, -10], leadsTo: "main-hall", isLocked: false }],
  },
  {
    id: "main-hall",
    name: "Головний хол",
    type: "hallway",
    bounds: { minX: -15, maxX: 15, minZ: -10, maxZ: 10 },
    doors: [
      { position: [0, 0, -10], leadsTo: "main-entrance", isLocked: false },
      { position: [-10, 0, 10], leadsTo: "corridor-1", isLocked: false },
      { position: [10, 0, 10], leadsTo: "library", isLocked: false },
    ],
  },
  {
    id: "corridor-1",
    name: "Коридор 1-й поверх",
    type: "hallway",
    bounds: { minX: -25, maxX: -10, minZ: 10, maxZ: 30 },
    doors: [
      { position: [-10, 0, 10], leadsTo: "main-hall", isLocked: false },
      { position: [-20, 0, 15], leadsTo: "lecture-301", isLocked: false },
      { position: [-20, 0, 25], leadsTo: "lab-101", isLocked: false },
    ],
  },
  {
    id: "lecture-301",
    name: "Аудиторія 301",
    type: "lecture",
    bounds: { minX: -30, maxX: -20, minZ: 12, maxZ: 22 },
    doors: [{ position: [-20, 0, 15], leadsTo: "corridor-1", isLocked: false }],
  },
  {
    id: "lab-101",
    name: "Лабораторія 101",
    type: "lab",
    bounds: { minX: -30, maxX: -20, minZ: 23, maxZ: 33 },
    doors: [{ position: [-20, 0, 25], leadsTo: "corridor-1", isLocked: false }],
  },
  {
    id: "library",
    name: "Бібліотека",
    type: "library",
    bounds: { minX: 10, maxX: 30, minZ: 10, maxZ: 30 },
    doors: [{ position: [10, 0, 10], leadsTo: "main-hall", isLocked: false }],
  },
]

export const interactiveObjects: InteractiveObject[] = [
  // Tea bags scattered around
  {
    id: "tea-1",
    type: "item",
    name: "Пакетик чаю",
    position: [-5, 0.5, 5],
    roomId: "main-hall",
    isInteractable: true,
    givesItem: "tea-bag",
  },
  {
    id: "tea-2",
    type: "item",
    name: "Пакетик чаю",
    position: [-22, 0.5, 18],
    roomId: "corridor-1",
    isInteractable: true,
    givesItem: "tea-bag",
  },
  {
    id: "tea-3",
    type: "item",
    name: "Пакетик чаю",
    position: [20, 0.5, 20],
    roomId: "library",
    isInteractable: true,
    givesItem: "tea-bag",
  },
  {
    id: "tea-4",
    type: "item",
    name: "Пакетик чаю",
    position: [-25, 0.5, 17],
    roomId: "lecture-301",
    isInteractable: true,
    givesItem: "tea-bag",
  },
  {
    id: "tea-5",
    type: "item",
    name: "Пакетик чаю",
    position: [-25, 0.5, 28],
    roomId: "lab-101",
    isInteractable: true,
    givesItem: "tea-bag",
  },

  // Books
  {
    id: "book-1",
    type: "book",
    name: "Підручник програмування",
    position: [15, 1, 15],
    roomId: "library",
    isInteractable: true,
    givesItem: "textbook",
  },

  // Projector
  {
    id: "projector-main",
    type: "projector",
    name: "Проектор",
    position: [-25, 1.5, 14],
    roomId: "lecture-301",
    isInteractable: true,
  },

  // Light switches
  {
    id: "light-hall",
    type: "light",
    name: "Вимикач світла",
    position: [-14, 1.5, 0],
    roomId: "main-hall",
    isInteractable: true,
  },
  {
    id: "light-lecture",
    type: "light",
    name: "Вимикач світла",
    position: [-21, 1.5, 13],
    roomId: "lecture-301",
    isInteractable: true,
  },

  // Schedule pieces
  {
    id: "schedule-1",
    type: "item",
    name: "Частина розкладу",
    position: [8, 0.5, 0],
    roomId: "main-hall",
    isInteractable: true,
    givesItem: "schedule-piece",
  },
  {
    id: "schedule-2",
    type: "item",
    name: "Частина розкладу",
    position: [-15, 0.5, 20],
    roomId: "corridor-1",
    isInteractable: true,
    givesItem: "schedule-piece",
  },
  {
    id: "schedule-3",
    type: "item",
    name: "Частина розкладу",
    position: [25, 0.5, 25],
    roomId: "library",
    isInteractable: true,
    givesItem: "schedule-piece",
  },
  {
    id: "schedule-4",
    type: "item",
    name: "Частина розкладу",
    position: [-26, 0.5, 30],
    roomId: "lab-101",
    isInteractable: true,
    givesItem: "schedule-piece",
  },
]

export const npcs: NPCCharacter[] = [
  {
    id: "professor-petrenko",
    name: "Проф. Петренко",
    role: "professor",
    position: [-25, 0, 17],
    roomId: "lecture-301",
    dialogue: [
      "Привіт! Рад бачити тебе на лекції.",
      "Не забудь виконати домашнє завдання!",
      "Молодець, що знайшов аудиторію!",
    ],
    questGiver: true,
    questId: "find-auditorium",
  },
  {
    id: "professor-koval",
    name: "Проф. Коваль",
    role: "professor",
    position: [-25, 0, 28],
    roomId: "lab-101",
    dialogue: ["Потрібен підручник з бібліотеки.", "Дякую за допомогу!", "Ти справжній помічник!"],
    questGiver: true,
    questId: "fetch-book",
  },
  {
    id: "student-maria",
    name: "Марія",
    role: "student",
    position: [0, 0, 0],
    roomId: "main-hall",
    dialogue: ["Привіт! Ти теж новачок?", "Це найкращий університет!", "Удачі на парах!"],
    patrolPath: [
      [0, 0, 0],
      [5, 0, 5],
      [0, 0, 0],
      [-5, 0, 5],
    ],
  },
  {
    id: "student-ivan",
    name: "Іван",
    role: "student",
    position: [18, 0, 18],
    roomId: "library",
    dialogue: ["Тут так тихо і спокійно.", "Люблю читати книги.", "Бібліотека - моє улюблене місце!"],
  },
]
