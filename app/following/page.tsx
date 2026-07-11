'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Radio, Users, Heart, Music } from 'lucide-react'
import Link from 'next/link'
import { getFollowedArtists, unfollowArtist } from '@/lib/local-storage'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function FollowingPage() {
  const [followedArtists, setFollowedArtists] = useState<any[]>([])

  useEffect(() => {
    setFollowedArtists(getFollowedArtists())
  }, [])

  const handleUnfollow = (artistId: string) => {
    unfollowArtist(artistId)
    setFollowedArtists(getFollowedArtists())
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-24">
      <BackgroundPattern />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-heading mb-2">Following</h1>
            <p className="text-muted-foreground">
              {followedArtists.length} {followedArtists.length === 1 ? 'artist' : 'artists'} you follow
            </p>
          </div>
        </div>

        {/* Artists Grid */}
        {followedArtists.length === 0 ? (
          <div className="text-center py-24 bg-card/20 border border-border/10 rounded-xl">
            <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-6 border border-border/10">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">No artists followed yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Follow your favorite artists to see them here and stay updated with their latest releases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {followedArtists.map((artist) => (
              <Card
                key={artist.id}
                className="group relative overflow-hidden border-none bg-card/30 hover:bg-card/70 transition-all duration-300 cursor-pointer rounded-xl p-4 flex flex-col gap-4"
              >
                <Link href={`/artist/${artist.id}`} className="absolute inset-0 z-10" />
                
                <div className="aspect-square w-full bg-muted/40 rounded-full flex items-center justify-center relative shadow-md group-hover:shadow-xl transition-shadow overflow-hidden border border-border/10">
                  {artist.image.startsWith('http') ? (
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{artist.image}</span>
                  )}
                  
                  {artist.verified && (
                    <Badge variant="secondary" className="absolute bottom-3 left-3 bg-primary/10 text-primary border-transparent rounded-full px-2 py-0.5 font-semibold gap-1 text-[10px] tracking-wide uppercase pointer-events-none font-ui z-20">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 px-1 z-20">
                  <h3 className="text-sm font-bold tracking-tight truncate group-hover:text-primary transition-colors font-heading">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5 font-medium truncate">
                    <Radio className="h-3 w-3" /> {artist.genres.slice(0, 2).join(', ')}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    handleUnfollow(artist.id)
                  }}
                  className="z-20 w-full rounded-full border-border/60 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
                >
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Following
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
