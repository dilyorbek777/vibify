import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, TrendingUp, Music } from 'lucide-react'
import BackgroundPattern from '@/components/BackgroundPattern'
import { topArtists } from '@/constants'
import Link from 'next/link'

export default function TopArtistsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-24">
      <BackgroundPattern />
      <main className="max-w-7xl relative z-10 mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-sans mb-2 flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              Top Artists
            </h1>
            <p className="text-muted-foreground">
              The {topArtists.length} most streamed artists globally in 2026
            </p>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {topArtists.map((artist) => (
            <Link href={`/?q=${artist.artist}`}
              key={artist.rank}
              className="group relative overflow-hidden border border-border/20 bg-card/30 hover:bg-card/70 transition-all duration-300 rounded-xl p-6 flex flex-col gap-4"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge 
                  variant={artist.rank <= 3 ? "default" : "secondary"}
                  className={`rounded-full px-3 py-1 font-bold text-sm ${
                    artist.rank <= 3 
                      ? 'bg-linear-to-r from-primary to-primary/80 shadow-lg' 
                      : 'bg-muted/60'
                  }`}
                >
                  #{artist.rank}
                </Badge>
              </div>

              {/* Artist Info */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border/20 shrink-0">
                    <Music className="h-8 w-8 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold tracking-tight truncate group-hover:text-primary transition-colors font-sans">
                      {artist.artist}
                    </h3>
                    <p className="text-sm text-muted-foreground/80 font-medium">
                      {artist.primary_genre}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-primary/70" />
                    <span className="text-muted-foreground">Streams:</span>
                    <span className="font-semibold text-foreground">{artist.global_streams_2026}</span>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3 border border-border/10">
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">
                      {artist.notable_achievement}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
