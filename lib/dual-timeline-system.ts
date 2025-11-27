export type TimelineType = "success" | "chaos"

export interface Timeline {
  type: TimelineType
  name: string
  description: string
  stats: {
    energy: number
    happiness: number
    stress: number
    money: number
  }
  events: string[]
  questsCompleted: string[]
  relationshipsModifier: number // Модифікатор відносин з NPC
  difficultyModifier: number // Складність викликів
  theme: {
    primary: string
    secondary: string
    background: string
    textColor: string
  }
}

export interface TimelineChoice {
  id: string
  description: string
  successOutcome: string
  chaosOutcome: string
  impactOnOtherTimeline: number // Як вплине на іншу лінію
  timestamp: number
}

export interface CrossTimelineEvent {
  id: string
  title: string
  description: string
  requirement: string
  reward: string
  unlocked: boolean
}

const TIMELINES: Record<TimelineType, Omit<Timeline, "stats" | "events" | "questsCompleted">> = {
  success: {
    type: "success",
    name: "Успішний Семестр",
    description: "Світ порядку, дисципліни та досягнень. Тут все йде за планом.",
    relationshipsModifier: 1.2, // Краще відносини
    difficultyModifier: 0.8, // Легше
    theme: {
      primary: "from-blue-500 to-cyan-500",
      secondary: "from-green-400 to-emerald-500",
      background: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
      textColor: "text-blue-900 dark:text-blue-100",
    },
  },
  chaos: {
    type: "chaos",
    name: "Хаотичний Семестр",
    description: "Світ непередбачуваності, ризику та несподіванок. Тут правила не працюють.",
    relationshipsModifier: 0.8, // Гірші відносини
    difficultyModifier: 1.3, // Складніше
    theme: {
      primary: "from-purple-500 to-pink-500",
      secondary: "from-orange-400 to-red-500",
      background: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
      textColor: "text-purple-900 dark:text-purple-100",
    },
  },
}

const CROSS_TIMELINE_EVENTS: CrossTimelineEvent[] = [
  {
    id: "paradox-1",
    title: "Парадокс Часу",
    description: "Твої дії створили парадокс між світами",
    requirement: "Досягни 10 рівня в обох семестрах",
    reward: "+500 досвіду, унікальний бейдж",
    unlocked: false,
  },
  {
    id: "harmony",
    title: "Гармонія Світів",
    description: "Ти знайшов баланс між порядком та хаосом",
    requirement: "Виконай 5 квестів в кожному семестрі",
    reward: "+1000 грошей, постійний бонус +10% до всіх статів",
    unlocked: false,
  },
  {
    id: "butterfly-effect",
    title: "Ефект Метелика",
    description: "Маленький вибір змінив обидва світи",
    requirement: "Зроби 20 виборів що вплинули на обидві лінії",
    reward: "Унікальна здатність бачити наслідки виборів",
    unlocked: false,
  },
]

export class DualTimelineSystem {
  private activeTimeline: TimelineType = "success"
  private timelines: Record<TimelineType, Timeline>
  private choices: TimelineChoice[] = []
  private crossTimelineEvents: CrossTimelineEvent[] = [...CROSS_TIMELINE_EVENTS]
  private switchCount = 0

  constructor(playerState: any) {
    this.timelines = {
      success: {
        ...TIMELINES.success,
        stats: { ...playerState.stats },
        events: [],
        questsCompleted: [],
      },
      chaos: {
        ...TIMELINES.chaos,
        stats: {
          energy: Math.max(20, playerState.stats.energy - 20),
          happiness: Math.max(20, playerState.stats.happiness - 15),
          stress: Math.min(100, playerState.stats.stress + 25),
          money: Math.floor(playerState.stats.money * 0.7),
        },
        events: [],
        questsCompleted: [],
      },
    }
  }

  getActiveTimeline(): Timeline {
    return this.timelines[this.activeTimeline]
  }

  getOtherTimeline(): Timeline {
    return this.timelines[this.activeTimeline === "success" ? "chaos" : "success"]
  }

  switchTimeline(): { success: boolean; message: string } {
    const oldTimeline = this.activeTimeline
    this.activeTimeline = this.activeTimeline === "success" ? "chaos" : "success"
    this.switchCount++

    // Перевірка кросс-таймлайн подій
    this.checkCrossTimelineEvents()

    return {
      success: true,
      message: `Ти перемістився з "${TIMELINES[oldTimeline].name}" до "${TIMELINES[this.activeTimeline].name}"`,
    }
  }

  makeChoice(description: string, playerState: any): TimelineChoice {
    const choice: TimelineChoice = {
      id: `choice-${Date.now()}`,
      description,
      successOutcome: this.generateOutcome("success", description),
      chaosOutcome: this.generateOutcome("chaos", description),
      impactOnOtherTimeline: Math.random() * 0.5 + 0.2, // 20-70% впливу
      timestamp: Date.now(),
    }

    this.choices.push(choice)

    // Застосувати вплив на іншу лінію
    const otherTimeline = this.getOtherTimeline()
    if (this.activeTimeline === "success") {
      // Успішні вибори зменшують стрес в хаосі
      otherTimeline.stats.stress = Math.max(0, otherTimeline.stats.stress - choice.impactOnOtherTimeline * 10)
    } else {
      // Хаотичні вибори збільшують стрес в успіху
      const successTimeline = this.timelines.success
      successTimeline.stats.stress = Math.min(100, successTimeline.stats.stress + choice.impactOnOtherTimeline * 15)
    }

    return choice
  }

  private generateOutcome(timeline: TimelineType, description: string): string {
    if (timeline === "success") {
      const outcomes = [
        "Все пройшло ідеально! +20 щастя",
        "Ти зробив правильний вибір. +15 енергія",
        "Відмінний результат! +100 грошей",
        "Це було розумне рішення. -10 стрес",
      ]
      return outcomes[Math.floor(Math.random() * outcomes.length)]
    } else {
      const outcomes = [
        "Непередбачуваний результат! +50 досвіду",
        "Хаос приніс несподівані переваги! +200 грошей",
        "Це було божевільно, але спрацювало! +25 щастя",
        "Ризик виправдався! Отримано унікальний предмет",
      ]
      return outcomes[Math.floor(Math.random() * outcomes.length)]
    }
  }

  private checkCrossTimelineEvents(): void {
    this.crossTimelineEvents.forEach((event) => {
      if (event.unlocked) return

      // Перевірка умов
      if (event.id === "paradox-1") {
        if (this.timelines.success.questsCompleted.length >= 10 && this.timelines.chaos.questsCompleted.length >= 10) {
          event.unlocked = true
        }
      } else if (event.id === "harmony") {
        if (this.timelines.success.questsCompleted.length >= 5 && this.timelines.chaos.questsCompleted.length >= 5) {
          event.unlocked = true
        }
      } else if (event.id === "butterfly-effect") {
        if (this.choices.length >= 20) {
          event.unlocked = true
        }
      }
    })
  }

  getTimelineStats(): {
    successStats: Timeline["stats"]
    chaosStats: Timeline["stats"]
    totalSwitches: number
    totalChoices: number
    unlockedEvents: number
  } {
    return {
      successStats: this.timelines.success.stats,
      chaosStats: this.timelines.chaos.stats,
      totalSwitches: this.switchCount,
      totalChoices: this.choices.length,
      unlockedEvents: this.crossTimelineEvents.filter((e) => e.unlocked).length,
    }
  }

  getCrossTimelineEvents(): CrossTimelineEvent[] {
    return this.crossTimelineEvents
  }

  getRecentChoices(count = 5): TimelineChoice[] {
    return this.choices.slice(-count)
  }

  syncWithGameState(playerState: any): void {
    // Синхронізувати активну лінію з основним станом гри
    const activeTimeline = this.getActiveTimeline()
    activeTimeline.stats = { ...playerState.stats }
  }

  applyTimelineToGameState(playerState: any): any {
    // Застосувати стати активної лінії до основного стану
    const activeTimeline = this.getActiveTimeline()
    return {
      ...playerState,
      stats: { ...activeTimeline.stats },
    }
  }
}

// Глобальний інстанс (буде ініціалізований при першому використанні)
let dualTimelineInstance: DualTimelineSystem | null = null

export function initDualTimeline(playerState: any): DualTimelineSystem {
  if (!dualTimelineInstance) {
    dualTimelineInstance = new DualTimelineSystem(playerState)
  }
  return dualTimelineInstance
}

export function getDualTimeline(): DualTimelineSystem | null {
  return dualTimelineInstance
}
