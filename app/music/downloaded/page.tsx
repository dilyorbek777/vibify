'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, PackageCheck, Trash2, Clock } from 'lucide-react'
import { indexedDBManager, DownloadedAudio } from '@/lib/indexeddb'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function DownloadedPage() {
  const [downloadedSongs, setDownloadedSongs] = useState<DownloadedAudio[]>([])
  const [loading, setLoading] = useState(true)
  const { playSong, playPlaylist, togglePlay, isPlaying, currentSong } = useMusicPlayer()

  useEffect(() => {
    async function loadDownloadedSongs() {
      try {
        const songs = await indexedDBManager.getAllDownloaded()
        setDownloadedSongs(songs)
      } catch (error) {
        console.error('Error loading downloaded songs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDownloadedSongs()
  }, [])

  const handlePlaySong = (song: DownloadedAudio) => {
    const blobUrl = URL.createObjectURL(song.audioBlob)
    playSong(
      {
        id: song.songId,
        name: song.songName,
        artist: song.artist,
        album: song.album,
        image: song.coverArt,
        totalSeconds: 0,
      },
      blobUrl
    )
  }

  const handleDeleteSong = async (songId: string) => {
    try {
      await indexedDBManager.deleteAudio(songId)
      setDownloadedSongs(downloadedSongs.filter(song => song.songId !== songId))
    } catch (error) {
      console.error('Error deleting song:', error)
    }
  }

  const handlePlayAll = () => {
    if (downloadedSongs.length === 0) return

    const songs = downloadedSongs.map(song => ({
      id: song.songId,
      name: song.songName,
      artist: song.artist,
      album: song.album,
      image: song.coverArt,
      totalSeconds: 0,
    }))

    const urls = downloadedSongs.map(song => URL.createObjectURL(song.audioBlob))
    playPlaylist(songs, urls)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDownloadDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-24">
      <BackgroundPattern />
      <div className="max-w-7xl relative z-10 mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-heading">
              Downloaded Songs
            </h1>
            <p className="text-muted-foreground">
              {downloadedSongs.length} {downloadedSongs.length === 1 ? 'song' : 'songs'} available offline
            </p>
          </div>
          {downloadedSongs.length > 0 && (
            <Button
              onClick={handlePlayAll}
              size="lg"
              className="rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform"
            >
              <Play className="h-5 w-5 fill-current mr-2" />
              Play All
            </Button>
          )}
        </div>

        {/* Songs List */}
        {downloadedSongs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <PackageCheck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No downloaded songs</h3>
            <p className="text-muted-foreground">
              Download songs to listen to them offline
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {downloadedSongs.map((song) => {
              const isCurrentSong = currentSong?.id === song.songId
              const isCurrentlyPlaying = isCurrentSong && isPlaying

              return (
                <div
                  key={song.songId}
                  className="group flex items-center gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors duration-150"
                >
                  {/* Play Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlaySong(song)}
                    className="h-10 w-10 shrink-0"
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    )}
                  </Button>

                  {/* Cover Art */}
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {song.coverArt.startsWith('http') ? (
                      <img src={song.coverArt} alt={song.songName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{song.coverArt}</span>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm tracking-tight text-foreground truncate">
                      {song.songName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist} • {song.album}
                    </p>
                  </div>

                  {/* File Info */}
                  <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDownloadDate(song.downloadedAt)}</span>
                    </div>
                    <span>{formatFileSize(song.audioBlob.size)}</span>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSong(song.songId)}
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
