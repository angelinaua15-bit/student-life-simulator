"use client"

import { motion } from "framer-motion"
import { User, TrendingUp, Wifi, WifiOff, UserPlus, UserCheck, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PlayerProfile } from "@/lib/friends-system"

interface PlayerCardProps {
  player: PlayerProfile
  onAddFriend?: () => void
  onViewProfile?: () => void
  onRemoveFriend?: () => void
  friendshipLevel?: number
  showAddButton?: boolean
  isFriend?: boolean
  isPending?: boolean
}

export function PlayerCard({
  player,
  onAddFriend,
  onViewProfile,
  onRemoveFriend,
  friendshipLevel,
  showAddButton = true,
  isFriend = false,
  isPending = false,
}: PlayerCardProps) {
  const isOnline = player.is_online
  const lastOnline = player.last_online ? new Date(player.last_online) : null
  const now = new Date()
  const timeDiff = lastOnline ? now.getTime() - lastOnline.getTime() : 0
  const minutesAgo = Math.floor(timeDiff / 60000)
  const hoursAgo = Math.floor(minutesAgo / 60)
  const daysAgo = Math.floor(hoursAgo / 24)

  let onlineStatus = "Офлайн"
  if (isOnline) {
    onlineStatus = "Онлайн"
  } else if (minutesAgo < 5) {
    onlineStatus = "Щойно був"
  } else if (minutesAgo < 60) {
    onlineStatus = `${minutesAgo} хв тому`
  } else if (hoursAgo < 24) {
    onlineStatus = `${hoursAgo} год тому`
  } else if (daysAgo < 7) {
    onlineStatus = `${daysAgo} дн тому`
  }

  const skins: Record<string, string> = {
    default: "bg-gradient-to-br from-blue-400 to-blue-600",
    cool: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    fire: "bg-gradient-to-br from-orange-400 to-red-600",
    nature: "bg-gradient-to-br from-green-400 to-green-600",
    cosmic: "bg-gradient-to-br from-purple-400 to-pink-600",
    golden: "bg-gradient-to-br from-yellow-400 to-orange-500",
    shadow: "bg-gradient-to-br from-gray-600 to-gray-900",
    neon: "bg-gradient-to-br from-lime-400 to-cyan-500",
    sunset: "bg-gradient-to-br from-pink-500 to-orange-500",
    ocean: "bg-gradient-to-br from-blue-500 to-teal-500",
    forest: "bg-gradient-to-br from-emerald-500 to-lime-500",
    royal: "bg-gradient-to-br from-indigo-500 to-purple-600",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group"
    >
      <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity" />

        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`w-16 h-16 rounded-2xl ${skins[player.skin] || skins.default} p-0.5 shadow-lg`}
            >
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1">
              {isOnline ? (
                <div className="relative">
                  <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg" />
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                </div>
              ) : (
                <div className="w-5 h-5 bg-gray-400 rounded-full border-2 border-white dark:border-slate-900 shadow-lg" />
              )}
            </div>
          </div>

          {/* Player info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {player.nickname}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <TrendingUp className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  {player.status} • {player.level} рівень
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">{onlineStatus}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-gray-400" />
                  <span>{onlineStatus}</span>
                </>
              )}
            </div>
            {isFriend && friendshipLevel && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${(friendshipLevel / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-green-600">Рівень {friendshipLevel}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative z-10 flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onViewProfile}
            className="flex-1 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-white/30 hover:bg-white/70 hover:scale-105 transition-all shadow-lg font-bold"
          >
            <Eye className="w-4 h-4 mr-1" />
            Профіль
          </Button>
          {isFriend && onRemoveFriend ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onRemoveFriend}
              className="flex-1 rounded-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 transition-all shadow-lg font-bold text-red-600 dark:text-red-400"
            >
              Видалити
            </Button>
          ) : showAddButton && !isFriend ? (
            <Button
              size="sm"
              onClick={onAddFriend}
              disabled={isPending}
              className="flex-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all shadow-xl font-bold"
            >
              {isPending ? (
                <>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Запит надіслано
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Додати
                </>
              )}
            </Button>
          ) : isFriend ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-700 dark:text-green-300">Друг</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
