'use client'

import { useState, useEffect } from 'react'
import { getUserPlaylists, createPlaylist, addBookToPlaylist } from '@/app/actions/playlists'

interface SaveToPlaylistModalProps {
  bookId: string
  onClose: () => void
}

export default function SaveToPlaylistModal({ bookId, onClose }: SaveToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    const { data } = await getUserPlaylists()
    if (data) setPlaylists(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setSavingId('new')
    const { data, error } = await createPlaylist(newTitle.trim(), '', true)
    if (error) {
      alert(error)
      setSavingId(null)
      return
    }
    if (data) {
      // Auto add book to the new playlist
      await handleAddToPlaylist(data.id)
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    setSavingId(playlistId)
    const { error } = await addBookToPlaylist(playlistId, bookId)
    setSavingId(null)
    if (error) {
      alert(error)
    } else {
      alert('¡Libro agregado a la lista!')
      onClose()
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
        padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%',
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Guardar en Lista</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando tus listas...</p>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {playlists.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No tienes listas de lectura aún.</p>
            ) : (
              playlists.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleAddToPlaylist(p.id)}
                  disabled={savingId !== null}
                  style={{
                    padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'left',
                    cursor: savingId ? 'wait' : 'pointer', display: 'flex', justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{p.title}</span>
                  {savingId === p.id && <span style={{ color: 'var(--brand-primary)' }}>Guardando...</span>}
                </button>
              ))
            )}
          </div>
        )}

        {isCreating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Nombre de la nueva lista..." 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button 
                onClick={handleCreate} 
                disabled={!newTitle.trim() || savingId !== null}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--brand-primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                {savingId === 'new' ? 'Creando...' : 'Crear y Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
          >
            + Crear nueva lista
          </button>
        )}
      </div>
    </div>
  )
}
