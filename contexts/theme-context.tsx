'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { themes, Theme } from '@/constants'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. Initialize with safe fallback defaults
  const [theme, setThemeState] = useState<Theme>(themes[0])
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  // 2. Read from localStorage once the component safely mounts on the client
  useEffect(() => {
    const savedThemeId = localStorage.getItem('vibify-theme-id')
    const savedDarkMode = localStorage.getItem('vibify-dark-mode')

    if (savedThemeId) {
      const foundTheme = themes.find((t) => t.id === savedThemeId)
      if (foundTheme) setThemeState(foundTheme)
    }

    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === 'true')
    } else {
      // If no saved preference, fall back to system settings
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(systemPrefersDark)
    }

    setIsHydrated(true)
  }, [])

  // 3. Keep CSS variables and HTML classes updated when state changes
  useEffect(() => {
    if (!isHydrated) return // Prevent executing code on server-side compilation passes

    const root = document.documentElement
    const colors = isDarkMode ? theme.dark : theme.light

    // Inject custom palette token variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Synchronize Tailwind variant classes
    root.classList.remove('light', 'dark')
    root.classList.add(isDarkMode ? 'dark' : 'light')
  }, [theme, isDarkMode, isHydrated])

  // 4. Intercept setters to seamlessly cache variations locally
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('vibify-theme-id', newTheme.id)
  }

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const nextState = !prev
      localStorage.setItem('vibify-dark-mode', String(nextState))
      return nextState
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      {/* CRITICAL FIX: Keep children nested inside the Provider at all times 
        so useTheme() doesn't throw errors during the hydration phase.
      */}
      <div className={isHydrated ? "" : "invisible"}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
