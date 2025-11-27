export interface ShadowProfile {
  name: string
  level: number
  stats: {
    energy: number
    happiness: number
    stress: number
    money: number
  }
  personality: "rebel" | "perfectionist" | "chaos" | "genius"
  appearance: "dark" | "glitch" | "mirror" | "corrupted"
  lastEncounter: number
  challengesIssued: number
  challengesWon: number
  challengesLost: number
  currentChallenge?: ShadowChallenge
}

export interface ShadowChallenge {
  id: string
  type: "minigame" | "quest" | "stat-race" | "achievement"
  description: string
  reward: number
  penalty: number
  deadline: number
  target: number | string
  progress: number
}

export interface ShadowEncounter {
  id: string
  type: "challenge" | "hint" | "taunt" | "trap"
  message: string
  timestamp: number
}

const SHADOW_PERSONALITIES = {
  rebel: {
    name: "Темний",
    traits: ["Бунтівний", "Непередбачуваний", "Ризикований"],
    messages: {
      greeting: [
        "Знову ти? Я вже почав сумувати...",
        "Цікаво, коли ти нарешті станеш справді крутим?",
        "Бачу, ти все ще граєш безпечно. Нудно.",
      ],
      challenge: [
        "Кидаю тобі виклик! Давай подивимось, хто кращий!",
        "Зараз покажу тобі, як треба грати!",
        "Готовий програти? Бо я готовий перемогти!",
      ],
      victory: [
        "Що? Ти переміг? Це просто удача...",
        "Добре, добре... Але наступного разу я не здамся!",
        "Хм, можливо ти не такий безнадійний...",
      ],
      defeat: ["Ха! Я ж казав, що ти не готовий!", "Може спробуєш ще раз, коли підростеш?", "Це було... надто легко."],
      hint: [
        "Слухай, я тобі підкажу одну річ...",
        "Не кажи, що я тобі допомагаю, але...",
        "Може, спробуєш інший підхід?",
      ],
    },
  },
  perfectionist: {
    name: "Ідеальний",
    traits: ["Перфекціоніст", "Амбітний", "Конкурентний"],
    messages: {
      greeting: [
        "Твої показники... цікаво, але недостатньо.",
        "Я бачу всі твої помилки. ВСІ.",
        "Коли ти нарешті досягнеш досконалості?",
      ],
      challenge: [
        "Давай змагатись за досконалість!",
        "Покажи мені свій максимум!",
        "Тільки ідеальний результат має значення!",
      ],
      victory: [
        "Непогано... для новачка.",
        "Цього разу ти був... достатньо хорошим.",
        "Я визнаю твою перемогу. Але тільки цього разу.",
      ],
      defeat: [
        "Як і передбачав. Сценарій №42.",
        "Логіка завжди перемагає.",
        "Твоя помилка була очевидною з самого початку.",
      ],
      hint: ["Проаналізуй закономірність.", "Відповідь лежить у деталях.", "Думай на три кроки вперед."],
    },
  },
  chaos: {
    name: "Хаос",
    traits: ["Хаотичний", "Непередбачуваний", "Веселий"],
    messages: {
      greeting: ["ХА-ХА! Давай влаштуємо ХАОС!", "Нудьга? Не при мені! БУУУМ!", "Готовий до БЕЗУМСТВА?!"],
      challenge: [
        "Зіграємо у МОЮ гру! Правила? Яких правила?!",
        "Хаос проти порядку! ПОЧИНАЄМО!",
        "Думаєш, це буде легко? СЮРПРИЗ!",
      ],
      victory: [
        "ВАУ! Ти переміг ХАОС! Це... неможливо!",
        "Окей, ти крутий! Навіть я не передбачив!",
        "ХА! Мені подобається твій стиль!",
      ],
      defeat: ["ХАОС ПЕРЕМАГАЄ! Як завжди!", "Не можна передбачити ХАОС!", "ХА-ХА-ХА! Це було епічно!"],
      hint: [
        "Секрет: спробуй зробити щось БОЖЕВІЛЬНЕ!",
        "А що якщо... зробити все НАВПАКИ?",
        "Підказка: БІЛЬШЕ ХАОСУ!",
      ],
    },
  },
  genius: {
    name: "Геній",
    traits: ["Розумний", "Стратегічний", "Таємничий"],
    messages: {
      greeting: [
        "Цікавий вибір. Але не найоптимальніший.",
        "Я вже прорахував 147 можливих сценаріїв.",
        "Твоя стратегія... інтригуюча.",
      ],
      challenge: ["Перевіримо твій інтелект!", "Це буде інтелектуальна дуель.", "Покажи мені свою стратегію."],
      victory: [
        "Імпресивно. Я не врахував цей варіант.",
        "Твоя логіка... несподівана, але ефективна.",
        "Я недооцінив тебе. Це не повториться.",
      ],
      defeat: [
        "Як і передбачав. Сценарій №42.",
        "Логіка завжди перемагає.",
        "Твоя помилка була очевидною з самого початку.",
      ],
      hint: ["Проаналізуй закономірність.", "Відповідь лежить у деталях.", "Думай на три кроки вперед."],
    },
  },
}

export class ShadowStudentAI {
  private shadowProfile: ShadowProfile | null = null
  private encounters: ShadowEncounter[] = []

  initializeShadow(playerState: any): ShadowProfile {
    // Створення протилежної особистості
    const personalities: Array<ShadowProfile["personality"]> = ["rebel", "perfectionist", "chaos", "genius"]
    const playerPersonality = playerState.personalityType || "default"

    let shadowPersonality: ShadowProfile["personality"] = "rebel"

    // Вибір протилежної особистості
    if (playerPersonality === "ambitious") {
      shadowPersonality = "chaos"
    } else if (playerPersonality === "creative") {
      shadowPersonality = "perfectionist"
    } else if (playerPersonality === "social") {
      shadowPersonality = "genius"
    } else {
      shadowPersonality = personalities[Math.floor(Math.random() * personalities.length)]
    }

    this.shadowProfile = {
      name: `${playerState.playerName} [ТІНЬ]`,
      level: Math.max(1, playerState.stats.level - 2), // Трохи слабший
      stats: {
        energy: 100 - playerState.stats.energy,
        happiness: 100 - playerState.stats.happiness,
        stress: 100 - playerState.stats.stress,
        money: Math.floor(playerState.stats.money * 0.8),
      },
      personality: shadowPersonality,
      appearance: "dark",
      lastEncounter: Date.now(),
      challengesIssued: 0,
      challengesWon: 0,
      challengesLost: 0,
    }

    return this.shadowProfile
  }

  getShadowProfile(): ShadowProfile | null {
    return this.shadowProfile
  }

  shouldAppear(playerState: any): boolean {
    if (!this.shadowProfile) {
      this.initializeShadow(playerState)
    }

    const timeSinceLastEncounter = Date.now() - (this.shadowProfile?.lastEncounter || 0)
    const hoursSinceLastEncounter = timeSinceLastEncounter / (1000 * 60 * 60)

    // З'являється кожні 2-4 години гри або при особливих умовах
    if (hoursSinceLastEncounter > 2) {
      return Math.random() < 0.3 // 30% шанс
    }

    // Особливі умови
    if (playerState.stats.level % 5 === 0 && playerState.stats.experience < 50) {
      return true // З'являється на круглих рівнях
    }

    if (playerState.stats.stress > 80 || playerState.stats.happiness < 20) {
      return Math.random() < 0.5 // 50% шанс при поганому стані
    }

    return false
  }

  generateEncounter(type: ShadowEncounter["type"], playerState: any): ShadowEncounter {
    if (!this.shadowProfile) {
      this.initializeShadow(playerState)
    }

    const personality = SHADOW_PERSONALITIES[this.shadowProfile!.personality]
    let message = ""

    switch (type) {
      case "challenge":
        message = personality.messages.challenge[Math.floor(Math.random() * personality.messages.challenge.length)]
        break
      case "hint":
        message = personality.messages.hint[Math.floor(Math.random() * personality.messages.hint.length)]
        break
      case "taunt":
        message = personality.messages.greeting[Math.floor(Math.random() * personality.messages.greeting.length)]
        break
      case "trap":
        message = "Спробуй вгадати, що я запланував... або не вгадуй. Мені однаково."
        break
    }

    const encounter: ShadowEncounter = {
      id: `encounter-${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
    }

    this.encounters.push(encounter)
    if (this.shadowProfile) {
      this.shadowProfile.lastEncounter = Date.now()
    }

    return encounter
  }

  createChallenge(playerState: any): ShadowChallenge {
    const challengeTypes: ShadowChallenge["type"][] = ["minigame", "quest", "stat-race", "achievement"]
    const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)]

    const challenge: ShadowChallenge = {
      id: `challenge-${Date.now()}`,
      type,
      description: "",
      reward: 100 + playerState.stats.level * 20,
      penalty: 50 + playerState.stats.level * 10,
      deadline: Date.now() + 24 * 60 * 60 * 1000, // 24 години
      target: 0,
      progress: 0,
    }

    switch (type) {
      case "minigame":
        const games = ["cafe", "library", "carePackages"]
        const game = games[Math.floor(Math.random() * games.length)]
        const targetScore = (playerState.minigameHighScores[game] || 10) + 50
        challenge.description = `Набери ${targetScore} очок у міні-грі "${game}"`
        challenge.target = targetScore
        break

      case "quest":
        challenge.description = "Виконай 3 квести за наступні 24 години"
        challenge.target = 3
        break

      case "stat-race":
        challenge.description = `Досягни ${playerState.stats.level + 3} рівня раніше за мене`
        challenge.target = playerState.stats.level + 3
        break

      case "achievement":
        challenge.description = "Отримай 5 нових досягнень"
        challenge.target = 5
        break
    }

    if (this.shadowProfile) {
      this.shadowProfile.currentChallenge = challenge
      this.shadowProfile.challengesIssued++
    }

    return challenge
  }

  resolveChallenge(won: boolean): string {
    if (!this.shadowProfile) {
      return ""
    }

    const personality = SHADOW_PERSONALITIES[this.shadowProfile.personality]

    if (won) {
      this.shadowProfile.challengesLost++
      return personality.messages.victory[Math.floor(Math.random() * personality.messages.victory.length)]
    } else {
      this.shadowProfile.challengesWon++
      return personality.messages.defeat[Math.floor(Math.random() * personality.messages.defeat.length)]
    }
  }

  getRecentEncounters(count = 5): ShadowEncounter[] {
    return this.encounters.slice(-count)
  }
}

export const shadowStudentAI = new ShadowStudentAI()
