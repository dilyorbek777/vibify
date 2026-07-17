'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem, DropdownMenuHeader, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Toast } from '@/components/ui/toast'
import { getSongDetails, getArtistDetails, getArtistTopSongs, formatShazamTrack } from '@/lib/shazam-api'
import { addToRecentlyListened, isSongLiked, toggleLikedSong, getPlaylists, createPlaylist, addSongToPlaylist } from '@/lib/local-storage'
import { indexedDBManager } from '@/lib/indexeddb'
import { Play, Pause, Heart, MoreHorizontal, Disc, Calendar, Flame, Music3, Music4, Plus, Download, PackageCheck } from 'lucide-react'
import Link from 'next/link'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function MusicPage() {
  const params = useParams()
  const { playSong, togglePlay, isPlaying, currentSong } = useMusicPlayer()
  const [isLiked, setIsLiked] = useState(false)
  const [song, setSong] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [artistIds, setArtistIds] = useState<string[]>([])
  const [albumId, setAlbumId] = useState<string | null>(null)
  const [artistTopSongs, setArtistTopSongs] = useState<any[]>([])
  const [loadingSongs, setLoadingSongs] = useState(false)
  const [playlists, setPlaylists] = useState<any[]>([])
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    setPlaylists(getPlaylists())
  }, [])

  useEffect(() => {
    async function checkDownloadStatus() {
      if (params.id) {
        const downloaded = await indexedDBManager.isDownloaded(params.id as string)
        setIsDownloaded(downloaded)
      }
    }
    checkDownloadStatus()
  }, [params.id])

  useEffect(() => {
    async function fetchSong() {
      try {
        const data = await getSongDetails(params.id as string)
        console.log('Full API Response:', data)

        const trackData = data?.data?.[0] || data?.[0] || data
        console.log('Track Data:', trackData)

        const attrs = trackData?.attributes || trackData
        console.log('Attributes:', attrs)

        // Check if valid song data exists
        if (!attrs || (!attrs.name && !attrs.title)) {
          console.log('Invalid song data, triggering not found')
          notFound()
          return
        }

        const audioUrl = attrs?.previews?.[0]?.url || attrs?.playParams?.[0]?.url || attrs?.previewUrl || attrs?.url || null
        console.log('Audio URL:', audioUrl)

        const songData = {
          id: params.id as string,
          name: attrs?.name || attrs?.title || 'Unknown',
          artist: attrs?.artistName || attrs?.artist || 'Unknown',
          album: attrs?.albumName || attrs?.album || 'Unknown',
          year: attrs?.releaseDate ? new Date(attrs.releaseDate).getFullYear() : 'Unknown',
          totalSeconds: Math.floor((attrs?.durationInMillis || attrs?.duration || 0) / 1000),
          image: attrs?.artwork?.url?.replace('{w}x{h}bb', '400x400bb') || attrs?.coverArt || '🎵',
          coverArt: attrs?.artwork?.url?.replace('{w}x{h}bb', '400x400bb') || attrs?.coverArt || '🎵',
          plays: attrs?.playCount || '0',
          likes: attrs?.likeCount || '0',
          bgColor: attrs?.artwork?.bgColor || null,
          textColor1: attrs?.artwork?.textColor1 || null,
          textColor2: attrs?.artwork?.textColor2 || null,
          textColor3: attrs?.artwork?.textColor3 || null,
          textColor4: attrs?.artwork?.textColor4 || null,
          listenedAt: Date.now(),
          musicUrl: audioUrl || ''
        }

        setSong(songData)
        setAudioUrl(audioUrl)

        // Check if song is liked
        setIsLiked(isSongLiked(params.id as string))

        // Save to recently listened
        addToRecentlyListened(songData)

        const artists = trackData?.relationships?.artists?.data || []
        setArtistIds(artists.map((a: any) => a.id))

        const album = trackData?.relationships?.albums?.data?.[0]
        setAlbumId(album?.id || null)
      } catch (err) {
        console.error('Error fetching song:', err)
        setError('Failed to load song details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchSong()
  }, [params.id])

  useEffect(() => {
    async function fetchArtistTopSongs() {
      if (artistIds.length === 0) return

      setLoadingSongs(true)
      try {
        const topSongsData = await getArtistTopSongs(artistIds[0])
        const formattedSongs = topSongsData.map(formatShazamTrack).slice(0, 4)
        setArtistTopSongs(formattedSongs)
      } catch (err) {
        console.error('Error fetching artist top songs:', err)
      } finally {
        setLoadingSongs(false)
      }
    }

    fetchArtistTopSongs()
  }, [artistIds])

  const handleCreatePlaylist = () => {
    const name = newPlaylistName.trim() || undefined
    const newPlaylist = createPlaylist(name)
    setPlaylists([...playlists, newPlaylist])

    if (song) {
      addSongToPlaylist(newPlaylist.id, {
        id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        image: song.image,
        musicUrl: audioUrl || ''
      })
      setToastMessage(`Added to "${newPlaylist.name}"`)
    }

    setNewPlaylistName('')
    setShowCreatePlaylist(false)
    setIsDropdownOpen(false)
  }

  const handleDownload = async () => {
    if (!song || !audioUrl || isDownloading) return

    setIsDownloading(true)

    try {
      // Fetch the audio file
      const response = await fetch(audioUrl)
      if (!response.ok) throw new Error('Failed to download audio')

      const blob = await response.blob()

      // Save to IndexedDB
      await indexedDBManager.saveAudio({
        songId: song.id,
        songName: song.name,
        artist: song.artist,
        album: song.album,
        coverArt: song.coverArt,
        audioBlob: blob,
        audioUrl: audioUrl
      })

      setIsDownloaded(true)
      setToastMessage('Song downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      setToastMessage('Failed to download song')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleAddToPlaylist = (playlistId: string) => {
    if (song) {
      const playlist = playlists.find(p => p.id === playlistId)
      addSongToPlaylist(playlistId, {
        id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        image: song.image,
        musicUrl: audioUrl || ''
      })
      if (playlist) {
        setToastMessage(`Added to "${playlist.name}"`)
      }
      setIsDropdownOpen(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading song details...</p>
        </div>
      </div>
    )
  }

  if (error || !song) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground select-none pb-40">
      <BackgroundPattern />
      <div
        className="relative"
        style={{
          background: song.bgColor
            ? `linear-gradient(to bottom,transparent,transparent,  #${song.bgColor})`
            : 'linear-gradient(to bottom, from-primary/15 via-background/40 to-background)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: song.bgColor
            ? `radial-gradient(circle at 20% 30%, #${song.textColor3 || song.bgColor} 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, #${song.textColor4 || song.bgColor} 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, #${song.textColor1 || song.bgColor} 0%, transparent 70%)`
            : 'none'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-6 md:pb-8 flex flex-col md:flex-row items-end gap-6 md:gap-8">
          <div className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 rounded-2xl bg-card border border-border/30 flex items-center justify-center shadow-2xl shrink-0 relative group overflow-hidden mx-auto md:mx-0">
            {song.image?.startsWith('http') ? (
              <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[110px]">{song.image}</span>
            )}
          </div>
          <div className="flex-1 space-y-3 min-w-0">

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight truncate leading-none font-heading">{song.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold text-base hover:underline cursor-pointer font-heading">{song.artist}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1"><Disc className="h-3.5 w-3.5" /> {song.album}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {song.year}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-3 md:pt-4">
              <Button
                onClick={() => {
                  if (audioUrl && song) {
                    const songData = {
                      id: song.id,
                      name: song.name,
                      artist: song.artist,
                      album: song.album,
                      image: song.image,
                      totalSeconds: song.totalSeconds
                    }
                    playSong(songData, audioUrl)
                  }
                }}
                size="lg"
                disabled={!audioUrl}
                className="rounded-full px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground h-12 disabled:opacity-50"
              >
                {currentSong?.id === song.id && isPlaying ? <Pause className="h-5 w-5 mr-2 fill-current" /> : <Play className="h-5 w-5 mr-2 fill-current" />}
                {currentSong?.id === song.id && isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (song) {
                    toggleLikedSong({
                      id: song.id,
                      name: song.name,
                      artist: song.artist,
                      album: song.album,
                      image: song.image,
                      likedAt: Date.now(),
                      musicUrl: audioUrl || ''
                    })
                    setIsLiked(!isLiked)
                  }
                }}
                className={`rounded-full h-12 w-12 border-border/60 ${isLiked ? 'text-primary border-primary/40 bg-primary/5' : 'hover:bg-muted'}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={isDownloading}
                className={`rounded-full h-12 w-12 border-border/60 ${isDownloaded ? 'text-primary border-primary/40 bg-primary/5' : 'hover:bg-muted'}`}
              >
                {isDownloading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                ) : isDownloaded ? (
                  <PackageCheck className="h-5 w-5" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </Button>

              <DropdownMenu
                isOpen={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                trigger={
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-border/60 hover:bg-muted">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                }
              >
                <DropdownMenuHeader>Add to Playlist</DropdownMenuHeader>
                {playlists.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">No playlists yet</p>
                    <p className="text-xs text-muted-foreground/60">Create one to get started</p>
                  </div>
                ) : (
                  <>
                    {playlists.map((playlist) => (
                      <DropdownMenuItem
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        icon={<Music4 className="h-4 w-4" />}
                      >
                        {playlist.name}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {playlist.songs.length}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowCreatePlaylist(true)}
                  className="font-semibold text-primary"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Create new playlist
                </DropdownMenuItem>
              </DropdownMenu>

              {showCreatePlaylist && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-card border border-border/40 rounded-xl p-6 w-96 max-w-[90vw]">
                    <h3 className="text-lg font-bold mb-4 font-heading">Create New Playlist</h3>
                    <input
                      type="text"
                      placeholder="Playlist name (optional)"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full bg-background border border-border/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => setShowCreatePlaylist(false)} variant="outline" className="cursor-pointer">
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePlaylist} className="cursor-pointer">
                        Create & Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/80 md:ml-4 bg-muted/30 px-4 py-2 rounded-xl border border-border/10">
                <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-primary" /> {song.plays} Plays</span>
                <span className="h-3 w-px bg-border/40" />
                <span>{song.likes} Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-background/40 to-background h-32" />

      <main className="max-w-7xl z-10 relative mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight font-heading">More Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artistIds.map((artistId) => (
              <Link
                key={artistId}
                href={`/artist/${artistId}`}
                className="group relative h-32 rounded-2xl overflow-hidden border border-border/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  // backgroundImage: `url(${song.image?.replace('400x400bb', '800x800bb')})`,
                  background: `linear-gradient(to bottom, #${song.textColor1}, #${song.textColor2})`,
                  // backgroundSize: 'cover',
                  // backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Artist</p>
                    <h3 className="text-lg font-bold text-white font-heading">{song.artist}</h3>
                  </div>
                </div>
              </Link>
            ))}

            {albumId && (
              <Link
                href={`/album/${albumId}`}
                className="group relative h-32 rounded-2xl overflow-hidden border border-border/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  backgroundImage: `url(${song.image?.replace('400x400bb', '800x800bb')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Album</p>
                    <h3 className="text-lg font-bold text-white font-heading">{song.album}</h3>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>

        {artistTopSongs.length > 0 && (
          <section className="space-y-6 mt-12">
            <h2 className="text-xl font-bold tracking-tight font-heading">More from {song.artist}</h2>
            <div className="space-y-1">
              {artistTopSongs.map((song, index) => (
                <Link
                  href={`/music/${song.id}`}
                  key={song.id}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-card/50 transition-colors duration-150 cursor-pointer"
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
              ))}
            </div>
          </section>
        )}
      </main>

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  )
} 