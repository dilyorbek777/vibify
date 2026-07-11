'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Disc, Layers, Music4, Radio, UserStar, Heart, Plus } from 'lucide-react'
import { searchSongs, formatShazamTrack } from '@/lib/shazam-api'
import { getLikedSongs, getRecentlyListened, getPlaylists, createPlaylist } from '@/lib/local-storage'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import Link from 'next/link'
import BackgroundPattern from '@/components/BackgroundPattern'

// 1. Change this from default export to a regular function named HomeContent
function HomeContent() {
  const searchParams = useSearchParams()
  const { playPlaylist, isPlaying, currentSong } = useMusicPlayer()
  const queryParam = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([])
  const [likedSongs, setLikedSongs] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  useEffect(() => {
    setSearchQuery(queryParam)
  }, [queryParam])

  useEffect(() => {
    setRecentlyPlayed(getRecentlyListened())
    setLikedSongs(getLikedSongs())
    setPlaylists(getPlaylists())
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

  const handlePlayLikedSongs = useCallback(() => {
    if (likedSongs.length === 0) return

    const songs = likedSongs.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.artist,
      album: song.album,
      image: song.image,
      totalSeconds: 0, // Will be updated by audio duration
    }))

    const urls = likedSongs.map(song => song.musicUrl)
    playPlaylist(songs, urls)
  }, [likedSongs, playPlaylist])

  const handleCreatePlaylist = useCallback(() => {
    const name = newPlaylistName.trim() || undefined
    const newPlaylist = createPlaylist(name)
    setPlaylists([...playlists, newPlaylist])
    setNewPlaylistName('')
    setShowCreatePlaylist(false)
  }, [newPlaylistName, playlists])

  const isPlaylistPlaying = (playlist: any) => {
    if (!isPlaying || !currentSong) return false
    return playlist.songs.some((song: any) => song.id === currentSong.id)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  return (
    // 2. Remove the <Suspense> tags from here entirely
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
      <BackgroundPattern />



      {/* Main Layout View */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 md:space-y-12 z-100 pb-20 md:pb-24">

        {/* Search Results Section */}
        {searchQuery && (
          <section className='z-10 relative'>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight font-heading">
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
                      <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors font-heading">
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No music found for "{searchQuery}"</p>
              </div>
            )}
          </section>
        )}


        {/* Playlists Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight font-heading">Your Playlists</h2>
              <p className="text-sm text-muted-foreground max-md:hidden">Create and manage your playlists.</p>
            </div>
            <Button onClick={() => setShowCreatePlaylist(true)} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </div>

          {showCreatePlaylist && (
            <div className="mb-6 p-4 bg-card/30 border border-border/30 rounded-xl">
              <input
                type="text"
                placeholder="Playlist name (optional)"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full bg-background border border-border/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreatePlaylist} size="sm" className="cursor-pointer">
                  Create
                </Button>
                <Button onClick={() => setShowCreatePlaylist(false)} variant="outline" size="sm" className="cursor-pointer">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {playlists.length === 0 ? (
            <div className="text-center py-12 bg-card/20 border border-border/10 rounded-xl">
              <p className="text-muted-foreground mb-2">No playlists yet</p>
              <p className="text-sm text-muted-foreground/60 ">Create your first playlist to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {playlists.slice(-4).reverse().map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/myplaylists/${playlist.id}`}
                  className="group relative overflow-hidden border-none bg-primary/10 hover:bg-primary/40 rounded-full transition-all duration-300 w-[150px] h-[150px] cursor-pointer p-4 flex flex-col gap-4"
                >
                  <div className={`aspect-square overflow-hidden  w-full relative bg-background/80 border-primary border-2 rounded-full flex items-center justify-center text-5xl relative shadow-md ${isPlaylistPlaying(playlist) ? 'animate-spin ' : ''}`} style={isPlaylistPlaying(playlist) ? { animationDuration: '3s' } : undefined}>
                    {playlist.songs.length > 0 && playlist.songs[0].image?.startsWith('http') ? (
                      <img src={playlist.songs[0].image} alt={playlist.name} className="w-full absolute h-full object-cover" />
                    ) : (
                      <Music4 size={55} className='text-primary' />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 rounded-b-full backdrop-blur-sm p-2 text-center">
                      <CardTitle className="text-sm font-bold tracking-tight line-clamp-1 font-heading text-white">{playlist.name}</CardTitle>
                      <CardDescription className="text-xs text-white/80 line-clamp-1 leading-relaxed">
                        {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                      </CardDescription>
                    </div>
                  </div>
                  
                </Link >
              ))}

              <Link
                key={"playlists"}
                href={`/myplaylists`}
                className="group relative overflow-hidden border-none bg-primary/10 hover:bg-primary/40 rounded-full transition-all duration-300 w-[150px] h-[150px] cursor-pointer p-4 flex flex-col gap-4"
              >
                <div className={`aspect-square w-full bg-background/80 border-primary border-2 rounded-full flex items-center justify-center text-5xl relative shadow-md `}>


                  <div className="space-y-1.5 px-1">
                    <CardTitle className="text-base font-bold tracking-tight line-clamp-1 font-heading">See all</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      My playlists
                    </CardDescription>
                  </div>

                </div>
              </Link >
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight font-heading">Your Favorites</h2>
              <p className="text-sm text-muted-foreground max-md:hidden">Your favorite songs and playlists.</p>
            </div>
            <Button
              onClick={handlePlayLikedSongs}
              disabled={likedSongs.length === 0 || isPlaying}
              className="cursor-pointer"
            >
              <Play className="h-4 w-4 mr-2" />
              {isPlaying ? 'Playing...' : 'Play Liked Songs'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card
              key={"Liked"}
              className="group relative overflow-hidden border-none bg-card/30 hover:bg-card/70 transition-all duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-4"
            >
              <div className="aspect-square w-full bg-muted/40 rounded-lg flex items-center justify-center text-5xl relative shadow-md">
                {/* <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" /> */}
                <Heart size={55} className='text-primary bg-background border-2 border-primary p-2 rounded-full' />
                {/* Floating Action Play Button (Shadcn/Spotify signature element) */}
                <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 scale-90 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                  <Button asChild size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform">
                    <Link href={`/liked`}>
                      <Play className="h-5 w-5 fill-current" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 px-1">
                <CardTitle className="text-base font-bold tracking-tight line-clamp-1 font-heading">Play your favorite songs</CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {/* {playlist.description} <span className="text-primary flex items-center justify-start gap-2"><UserStar size={18} /> {playlist.artist}</span> */}
                  <p><label htmlFor=""></label></p>
                </CardDescription>
              </div>
            </Card>
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
                  <CardTitle className="text-base font-bold tracking-tight line-clamp-1 font-heading">{playlist.name}</CardTitle>
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
          <section className='z-10'>
            <h2 className="text-2xl font-bold tracking-tight mb-6 font-heading">Recently Played</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recentlyPlayed.slice(0, 7).map(track => (
                <Link
                  key={track.id}
                  href={`/music/${track.id}`}
                  className="group bg-card/30 z-10 hover:bg-card/70 border border-border/10 p-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200"
                >
                  <div className="h-14 w-14 rounded-md bg-muted/60 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-95 transition-transform duration-200 overflow-hidden">
                    {track.coverArt?.startsWith('http') ? (
                      <img src={track.coverArt} alt={track.name} className="w-full h-full object-cover" />
                    ) : (
                      track.image
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors font-heading">
                      {track.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                </Link>
              ))}
              {recentlyPlayed.length > 7 && (
                <Link
                  href="/recents"
                  className="group bg-card/30 hover:bg-card/70 border border-border/10 p-3 rounded-xl flex items-center justify-start gap-4 cursor-pointer transition-all duration-200"
                >
                  <div className="h-14 w-14 rounded-md bg-muted/60 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-95 transition-transform duration-200">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors font-heading">
                      View All
                    </h4>
                    <p className="text-xs text-muted-foreground">{recentlyPlayed.length} songs</p>
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Categories Menu */}
        <section className='pb-18 z-10 relative'>
          <div className="flex items-center gap-2 mb-6 ">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight font-heading">Explore Genres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Jazz', 'Classical', 'Country'].map((genre, index) => (
              <Button
                key={genre}
                variant="outline"
                className="h-14 w-full justify-start px-4 border-border/40 bg-card/20 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all duration-200 group rounded-xl"
              >
                <span className="text-xs font-semibold tracking-wide font-ui">{genre}</span>
              </Button>
            ))}
            <Link
              href="/hover-anim"
              className="h-14 flex items-center justify-center px-4 border-border/40 bg-primary/10 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all duration-200 group rounded-xl font-semibold text-xs tracking-wide font-ui"
            >
              Hover Demo
            </Link>
          </div>
        </section>
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