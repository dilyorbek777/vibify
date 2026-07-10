'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Pause, Trash2, ArrowLeft, Music4 } from 'lucide-react'
import { getPlaylists, removeSongFromPlaylist, deletePlaylist } from '@/lib/local-storage'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import Link from 'next/link'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function PlaylistDetailPage() {
  const params = useParams()
  const { playPlaylist, isPlaying, currentSong } = useMusicPlayer()
  const [playlist, setPlaylist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const playlists = getPlaylists()
    const foundPlaylist = playlists.find(p => p.id === params.id)
    setPlaylist(foundPlaylist || null)
    setLoading(false)
  }, [params.id])

  const handlePlayPlaylist = () => {
    if (!playlist || playlist.songs.length === 0) return

    const songs = playlist.songs.map((song: any) => ({
      id: song.id,
      name: song.name,
      artist: song.artist,
      album: song.album,
      image: song.image,
      totalSeconds: 0
    }))

    const urls = playlist.songs.map((song: any) => song.musicUrl)
    playPlaylist(songs, urls)
  }

  const handleRemoveSong = (songId: string) => {
    if (!playlist) return
    removeSongFromPlaylist(playlist.id, songId)
    setPlaylist({
      ...playlist,
      songs: playlist.songs.filter((s: any) => s.id !== songId)
    })
  }

  const handleDeletePlaylist = () => {
    if (!playlist) return
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlist.id)
      window.location.href = '/myplaylists'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading playlist...</p>
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Playlist not found</p>
          <Link href="/myplaylists">
            <Button>Back to Playlists</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <BackgroundPattern />
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/myplaylists" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">{playlist.name}</h1>
              <p className="text-muted-foreground">{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={handlePlayPlaylist}
                disabled={playlist.songs.length === 0}
                className="cursor-pointer"
              >
                <Play className="h-4 w-4 mr-2" />
                Play All
              </Button>
              <Button
                onClick={handleDeletePlaylist}
                variant="destructive"
                className="cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Songs List */}
        {playlist.songs.length === 0 ? (
          <div className="text-center py-20 bg-card/20 border border-border/10 rounded-xl">
            <Music4 className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No songs in this playlist</p>
            <p className="text-sm text-muted-foreground/60">Add songs from the music page</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((song: any, index: number) => (
              <div
                key={song.id}
                className="group flex items-center justify-between p-4 rounded-xl hover:bg-card/50 transition-colors duration-150"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-6 text-center text-sm font-semibold text-muted-foreground shrink-0 flex items-center justify-center">
                    <span className="group-hover:hidden">{index + 1}</span>
                    <Play className="hidden group-hover:block h-3.5 w-3.5 text-primary fill-current" />
                  </div>

                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                    {song.image?.startsWith('http') ? (
                      <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{song.image}</span>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm tracking-tight text-foreground truncate font-heading">
                      {song.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSong(song.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
