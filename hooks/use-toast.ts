"use client"

import { useState } from "react"

export type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    console.log("Toast:", props) // Para debug
    setToasts(prev => [...prev, props])
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== props))
    }, 3000)
  }

  return {
    toast,
    toasts
  }
}
