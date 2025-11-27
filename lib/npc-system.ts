import type { LocationId, TimeOfDay } from "./world-system"

export interface NPC {
  id: string
  name: string
  role: string
  personality: string
  avatarColor: string
  routines: {
    morning: LocationId
    afternoon: LocationId
    evening: LocationId
    night: LocationId
  }
  dialogues: {
    greeting: string[]
    quest: string[]
    casual: string[]
    farewell: string[]
  }
  questsAvailable: string[]
  friendshipLevel: number
  canBeFriend: boolean
}

export const NPCS: Record<string, NPC> = {
  mentor: {
    id: "mentor",
    name: "Стильний Ментор",
    role: "Наставник",
    personality: "Мудрий і з гумором",
    avatarColor: "from-purple-500 to-pink-500",
    routines: {
      morning: "campus",
      afternoon: "coworking",
      evening: "cafeteria",
      night: "campus",
    },
    dialogues: {
      greeting: [
        "Привіт, зірко! Готовий підкорити цей день?",
        "О, дивлюсь хтось вирішив стати легендою!",
        "Йоу! Що нового в житті крутого студента?",
      ],
      quest: [
        "У мене є для тебе цікаве завдання!",
        "Хочеш перевірити свої скіли?",
        "Є одна справа, де б не завадила твоя допомога.",
      ],
      casual: [
        "Пам'ятай: стрес - це тимчасово, а диплом - назавжди!",
        "Балансуй між навчанням та відпочинком, це ключ до успіху.",
        "Не забувай про друзів, вони роблять студентське життя незабутнім!",
      ],
      farewell: ["Удачі! Ти впораєшся!", "Бувай, чемпіоне!", "До зустрічі, зірко!"],
    },
    questsAvailable: ["story_1", "story_2"],
    friendshipLevel: 50,
    canBeFriend: true,
  },
  student1: {
    id: "student1",
    name: "Олег",
    role: "Студент-програміст",
    personality: "Технічний гік",
    avatarColor: "from-blue-500 to-cyan-500",
    routines: {
      morning: "computer-lab",
      afternoon: "coworking",
      evening: "dormitory",
      night: "dormitory",
    },
    dialogues: {
      greeting: ["Привіт! Кодиш щось цікаве?", "Йо! Як там твій проект?", "Хей! Бачив новий фреймворк?"],
      quest: ["Допоможеш з баг-фіксом?", "Треба зробити код рев'ю."],
      casual: [
        "Програмування - це мистецтво!",
        "Дебажити до ранку - норма життя.",
        "Stack Overflow - наш найкращий друг!",
      ],
      farewell: ["Бувай! Happy coding!", "Чао, dev!", "До зустрічі в коді!"],
    },
    questsAvailable: ["side_1"],
    friendshipLevel: 0,
    canBeFriend: true,
  },
  student2: {
    id: "student2",
    name: "Марія",
    role: "Студентка-дизайнерка",
    personality: "Творча особистість",
    avatarColor: "from-pink-500 to-rose-500",
    routines: {
      morning: "campus",
      afternoon: "coworking",
      evening: "cafeteria",
      night: "dormitory",
    },
    dialogues: {
      greeting: ["Привіт! Як настрій?", "Хей! Бачила твої роботи, круто!", "Вітаю! Що малюєш сьогодні?"],
      quest: ["Допоможеш з дизайн-проектом?", "Треба фідбек на макети."],
      casual: ["Креативність - це суперсила!", "Кожен проект - це нова пригода.", "Кольори створюють настрій!"],
      farewell: ["Бувай, творче!", "Чао, артисте!", "До побачення!"],
    },
    questsAvailable: ["side_2"],
    friendshipLevel: 0,
    canBeFriend: true,
  },
  roommate: {
    id: "roommate",
    name: "Максим",
    role: "Сусід по кімнаті",
    personality: "Веселун і тусовщик",
    avatarColor: "from-orange-500 to-red-500",
    routines: {
      morning: "dormitory",
      afternoon: "campus",
      evening: "cafeteria",
      night: "dormitory",
    },
    dialogues: {
      greeting: ["Йоу, сусіде! Як справи?", "Привіт! Сьогодні тусим?", "Хей! Готовий до нових пригод?"],
      quest: ["Допоможеш організувати вечірку?", "Треба закупити продукти."],
      casual: [
        "Життя занадто коротке, щоб бути сумним!",
        "Тусовки - це частина студентського життя.",
        "Друзі роблять гуртожиток домом!",
      ],
      farewell: ["Бувай, братан!", "Чао!", "До побачення!"],
    },
    questsAvailable: ["side_3"],
    friendshipLevel: 25,
    canBeFriend: true,
  },
  chef: {
    id: "chef",
    name: "Іван Петрович",
    role: "Шеф кухар",
    personality: "Гостинний і доброзичливий",
    avatarColor: "from-yellow-500 to-orange-500",
    routines: {
      morning: "cafeteria",
      afternoon: "cafeteria",
      evening: "cafeteria",
      night: "dormitory",
    },
    dialogues: {
      greeting: ["Вітаю! Голодний?", "Привіт! Сьогодні є смачні страви!", "Доброго дня! Що бажаєте?"],
      quest: ["Допоможи на кухні!", "Треба приготувати на подію."],
      casual: ["Смачна їжа - це любов!", "Готувати - моя пристрасть.", "Їжа об'єднує людей!"],
      farewell: ["Смачного!", "Приходь ще!", "Бувайте здорові!"],
    },
    questsAvailable: ["job_cafe"],
    friendshipLevel: 0,
    canBeFriend: false,
  },
  librarian: {
    id: "librarian",
    name: "Ольга Василівна",
    role: "Бібліотекарка",
    personality: "Інтелігентна і тиха",
    avatarColor: "from-green-500 to-emerald-500",
    routines: {
      morning: "library",
      afternoon: "library",
      evening: "library",
      night: "dormitory",
    },
    dialogues: {
      greeting: ["Тихо! Вітаю в бібліотеці.", "Доброго дня. Шукаєте щось конкретне?", "Привіт. Чим можу допомогти?"],
      quest: ["Допоможи розібрати книги.", "Треба каталогізувати нові надходження."],
      casual: ["Книги - це скарбниця знань.", "Читання розвиває розум.", "Тиша допомагає зосередитись."],
      farewell: ["Гарного дня!", "До побачення!", "Приходьте ще!"],
    },
    questsAvailable: ["job_library"],
    friendshipLevel: 0,
    canBeFriend: false,
  },
}

export function getNPCAtLocation(locationId: LocationId, timeOfDay: TimeOfDay): NPC[] {
  return Object.values(NPCS).filter((npc) => npc.routines[timeOfDay] === locationId)
}

export function getRandomDialogue(npc: NPC, type: keyof NPC["dialogues"]): string {
  const dialogues = npc.dialogues[type]
  return dialogues[Math.floor(Math.random() * dialogues.length)]
}

export function increaseFriendship(npcId: string, amount: number): number {
  const npc = NPCS[npcId]
  if (!npc || !npc.canBeFriend) return 0
  npc.friendshipLevel = Math.min(100, npc.friendshipLevel + amount)
  return npc.friendshipLevel
}
