"use client"

import * as React from "react"
import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  type?: "default" | "destructive" | "success" | "warning"
  className?: string
}

export function useToast() {
  const addToast = React.useCallback((toast: ToastProps) => {
    if (toast.type === "destructive") {
      sonnerToast.error(toast.title as string, {
        description: toast.description as string,
        duration: toast.duration || 4000,
      })
    } else if (toast.type === "success") {
      sonnerToast.success(toast.title as string, {
        description: toast.description as string,
        duration: toast.duration || 4000,
      })
    } else if (toast.type === "warning") {
      sonnerToast.warning(toast.title as string, {
        description: toast.description as string,
        duration: toast.duration || 4000,
      })
    } else {
      sonnerToast(toast.title as string, {
        description: toast.description as string,
        duration: toast.duration || 4000,
      })
    }
  }, [])

  return {
    toast: addToast,
  }
}