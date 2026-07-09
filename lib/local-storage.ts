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
