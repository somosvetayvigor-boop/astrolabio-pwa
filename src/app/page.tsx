import Link from "next/link";
import { createClient } from '@/utils/supabase/server'

export const revalidate = 0; // Dynamic rendering for the home page

export default async function Home() {
  const supabase = await createClient()

  const { data: books } = await supabase
    .from('books')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  const featuredBooks = books || []

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Descubre historias increíbles. <br />Apoya a creadores independientes.</h1>
          <p>Lee miles de libros de autores emergentes. Paga por libro o suscríbete para leer sin límites, mientras los autores ganan por cada página que disfrutas.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="#catalogo" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Explorar Catálogo</Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Publicar mi Libro</Link>
          </div>
        </div>
      </section>

      <section id="catalogo" className="container" style={{ paddingBottom: '4rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>Destacados de esta semana</h2>
        
        {featuredBooks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No hay libros publicados todavía. ¡Sé el primero en subir uno!</p>
          </div>
        ) : (
          <div className="book-grid">
            {featuredBooks.map((book) => (
              <Link href={`/book/${book.id}`} key={book.id}>
                <div className="book-card">
                  <div className="book-cover" style={{ backgroundImage: `url(${book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.profiles?.full_name || 'Autor Desconocido'}</p>
                    <div className="book-footer">
                      <span className="book-price">${book.price}</span>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Leer</button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
