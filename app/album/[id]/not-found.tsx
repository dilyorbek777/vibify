import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Disc } from 'lucide-react'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function AlbumNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <BackgroundPattern />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Disc className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight font-sans">Album Not Found</h1>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            The album you're looking for doesn't exist or has been removed.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild className="cursor-pointer">
              <Link href="/">Go Home</Link>
            </Button>
            
          </div>
        </div>
      </div>
    </div>
  )
}
