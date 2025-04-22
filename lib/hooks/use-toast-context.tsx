"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useToast } from "@/hooks/use-toast"

type ToastContextType = {
  showSuccessToast: (message: string) => void
  showErrorToast: (message: string) => void
  showInfoToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  const showSuccessToast = (message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default",
    })
  }

  const showErrorToast = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  }

  const showInfoToast = (message: string) => {
    toast({
      title: "Info",
      description: message,
    })
  }

  return (
    <ToastContext.Provider value={{ showSuccessToast, showErrorToast, showInfoToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}
