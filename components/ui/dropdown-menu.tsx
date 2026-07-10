'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './button'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DropdownMenu({ trigger, children, isOpen: controlledIsOpen, onOpenChange }: DropdownMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = onOpenChange || setInternalIsOpen
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border/40 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="py-2">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownMenuHeaderProps {
  children: React.ReactNode
}

export function DropdownMenuHeader({ children }: DropdownMenuHeaderProps) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </div>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className = '' }: DropdownMenuSeparatorProps) {
  return <div className={`my-1 h-px bg-border/40 ${className}`} />
}

interface DropdownMenuItemProps {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function DropdownMenuItem({ onClick, children, className = '', icon }: DropdownMenuItemProps) {
  return (
    <button
      onClick={() => {
        onClick?.()
      }}
      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors flex items-center gap-3 ${className}`}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  )
}
