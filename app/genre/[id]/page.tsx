'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { searchSongs, formatShazamTrack } from '@/lib/shazam-api'
import { getGenreSongs, addGenreSongs } from '@/lib/local-storage'
import Link from 'next/link'
import BackgroundPattern from '@/components/BackgroundPattern'
import { Layers, Loader2 } from 'lucide-react'

const SONGS_PER_FETCH = 5
const MAX_SONGS = 25

export default function GenrePage() {
  const params = useParams()
  const genre = decodeURIComponent(params.id as string)
  const [songs, setSongs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format genre name for display (capitalize first letter)
  const displayGenre = genre.charAt(0).toUpperCase() + genre.slice(1)

  const fetchSongsFromAPI = useCallback(async (offset: number = 0) => {
    try {
      const tracks = await searchSongs(`${genre} music`, SONGS_PER_FETCH, offset)
      const formattedTracks = tracks.map((track: any) => formatShazamTrack(track))
      return formattedTracks
    } catch (error) {
      console.error('Error fetching genre songs:', error)
      throw error
    }
  }, [genre])

  const loadMoreSongs = useCallback(async () => {
    if (songs.length >= MAX_SONGS || isLoadingMore) return

    setIsLoadingMore(true)
    setError(null)

    try {
      const offset = songs.length
      console.log(`Loading more songs with offset: ${offset}, limit: ${SONGS_PER_FETCH}`)
      const newSongs = await fetchSongsFromAPI(offset)
      console.log(`Fetched ${newSongs.length} songs`)
      addGenreSongs(genre, newSongs)
      setSongs(prev => [...prev, ...newSongs])
    } catch (error) {
      setError('Failed to load more songs. Please try again.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [songs.length, genre, fetchSongsFromAPI, isLoadingMore])

  useEffect(() => {
    const loadInitialSongs = async () => {
      setIsLoading(true)
      setError(null)

      // Check localStorage first
      const cachedSongs = getGenreSongs(genre)
      
      if (cachedSongs.length > 0) {
        setSongs(cachedSongs)
        setIsLoading(false)
        
        // If we have less than 25 songs, fetch more
        if (cachedSongs.length < MAX_SONGS) {
          try {
            const newSongs = await fetchSongsFromAPI(cachedSongs.length)
            addGenreSongs(genre, newSongs)
            setSongs([...cachedSongs, ...newSongs])
          } catch (error) {
            console.error('Error fetching additional songs:', error)
          }
        }
      } else {
        // No cached songs, fetch initial batch
        try {
          const initialSongs = await fetchSongsFromAPI(0)
          addGenreSongs(genre, initialSongs)
          setSongs(initialSongs)
        } catch (error) {
          setError('Failed to load songs. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadInitialSongs()
  }, [genre, fetchSongsFromAPI])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <BackgroundPattern />

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 md:space-y-12 z-100 pb-20 md:pb-24">
        {/* Header */}
        <section className='z-10 relative'>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight font-sans">{displayGenre}</h1>
          </div>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading songs...' : songs.length > 0 ? `${songs.length} songs found` : 'No songs found'}
          </p>
        </section>

        {/* Songs Grid */}
        {isLoading ? (
          <div className="grid z-10 relative grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card/30 border border-border/10 p-3 rounded-xl flex items-center gap-4">
                <div className="h-14 w-14 rounded-md bg-muted/60 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/60 rounded animate-pulse" />
                  <div className="h-3 bg-muted/60 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 cursor-pointer">
              Retry
            </Button>
          </div>
        ) : songs.length > 0 ? (
          <>
            <div className="grid z-10 relative grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {songs.map((track) => (
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
                    <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors font-sans">
                      {track.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {songs.length < MAX_SONGS && (
              <div className="flex justify-center pt-8 z-10 relative">
               <Button
                  onClick={loadMoreSongs}
                  disabled={isLoadingMore}
                  className="cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}

            {songs.length >= MAX_SONGS && (
              <div className="text-center pt-8 text-muted-foreground text-sm">
                You've reached the maximum number of songs for this genre.
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No songs found for this genre.</p>
          </div>
        )}
      </main>
    </div>
  )
}
