'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Disc, Layers, Music4, Radio, UserStar } from 'lucide-react'
import { searchSongs, formatShazamTrack } from '@/lib/shazam-api'
import { getLikedSongs, getRecentlyListened } from '@/lib/local-storage'
import Link from 'next/link'


export default function Home() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([])
  const [likedSongs, setLikedSongs] = useState<any[]>([])

  // Update searchQuery when URL parameter changes
  useEffect(() => {
    setSearchQuery(queryParam)
  }, [queryParam])

  // Load recently played from localStorage
  useEffect(() => {
    setRecentlyPlayed(getRecentlyListened())
    setLikedSongs(getLikedSongs())
  }, [])

  // const featuredPlaylists = [
  //   { id: 1, name: "Today's Top Hits", description: 'The hottest tracks right now', image: '🎵' },
  //   { id: 2, name: 'Chill Vibes', description: 'Relax and unwind', image: '🌊' },
  //   { id: 3, name: 'Workout Mix', description: 'Get pumped up', image: '💪' },
  //   { id: 4, name: 'Focus Flow', description: 'Concentration boost', image: '🧠' },
  // ]

  // Debounced search function
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const tracks = await searchSongs(query, 8)
      const formattedTracks = tracks.map(formatShazamTrack)
      setSearchResults(formattedTracks)
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Failed to search. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
     

      {/* Main Layout View */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-12 pb-24">
        
        {/* Search Results Section */}
        {searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {searchError ? searchError : searchResults.length > 0 ? `Found ${searchResults.length} songs` : ''}
                </p>
              </div>
            </div>
            
            {isSearching ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card/30 border border-border/10 p-3 rounded-xl flex items-center gap-4">
                    <div className="h-14 w-14 rounded-md bg-muted/60 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted/60 rounded animate-pulse" />
                      <div className="h-3 bg-muted/60 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {searchResults.map((track) => (
                  <Link
                    key={track.id}
                    href={`/music/${track.id}`}
                    className="group bg-card/30 hover:bg-card/70 border border-border/10 p-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200"
                  >
                    <div className="h-14 w-14 rounded-md bg-muted/60 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-95 transition-transform duration-200 overflow-hidden">
                      {track.coverArt ? (
                        <img src={track.coverArt} alt={track.name} className="w-full h-full object-cover" />
                      ) : (
                        track.image
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                        {track.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchError ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{searchError}</p>
              </div>
            ) : null}
          </section>
        )}

        <p>
          Check out our <Link href="/hover-anim" className="text-primary hover:underline font-semibold bg-primary/30 px-4 py-1 rounded-xl">Hover Animation Page</Link>
        </p>
        
        {/* Featured Playlists Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Your Favorites</h2>
              <p className="text-sm text-muted-foreground">Your favorite songs and playlists.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {likedSongs.map(playlist => (
              <Card
                key={playlist.id}
                className="group relative overflow-hidden border-none bg-card/30 hover:bg-card/70 transition-all duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-4"
              >
                <div className="aspect-square w-full bg-muted/40 rounded-lg flex items-center justify-center text-5xl relative shadow-md">
                  <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
                  
                  {/* Floating Action Play Button (Shadcn/Spotify signature element) */}
                  <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 scale-90 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                    <Button asChild size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform">
                      <Link href={`/music/${playlist.id}`}>
                        <Play className="h-5 w-5 fill-current" />
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1.5 px-1">
                  <CardTitle className="text-base font-bold tracking-tight line-clamp-1">{playlist.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {playlist.description} <span className="text-primary flex items-center justify-start gap-2"><UserStar size={18} /> {playlist.artist}</span> 
                  </CardDescription>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Recently Played Grid List */}
        {recentlyPlayed.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Recently Played</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recentlyPlayed.map(track => (
                <Link
                  key={track.id}
                  href={`/music/${track.id}`}
                  className="group bg-card/30 hover:bg-card/70 border border-border/10 p-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200"
                >
                  <div className="h-14 w-14 rounded-md bg-muted/60 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-95 transition-transform duration-200 overflow-hidden">
                    {track.coverArt?.startsWith('http') ? (
                      <img src={track.coverArt} alt={track.name} className="w-full h-full object-cover" />
                    ) : (
                      track.image
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                      {track.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Categories Menu */}
        <section className='pb-18'>
          <div className="flex items-center gap-2 mb-6 ">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Explore Genres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Jazz', 'Classical', 'Country'].map((genre, index) => (
              <Button
                key={genre}
                variant="outline"
                className="h-14 w-full justify-start px-4 border-border/40 bg-card/20 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all duration-200 group rounded-xl"
              >
                <span className="text-xs font-semibold tracking-wide">{genre}</span>
              </Button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}