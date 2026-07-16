import { getArtistSummary, formatAppleMusicArtist, formatAppleMusicAlbum, formatShazamTrack } from '@/lib/shazam-api'
import { notFound } from 'next/navigation'
import ArtistClient from './artist-client.tsx'

interface ArtistPageProps {
  params: Promise<{
    id: string
  }>
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