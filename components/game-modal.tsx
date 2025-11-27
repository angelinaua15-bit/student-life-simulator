"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type GameModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message: string
  type?: "info" | "confirm" | "success" | "warning"
  confirmText?: string
  cancelText?: string
}

export function GameModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Скасувати",
}: GameModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅"
      case "warning":
        return "⚠️"
      case "confirm":
        return "❓"
      default:
        return "ℹ️"
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return "text-success"
      case "warning":
        return "text-warning"
      case "confirm":
        return "text-primary"
      default:
        return "text-secondary"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-card/95 border-2 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{getIcon()}</span>
            <DialogTitle className={`text-2xl font-black ${getColors()}`}>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base text-foreground/90 leading-relaxed">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          {type === "confirm" && onConfirm ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 text-base font-semibold bg-transparent hover:bg-muted"
              >
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="flex-1 h-11 text-base font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
