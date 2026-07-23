import { notFound } from 'next/navigation'
import { getAlbumDetails, formatAlbumTrack } from '@/lib/shazam-api'
import { Play, Clock, Calendar, Disc, Music, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import AlbumContent from './AlbumContent.tsx'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: albumId } = await params
  
  try {
    const album = await getAlbumDetails(albumId)
    
    if (!album) {
      return {
        title: 'Album | Vibify',
      }
    }
    
    const attrs = album.attributes
    const coverArt = attrs.artwork?.url?.replace('{w}x{h}bb', '600x600bb') || ''
    const artistName = attrs.artistName || 'Unknown Artist'
    const releaseYear = new Date(attrs.releaseDate).getFullYear()
    
    return {
      title: `${attrs.name} by ${artistName} | Vibify`,
      description: `Listen to ${attrs.name} by ${artistName} (${releaseYear}). ${attrs.genreNames?.slice(0, 3).join(', ') || 'Music'}`,
      openGraph: {
        title: `${attrs.name} - ${artistName}`,
        description: `Album by ${artistName} released in ${releaseYear}. Stream on Vibify.`,
        images: coverArt ? [{ url: coverArt, width: 1200, height: 630, alt: attrs.name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${attrs.name} by ${artistName}`,
        description: `Listen to ${attrs.name} on Vibify`,
        images: coverArt ? [coverArt] : [],
      },
    }
  } catch {
    return {
      title: 'Album | Vibify',
    }
  }
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
