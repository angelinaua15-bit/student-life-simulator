export type PersonalityType = "genius" | "social" | "coder" | "optimizer" | "activist"

export interface PersonalityTraits {
  id: PersonalityType
  name: string
  description: string
  emoji: string
  statModifiers: {
    stressRate: number // як швидко наростає стрес
    energyRecovery: number // швидкість відновлення енергії
    happinessBonus: number // початковий бонус щастя
    learningSpeed: number // множник досвіду
    moneyBonus: number // бонус до заробітку
  }
  specialAbility: string
  color: string
}

export const PERSONALITY_TYPES: Record<PersonalityType, PersonalityTraits> = {
  genius: {
    id: "genius",
    name: "Інтроверт-геній",
    description:
      "Ти любиш самотність та глибоке занурення в навчання. Легко концентруєшся, але соціальні взаємодії можуть тебе виснажувати.",
    emoji: "🧠",
    statModifiers: {
      stressRate: 1.2,
      energyRecovery: 0.8,
      happinessBonus: -5,
      learningSpeed: 1.5,
      moneyBonus: 1.0,
    },
    specialAbility: "+50% досвіду від бібліотеки",
    color: "from-blue-500 to-purple-500",
  },
  social: {
    id: "social",
    name: "Соц-лідер",
    description:
      "Ти душа компанії! Легко заводиш друзів, організовуєш події та надихаєш інших. Самотність тебе пригнічує.",
    emoji: "🎉",
    statModifiers: {
      stressRate: 0.7,
      energyRecovery: 1.2,
      happinessBonus: 15,
      learningSpeed: 0.9,
      moneyBonus: 1.3,
    },
    specialAbility: "+30% до заробітку в кафе",
    color: "from-pink-500 to-rose-500",
  },
  coder: {
    id: "coder",
    name: "Нічний кодер",
    description: "Найбільш продуктивний після опівночі. Можеш працювати годинами без перерви, але режим сну страждає.",
    emoji: "💻",
    statModifiers: {
      stressRate: 1.0,
      energyRecovery: 0.9,
      happinessBonus: 0,
      learningSpeed: 1.3,
      moneyBonus: 1.2,
    },
    specialAbility: "Подвійні монети після 22:00",
    color: "from-green-500 to-teal-500",
  },
  optimizer: {
    id: "optimizer",
    name: "Оптимізатор",
    description:
      "Все має бути ідеально спланованим. Ти ефективно використовуєш ресурси та час, але перфекціонізм додає стресу.",
    emoji: "📊",
    statModifiers: {
      stressRate: 1.3,
      energyRecovery: 1.0,
      happinessBonus: 5,
      learningSpeed: 1.1,
      moneyBonus: 1.4,
    },
    specialAbility: "Знижка 20% у банку",
    color: "from-yellow-500 to-orange-500",
  },
  activist: {
    id: "activist",
    name: "Енергійний активіст",
    description: "Ти повний енергії та ентузіазму! Береш участь у всьому, але іноді перевтомлюєшся.",
    emoji: "⚡",
    statModifiers: {
      stressRate: 0.8,
      energyRecovery: 1.5,
      happinessBonus: 10,
      learningSpeed: 1.0,
      moneyBonus: 1.1,
    },
    specialAbility: "Початкова енергія 100",
    color: "from-red-500 to-orange-500",
  },
}

export function getPersonalityQuestions() {
  return [
    {
      question: "Як ти проводиш вихідні?",
      answers: [
        { text: "Читаю книги або дивлюся лекції", type: "genius" },
        { text: "Збираюся з друзями на вечірки", type: "social" },
        { text: "Програмую особисті проєкти", type: "coder" },
        { text: "Планую наступний тиждень", type: "optimizer" },
        { text: "Беру участь у різних заходах", type: "activist" },
      ],
    },
    {
      question: "Коли ти найбільш продуктивний?",
      answers: [
        { text: "Вранці, коли тихо", type: "genius" },
        { text: "Коли працюю в команді", type: "social" },
        { text: "Пізно вночі", type: "coder" },
        { text: "Коли все спланував", type: "optimizer" },
        { text: "Завжди повний енергії!", type: "activist" },
      ],
    },
    {
      question: "Як ти реагуєш на дедлайни?",
      answers: [
        { text: "Готуюся заздалегідь та вчу все ідеально", type: "genius" },
        { text: "Працюю з однокурсниками", type: "social" },
        { text: "Кодую всю ніч перед здачею", type: "coder" },
        { text: "Розбиваю на підзадачі та виконую", type: "optimizer" },
        { text: "Робота під тиском мене мотивує", type: "activist" },
      ],
    },
    {
      question: "Твоє ставлення до грошей?",
      answers: [
        { text: "Інвестую в освіту", type: "genius" },
        { text: "Витрачаю на розваги з друзями", type: "social" },
        { text: "Купую техніку та гаджети", type: "coder" },
        { text: "Завжди рахую бюджет", type: "optimizer" },
        { text: "Живу тут і зараз", type: "activist" },
      ],
    },
    {
      question: "Що тебе найбільше мотивує?",
      answers: [
        { text: "Здобувати нові знання", type: "genius" },
        { text: "Допомагати іншим", type: "social" },
        { text: "Створювати крутий код", type: "coder" },
        { text: "Досягати цілей ефективно", type: "optimizer" },
        { text: "Змінювати світ на краще", type: "activist" },
      ],
    },
  ]
}

export function calculatePersonalityType(answers: PersonalityType[]): PersonalityType {
  const counts: Record<PersonalityType, number> = {
    genius: 0,
    social: 0,
    coder: 0,
    optimizer: 0,
    activist: 0,
  }

  answers.forEach((answer) => {
    counts[answer]++
  })

  let maxCount = 0
  let resultType: PersonalityType = "genius"

  Object.entries(counts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count
      resultType = type as PersonalityType
    }
  })

  return resultType
}
