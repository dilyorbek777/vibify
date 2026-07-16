'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Play, Pause, Check, MoreHorizontal, Users, Radio,
  Disc, Award, Clock, Heart, Share2, Info,
  BadgeCheck
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { isArtistFollowed, toggleFollowArtist } from '@/lib/local-storage'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

interface ArtistClientProps {
  artist: {
    id: string
    name: string
    image: string
    genres: string[]
    url: string
    verified: boolean
  }
  albums: Array<{
    id: string
    name: string
    year: number
    image: string
    artist: string
  }>
  popularSongs: Array<{
    id: string
    name: string
    artist: string
    album: string
    duration: string
    image: string
    url: string
    coverArt: string
  }>
  error: string | null
}

export default function ArtistClient({ artist, albums, popularSongs, error }: ArtistClientProps) {
  const { playPlaylist, togglePlay, isPlaying: globalIsPlaying, currentSong } = useMusicPlayer()
  const [activeTab, setActiveTab] = useState<'songs' | 'albums' | 'about'>('songs')
  const [isFollowing, setIsFollowing] = useState(false)

  // Check if any of the artist's songs are currently playing
  const isArtistPlaying = currentSong && popularSongs.some(song => song.id === currentSong.id)

  const handlePlayArtist = () => {
    if (popularSongs.length === 0) return

    if (isArtistPlaying && globalIsPlaying) {
      // Pause if currently playing this artist
      togglePlay()
    } else {
      // Play the artist's popular songs
      const songs = popularSongs.map(song => ({
        id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        image: song.image,
        totalSeconds: 0, // Will be updated by audio duration
      }))

      // Get preview URLs from the songs
      const urls = popularSongs.map(song => song.url || '').filter(url => url !== '')

      if (urls.length > 0) {
        playPlaylist(songs, urls)
      }
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Error loading artist</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground select-none pb-20 md:pb-24">
      {/* Dynamic Profile Cover Banner */}
      <div className="relative bg-gradient-to-b from-primary/20 via-background/60 to-background overflow-hidden border-b border-border/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-8 md:pb-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 relative z-10">

          {/* Avatar Profile Frame */}
          <div className="h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 rounded-full bg-card border-4 border-background/80 shadow-2xl flex items-center justify-center shrink-0 select-none bg-gradient-to-tr from-muted to-muted/20 overflow-hidden mx-auto md:mx-0">
            {artist.image.startsWith('http') ? (
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[90px]">{artist.image}</span>
            )}
          </div>

          {/* Identity Meta Block */}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0">


            <h1 className="text-3xl sm:text-4xl flex items-center justify-center md:justify-start gap-2 md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-none text-foreground drop-shadow-sm py-1 font-heading text-center md:text-left">
              {artist.name} {artist.verified && (

                <BadgeCheck className='text-primary' size={30} />

              )}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Radio className="h-4 w-4" /> {artist.genres.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Core Menu Controls */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-center md:justify-start gap-3 md:gap-4">
        <Button
          onClick={handlePlayArtist}
          size="lg"
          className="rounded-full h-12 w-12 md:h-14 md:w-14 bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform"
          disabled={popularSongs.length === 0}
        >
          {isArtistPlaying && globalIsPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
        </Button>

        <Button
          variant={isFollowing ? "outline" : "default"}
          onClick={() => {
            toggleFollowArtist({
              id: artist.id,
              name: artist.name,
              image: artist.image,
              genres: artist.genres,
              url: artist.url,
              verified: artist.verified,
              followedAt: Date.now()
            })
            setIsFollowing(!isFollowing)
          }}
          className={`rounded-full px-6 font-bold h-10 border-border/60 transition-all ${isFollowing
            ? 'border-primary/30 bg-primary/5 text-primary'
            : 'bg-foreground text-background hover:bg-foreground/90'
            }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>

        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60 text-muted-foreground hover:text-foreground">
          <Share2 className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Layout Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="bg-muted/40 p-1 border border-border/20 rounded-xl mb-6 md:mb-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="songs" className="rounded-lg px-3 md:px-4 py-2 font-semibold text-xs md:text-sm font-ui whitespace-nowrap">Popular Tracks</TabsTrigger>
            <TabsTrigger value="albums" className="rounded-lg px-3 md:px-4 py-2 font-semibold text-xs md:text-sm font-ui whitespace-nowrap">Albums</TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg px-3 md:px-4 py-2 font-semibold text-xs md:text-sm font-ui whitespace-nowrap">About</TabsTrigger>
          </TabsList>

          {/* Songs Content Grid View */}
          <TabsContent value="songs" className="space-y-4 focus-visible:outline-none">
            <div className="flex items-center justify-between border-b border-border/10 pb-2 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase px-4 font-ui">
              <div className="flex items-center gap-4">
                <span>#</span>
                <span>Title</span>
              </div>
              <div className="flex items-center gap-12">
                <Clock className="h-4 w-4 mr-2" />
              </div>
            </div>

            <div className="space-y-1">
              {popularSongs.length > 0 ? popularSongs.map((song, index) => (
                <Link href={`/music/${song.id}`}
                  key={song.id}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-card/50 transition-colors duration-150 cursor-pointer px-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-4 text-center text-sm font-semibold text-muted-foreground shrink-0 flex items-center justify-center">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play className="hidden group-hover:block h-3.5 w-3.5 text-primary fill-current" />
                    </div>

                    <div className="h-11 w-11 rounded-md bg-muted flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                      {song.coverArt ? (
                        <img src={song.coverArt} alt={song.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{song.image}</span>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm tracking-tight text-foreground truncate group-hover:text-primary transition-colors font-heading">
                        {song.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 text-xs font-semibold text-muted-foreground tabular-nums font-ui">
                    <span className="w-10 text-right pr-2">{song.duration}</span>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-12 text-muted-foreground">
                  No popular tracks available
                </div>
              )}
            </div>
          </TabsContent>

          {/* Albums Gallery View */}
          <TabsContent value="albums" className="focus-visible:outline-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {albums.length > 0 ? albums.map(album => (
                <Link href={`/album/${album.id}`}
                  key={album.id}
                  className="group relative overflow-hidden border-none bg-card/30 hover:bg-card/70 transition-all duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-4"
                >
                  <div className="aspect-square w-full bg-muted/40 rounded-lg flex items-center justify-center relative shadow-md group-hover:shadow-xl transition-shadow overflow-hidden">
                    {album.image.startsWith('http') ? (
                      <img src={album.image} alt={album.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">{album.image}</span>
                    )}
                    <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                      <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg">
                        <Play className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 px-1">
                    <CardTitle className="text-sm font-bold tracking-tight truncate group-hover:text-primary transition-colors font-heading">{album.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground/80 flex items-center gap-1.5 font-medium">
                      <Disc className="h-3 w-3" /> {album.year}
                    </CardDescription>
                  </div>
                </Link>
              )) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No albums available
                </div>
              )}
            </div>
          </TabsContent>

          {/* About Biography Panel View */}
          <TabsContent value="about" className="focus-visible:outline-none">
            <Card className="border border-border/20 bg-card/20 overflow-hidden rounded-2xl shadow-inner">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border/10">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl shrink-0 border border-primary/20 shadow-sm">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-0.5 font-heading">Artist Information</h3>
                    <p className="text-xs text-muted-foreground">Artist data from Apple Music API for {artist.name}.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-border/10">
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wider font-ui">Albums</p>
                    <p className="text-xl font-black text-foreground tabular-nums">{albums.length}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wider font-ui">Popular Tracks</p>
                    <p className="text-xl font-black text-foreground tabular-nums">{popularSongs.length}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wider font-ui">Genres</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {artist.genres.slice(0, 2).map(g => (
                        <Badge key={g} variant="outline" className="text-[10px] py-0 border-border/60 font-bold bg-background/50 text-muted-foreground pointer-events-none font-ui">{g}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wider font-ui">Status</p>
                    <p className="text-xl font-black text-foreground tabular-nums">{artist.verified ? 'Verified' : 'Unverified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
