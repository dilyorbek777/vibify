'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'
import { getRecentlyListened } from '@/lib/local-storage'
import { indexedDBManager } from '@/lib/indexeddb'

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
  volume: number
  playSong: (song: Song, url: string) => void
  playPlaylist: (songs: Song[], urls: string[]) => void
  togglePlay: () => void
  handleSeek: (value: number[]) => void
  handleVolumeChange: (value: number[]) => void
  playNext: () => void
  playPrevious: () => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState([0])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [volume, setVolume] = useState(75)
  const [playlist, setPlaylist] = useState<{ songs: Song[]; urls: string[] } | null>(null)
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Set initial volume when audio element is created
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const playSong = async (song: Song, url: string) => {
    setCurrentSong(song)
    setProgress([0])
    setPlaylist(null)
    setCurrentPlaylistIndex(0)

    // Check if song is downloaded and use cached audio
    const downloadedAudio = await indexedDBManager.getAudio(song.id)
    if (downloadedAudio) {
      const blobUrl = URL.createObjectURL(downloadedAudio.audioBlob)
      setAudioUrl(blobUrl)
    } else {
      setAudioUrl(url)
    }

    setIsPlaying(true)

    // Play the audio after a short delay to ensure the audio element is rendered
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play()
      }
    }, 100)
  }

  const playPlaylist = async (songs: Song[], urls: string[]) => {
    if (songs.length === 0) return

    // Check each song for downloaded audio
    const processedUrls = await Promise.all(
      urls.map(async (url, index) => {
        const downloadedAudio = await indexedDBManager.getAudio(songs[index].id)
        if (downloadedAudio) {
          return URL.createObjectURL(downloadedAudio.audioBlob)
        }
        return url
      })
    )

    setPlaylist({ songs, urls: processedUrls })
    setCurrentPlaylistIndex(0)
    setCurrentSong(songs[0])
    setAudioUrl(processedUrls[0])
    setProgress([0])
    setIsPlaying(true)

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

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && currentSong) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress([percentage])
    }
  }

  const handleEnded = () => {
    if (playlist && currentPlaylistIndex < playlist.songs.length - 1) {
      // Play next song in playlist
      const nextIndex = currentPlaylistIndex + 1
      setCurrentPlaylistIndex(nextIndex)
      setCurrentSong(playlist.songs[nextIndex])
      setAudioUrl(playlist.urls[nextIndex])
      setProgress([0])

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
        }
      }, 100)
    } else if (playlist) {
      // End of playlist - loop back to beginning
      setCurrentPlaylistIndex(0)
      setCurrentSong(playlist.songs[0])
      setAudioUrl(playlist.urls[0])
      setProgress([0])

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
        }
      }, 100)
    } else {
      // No playlist - load recently listened as playlist and play first
      const recentlyListened = getRecentlyListened()
      if (recentlyListened.length > 0) {
        const songs = recentlyListened.map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album,
          image: song.image,
          totalSeconds: 0,
        }))
        const urls = recentlyListened.map(song => song.musicUrl)
        playPlaylist(songs, urls)
      } else {
        // No recently listened songs - stop
        setIsPlaying(false)
        setProgress([0])
      }
    }
  }

  const playNext = () => {
    if (playlist && currentPlaylistIndex < playlist.songs.length - 1) {
      // Play next song in playlist
      const nextIndex = currentPlaylistIndex + 1
      setCurrentPlaylistIndex(nextIndex)
      setCurrentSong(playlist.songs[nextIndex])
      setAudioUrl(playlist.urls[nextIndex])
      setProgress([0])

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
        }
      }, 100)
    } else if (!playlist) {
      // Not in playlist - load recently listened as playlist and play first
      const recentlyListened = getRecentlyListened()
      if (recentlyListened.length > 0) {
        const songs = recentlyListened.map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album,
          image: song.image,
          totalSeconds: 0,
        }))
        const urls = recentlyListened.map(song => song.musicUrl)
        playPlaylist(songs, urls)
      }
    } else {
      // End of playlist - restart from beginning
      setCurrentPlaylistIndex(0)
      setCurrentSong(playlist.songs[0])
      setAudioUrl(playlist.urls[0])
      setProgress([0])

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
        }
      }, 100)
    }
  }

  const playPrevious = () => {
    if (playlist && currentPlaylistIndex > 0) {
      // Play previous song in playlist
      const prevIndex = currentPlaylistIndex - 1
      setCurrentPlaylistIndex(prevIndex)
      setCurrentSong(playlist.songs[prevIndex])
      setAudioUrl(playlist.urls[prevIndex])
      setProgress([0])

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
        }
      }, 100)
    } else if (playlist) {
      // At start of playlist - restart current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        setProgress([0])
        if (!isPlaying) {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }
    } else {
      // Not in playlist - restart current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        setProgress([0])
        if (!isPlaying) {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }
    }
  }

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        audioUrl,
        volume,
        playSong,
        playPlaylist,
        togglePlay,
        handleSeek,
        handleVolumeChange,
        playNext,
        playPrevious,
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
