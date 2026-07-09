'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSongDetails, getArtistDetails, getArtistTopSongs, formatShazamTrack } from '@/lib/shazam-api'
import { addToRecentlyListened, isSongLiked, toggleLikedSong } from '@/lib/local-storage'
import { Play, Pause, Heart, MoreHorizontal, Disc, Calendar, Flame, Music3 } from 'lucide-react'
import Link from 'next/link'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

export default function MusicPage() {
  const params = useParams()
  const { playSong, togglePlay, isPlaying, currentSong } = useMusicPlayer()
  const [isLiked, setIsLiked] = useState(false)
  const [song, setSong] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSong() {
      try {
        const data = await getSongDetails(params.id as string)
        console.log('Full API Response:', data)

        const trackData = data?.data?.[0] || data?.[0] || data
        console.log('Track Data:', trackData)

        const attrs = trackData?.attributes || trackData
        console.log('Attributes:', attrs)

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

  const [artistIds, setArtistIds] = useState<string[]>([])
  const [albumId, setAlbumId] = useState<string | null>(null)
  const [artistTopSongs, setArtistTopSongs] = useState<any[]>([])
  const [loadingSongs, setLoadingSongs] = useState(false)

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
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Song not found'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground select-none pb-40">
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
        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row items-end gap-8">
          <div className="h-64 w-64 md:h-72 md:w-72 rounded-2xl bg-card border border-border/30 flex items-center justify-center shadow-2xl shrink-0 relative group overflow-hidden">
            {song.image?.startsWith('http') ? (
              <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[110px]">{song.image}</span>
            )}
          </div>
          <div className="flex-1 space-y-3 min-w-0">

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight truncate leading-none">{song.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold text-base hover:underline cursor-pointer">{song.artist}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1"><Disc className="h-3.5 w-3.5" /> {song.album}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {song.year}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4">
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
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-border/60 hover:bg-muted">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
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

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">More Info</h2>
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
                    <h3 className="text-lg font-bold text-white">{song.artist}</h3>
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
                    <h3 className="text-lg font-bold text-white">{song.album}</h3>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>

        {artistTopSongs.length > 0 && (
          <section className="space-y-6 mt-12">
            <h2 className="text-xl font-bold tracking-tight">More from {song.artist}</h2>
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
                      <h4 className="font-bold text-sm tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                        {song.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 text-xs font-semibold text-muted-foreground tabular-nums">
                    <span className="w-10 text-right pr-2">{song.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
} 