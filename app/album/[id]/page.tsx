import { notFound } from 'next/navigation'
import { getAlbumDetails, formatAlbumTrack } from '@/lib/shazam-api'
import { Play, Clock, Calendar, Disc, Music, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import AlbumContent from './AlbumContent.tsx'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AlbumPage({ params }: PageProps) {
  const { id: albumId } = await params
  let album

  try {
    album = await getAlbumDetails(albumId)
  } catch (error) {
    console.error('Error fetching album:', error)
    if (error instanceof Error && error.message.includes('404')) {
      notFound()
    }
  }

  if (!album) {
    notFound()
  }

  const attrs = album.attributes
  const tracks = album.relationships?.tracks?.data || []
  const formattedTracks = tracks.map(formatAlbumTrack)
  
  const coverArt = attrs.artwork?.url?.replace('{w}x{h}bb', '600x600bb') || ''
  const releaseYear = new Date(attrs.releaseDate).getFullYear()
  const totalDuration = formattedTracks.reduce((acc, track) => {
    const [mins, secs] = track.duration.split(':').map(Number)
    return acc + mins * 60 + secs
  }, 0)
  const totalMins = Math.floor(totalDuration / 60)
  const totalSecs = totalDuration % 60

  return (
    <AlbumContent
      album={album}
      formattedTracks={formattedTracks}
      coverArt={coverArt}
      releaseYear={releaseYear}
      totalMins={totalMins}
      totalSecs={totalSecs}
    />
  )
}
