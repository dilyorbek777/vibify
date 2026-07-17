'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, ListMusic, Heart, Zap, Users, Award, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Recents', href: '/recents', icon: Clock },
  { name: 'My Playlists', href: '/myplaylists', icon: ListMusic },
  { name: 'Liked', href: '/liked', icon: Heart },
  { name: 'Downloaded', href: '/music/downloaded', icon: Download },
  { name: 'Following', href: '/following', icon: Users },
  { name: 'Top Artists', href: '/top-artists', icon: Award },
  { name: 'Hover Demo', href: '/hover-anim', icon: Zap },
]

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="hidden font-heading lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-border/40 bg-background/80 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border/20">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black">
            V
          </div>
          <span className="text-xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-heading">
            vibify<span className="text-primary">.</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
