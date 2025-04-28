"use client"

import * as React from "react"
import { useCallback, useRef } from "react"

const UPDATE_INTERVAL = 4000

type ToastActionElement = React.ReactNode & React.RefAttributes<HTMLButtonElement>

export interface ToastProps {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  type?: "default" | "destructive"
  className?: string
}

const ToastContext = React.createContext<{
  addToast: (toast: ToastProps) => void
  updateToast: (toast: ToastProps) => void
  removeToast: (toastId: string) => void
  toasts: ToastProps[]
}>(null as any)

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])
  const idRef = useRef(0)

  const addToast = useCallback((toast: ToastProps) => {
    const id = String(idRef.current++)
    setToasts((prev) => [...prev, { id, ...toast }])
  }, [])

  const updateToast = useCallback((toast: ToastProps) => {
    setToasts((prev) => prev.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)))
  }, [])

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  const value = React.useMemo(
    () => ({
      addToast,
      updateToast,
      removeToast,
      toasts,
    }),
    [addToast, updateToast, removeToast, toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export { useToast, ToastProvider }
