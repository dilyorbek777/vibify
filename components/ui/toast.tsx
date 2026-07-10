'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from './button'

interface ToastProps {
  message: string
  duration?: number
  onClose?: () => void
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border border-border/40 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
        <Check className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-medium">{message}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleClose}
        className="h-6 w-6 p-0 hover:bg-muted cursor-pointer"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
