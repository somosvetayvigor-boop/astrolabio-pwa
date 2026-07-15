import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStreakBadge, getVolumeBadge } from '@/utils/gamification'
import OfflineBooksList from '@/components/OfflineBooksList'

export default async function LibraryPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const tab = searchParams.tab || 'coleccion'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch purchased books
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select(`
      books (
        id,
        title,
        cover_url,
        author_id,
        profiles (
          full_name
        )
      )
    `)
    .eq('user_id', user.id)

  // Fetch books started reading (reading_progress)
  const { data: readingProgress, error: readingError } = await supabase
    .from('reading_progress')
    .select(`
      books (
        id,
        title,
        cover_url,
        author_id,
        profiles (
          full_name
        )
      )
    `)
    .eq('user_id', user.id)

  // Extract books and remove duplicates by ID
  const allBooksMap = new Map<string, any>()
  
  if (purchases) {
    purchases.forEach((p: any) => {
      if (p.books && p.books.id) allBooksMap.set(p.books.id, p.books)
    })
  }
  
  if (readingProgress) {
    readingProgress.forEach((rp: any) => {
      if (rp.books && rp.books.id) allBooksMap.set(rp.books.id, rp.books)
    })
  }

  const myLibraryBooks = Array.from(allBooksMap.values())

  // Fetch gamification stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const { count: completedBooksCount } = await supabase
    .from('reading_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_completed', true)

  const streakBadge = getStreakBadge(profile?.current_streak || 0)
  const volumeBadge = getVolumeBadge(completedBooksCount || 0)

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      
      {/* Gamification Dashboard */}
      <div className="glass" style={{ marginBottom: '3rem', padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary)' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '3px solid var(--brand-primary)' }}>👤</div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{profile?.full_name || 'Lector'}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Progreso Literario</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flex: '2 1 400px', flexWrap: 'wrap' }}>
          
          {/* Racha Badge */}
          <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${streakBadge.color}`, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>{streakBadge.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Racha (Días)</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: streakBadge.color }}>{streakBadge.title}</p>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Llevas <strong>{profile?.current_streak || 0}</strong> días seguidos.</p>
            {streakBadge.nextGoal && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Faltan {streakBadge.nextGoal - (profile?.current_streak || 0)} días para evolucionar.</p>
            )}
          </div>

          {/* Volume Badge */}
          <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${volumeBadge.color}`, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>{volumeBadge.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Libros Terminados</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: volumeBadge.color }}>{volumeBadge.title}</p>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Has completado <strong>{completedBooksCount || 0}</strong> libros.</p>
            {volumeBadge.nextGoal && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Faltan {volumeBadge.nextGoal - (completedBooksCount || 0)} para el siguiente nivel.</p>
            )}
          </div>

        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Mi Biblioteca</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/library?tab=coleccion" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, backgroundColor: tab === 'coleccion' ? 'var(--brand-primary)' : 'var(--bg-secondary)', color: tab === 'coleccion' ? 'white' : 'var(--text-secondary)', textDecoration: 'none' }}>
            📚 Colección
          </Link>
          <Link href="/library?tab=descargas" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, backgroundColor: tab === 'descargas' ? 'var(--brand-primary)' : 'var(--bg-secondary)', color: tab === 'descargas' ? 'white' : 'var(--text-secondary)', textDecoration: 'none' }}>
            📴 Descargas
          </Link>
          <Link href="/playlists" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>🎧</span> Playlists
          </Link>
        </div>
      </div>
      
      {tab === 'coleccion' ? (
        myLibraryBooks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Tu biblioteca está vacía</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Aún no has adquirido ningún libro. ¡Explora el catálogo y apoya a los autores independientes!
            </p>
            <Link href="/#catalogo" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="books-grid">
            {myLibraryBooks.map((book: any) => (
              <div key={book.id} className="book-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href={`/book/${book.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={`Portada de ${book.title}`} className="book-cover" />
                  ) : (
                    <div className="book-cover" style={{ backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Sin Portada</span>
                    </div>
                  )}
                  <div className="book-info" style={{ padding: '1rem', flex: 1 }}>
                    <h3 className="book-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>{book.title}</h3>
                    <p className="book-author" style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Por {book.profiles?.full_name || 'Autor Desconocido'}
                    </p>
                  </div>
                </Link>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                  <Link href={`/reader/${book.id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', fontSize: '1rem' }}>
                    📖 Leer Ahora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <OfflineBooksList books={myLibraryBooks} />
      )}
    </div>
  )
}
