import { getArtistSummary, formatAppleMusicArtist, formatAppleMusicAlbum, formatShazamTrack } from '@/lib/shazam-api'
import { notFound } from 'next/navigation'
import ArtistClient from './artist-client.tsx'
import type { Metadata } from 'next'

interface ArtistPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { id: artistId } = await params
  
  try {
    const summaryData = await getArtistSummary(artistId)
    const artistData = summaryData?.resources?.artists?.[artistId]
    const artist = artistData ? formatAppleMusicArtist(artistData) : null
    
    if (!artist) {
      return {
        title: 'Artist | Vibify',
      }
    }
    
    const artistImage = artist.image?.startsWith('http') ? artist.image : undefined
    
    return {
      title: `${artist.name} | Vibify`,
      description: `Listen to ${artist.name}'s top songs and albums on Vibify. ${artist.genres?.slice(0, 3).join(', ') || 'Music'}`,
      openGraph: {
        title: `${artist.name} - Artist on Vibify`,
        description: `Discover music by ${artist.name}. Stream their top songs and albums.`,
        images: artistImage ? [{ url: artistImage, width: 1200, height: 630, alt: artist.name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${artist.name} on Vibify`,
        description: `Listen to ${artist.name} on Vibify`,
        images: artistImage ? [artistImage] : [],
      },
    }
  } catch {
    return {
      title: 'Artist | Vibify',
    }
  }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { id: artistId } = await params

  let summaryData = null
  let error = null

  try {
    summaryData = await getArtistSummary(artistId)
  } catch (err) {
    console.error('Error fetching artist summary:', err)
    error = err instanceof Error ? err.message : 'Failed to load artist data'
  }

  if (!summaryData && !error) {
    notFound()
  }

  // Extract artist data from summary
  const artistData = summaryData?.resources?.artists?.[artistId]
  const artist = artistData ? formatAppleMusicArtist(artistData) : {
    id: artistId,
    name: 'Unknown Artist',
    image: '🎤',
    genres: [],
    url: '',
    verified: false,
  }

  // Extract albums from summary
  const albumsData = artistData?.relationships?.albums?.data?.map((albumRef: { id: string }) =>
    summaryData?.resources?.albums?.[albumRef.id]
  ).filter(Boolean) || []

  const albums = albumsData.map(formatAppleMusicAlbum)

  // Extract top songs from summary
  const topSongsData = artistData?.views?.['top-songs']?.data?.map((songRef: { id: string }) =>
    summaryData?.resources?.songs?.[songRef.id]
  ).filter(Boolean) || []

  const popularSongs = topSongsData.map(formatShazamTrack).slice(0, 10)

  return <ArtistClient artist={artist} albums={albums} popularSongs={popularSongs} error={error} />
}