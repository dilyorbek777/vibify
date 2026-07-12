import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Layers } from 'lucide-react'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function GenreNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <BackgroundPattern />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Layers className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight font-heading">Genre Not Found</h1>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            The genre you're looking for doesn't exist. Try exploring our available genres.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild className="cursor-pointer">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="cursor-pointer">
              <Link href="/">Explore Genres</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
