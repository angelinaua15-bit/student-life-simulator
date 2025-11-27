"use client"

import { GameModal } from "./game-modal"
import { useGameModal } from "@/lib/use-game-modal"

export function GlobalModalProvider() {
  const { isOpen, title, message, type, confirmText, cancelText, onConfirm, hideModal } = useGameModal()

  return (
    <GameModal
      isOpen={isOpen}
      onClose={hideModal}
      onConfirm={onConfirm}
      title={title}
      message={message}
      type={type}
      confirmText={confirmText}
      cancelText={cancelText}
    />
  )
}
