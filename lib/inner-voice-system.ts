export interface InnerVoiceMessage {
  id: string
  text: string
  emotion: "neutral" | "happy" | "worried" | "excited" | "tired" | "motivated"
  timestamp: number
  category: "achievement" | "warning" | "advice" | "comment" | "encouragement"
}

export interface InnerVoiceAnalysis {
  sleepPattern: "good" | "poor" | "irregular"
  stressLevel: "low" | "medium" | "high"
  studyHabits: "consistent" | "sporadic" | "intense"
  socialActivity: "active" | "moderate" | "isolated"
}

const PERSONALITY_REACTIONS: Record<
  string,
  {
    greetings: string[]
    achievements: string[]
    warnings: string[]
    advice: string[]
    jokes: string[]
  }
> = {
  default: {
    greetings: [
      "Привіт! Готовий підкорювати новий день?",
      "Ей, давай зробимо щось крутe сьогодні!",
      "Знову тут? Я завжди з тобою, друже!",
    ],
    achievements: [
      "Ого! Ти просто неймовірний!",
      "Так тримати! Я вірю в тебе!",
      "Вау! Ти перевершив мої очікування!",
      "Це було епічно! Продовжуй у тому ж дусі!",
    ],
    warnings: [
      "Ем... може, варто трохи відпочити?",
      "Я трохи хвилююсь за тебе...",
      "Гей, не забувай про баланс!",
      "Стоп! Це не дуже хороша ідея...",
    ],
    advice: [
      "Знаєш що? Спробуй спочатку вивчити щось нове.",
      "Може, варто познайомитись з кимось новим?",
      "Думаю, тобі варто відвідати бібліотеку.",
      "А що якщо спробувати інший підхід?",
    ],
    jokes: [
      "Знаєш, я теж колись був студентом... у чиємусь уяві 😄",
      "Між нами: кава — це рідина мудрості!",
      "Якщо життя дає тобі екзамени, зроби з них шпаргалки!",
      "Не всі герої носять мантії. Деякі просто здають сесію!",
    ],
  },
  ambitious: {
    greetings: [
      "Ранок переможця! Готовий до нових перемог?",
      "Час показати світу, на що ти здатний!",
      "Кожна секунда — це можливість стати кращим!",
    ],
    achievements: [
      "Так! Ти — справжній чемпіон!",
      "Це тільки початок твоєї легенди!",
      "Вершина все ближче! Не зупиняйся!",
      "Неймовірно! Ти встановив новий рекорд!",
    ],
    warnings: [
      "Стоп! Навіть чемпіонам потрібен відпочинок!",
      "Без енергії не буде перемог!",
      "Виснаження — це не знак сили!",
    ],
    advice: [
      "Концентруйся на цілі! Успіх близько!",
      "Планування — ключ до великих перемог!",
      "Не забувай: якість важливіша за кількість!",
    ],
    jokes: [
      "Знаєш різницю між тобою та кавою? Кава іноді остигає!",
      "Твій рівень мотивації: космічний 🚀",
      "Навіть Ілон Маск заздрить твоїй продуктивності!",
    ],
  },
  creative: {
    greetings: ["О, привіт, креативний генію!", "Який шедевр створимо сьогодні?", "Твоя уява — це суперсила!"],
    achievements: [
      "Це ж справжнє мистецтво!",
      "Вау! Де ти береш такі ідеї?",
      "Пікассо плаче від заздрості!",
      "Я відчуваю натхнення навіть від спостереження за тобою!",
    ],
    warnings: [
      "Гей, генію, твій мозок теж потребує перезарядки!",
      "Креативність та виснаження не дуже дружать...",
      "Може, час зробити творчу паузу?",
    ],
    advice: [
      "Спробуй подивитись на проблему з іншого кута!",
      "Іноді найкращі ідеї приходять під час відпочинку.",
      "Експериментуй! Не бійся помилок!",
    ],
    jokes: [
      "Твоя креативність яскравіша за неонові вивіски Токіо!",
      "Якби ідеї були валютою, ти був би мільйонером!",
      "Моя теорія: ти — втілення мрії Pinterest!",
    ],
  },
}

export class InnerVoiceAI {
  private playerAnalysis: InnerVoiceAnalysis = {
    sleepPattern: "good",
    stressLevel: "low",
    studyHabits: "consistent",
    socialActivity: "moderate",
  }

  private messageHistory: InnerVoiceMessage[] = []
  private lastMessageTime = 0
  private readonly MIN_MESSAGE_INTERVAL = 30000 // 30 секунд між повідомленнями

  analyzePlayer(gameState: any): InnerVoiceAnalysis {
    // Аналіз сну (базується на енергії)
    const sleepPattern = gameState.stats.energy > 70 ? "good" : gameState.stats.energy > 40 ? "irregular" : "poor"

    // Аналіз стресу
    const stressLevel = gameState.stats.stress < 30 ? "low" : gameState.stats.stress < 60 ? "medium" : "high"

    // Аналіз звичок навчання (базується на level та experience)
    const studyHabits =
      gameState.stats.level > 10 ? "consistent" : gameState.stats.experience > 50 ? "intense" : "sporadic"

    // Аналіз соціальної активності (базується на friends)
    const friendsCount = gameState.friends?.length || 0
    const socialActivity = friendsCount > 3 ? "active" : friendsCount > 1 ? "moderate" : "isolated"

    this.playerAnalysis = {
      sleepPattern,
      stressLevel,
      studyHabits,
      socialActivity,
    }

    return this.playerAnalysis
  }

  generateMessage(
    trigger: "greeting" | "achievement" | "warning" | "random" | "advice",
    gameState: any,
  ): InnerVoiceMessage | null {
    // Перевірка інтервалу між повідомленнями
    const now = Date.now()
    if (now - this.lastMessageTime < this.MIN_MESSAGE_INTERVAL && trigger === "random") {
      return null
    }

    const personality = gameState.personalityType || "default"
    const reactions = PERSONALITY_REACTIONS[personality] || PERSONALITY_REACTIONS.default

    let text = ""
    let emotion: InnerVoiceMessage["emotion"] = "neutral"
    let category: InnerVoiceMessage["category"] = "comment"

    this.analyzePlayer(gameState)

    switch (trigger) {
      case "greeting":
        text = reactions.greetings[Math.floor(Math.random() * reactions.greetings.length)]
        emotion = "happy"
        category = "comment"
        break

      case "achievement":
        text = reactions.achievements[Math.floor(Math.random() * reactions.achievements.length)]
        emotion = "excited"
        category = "achievement"
        break

      case "warning":
        text = reactions.warnings[Math.floor(Math.random() * reactions.warnings.length)]
        emotion = "worried"
        category = "warning"

        // Додати конкретне попередження залежно від стану
        if (gameState.stats.energy < 20) {
          text = "Ей! Твоя енергія на нулі! Терміново відпочинь!"
          emotion = "worried"
        } else if (gameState.stats.stress > 80) {
          text = "Стрес зашкалює! Тобі потрібен відпочинок, друже!"
          emotion = "worried"
        } else if (gameState.stats.happiness < 30) {
          text = "Виглядаєш сумним... Може, щось веселе?"
          emotion = "worried"
        }
        break

      case "advice":
        text = reactions.advice[Math.floor(Math.random() * reactions.advice.length)]
        emotion = "motivated"
        category = "advice"

        // Персоналізовані поради на основі аналізу
        if (this.playerAnalysis.stressLevel === "high") {
          text = "Знаєш, високий стрес знижує продуктивність. Спробуй медитацію або прогулянку!"
        } else if (this.playerAnalysis.sleepPattern === "poor") {
          text = "Твій режим сну не дуже... Спробуй лягати раніше, це реально допомагає!"
        } else if (this.playerAnalysis.socialActivity === "isolated") {
          text = "Ти давно не спілкувався з друзями. Може, час познайомитись з кимось?"
        }
        break

      case "random":
        // Випадкові коментарі або жарти
        const random = Math.random()
        if (random < 0.5) {
          text = reactions.jokes[Math.floor(Math.random() * reactions.jokes.length)]
          emotion = "happy"
          category = "comment"
        } else {
          text = reactions.advice[Math.floor(Math.random() * reactions.advice.length)]
          emotion = "neutral"
          category = "advice"
        }
        break
    }

    const message: InnerVoiceMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text,
      emotion,
      category,
      timestamp: now,
    }

    this.messageHistory.push(message)
    this.lastMessageTime = now

    // Зберігати тільки останні 50 повідомлень
    if (this.messageHistory.length > 50) {
      this.messageHistory = this.messageHistory.slice(-50)
    }

    return message
  }

  getRecentMessages(count = 10): InnerVoiceMessage[] {
    return this.messageHistory.slice(-count)
  }

  shouldShowMessage(gameState: any): InnerVoiceMessage | null {
    // Автоматична перевірка стану гравця і генерація повідомлень
    if (gameState.stats.energy < 20 || gameState.stats.stress > 80) {
      return this.generateMessage("warning", gameState)
    }

    // Випадкові поради кожні 2 хвилини
    const timeSinceLastMessage = Date.now() - this.lastMessageTime
    if (timeSinceLastMessage > 120000) {
      // 2 хвилини
      return this.generateMessage("advice", gameState)
    }

    return null
  }
}

// Глобальний інстанс
export const innerVoiceAI = new InnerVoiceAI()
