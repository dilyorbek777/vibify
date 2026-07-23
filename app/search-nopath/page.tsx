'use client'

import { useState, useEffect } from 'react'
import { themes } from '@/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from '@/contexts/theme-context'
import { searchSongs, formatShazamTrack } from '@/lib/shazam-api'
import { Search, Play, Clock, AlertCircle, Music, Compass, Moon, Sun } from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  artist: string
  album: string
  duration: string
  image: string
  url?: string
  coverArt?: string
}

export default function SearchPage() {
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const tracks = await searchSongs(searchQuery, 10)
        const formattedResults = tracks.map((track: any) => formatShazamTrack(track))
        setResults(formattedResults)
      } catch (err) {
        setError('Failed to fetch search results. Please try again.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 400)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black">
              V
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight hidden sm:inline">
              vibify<span className="text-primary">.</span>
            </span>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Artists, songs, or playlists"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-muted/50 border-border/50 focus-visible:ring-primary/50 transition-all rounded-full h-10"
            />
          </div>

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

      {/* Main Container Area */}
      <main className="max-w-5xl mx-auto p-6 md:p-8">
        {searchQuery ? (
          <div>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 bg-muted/60 mb-6" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-4 flex-1">
                      <Skeleton className="h-12 w-12 rounded-md bg-muted/60" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4 bg-muted/60" />
                        <Skeleton className="h-3 w-1/3 bg-muted/40" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-10 bg-muted/40" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4 stroke-[1.5]" />
                <h3 className="text-xl font-bold tracking-tight mb-1">Search Error</h3>
                <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase px-4">
                  <div className="flex items-center gap-4">
                    <span>#</span>
                    <span>Title</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  {results.map((song, index) => (
                    <div
                      key={song.id}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-card/60 transition-colors duration-150 cursor-pointer px-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-4 text-center text-sm font-medium text-muted-foreground shrink-0 flex items-center justify-center">
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play className="hidden group-hover:block h-3.5 w-3.5 text-primary fill-current" />
                        </div>

                        {/* Normalized Cover Image Rendering Logic */}
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner border border-border/10">
                          {song.coverArt ? (
                            <img 
                              src={song.coverArt} 
                              alt={song.name} 
                              className="object-cover h-full w-full"
                              loading="lazy"
                              onError={(e) => {
                                // Strip fallback source dynamically if link structure expires
                                e.currentTarget.style.display = 'none';
                                const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (sibling) sibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
                            style={{ display: song.coverArt ? 'none' : 'flex' }}
                          >
                            <Music className="h-5 w-5 opacity-60" />
                          </div>
                        </div>

                        <div className="overflow-hidden pr-4">
                          <h4 className="font-semibold text-sm tracking-tight truncate text-foreground group-hover:text-primary transition-colors">
                            {song.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {song.artist} <span className="text-muted-foreground/40 mx-1">•</span> {song.album}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                        {song.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Music className="h-12 w-12 text-muted-foreground/40 mb-4 stroke-[1.5]" />
                <h3 className="text-xl font-bold tracking-tight mb-1">No results found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We couldn't find anything matching "{searchQuery}". Check your spelling or try another term.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mb-6 border border-border/10">
              <Compass className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-1">Discover your next sound</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Search for tracks, creators, and albums across the Vibify ecosystem.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
