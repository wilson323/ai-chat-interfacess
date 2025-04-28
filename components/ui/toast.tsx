"use client"

import {
  Toast as ShadcnToast,
  ToastClose as ShadcnToastClose,
  ToastDescription as ShadcnToastDescription,
  ToastProvider as ShadcnToastProvider,
  ToastTitle as ShadcnToastTitle,
  ToastViewport as ShadcnToastViewport,
} from "@radix-ui/react-toast"

import { useToast as useToastHooks } from "@/hooks/use-toast"

export {
  ShadcnToast as Toast,
  ShadcnToastClose as ToastClose,
  ShadcnToastDescription as ToastDescription,
  ShadcnToastProvider as ToastProvider,
  ShadcnToastTitle as ToastTitle,
  ShadcnToastViewport as ToastViewport,
  useToastHooks as useToast,
}
