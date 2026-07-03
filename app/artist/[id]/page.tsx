import { getArtistDetails, getArtistAlbums, getArtistTopSongs, formatAppleMusicArtist, formatAppleMusicAlbum, formatShazamTrack } from '@/lib/shazam-api'
import { notFound } from 'next/navigation'
import ArtistClient from './artist-client.tsx'

interface ArtistPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { id: artistId } = await params
  
  let artistData = null
  let albumsData: any[] = []
  let topSongsData: any[] = []
  let error = null

  try {
    // Stagger requests to avoid rate limiting
    artistData = await getArtistDetails(artistId)
    
    // Only fetch albums if artist data was successfully retrieved
    if (artistData) {
      // Wait 500ms before next request
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        albumsData = await getArtistAlbums(artistId)
      } catch (albumErr) {
        console.warn('Failed to fetch albums, continuing without them:', albumErr)
      }
      
      // Wait another 500ms before final request
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        topSongsData = await getArtistTopSongs(artistId)
      } catch (songsErr) {
        console.warn('Failed to fetch top songs, continuing without them:', songsErr)
      }
    }
  } catch (err) {
    console.error('Error fetching artist data:', err)
    error = err instanceof Error ? err.message : 'Failed to load artist data'
  }

  if (!artistData && !error) {
    notFound()
  }

  const artist = artistData ? formatAppleMusicArtist(artistData) : {
    id: artistId,
    name: 'Unknown Artist',
    image: '🎤',
    genres: [],
    url: '',
    verified: false,
  }

  const albums = albumsData.map(formatAppleMusicAlbum)
  const popularSongs = topSongsData.map(formatShazamTrack).slice(0, 10)

  return <ArtistClient artist={artist} albums={albums} popularSongs={popularSongs} error={error} />
}