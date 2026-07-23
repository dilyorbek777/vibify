'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, PackageCheck } from 'lucide-react'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { indexedDBManager } from '@/lib/indexeddb'

export function MusicPlayer() {
  const { currentSong, isPlaying, progress, audioUrl, volume, togglePlay, handleSeek, handleVolumeChange, playNext, playPrevious } = useMusicPlayer()
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    async function checkDownloadStatus() {
      if (currentSong) {
        const downloaded = await indexedDBManager.isDownloaded(currentSong.id)
        setIsDownloaded(downloaded)
      }
    }
    checkDownloadStatus()
  }, [currentSong])

  const handleDownload = async () => {
    if (!currentSong || !audioUrl || isDownloading) return

    setIsDownloading(true)

    try {
      const response = await fetch(audioUrl)
      if (!response.ok) throw new Error('Failed to download audio')

      const blob = await response.blob()

      await indexedDBManager.saveAudio({
        songId: currentSong.id,
        songName: currentSong.name,
        artist: currentSong.artist,
        album: currentSong.album,
        coverArt: currentSong.image,
        audioBlob: blob,
        audioUrl: audioUrl
      })

      setIsDownloaded(true)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setIsDownloading(false)
    }
  }

useEffect(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      togglePlay();
    }
  };

  window.addEventListener('keydown', handleKeydown);
  return () => {
    window.removeEventListener('keydown', handleKeydown);
  };
}, [togglePlay]); // Runs only if togglePlay changes

  if (!currentSong) return null

  const formatTime = (percentage: number) => {
    const currentSeconds = Math.floor((percentage / 100) * currentSong.totalSeconds)
    const mins = Math.floor(currentSeconds / 60)
    const secs = currentSeconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <footer className="fixed max-md:bottom-14 border-t border-border/50 bottom-0 left-0 right-0 bg-background/75 backdrop-blur-xl z-50 p-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link href={`/music/${currentSong.id}`} className="flex items-center gap-3 min-w-0 w-1/4 sm:flex">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            {currentSong.image?.startsWith('http') ? (
              <img src={currentSong.image} alt={currentSong.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{currentSong.image}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm truncate tracking-tight font-sans">{currentSong.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
        </Link>
        <div className="flex-1 max-w-xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Button onClick={playPrevious} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <SkipBack className="h-4 w-4 fill-current" />
            </Button>
            <Button onClick={togglePlay} size="icon" disabled={!audioUrl} className="h-9 w-9 rounded-full bg-foreground text-background hover:scale-105 transition-transform disabled:opacity-50">
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </Button>
            <Button onClick={playNext} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <SkipForward className="h-4 w-4 fill-current" />
            </Button>
          </div>
          <div className="w-full flex items-center gap-3 text-xs font-medium text-muted-foreground tabular-nums font-sans">
            <span>{formatTime(progress[0])}</span>
            <Slider value={progress} onValueChange={handleSeek} className="flex-1 cursor-pointer" disabled={!audioUrl} />
            <span>{formatTime(100)}</span>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isDownloaded ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {isDownloading ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : isDownloaded ? (
            <PackageCheck className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
        <div className="w-1/4 justify-end gap-3 items-center hidden md:flex text-muted-foreground">
          <Volume2 className="h-4 w-4 shrink-0" />
          <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} className="w-24 cursor-pointer" />
        </div>
      </div>
    </footer>
  )
}
