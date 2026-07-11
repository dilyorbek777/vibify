'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Clock, ListMusic, Heart, Search, X, Clock as ClockIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Input } from './ui/input'
import { getSearchHistory, addSearchToHistory } from '@/lib/local-storage'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Recents', href: '/recents', icon: Clock },
  { name: 'Playlists', href: '/myplaylists', icon: ListMusic },
  { name: 'Liked', href: '/liked', icon: Heart },
]

const MobileBottomBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchPanel(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addSearchToHistory(searchQuery.trim())
      setSearchHistory(getSearchHistory())
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchPanel(false)
      setSearchQuery('')
    }
  }

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query)
    addSearchToHistory(query)
    setSearchHistory(getSearchHistory())
    router.push(`/?q=${encodeURIComponent(query)}`)
    setShowSearchPanel(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/40 z-50">
        <div className="flex items-center justify-around p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all cursor-pointer min-w-[60px]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
          
          {/* Search Button */}
          <button
            onClick={() => setShowSearchPanel(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all cursor-pointer min-w-[60px] text-muted-foreground hover:text-foreground"
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
        </div>
      </div>

      {/* Search Panel Overlay */}
      {showSearchPanel && (
        <div className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-border/40">
            <button
              onClick={() => setShowSearchPanel(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <Input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border-border/50 focus-visible:ring-primary/50 transition-all rounded-full"
                autoFocus
              />
            </form>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Searches</h3>
              <div className="space-y-1">
                {searchHistory.slice(0, 10).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(query)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <ClockIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default MobileBottomBar
