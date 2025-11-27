export interface MentorEvent {
  id: string
  type: "advice" | "challenge" | "story" | "reward"
  title: string
  description: string
  options: {
    text: string
    effects: {
      stress?: number
      happiness?: number
      energy?: number
      money?: number
      experience?: number
    }
    requiredLevel?: number
  }[]
}

export const MENTOR_EVENTS: MentorEvent[] = [
  {
    id: "welcome",
    type: "story",
    title: "Зустріч з Ментором",
    description:
      'Стильний ментор з\'являється в сяйві неонового світла. "Yo, студент! Я тут, щоб допомогти тобі вижити в цьому безумному студентському житті. Готовий до пригод?"',
    options: [
      {
        text: "Так, давай!",
        effects: { happiness: 10, experience: 10 },
      },
    ],
  },
  {
    id: "stress-advice",
    type: "advice",
    title: "Поради про стрес",
    description:
      'Ментор помічає, що ти виглядаєш напруженим. "Слухай, стрес - це нормально, але не дай йому керувати тобою! Грай в міні-ігри, щоб розслабитись, або просто відпочинь. Пам\'ятай: баланс - це ключ!"',
    options: [
      {
        text: "Дякую за пораду!",
        effects: { stress: -10, happiness: 5 },
      },
    ],
  },
  {
    id: "money-challenge",
    type: "challenge",
    title: "Фінансовий виклик",
    description: 'Ментор пропонує виклик: "Давай перевіримо твої навички! Заробиш 500 грн - отримаєш бонус від мене!"',
    options: [
      {
        text: "Приймаю виклик!",
        effects: { happiness: 5, experience: 20 },
      },
      {
        text: "Може пізніше...",
        effects: { stress: 5 },
      },
    ],
  },
  {
    id: "bank-advice",
    type: "advice",
    title: "Мудрість банкіра",
    description:
      'Ментор щось розмірковує: "Знаєш, гроші люблять тишу... і відсотки! Поклади щось у банк, нехай працюють на тебе. 5% - це непогано!"',
    options: [
      {
        text: "Хороша ідея!",
        effects: { happiness: 5, experience: 10 },
      },
    ],
  },
  {
    id: "lottery-warning",
    type: "advice",
    title: "Попередження про азарт",
    description:
      'Ментор серйозно дивиться на тебе: "Слухай, лотерея - це весело, але не захоплюйся. Це лише розвага, не стратегія заробітку. Будь розумним!"',
    options: [
      {
        text: "Розумію",
        effects: { experience: 15 },
      },
      {
        text: "Та я контролюю ситуацію",
        effects: { stress: 5 },
      },
    ],
  },
  {
    id: "level-up",
    type: "reward",
    title: "Вітаю з прогресом!",
    description:
      'Ментор гордо посміхається: "Дивлюсь, ти непогано просуваєшся! Ось тобі невелика нагорода за зусилля. Так тримати!"',
    options: [
      {
        text: "Дякую!",
        effects: { money: 100, happiness: 15, experience: 50 },
        requiredLevel: 3,
      },
    ],
  },
  {
    id: "energy-boost",
    type: "reward",
    title: "Енергетичний бустер",
    description:
      'Ментор дістає якийсь дивний напій: "Виглядаєш втомленим. Тримай цей магічний енергетик! Просто не питай, що в ньому..."',
    options: [
      {
        text: "Випити",
        effects: { energy: 30, happiness: 5 },
      },
      {
        text: "Ні, дякую",
        effects: { stress: -5 },
      },
    ],
  },
  {
    id: "wisdom-share",
    type: "story",
    title: "Мудрість старших",
    description:
      'Ментор розповідає: "Знаєш, коли я був студентом, думав що гроші - це все. Але насправді важливіший баланс. Щастя, енергія, низький стрес - ось що робить життя крутим!"',
    options: [
      {
        text: "Цікава історія",
        effects: { happiness: 10, stress: -10, experience: 20 },
      },
    ],
  },
  {
    id: "achievement-unlocked",
    type: "reward",
    title: "Досягнення розблоковано!",
    description:
      'Ментор аплодує: "Wow! Ти справді старався! Таких результатів досягають не всі. Тримай заслужену винагороду, чемпіоне!"',
    options: [
      {
        text: "О так!",
        effects: { money: 200, happiness: 20, experience: 100 },
        requiredLevel: 5,
      },
    ],
  },
  {
    id: "final-wisdom",
    type: "story",
    title: "Фінальна мудрість",
    description:
      'Ментор серйознішає: "Запам\'ятай - студентське життя це не тільки про оцінки чи гроші. Це про досвід, друзів, помилки і перемоги. Живи на повну, але не забувай про баланс!"',
    options: [
      {
        text: "Запам'ятаю!",
        effects: { happiness: 15, stress: -15, experience: 50 },
        requiredLevel: 7,
      },
    ],
  },
]

export function getAvailableEvents(level: number, completedEvents: string[]): MentorEvent[] {
  return MENTOR_EVENTS.filter((event) => {
    // Check if already completed
    if (completedEvents.includes(event.id)) return false

    // Check level requirement
    const minLevel = event.options[0]?.requiredLevel || 1
    if (level < minLevel) return false

    return true
  })
}

export function getRandomEvent(level: number, completedEvents: string[]): MentorEvent | null {
  const available = getAvailableEvents(level, completedEvents)
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}
