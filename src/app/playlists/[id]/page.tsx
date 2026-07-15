import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function PlaylistDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: playlist, error } = await supabase
    .from('playlists')
    .select('*, profiles(full_name)')
    .eq('id', params.id)
    .single()

  if (error || !playlist) {
    notFound()
  }

  // If playlist is private, only owner can view
  if (!playlist.is_public && playlist.user_id !== user?.id) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Esta lista es privada.</h2>
      </div>
    )
  }

  // Fetch books in playlist
  const { data: playlistBooks } = await supabase
    .from('playlist_books')
    .select('added_at, books(*, profiles(full_name))')
    .eq('playlist_id', playlist.id)
    .order('added_at', { ascending: false })

  const isOwner = user?.id === playlist.user_id

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1000px' }}>
      <Link href="/playlists" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <span>←</span> Volver a Listas
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{playlist.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>{playlist.description || 'Sin descripción'}</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            Creada por <strong style={{ color: 'var(--text-primary)' }}>{playlist.profiles?.full_name || 'Alguien'}</strong>
          </span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>•</span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            {playlistBooks?.length || 0} libros
          </span>
          <span style={{ marginLeft: 'auto', backgroundColor: playlist.is_public ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: playlist.is_public ? '#22c55e' : '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
            {playlist.is_public ? 'Pública' : 'Privada'}
          </span>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Libros en esta lista</h2>
        {playlistBooks && playlistBooks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {playlistBooks.map(({ books: book }: any) => {
              if (!book) return null;
              const defaultCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop"
              return (
                <Link key={book.id} href={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass hover-glow" style={{ display: 'flex', gap: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '90px', backgroundImage: `url(${book.cover_url || defaultCover})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{book.title}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{book.profiles?.full_name || 'Autor'}</p>
                      <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        {book.category || 'Ficción'} • ${book.price} MXN
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Esta lista está vacía.</p>
        )}
      </div>
    </div>
  )
}
