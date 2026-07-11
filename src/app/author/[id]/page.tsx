import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { notFound } from "next/navigation";

export default async function AuthorProfile(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !profile) {
    notFound()
  }

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('author_id', params.id)
    .order('created_at', { ascending: false })

  const authorBooks = books || []

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1000px' }}>
      
      {/* Author Header */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '4rem', flexWrap: 'wrap' }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }} />
        ) : (
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--text-tertiary)', boxShadow: 'var(--shadow-md)' }}>
            👤
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{profile.full_name}</h1>
          {profile.bio ? (
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {profile.bio}
            </p>
          ) : (
            <p style={{ fontSize: '1.125rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Este autor aún no ha escrito su biografía.
            </p>
          )}
        </div>
      </div>

      {/* Author's Books */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Libros Publicados ({authorBooks.length})</h2>
      
      {authorBooks.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No hay libros publicados por este autor.</p>
        </div>
      ) : (
        <div className="book-grid">
          {authorBooks.map((book) => (
            <Link href={`/book/${book.id}`} key={book.id}>
              <div className="book-card">
                <div className="book-cover" style={{ backgroundImage: `url(${book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div className="book-info">
                  {book.category && <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{book.category}</span>}
                  <h3 className="book-title" style={{ marginTop: '0.25rem' }}>{book.title}</h3>
                  <div className="book-footer">
                    <span className="book-price">${book.price}</span>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Ver Libro</button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
