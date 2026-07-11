'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun, Search, Clock, X } from "lucide-react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { themes } from "@/constants"
import { useTheme } from "@/contexts/theme-context"
import Link from "next/link"
import { getSearchHistory, addSearchToHistory } from "@/lib/local-storage"

const Navbar = () => {
  const router = useRouter()
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addSearchToHistory(searchQuery.trim())
      setSearchHistory(getSearchHistory())
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query)
    addSearchToHistory(query)
    setSearchHistory(getSearchHistory())
    router.push(`/?q=${encodeURIComponent(query)}`)
    setShowDropdown(false)
  }

  return (
    <>
     <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-4 gap-4">
          {/* Logo */}
          <Link href="/" className="hidden max-md:flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black">
              V
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-heading">
              vibify<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Search Bar Wrapper */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
            <form onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-9 bg-muted/50 border-border/50 focus-visible:ring-primary/50 transition-all rounded-full"
              />
            </form>

            {/* Search History Dropdown */}
            {showDropdown && searchHistory.length > 0 && (
              <div className="absolute bg-background/60 backdrop-blur-xl top-full left-0 right-0 mt-2 border border-border/60 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-2 space-y-1 bg-background/60 backdrop-blur-xl">
                  {searchHistory.slice(0, 7).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(query)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{query}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Select
              value={theme.id}
              onValueChange={(value) => setTheme(themes.find(t => t.id === value) || themes[0])}
            >
              <SelectTrigger className="w-[120px] bg-muted/40 border-border/50 rounded-full h-9 text-xs font-medium font-heading">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="border-border/60 bg-popover">
                {themes.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs font-ui">
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full h-9 w-9 border border-border/40 hover:bg-muted"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar