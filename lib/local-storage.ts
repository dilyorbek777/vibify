interface RecentlyListenedSong {
  id: string
  name: string
  artist: string
  album: string
  year: number | string
  image: string
  coverArt: string
  listenedAt: number
  musicUrl: string
}

const STORAGE_KEY = 'vibify_recently_listened'

export const getRecentlyListened = (): RecentlyListenedSong[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return []
  }
}



export const addToRecentlyListened = (song: RecentlyListenedSong): void => {
  if (typeof window === 'undefined') return
  
  try {
    const current = getRecentlyListened()
    
    // Check if song already exists
    const existingIndex = current.findIndex(s => s.id === song.id)
    
    if (existingIndex !== -1) {
      // Update the existing song's timestamp and move it to the front
      const updated = [...current]
      updated.splice(existingIndex, 1)
      updated.unshift({ ...song, listenedAt: Date.now() })
      
      // Keep only the last 20 songs
      const trimmed = updated.slice(0, 20)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } else {
      // Add new song to the front
      const newEntry = { ...song, listenedAt: Date.now() }
      const updated = [newEntry, ...current].slice(0, 20)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

export const clearRecentlyListened = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

export const removeFromRecentlyListened = (songId: string): void => {
  if (typeof window === 'undefined') return

  try {
    const current = getRecentlyListened()
    const updated = current.filter(s => s.id !== songId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error removing song from recently listened:', error)
  }
}

const VIEW_PREFERENCE_KEY = 'vibify_view_preference'

export const getViewPreference = (): 'grid' | 'list' => {
  if (typeof window === 'undefined') return 'grid'

  try {
    const data = localStorage.getItem(VIEW_PREFERENCE_KEY)
    return data === 'list' ? 'list' : 'grid'
  } catch (error) {
    console.error('Error reading view preference:', error)
    return 'grid'
  }
}

export const setViewPreference = (view: 'grid' | 'list'): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(VIEW_PREFERENCE_KEY, view)
  } catch (error) {
    console.error('Error saving view preference:', error)
  }
}

const SEARCH_HISTORY_KEY = 'vibify_search_history'

export const getSearchHistory = (): string[] => {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading search history:', error)
    return []
  }
}

export const addSearchToHistory = (query: string): void => {
  if (typeof window === 'undefined') return
  if (!query.trim()) return

  try {
    const current = getSearchHistory()
    // Remove if already exists to move to front
    const filtered = current.filter(q => q !== query)
    // Add to front
    const updated = [query, ...filtered].slice(0, 20) // Keep last 20
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving search to history:', error)
  }
}

export const clearSearchHistory = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error('Error clearing search history:', error)
  }
}

// Liked Songs
interface LikedSong {
  id: string
  name: string
  artist: string
  album: string
  image: string
  likedAt: number
  musicUrl: string
}

const LIKED_SONGS_KEY = 'vibify_liked_songs'

export const getLikedSongs = (): LikedSong[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(LIKED_SONGS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading liked songs from localStorage:', error)
    return []
  }
}

export const isSongLiked = (songId: string): boolean => {
  const likedSongs = getLikedSongs()
  return likedSongs.some(song => song.id === songId)
}

export const addToLikedSongs = (song: LikedSong): void => {
  if (typeof window === 'undefined') return
  
  try {
    const current = getLikedSongs()
    
    // Check if song already exists
    const existingIndex = current.findIndex(s => s.id === song.id)
    
    if (existingIndex === -1) {
      // Add new song to the front
      const newEntry = { ...song, likedAt: Date.now() }
      const updated = [newEntry, ...current]
      localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(updated))
    }
  } catch (error) {
    console.error('Error writing liked songs to localStorage:', error)
  }
}

export const removeFromLikedSongs = (songId: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    const current = getLikedSongs()
    const updated = current.filter(s => s.id !== songId)
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error removing liked song from localStorage:', error)
  }
}

export const toggleLikedSong = (song: LikedSong): void => {
  if (isSongLiked(song.id)) {
    removeFromLikedSongs(song.id)
  } else {
    addToLikedSongs(song)
  }
}

export const updateLikedSongsOrder = (songs: LikedSong[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(songs))
  } catch (error) {
    console.error('Error updating liked songs order:', error)
  }
}

// Playlists
interface PlaylistSong {
  id: string
  name: string
  artist: string
  album: string
  image: string
  musicUrl: string
}

interface Playlist {
  id: string
  name: string
  songs: PlaylistSong[]
  createdAt: number
}

const PLAYLISTS_KEY = 'vibify_playlists'

export const getPlaylists = (): Playlist[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(PLAYLISTS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading playlists from localStorage:', error)
    return []
  }
}

export const createPlaylist = (name?: string): Playlist => {
  if (typeof window === 'undefined') {
    return { id: '', name: name || '', songs: [], createdAt: Date.now() }
  }
  
  try {
    const playlists = getPlaylists()
    const playlistName = name || `Playlist #${playlists.length + 1}`
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      name: playlistName,
      songs: [],
      createdAt: Date.now()
    }
    
    const updated = [...playlists, newPlaylist]
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated))
    return newPlaylist
  } catch (error) {
    console.error('Error creating playlist:', error)
    return { id: '', name: name || '', songs: [], createdAt: Date.now() }
  }
}

export const addSongToPlaylist = (playlistId: string, song: PlaylistSong): void => {
  if (typeof window === 'undefined') return
  
  try {
    const playlists = getPlaylists()
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return
    
    // Check if song already exists in playlist
    const songExists = playlists[playlistIndex].songs.some(s => s.id === song.id)
    if (songExists) return
    
    playlists[playlistIndex].songs.push(song)
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
  } catch (error) {
    console.error('Error adding song to playlist:', error)
  }
}

export const removeSongFromPlaylist = (playlistId: string, songId: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    const playlists = getPlaylists()
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return
    
    playlists[playlistIndex].songs = playlists[playlistIndex].songs.filter(s => s.id !== songId)
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
  } catch (error) {
    console.error('Error removing song from playlist:', error)
  }
}

export const deletePlaylist = (playlistId: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    const playlists = getPlaylists()
    const updated = playlists.filter(p => p.id !== playlistId)
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error deleting playlist:', error)
  }
}

export const updatePlaylistName = (playlistId: string, name: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    const playlists = getPlaylists()
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return
    
    playlists[playlistIndex].name = name
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
  } catch (error) {
    console.error('Error updating playlist name:', error)
  }
}

export const updatePlaylistSongOrder = (playlistId: string, songs: PlaylistSong[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    const playlists = getPlaylists()
    const playlistIndex = playlists.findIndex(p => p.id === playlistId)
    
    if (playlistIndex === -1) return
    
    playlists[playlistIndex].songs = songs
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists))
  } catch (error) {
    console.error('Error updating playlist song order:', error)
  }
}

// Followed Artists
interface FollowedArtist {
  id: string
  name: string
  image: string
  genres: string[]
  url: string
  verified: boolean
  followedAt: number
}

const FOLLOWED_ARTISTS_KEY = 'vibify_followed_artists'

export const getFollowedArtists = (): FollowedArtist[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(FOLLOWED_ARTISTS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading followed artists from localStorage:', error)
    return []
  }
}

export const isArtistFollowed = (artistId: string): boolean => {
  const followedArtists = getFollowedArtists()
  return followedArtists.some(artist => artist.id === artistId)
}

export const followArtist = (artist: FollowedArtist): void => {
  if (typeof window === 'undefined') return
  
  try {
    const current = getFollowedArtists()
    
    // Check if artist already exists
    const existingIndex = current.findIndex(a => a.id === artist.id)
    
    if (existingIndex === -1) {
      // Add new artist to the front
      const newEntry = { ...artist, followedAt: Date.now() }
      const updated = [newEntry, ...current]
      localStorage.setItem(FOLLOWED_ARTISTS_KEY, JSON.stringify(updated))
    }
  } catch (error) {
    console.error('Error following artist:', error)
  }
}

export const unfollowArtist = (artistId: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    const current = getFollowedArtists()
    const updated = current.filter(a => a.id !== artistId)
    localStorage.setItem(FOLLOWED_ARTISTS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error unfollowing artist:', error)
  }
}

export const toggleFollowArtist = (artist: FollowedArtist): void => {
  if (isArtistFollowed(artist.id)) {
    unfollowArtist(artist.id)
  } else {
    followArtist(artist)
  }
}

// Genre Songs Caching
interface GenreSong {
  id: string
  name: string
  artist: string
  album: string
  image: string
  coverArt: string
  duration: string
  url: string
}

interface GenreCache {
  genre: string
  songs: GenreSong[]
  lastUpdated: number
}

const GENRE_CACHE_KEY = 'vibify_genre_cache'

export const getGenreSongs = (genre: string): GenreSong[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(GENRE_CACHE_KEY)
    if (!data) return []
    
    const cache: GenreCache[] = JSON.parse(data)
    const genreCache = cache.find(c => c.genre.toLowerCase() === genre.toLowerCase())
    
    return genreCache ? genreCache.songs : []
  } catch (error) {
    console.error('Error reading genre songs from localStorage:', error)
    return []
  }
}

export const setGenreSongs = (genre: string, songs: GenreSong[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    const data = localStorage.getItem(GENRE_CACHE_KEY)
    const cache: GenreCache[] = data ? JSON.parse(data) : []
    
    const existingIndex = cache.findIndex(c => c.genre.toLowerCase() === genre.toLowerCase())
    
    if (existingIndex !== -1) {
      // Update existing genre cache
      cache[existingIndex] = {
        genre,
        songs,
        lastUpdated: Date.now()
      }
    } else {
      // Add new genre cache
      cache.push({
        genre,
        songs,
        lastUpdated: Date.now()
      })
    }
    
    localStorage.setItem(GENRE_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error writing genre songs to localStorage:', error)
  }
}

export const addGenreSongs = (genre: string, newSongs: GenreSong[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    const existingSongs = getGenreSongs(genre)
    const combinedSongs = [...existingSongs, ...newSongs]
    
    // Remove duplicates based on song ID
    const uniqueSongs = combinedSongs.filter((song, index, self) =>
      index === self.findIndex(s => s.id === song.id)
    )
    
    // Limit to 25 songs max
    const limitedSongs = uniqueSongs.slice(0, 25)
    
    setGenreSongs(genre, limitedSongs)
  } catch (error) {
    console.error('Error adding genre songs to localStorage:', error)
  }
}

export const clearGenreCache = (genre?: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    if (genre) {
      // Clear specific genre
      const data = localStorage.getItem(GENRE_CACHE_KEY)
      if (data) {
        const cache: GenreCache[] = JSON.parse(data)
        const updated = cache.filter(c => c.genre.toLowerCase() !== genre.toLowerCase())
        localStorage.setItem(GENRE_CACHE_KEY, JSON.stringify(updated))
      }
    } else {
      // Clear all genre cache
      localStorage.removeItem(GENRE_CACHE_KEY)
    }
  } catch (error) {
    console.error('Error clearing genre cache:', error)
  }
}

// Detected Songs
export interface DetectedSong {
  id: string
  timestamp: number
  response: any
}

export const getDetectedSongs = (): DetectedSong[] => {
  if (typeof window === 'undefined') return []
  const key = 'vibify_detected_songs'
  const data = localStorage.getItem(key)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export const addDetectedSong = (response: any): DetectedSong => {
  const detectedSongs = getDetectedSongs()
  
  // Extract song ID from response - use songs ID from relationships instead of shazam-songs ID
  const matches = response?.results?.matches || []
  let songId = Date.now().toString()
  
  if (matches.length > 0) {
    const shazamSongId = matches[0].id
    const shazamSongData = response?.resources?.['shazam-songs']?.[shazamSongId]
    const songsRelationship = shazamSongData?.relationships?.songs?.data
    
    if (songsRelationship && songsRelationship.length > 0) {
      songId = songsRelationship[0].id
    } else {
      songId = shazamSongId
    }
  }
  
  const detectedSong: DetectedSong = {
    id: songId,
    timestamp: Date.now(),
    response
  }
  
  // Add to beginning of array (most recent first)
  detectedSongs.unshift(detectedSong)
  
  // Keep only last 20 detections
  if (detectedSongs.length > 20) {
    detectedSongs.pop()
  }
  
  const key = 'vibify_detected_songs'
  localStorage.setItem(key, JSON.stringify(detectedSongs))
  
  return detectedSong
}

export const getLatestDetectedSong = (): DetectedSong | null => {
  const detectedSongs = getDetectedSongs()
  return detectedSongs.length > 0 ? detectedSongs[0] : null
}
