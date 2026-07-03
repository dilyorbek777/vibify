'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun, Search } from "lucide-react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { themes } from "@/constants"
import { useTheme } from "@/contexts/theme-context"
import Link from "next/link"

const Navbar = () => {
  const router = useRouter()
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
     <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-4 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black">
              V
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              vibify<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Search Bar Wrapper */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-muted/50 border-border/50 focus-visible:ring-primary/50 transition-all rounded-full"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Select
              value={theme.id}
              onValueChange={(value) => setTheme(themes.find(t => t.id === value) || themes[0])}
            >
              <SelectTrigger className="w-[120px] bg-muted/40 border-border/50 rounded-full h-9 text-xs font-medium">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="border-border/60 bg-popover">
                {themes.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
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