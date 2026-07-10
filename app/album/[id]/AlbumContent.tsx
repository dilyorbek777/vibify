'use client'

import { Play, Clock, Calendar, Disc, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import type { AlbumData } from '@/lib/shazam-api'

interface AlbumContentProps {
  album: AlbumData
  formattedTracks: Array<{
    id: string
    name: string
    artist: string
    album: string
    duration: string
    trackNumber: number
    coverArt: string
    previewUrl: string
    url: string
  }>
  coverArt: string
  releaseYear: number
  totalMins: number
  totalSecs: number
}

export default function AlbumContent({
  album,
  formattedTracks,
  coverArt,
  releaseYear,
  totalMins,
  totalSecs,
}: AlbumContentProps) {
  const { playPlaylist } = useMusicPlayer()
  const attrs = album.attributes

  const handlePlayAlbum = () => {
    const songs = formattedTracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artist,
      album: track.album,
      image: track.coverArt || '🎵',
      totalSeconds: 0, // Will be updated by audio duration
    }))

    const urls = formattedTracks.map(track => track.previewUrl)
    playPlaylist(songs, urls)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto p-6 md:p-8 pb-24">
        {/* Album Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Album Cover */}
          <div className="w-full md:w-80 lg:w-96 shrink-0">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-muted/20">
              {coverArt ? (
                <img 
                  src={coverArt} 
                  alt={attrs.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  <Disc className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Album Info */}
          <div className="flex flex-col justify-end space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {attrs.isSingle ? 'Single' : 'Album'}
                </span>
                {attrs.contentRating === 'explicit' && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Explicit
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-heading">
                {attrs.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
                <Link 
                  href={`/artist/${album.relationships?.artists?.data?.[0]?.id}`}
                  className="hover:text-primary transition-colors font-medium"
                >
                  {attrs.artistName}
                </Link>
                <span>•</span>
                <span>{releaseYear}</span>
                <span>•</span>
                <span>{attrs.trackCount} songs</span>
                <span>•</span>
                <span>{totalMins} min {totalSecs} sec</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="h-14 px-8 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform"
                onClick={handlePlayAlbum}
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                Play
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-border/40">
                <Music className="h-5 w-5 mr-2" />
                Save
              </Button>
            </div>

            {/* Editorial Notes */}
            {attrs.editorialNotes?.short && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {attrs.editorialNotes.short}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Released {new Date(attrs.releaseDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Disc className="h-3 w-3" />
                <span>{attrs.recordLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                <span>{attrs.genreNames?.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-2">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20">
            <span className="w-8 text-center">#</span>
            <span>Title</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Time</span>
            </span>
          </div>

          {formattedTracks.map((track, index) => (
            <Link
              key={track.id}
              href={`/music/${track.id}`}
              className="group grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 rounded-lg hover:bg-card/50 transition-colors items-center"
            >
              <div className="w-8 text-center">
                <span className="group-hover:hidden text-muted-foreground font-medium">
                  {track.trackNumber}
                </span>
                <Play className="h-4 w-4 hidden group-hover:block fill-current text-primary" />
              </div>
              <div className="min-w-0 flex items-center gap-4">
                {track.coverArt && (
                  <img 
                    src={track.coverArt} 
                    alt={track.name}
                    className="h-10 w-10 rounded bg-muted/20 object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate group-hover:text-primary transition-colors font-heading">
                    {track.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artist}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {track.duration}
              </div>
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/20">
          <p className="text-xs text-muted-foreground">
            {attrs.copyright}
          </p>
        </div>
      </main>
    </div>
  )
}
