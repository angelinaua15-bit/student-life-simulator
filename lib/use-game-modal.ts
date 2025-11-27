"use client"

import { create } from "zustand"

type ModalState = {
  isOpen: boolean
  title: string
  message: string
  type: "info" | "confirm" | "success" | "warning"
  confirmText: string
  cancelText: string
  onConfirm?: () => void
  onClose?: () => void
}

type ModalStore = ModalState & {
  showModal: (props: Partial<ModalState>) => void
  showAlert: (message: string, title?: string) => void
  showConfirm: (message: string, onConfirm: () => void, title?: string) => Promise<boolean>
  showSuccess: (message: string, title?: string) => void
  hideModal: () => void
}

export const useGameModal = create<ModalStore>((set, get) => ({
  isOpen: false,
  title: "",
  message: "",
  type: "info",
  confirmText: "OK",
  cancelText: "Скасувати",
  onConfirm: undefined,
  onClose: undefined,

  showModal: (props) => {
    set({
      isOpen: true,
      title: props.title || "",
      message: props.message || "",
      type: props.type || "info",
      confirmText: props.confirmText || "OK",
      cancelText: props.cancelText || "Скасувати",
      onConfirm: props.onConfirm,
      onClose: props.onClose,
    })
  },

  showAlert: (message, title = "Повідомлення") => {
    set({
      isOpen: true,
      title,
      message,
      type: "info",
      confirmText: "OK",
      cancelText: "Скасувати",
      onConfirm: undefined,
      onClose: undefined,
    })
  },

  showConfirm: (message, onConfirm, title = "Підтвердження") => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        type: "confirm",
        confirmText: "Так",
        cancelText: "Скасувати",
        onConfirm: () => {
          onConfirm()
          resolve(true)
        },
        onClose: () => {
          resolve(false)
        },
      })
    })
  },

  showSuccess: (message, title = "Успіх!") => {
    set({
      isOpen: true,
      title,
      message,
      type: "success",
      confirmText: "Чудово!",
      cancelText: "Скасувати",
      onConfirm: undefined,
      onClose: undefined,
    })
  },

  hideModal: () => {
    const state = get()
    if (state.onClose) {
      state.onClose()
    }
    set({
      isOpen: false,
      onConfirm: undefined,
      onClose: undefined,
    })
  },
}))
