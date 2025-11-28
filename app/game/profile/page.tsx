"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useGameModal } from "@/lib/use-game-modal"
import {
  User,
  Camera,
  Edit,
  Save,
  TrendingUp,
  Award,
  Settings,
  ArrowLeft,
  Star,
  Zap,
  Heart,
  Brain,
  Coins,
  Trophy,
  Calendar,
  Activity,
  Target,
  Copy,
  Check,
  QrCode,
  Award as IdCard,
} from "lucide-react"
import Link from "next/link"
import { copyPlayerId } from "@/lib/player-id-system"

const AVATAR_OPTIONS = [
  { id: "avatar-1", emoji: "😎", name: "Крутий" },
  { id: "avatar-2", emoji: "🤓", name: "Ботан" },
  { id: "avatar-3", emoji: "😴", name: "Сонний" },
  { id: "avatar-4", emoji: "🤩", name: "Зіркровий" },
  { id: "avatar-5", emoji: "🥳", name: "Веселун" },
  { id: "avatar-6", emoji: "🧠", name: "Розумник" },
  { id: "avatar-7", emoji: "💪", name: "Сильний" },
  { id: "avatar-8", emoji: "🎨", name: "Творець" },
  { id: "avatar-9", emoji: "🚀", name: "Швидкий" },
  { id: "avatar-10", emoji: "⚡", name: "Енергія" },
  { id: "avatar-11", emoji: "🔥", name: "Гарячий" },
  { id: "avatar-12", emoji: "✨", name: "Зірка" },
]

export default function ProfilePage() {
  const router = useRouter()
  const { showSuccess } = useGameModal()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editNickname, setEditNickname] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editFaculty, setEditFaculty] = useState("")
  const [editGroup, setEditGroup] = useState("")
  const [editSocial, setEditSocial] = useState("")

  useEffect(() => {
    const loadData = async () => {
      const saved = await loadGameState()
      if (!saved) {
        router.push("/")
        return
      }
      setGameState(saved)
      setEditName(saved.playerName)
      setEditNickname(saved.playerName)
      setEditStatus(saved.status || "Новачок")
      setEditBio((saved as any).bio || "")
      setEditFaculty((saved as any).faculty || "")
      setEditGroup((saved as any).group || "")
      setEditSocial((saved as any).social || "")
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleSaveProfile = async () => {
    if (!gameState) return

    const updatedState = {
      ...gameState,
      playerName: editNickname,
      status: editStatus,
      bio: editBio,
      faculty: editFaculty,
      group: editGroup,
      social: editSocial,
    } as any

    await saveGameState(updatedState)
    setGameState(updatedState)
    setEditing(false)
    showSuccess("Профіль успішно оновлено!", "Збережено")
  }

  const handleAvatarSelect = async (avatarId: string) => {
    if (!gameState) return

    const updatedState = {
      ...gameState,
      skin: avatarId,
    }

    await saveGameState(updatedState)
    setGameState(updatedState)
    setAvatarDialogOpen(false)
    showSuccess("Аватар змінено!", "Успіх")
  }

  const handleCopyId = async () => {
    if (!gameState?.playerId) return

    const success = await copyPlayerId(gameState.playerId)
    if (success) {
      setCopied(true)
      showSuccess("ID скопійовано!", "Успіх")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { stats, achievements = [], completedEvents = [] } = gameState
  const selectedAvatar = AVATAR_OPTIONS.find((a) => a.id === gameState.skin) || AVATAR_OPTIONS[0]
  const expPercentage = (stats.experience / stats.experienceToNext) * 100

  // Calculate some statistics
  const totalGamesPlayed =
    (gameState.minigameHighScores?.cafe || 0) +
    (gameState.minigameHighScores?.library || 0) +
    (gameState.minigameHighScores?.carePackages || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/game">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад до гри
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Мій Профіль</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Профіль</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Статистика</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Досягнення</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Налаштування</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <IdCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Мій унікальний ID</h3>
                      <p className="text-sm text-muted-foreground">Поділись з друзями</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrDialogOpen(true)}
                    className="rounded-full hover:scale-105 transition-transform"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR-код
                  </Button>
                </div>

                <div className="relative group">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20 hover:border-primary/40 transition-all backdrop-blur-sm">
                    <div className="flex-1">
                      <p className="text-3xl font-mono font-bold tracking-wider bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {gameState.playerId || "STU-XXXXX-XXXXX"}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleCopyId}
                      className="rounded-full px-6 shadow-lg hover:scale-105 transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 mr-2 animate-scale-in" />
                          Скопійовано!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 mr-2" />
                          Копіювати
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient"></div>
              <div className="px-6 pb-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl shadow-2xl border-4 border-card animate-bounce-in">
                      {selectedAvatar.emoji}
                    </div>
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setAvatarDialogOpen(true)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                      <h2 className="text-3xl font-bold">{gameState.playerName}</h2>
                      {!editing && (
                        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Редагувати
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">{gameState.status}</p>
                    <div className="flex items-center gap-4 justify-center sm:justify-start flex-wrap">
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-bold">Рівень {stats.level}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-secondary" />
                        <span className="font-bold">{achievements.length} нагород</span>
                      </div>
                      <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full">
                        <Coins className="w-4 h-4 text-accent-foreground" />
                        <span className="font-bold">{stats.money} грн</span>
                      </div>
                    </div>

                    {/* Experience Bar */}
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Прогрес до наступного рівня</span>
                        <span>
                          {stats.experience} / {stats.experienceToNext}
                        </span>
                      </div>
                      <Progress value={expPercentage} className="h-3" />
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                {!editing ? (
                  <div className="mt-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Факультет</Label>
                        <p className="text-lg font-medium">{(gameState as any).faculty || "Не вказано"}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Група</Label>
                        <p className="text-lg font-medium">{(gameState as any).group || "Не вказано"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Біо</Label>
                      <p className="text-base">{(gameState as any).bio || "Розкажи про себе..."}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Соцмережі</Label>
                      <p className="text-base">{(gameState as any).social || "Не вказано"}</p>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-3 mt-8">
                      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 hover:scale-105 transition-transform">
                        <div className="flex items-center gap-3">
                          <Zap className="w-8 h-8 text-warning" />
                          <div>
                            <p className="text-sm text-muted-foreground">Енергія</p>
                            <p className="text-2xl font-bold">{Math.round(stats.energy)}%</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 hover:scale-105 transition-transform">
                        <div className="flex items-center gap-3">
                          <Heart className="w-8 h-8 text-success" />
                          <div>
                            <p className="text-sm text-muted-foreground">Щастя</p>
                            <p className="text-2xl font-bold">{Math.round(stats.happiness)}%</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-destructive/5 to-destructive/10 hover:scale-105 transition-transform">
                        <div className="flex items-center gap-3">
                          <Brain className="w-8 h-8 text-destructive" />
                          <div>
                            <p className="text-sm text-muted-foreground">Стрес</p>
                            <p className="text-2xl font-bold">{Math.round(stats.stress)}%</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nickname">Нікнейм</Label>
                        <Input
                          id="nickname"
                          value={editNickname}
                          onChange={(e) => setEditNickname(e.target.value)}
                          placeholder="Твій нік"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Статус</Label>
                        <Input
                          id="status"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          placeholder="Короткий підпис"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="faculty">Факультет</Label>
                        <Input
                          id="faculty"
                          value={editFaculty}
                          onChange={(e) => setEditFaculty(e.target.value)}
                          placeholder="Наприклад: ІКНІ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="group">Група</Label>
                        <Input
                          id="group"
                          value={editGroup}
                          onChange={(e) => setEditGroup(e.target.value)}
                          placeholder="Наприклад: КН-31"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Біо</Label>
                      <Textarea
                        id="bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Розкажи про себе..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social">Соцмережі</Label>
                      <Input
                        id="social"
                        value={editSocial}
                        onChange={(e) => setEditSocial(e.target.value)}
                        placeholder="@username або посилання"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Зберегти зміни
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Скасувати
                      </Button>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Остання активність
                  </h3>
                  <div className="space-y-3">
                    {completedEvents.slice(-3).map((event, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Завершено подію</p>
                          <p className="text-sm text-muted-foreground">{event}</p>
                        </div>
                      </div>
                    ))}
                    {completedEvents.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Поки немає активності...</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Загальний рівень</h3>
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary">{stats.level}</p>
                <Progress value={expPercentage} className="h-2 mt-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.experience} / {stats.experienceToNext} XP
                </p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Загальні гроші</h3>
                  <Coins className="w-6 h-6 text-accent-foreground" />
                </div>
                <p className="text-4xl font-bold text-accent-foreground">{stats.money + stats.bankBalance}</p>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <p>Готівка: {stats.money} грн</p>
                  <p>В банку: {stats.bankBalance} грн</p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Час у грі</h3>
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-4xl font-bold text-secondary">{Math.floor(gameState.totalPlayTime / 60)}</p>
                <p className="text-sm text-muted-foreground mt-2">хвилин</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Зіграно ігор</h3>
                  <Trophy className="w-6 h-6 text-warning" />
                </div>
                <p className="text-4xl font-bold text-warning">{totalGamesPlayed}</p>
                <p className="text-sm text-muted-foreground mt-2">міні-ігор завершено</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Подій завершено</h3>
                  <Target className="w-6 h-6 text-success" />
                </div>
                <p className="text-4xl font-bold text-success">{completedEvents.length}</p>
                <p className="text-sm text-muted-foreground mt-2">унікальних подій</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Досягнення</h3>
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-4xl font-bold text-purple-500">{achievements.length}</p>
                <p className="text-sm text-muted-foreground mt-2">отримано нагород</p>
              </Card>
            </div>

            {/* Mini-game High Scores */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Рекорди міні-ігор</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">Кафе</p>
                      <p className="text-sm text-muted-foreground">Рекорд очок</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{gameState.minigameHighScores?.cafe || 0}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold">Бібліотека</p>
                      <p className="text-sm text-muted-foreground">Рекорд очок</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{gameState.minigameHighScores?.library || 0}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-bold">Пакунки</p>
                      <p className="text-sm text-muted-foreground">Рекорд очок</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{gameState.minigameHighScores?.carePackages || 0}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Мої Досягнення
              </h3>
              {achievements.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement, i) => (
                    <Card
                      key={i}
                      className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 hover:scale-105 transition-transform animate-bounce-in"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{achievement}</p>
                          <p className="text-xs text-muted-foreground">Отримано</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-bold mb-2">Поки немає досягнень</p>
                  <p className="text-muted-foreground">Грай у міні-ігри та виконуй квести, щоб отримати нагороди!</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Налаштування профілю
              </h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Аватар</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl shadow-lg">
                      {selectedAvatar.emoji}
                    </div>
                    <Button onClick={() => setAvatarDialogOpen(true)}>
                      <Camera className="w-4 h-4 mr-2" />
                      Змінити аватар
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-bold">Звук</p>
                      <p className="text-sm text-muted-foreground">Звукові ефекти в грі</p>
                    </div>
                    <div className="text-sm font-medium">
                      {gameState.settings?.soundEnabled ? "Увімкнено" : "Вимкнено"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-bold">Музика</p>
                      <p className="text-sm text-muted-foreground">Фонова музика</p>
                    </div>
                    <div className="text-sm font-medium">
                      {gameState.settings?.musicEnabled ? "Увімкнено" : "Вимкнено"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-bold">Мова</p>
                      <p className="text-sm text-muted-foreground">Українська</p>
                    </div>
                    <div className="text-sm font-medium">UA</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-bold">Якість графіки</p>
                      <p className="text-sm text-muted-foreground">Висока</p>
                    </div>
                    <div className="text-sm font-medium capitalize">{gameState.settings?.graphicsQuality}</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Avatar Selection Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Обери свій аватар</DialogTitle>
            <DialogDescription>Вибери аватар, який найбільше тобі підходить</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 py-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.id)}
                className={`aspect-square rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 flex flex-col items-center justify-center gap-2 p-3 transition-all hover:scale-110 ${
                  gameState.skin === avatar.id ? "ring-4 ring-primary scale-105" : ""
                }`}
              >
                <span className="text-4xl">{avatar.emoji}</span>
                <span className="text-xs font-medium text-center">{avatar.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <QrCode className="w-6 h-6 text-primary" />
              QR-код мого ID
            </DialogTitle>
            <DialogDescription>Інші гравці можуть відсканувати цей код щоб додати тебе в друзі</DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-64 h-64 rounded-3xl bg-white p-4 shadow-2xl flex items-center justify-center border-2 border-primary/20">
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-primary/30" />
                  </div>
                  <p className="font-mono text-sm font-bold text-primary">{gameState.playerId}</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl opacity-50 -z-10" />
            </div>

            <div className="w-full space-y-2">
              <Button onClick={handleCopyId} className="w-full rounded-full" size="lg">
                <Copy className="w-4 h-4 mr-2" />
                Копіювати ID
              </Button>
              <p className="text-xs text-center text-muted-foreground">Твій унікальний код: {gameState.playerId}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
