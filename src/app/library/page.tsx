import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch purchased books
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      id,
      created_at,
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
    .order('created_at', { ascending: false })

  // Supabase returns books as an object or array depending on the relationship, 
  // since it's a many-to-one (many purchases to one book), books is an object.
  // We'll map it safely.
  const purchasedBooks = (purchases || []).map((p: any) => p.books).filter(Boolean)

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Mi Biblioteca</h1>
      
      {purchasedBooks.length === 0 ? (
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
          {purchasedBooks.map((book: any) => (
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
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                  Disponible offline tras abrir
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
