"use client"

import * as React from "react"
import {
  Toast as ShadcnToast,
  ToastClose as ShadcnToastClose,
  ToastDescription as ShadcnToastDescription,
  ToastProvider as ShadcnToastProvider,
  ToastTitle as ShadcnToastTitle,
  ToastViewport as ShadcnToastViewport,
} from "@radix-ui/react-toast"

const Toast = React.forwardRef<
  React.ElementRef<typeof ShadcnToast>,
  React.ComponentPropsWithoutRef<typeof ShadcnToast>
>(({ className, ...props }, ref) => {
  return <ShadcnToast ref={ref} className={className} {...props} />
})
Toast.displayName = ShadcnToast.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ShadcnToastClose>,
  React.ComponentPropsWithoutRef<typeof ShadcnToastClose>
>(({ className, ...props }, ref) => {
  return <ShadcnToastClose ref={ref} className={className} {...props} />
})
ToastClose.displayName = ShadcnToastClose.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ShadcnToastDescription>,
  React.ComponentPropsWithoutRef<typeof ShadcnToastDescription>
>(({ className, ...props }, ref) => {
  return <ShadcnToastDescription ref={ref} className={className} {...props} />
})
ToastDescription.displayName = ShadcnToastDescription.displayName

const ToastProvider = ShadcnToastProvider

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ShadcnToastTitle>,
  React.ComponentPropsWithoutRef<typeof ShadcnToastTitle>
>(({ className, ...props }, ref) => {
  return <ShadcnToastTitle ref={ref} className={className} {...props} />
})
ToastTitle.displayName = ShadcnToastTitle.displayName

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ShadcnToastViewport>,
  React.ComponentPropsWithoutRef<typeof ShadcnToastViewport>
>(({ className, ...props }, ref) => {
  return <ShadcnToastViewport ref={ref} className={className} {...props} />
})
ToastViewport.displayName = ShadcnToastViewport.displayName

export { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport }
