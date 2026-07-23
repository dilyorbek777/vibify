'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLikedSongs, removeFromLikedSongs, getViewPreference, setViewPreference, updateLikedSongsOrder } from '@/lib/local-storage'
import { ArrowLeft, Layers, Trash2, List, Grid3x3, Heart, GripVertical } from 'lucide-react'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function LikedSongsPage() {
  const [likedSongs, setLikedSongs] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    setLikedSongs(getLikedSongs())
    setViewMode(getViewPreference())
  }, [])

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(newMode)
    setViewPreference(newMode)
  }

  const handleDelete = (e: React.MouseEvent, songId: string) => {
    e.preventDefault()
    e.stopPropagation()
    removeFromLikedSongs(songId)
    setLikedSongs(getLikedSongs().filter(song => song.id !== songId))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newSongs = [...likedSongs]
    const [draggedSong] = newSongs.splice(draggedIndex, 1)
    newSongs.splice(dropIndex, 0, draggedSong)

    setLikedSongs(newSongs)
    updateLikedSongsOrder(newSongs)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
      <BackgroundPattern />
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 pb-20 md:pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-card/50 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight font-sans">Liked Songs</h1>
          </div>

          <button
            onClick={toggleViewMode}
            className="p-2 rounded-lg hover:bg-card/50 transition-colors"
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
          </button>

          <span className="text-sm text-muted-foreground ml-auto">
            {likedSongs.length} songs
          </span>
        </div>

        {/* Songs Grid/List */}
        {likedSongs.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {likedSongs.map(track => (
                <div
                  key={track.id}
                  className="group bg-card/30 hover:bg-card/70 border border-border/10 p-3 rounded-xl flex items-center gap-4 transition-all duration-200 relative"
                >
                  <Link
                    href={`/music/${track.id}`}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="h-14 w-14 rounded-md bg-muted/60 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-95 transition-transform duration-200 overflow-hidden">
                      {track.image?.startsWith('http') ? (
                        <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{track.image || '🎵'}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors font-sans">
                        {track.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, track.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from liked songs"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {likedSongs.map((track, index) => (
                <div
                  key={track.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group bg-card/30 hover:bg-card/70 border border-border/10 p-4 rounded-xl flex items-center gap-4 transition-all duration-200 relative cursor-move ${
                    draggedIndex === index ? 'bg-primary/20 border-2 border-primary' : ''
                  }`}
                >
                  <div className="w-6 text-center text-sm font-semibold text-muted-foreground shrink-0 flex items-center justify-center">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <Link
                    href={`/music/${track.id}`}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="h-12 w-12 rounded-md bg-muted/60 flex items-center justify-center text-xl shrink-0 shadow-inner overflow-hidden">
                      {track.image?.startsWith('http') ? (
                        <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{track.image || '🎵'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm tracking-tight truncate group-hover:text-primary transition-colors font-sans">
                        {track.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, track.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from liked songs"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 font-sans">No liked songs</h3>
            <p className="text-muted-foreground">Like songs to build your collection</p>
          </div>
        )}
      </main>
    </div>
  )
}
