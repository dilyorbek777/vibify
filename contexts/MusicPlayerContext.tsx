'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface Song {
  id: string
  name: string
  artist: string
  album: string
  image: string
  totalSeconds: number
}

interface MusicPlayerContextType {
  currentSong: Song | null
  isPlaying: boolean
  progress: number[]
  audioUrl: string | null
  playSong: (song: Song, url: string) => void
  togglePlay: () => void
  handleSeek: (value: number[]) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState([0])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const playSong = (song: Song, url: string) => {
    setCurrentSong(song)
    setAudioUrl(url)
    setProgress([0])
    setIsPlaying(true)
    
    // Play the audio after a short delay to ensure the audio element is rendered
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play()
      }
    }, 100)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current && currentSong) {
      audioRef.current.currentTime = (value[0] / 100) * currentSong.totalSeconds
      setProgress(value)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && currentSong) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress([percentage])
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress([0])
  }

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        audioUrl,
        playSong,
        togglePlay,
        handleSeek,
        audioRef,
      }}
    >
      {children}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          
        />
      )}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}
