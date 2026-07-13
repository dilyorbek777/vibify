'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Heart, Disc, Calendar, Flame, Music4, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import BackgroundPattern from '@/components/BackgroundPattern'
import { getDetectedSongs, isSongLiked, toggleLikedSong } from '@/lib/local-storage'

export default function DetectedSongPage() {
  const params = useParams()
  const { playSong, togglePlay, isPlaying, currentSong } = useMusicPlayer()
  const [detectedSong, setDetectedSong] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const detectedSongs = getDetectedSongs()
    const song = detectedSongs.find(s => s.id === params.id)
    
    if (song) {
      setDetectedSong(song)
      
      // Check if the matched song is liked
      const matches = song.response?.results?.matches || []
      if (matches.length > 0) {
        const songId = matches[0].id
        setIsLiked(isSongLiked(songId))
      }
    } else {
      setError('Detection not found')
    }
    
    setLoading(false)
  }, [params.id])

  const handleLike = () => {
    const matches = detectedSong?.response?.results?.matches || []
    if (matches.length > 0) {
      const songId = matches[0].id
      const songData = detectedSong.response.resources?.['shazam-songs']?.[songId]?.attributes
      
      if (songData) {
        toggleLikedSong({
          id: songId,
          name: songData.title,
          artist: songData.artist,
          album: songData.relationships?.albums?.data?.[0]?.id || 'Unknown',
          image: songData.images?.coverArt || '🎵',
          likedAt: Date.now(),
          musicUrl: songData.streaming?.preview || ''
        })
        setIsLiked(!isLiked)
      }
    }
  }

  const handlePlay = () => {
    const matches = detectedSong?.response?.results?.matches || []
    if (matches.length > 0) {
      const songId = matches[0].id
      const songData = detectedSong.response.resources?.['shazam-songs']?.[songId]?.attributes
      
      if (songData) {
        const audioUrl = songData.streaming?.preview
        if (audioUrl) {
          playSong(
            {
              id: songId,
              name: songData.title,
              artist: songData.artist,
              album: songData.relationships?.albums?.data?.[0]?.id || 'Unknown',
              image: songData.images?.coverArt || '🎵',
              totalSeconds: 0
            },
            audioUrl
          )
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading detection...</p>
        </div>
      </div>
    )
  }

  if (error || !detectedSong) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Detection not found'}</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const matches = detectedSong.response?.results?.matches || []
  const songId = matches.length > 0 ? matches[0].id : null
  const songData = songId ? detectedSong.response.resources?.['shazam-songs']?.[songId]?.attributes : null
  const artistId = songData?.relationships?.artists?.data?.[0]?.id
  const artistData = artistId ? detectedSong.response.resources?.artists?.[artistId]?.attributes : null
  const albumId = songData?.relationships?.albums?.data?.[0]?.id
  const albumData = albumId ? detectedSong.response.resources?.albums?.[albumId]?.attributes : null

  const detectionTime = new Date(detectedSong.timestamp).toLocaleString()

  if (!songData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Song data not found in detection</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground select-none pb-40">
      <BackgroundPattern />
      <div
        className="relative"
        style={{
          background: songData.artwork?.bgColor
            ? `linear-gradient(to bottom,transparent,transparent,  #${songData.artwork.bgColor})`
            : 'linear-gradient(to bottom, from-primary/15 via-background/40 to-background)',
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: songData.artwork?.bgColor
            ? `radial-gradient(circle at 20% 30%, #${songData.artwork.textColor3 || songData.artwork.bgColor} 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, #${songData.artwork.textColor4 || songData.artwork.bgColor} 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, #${songData.artwork.textColor1 || songData.artwork.bgColor} 0%, transparent 70%)`
            : 'none'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-6 md:pb-8 flex flex-col md:flex-row items-end gap-6 md:gap-8">
          <div className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 rounded-2xl bg-card border border-border/30 flex items-center justify-center shadow-2xl shrink-0 relative group overflow-hidden mx-auto md:mx-0">
            {songData.images?.coverArt ? (
              <img src={songData.images.coverArt} alt={songData.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[110px]">🎵</span>
            )}
          </div>
          <div className="flex-1 space-y-3 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight truncate leading-none font-heading">{songData.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold text-base hover:underline cursor-pointer font-heading">{songData.artist}</span>
              {albumData && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="flex items-center gap-1"><Disc className="h-3.5 w-3.5" /> {albumData.name}</span>
                </>
              )}
              {albumData?.releaseDate && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {albumData.releaseDate}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-3 md:pt-4">
              <Button
                onClick={handlePlay}
                size="lg"
                disabled={!songData.streaming?.preview}
                className="rounded-full px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground h-12 disabled:opacity-50"
              >
                {currentSong?.id === songId && isPlaying ? <Pause className="h-5 w-5 mr-2 fill-current" /> : <Play className="h-5 w-5 mr-2 fill-current" />}
                {currentSong?.id === songId && isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLike}
                className={`rounded-full h-12 w-12 border-border/60 ${isLiked ? 'text-primary border-primary/40 bg-primary/5' : 'hover:bg-muted'}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              {songData.webUrl && (
                <Button asChild variant="outline" size="icon" className="rounded-full h-12 w-12 border-border/60 hover:bg-muted">
                  <a href={songData.webUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              )}
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/80 md:ml-4 bg-muted/30 px-4 py-2 rounded-xl border border-border/10">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> Detected {detectionTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-background/40 to-background h-32" />

      <main className="max-w-7xl z-10 relative mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight font-heading">Detection Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artistId && artistData && (
              <div className="p-4 rounded-xl border border-border/30 bg-card/30">
                <p className="text-xs text-muted-foreground mb-1">Artist</p>
                <h3 className="text-lg font-bold font-heading">{artistData.name}</h3>
              </div>
            )}
            {albumData && (
              <div className="p-4 rounded-xl border border-border/30 bg-card/30">
                <p className="text-xs text-muted-foreground mb-1">Album</p>
                <h3 className="text-lg font-bold font-heading">{albumData.name}</h3>
              </div>
            )}
            {songData.genres?.primary && (
              <div className="p-4 rounded-xl border border-border/30 bg-card/30">
                <p className="text-xs text-muted-foreground mb-1">Genre</p>
                <h3 className="text-lg font-bold font-heading">{songData.genres.primary}</h3>
              </div>
            )}
            {songData.label && (
              <div className="p-4 rounded-xl border border-border/30 bg-card/30">
                <p className="text-xs text-muted-foreground mb-1">Label</p>
                <h3 className="text-lg font-bold font-heading">{songData.label}</h3>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
