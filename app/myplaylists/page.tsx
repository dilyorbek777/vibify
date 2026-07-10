'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Music4, Play, Trash2, Edit2, Plus } from 'lucide-react'
import { getPlaylists, deletePlaylist, updatePlaylistName, createPlaylist } from '@/lib/local-storage'
import Link from 'next/link'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function Playlists() {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  useEffect(() => {
    setPlaylists(getPlaylists())
  }, [])

  const handleDelete = (playlistId: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlistId)
      setPlaylists(playlists.filter(p => p.id !== playlistId))
    }
  }

  const handleStartEdit = (playlist: any) => {
    setEditingId(playlist.id)
    setEditName(playlist.name)
  }

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updatePlaylistName(editingId, editName.trim())
      setPlaylists(playlists.map(p =>
        p.id === editingId ? { ...p, name: editName.trim() } : p
      ))
      setEditingId(null)
      setEditName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleCreatePlaylist = () => {
    const name = newPlaylistName.trim() || undefined
    const newPlaylist = createPlaylist(name)
    setPlaylists([...playlists, newPlaylist])
    setNewPlaylistName('')
    setShowCreatePlaylist(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <BackgroundPattern />
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading mb-2">My Playlists</h1>
            <p className="text-muted-foreground">Manage your personal music collections</p>
          </div>
          <Button onClick={() => setShowCreatePlaylist(true)} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>

        {showCreatePlaylist && (
          <div className="mb-6 p-4 bg-card/30 border border-border/30 rounded-xl flex flex-col items-center w-[300px]">
            <input
              type="text"
              placeholder="Playlist name (optional)"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-background border border-border/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreatePlaylist} size="sm" className="cursor-pointer">
                Create
              </Button>
              <Button onClick={() => setShowCreatePlaylist(false)} variant="outline" size="sm" className="cursor-pointer">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {playlists.length === 0 ? (
          <div className="text-center py-20 bg-card/20 border border-border/10 rounded-xl">
            <Music4 className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No playlists yet</p>
            <p className="text-sm text-muted-foreground/60">Go to the home page to create your first playlist</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="group relative overflow-hidden border-none bg-card/30 hover:bg-card/70 transition-all duration-300 rounded-xl p-4 flex flex-col gap-4"
              >
                <div className="aspect-square w-full bg-muted/40 rounded-lg flex items-center justify-center text-5xl relative shadow-md overflow-hidden">
                  {playlist.songs.length > 0 && playlist.songs[0].image?.startsWith('http') ? (
                    <img src={playlist.songs[0].image} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music4 size={55} className='text-primary' />
                  )}
                  <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 scale-90 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                    <Button asChild size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform cursor-pointer">
                      <Link href={`/myplaylists/${playlist.id}`}>
                        <Play className="h-5 w-5 fill-current" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 px-1">
                  {editingId === playlist.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-background border border-border/40 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEdit} className="cursor-pointer px-2">
                        ✓
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="cursor-pointer px-2">
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold tracking-tight line-clamp-1 font-heading flex-1">
                        {playlist.name}
                      </CardTitle>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(playlist)}
                          className="h-6 w-6 p-0 hover:bg-muted cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(playlist.id)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                  </CardDescription>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}