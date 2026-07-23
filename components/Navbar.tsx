'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun, Search, Music, Play, User } from "lucide-react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { themes } from "@/constants"
import { useTheme } from "@/contexts/theme-context"
import Link from "next/link"
import { MusicDetectButton } from "./MusicDetectButton"
import { searchSongs, formatShazamTrack, formatShazamArtist } from "@/lib/shazam-api"

const Navbar = () => {
  const router = useRouter()
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
    }
  }

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowDropdown(false)
        return
      }

      setIsLoading(true)
      setShowDropdown(true)

      try {
        const results = await searchSongs(searchQuery, 5)
        const formattedResults = results.map((result: any) => {
          if (result.type === 'song') {
            return { ...formatShazamTrack(result.data), type: 'song' }
          } else if (result.type === 'artist') {
            return { ...formatShazamArtist(result.data), type: 'artist' }
          }
          return null
        }).filter(Boolean)
        setSearchResults(formattedResults)
      } catch (err) {
        console.error(err)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 400)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
     <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-4 gap-4">
          {/* Logo */}
          <Link href="/" className="hidden max-md:flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black">
              V
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-sans">
              vibify<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Search Bar Wrapper */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
            <form onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Artists, songs, or playlists"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 bg-muted/50 border-border/50 focus-visible:ring-primary/50 transition-all rounded-full h-10"
              />
            </form>

            {/* Search Results Dropdown */}
            {showDropdown && searchQuery.length >= 2 && (
              <div className="absolute bg-background backdrop-blur-xl top-full left-0 right-0 mt-2 border border-border/60 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted/60 animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-1/3 bg-muted/60 rounded animate-pulse" />
                          <div className="h-2 w-1/4 bg-muted/40 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {searchResults.map((item, index) => (
                      <button
                        key={item.id || index}
                        onClick={() => {
                          if (item.type === 'song') {
                            router.push(`/?q=${encodeURIComponent(item.name + ' ' + item.artist)}`)
                          } else {
                            router.push(`/artist/${item.id}`)
                          }
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0 relative border border-border/10">
                          {item.type === 'artist' ? (
                            item.image && item.image !== '🎤' ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="object-cover h-full w-full"
                                loading="lazy"
                              />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground/60" />
                            )
                          ) : item.coverArt ? (
                            <img 
                              src={item.coverArt} 
                              alt={item.name} 
                              className="object-cover h-full w-full"
                              loading="lazy"
                            />
                          ) : (
                            <Music className="h-4 w-4 text-muted-foreground/60" />
                          )}
                        </div>
                        <div className="overflow-hidden flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.type === 'artist' ? 'Artist' : item.artist}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <MusicDetectButton />
            
            <Select
              value={theme.id}
              onValueChange={(value) => setTheme(themes.find(t => t.id === value) || themes[0])}
              
            >
              <SelectTrigger className="w-[120px] bg-muted/40 border-border/50 rounded-full h-9 text-xs font-medium font-sans">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="border-border/60 bg-popover bg-background">
                {themes.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs font-sans">
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
