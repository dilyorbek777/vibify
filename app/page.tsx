'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Disc, Layers, Music4, Radio, UserStar } from 'lucide-react'
import { searchSongs, formatShazamTrack } from '@/lib/shazam-api'
import { getLikedSongs, getRecentlyListened } from '@/lib/local-storage'
import Link from 'next/link'

// 1. Change this from default export to a regular function named HomeContent
function HomeContent() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([])
  const [likedSongs, setLikedSongs] = useState<any[]>([])

  useEffect(() => {
    setSearchQuery(queryParam)
  }, [queryParam])

  useEffect(() => {
    setRecentlyPlayed(getRecentlyListened())
    setLikedSongs(getLikedSongs())
  }, [])

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

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  return (
    // 2. Remove the <Suspense> tags from here entirely
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-12 pb-24">
        {/* ... All your JSX remains exactly identical here ... */}
        {/* Search Results, Favorites, Recently Played, Explore Genres */}
        <p>
          Check out our <Link href="/hover-anim" className="text-primary hover:underline font-semibold bg-primary/30 px-4 py-1 rounded-xl">Hover Animation Page</Link>
        </p>
      </main>
    </div>
  )
}

// 3. Create the clean default export wrapper at the bottom
export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Vibify...</div>}>
      <HomeContent />
    </Suspense>
  )
}