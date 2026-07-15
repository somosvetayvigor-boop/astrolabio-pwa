import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Playlists - Astrolabio',
  description: 'Descubre listas de lectura creadas por la comunidad.',
}

export default async function PlaylistsPage() {
  const supabase = await createClient()

  // Fetch Public Playlists
  const { data: publicPlaylists } = await supabase
    .from('playlists')
    .select('*, profiles(full_name, username)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  // Fetch User's Playlists
  const { data: { user } } = await supabase.auth.getUser()
  let userPlaylists: any[] = []
  if (user) {
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) userPlaylists = data
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Listas de Lectura 📚</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.125rem' }}>
        Descubre colecciones curadas por la comunidad de Astrolabio.
      </p>

      {user && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👤</span> Tus Listas
          </h2>
          {userPlaylists.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {userPlaylists.map(playlist => (
                <Link key={playlist.id} href={`/playlists/${playlist.id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass hover-glow" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{playlist.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>{playlist.description || 'Sin descripción'}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {playlist.is_public ? '🌐 Pública' : '🔒 Privada'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Aún no has creado ninguna lista.</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Ve a cualquier libro y toca "Guardar" para empezar tu primera colección.</p>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌐</span> Listas de la Comunidad
        </h2>
        {publicPlaylists && publicPlaylists.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {publicPlaylists.map(playlist => (
              <Link key={playlist.id} href={`/playlists/${playlist.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass hover-glow" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{playlist.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>{playlist.description || 'Sin descripción'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Por <strong style={{ color: 'var(--text-primary)' }}>{playlist.profiles?.full_name || 'Alguien'}</strong></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Aún no hay listas públicas en la comunidad. ¡Sé el primero en crear una!</p>
        )}
      </div>
    </div>
  )
}
