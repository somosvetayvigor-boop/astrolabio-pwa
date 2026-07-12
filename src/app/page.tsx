import Link from "next/link";
import { createClient } from '@/utils/supabase/server'

export const revalidate = 0; // Dynamic rendering for the home page

export default async function Home(props: { searchParams: Promise<{ q?: string, cat?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  let query = supabase
    .from('books')
    .select('*, profiles!inner(full_name)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.cat) {
    query = query.eq('category', searchParams.cat)
  }

  const { data: books } = await query

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
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Catálogo</h2>
        
        <form method="GET" action="/#catalogo" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            name="q" 
            placeholder="Buscar por título..." 
            defaultValue={searchParams.q || ''} 
            style={{ flex: '1 1 300px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
          <select 
            name="cat" 
            defaultValue={searchParams.cat || ''}
            style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            <option value="">Todas las categorías</option>
            <option value="Romance">Romance</option>
            <option value="Ciencia Ficción">Ciencia Ficción</option>
            <option value="Fantasía">Fantasía</option>
            <option value="Terror / Suspenso">Terror / Suspenso</option>
            <option value="Desarrollo Personal">Desarrollo Personal</option>
            <option value="Artículos Científicos">Artículos Científicos</option>
            <option value="Infantil (0-5 años)">Infantil (0-5 años)</option>
            <option value="Infantil (6-9 años)">Infantil (6-9 años)</option>
            <option value="Infantil (10-12 años)">Infantil (10-12 años)</option>
            <option value="Poesía">Poesía</option>
            <option value="Biografía">Biografía</option>
            <option value="Otro">Otro</option>
          </select>
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>Filtrar</button>
          
          {(searchParams.q || searchParams.cat) && (
            <Link href="/#catalogo" className="btn btn-secondary" style={{ padding: '0.75rem 1rem', background: 'transparent', border: '1px solid var(--border-color)' }}>Limpiar</Link>
          )}
        </form>
        
        {featuredBooks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No se encontraron libros con estos filtros.</p>
          </div>
        ) : (
          <div className="book-grid">
            {featuredBooks.map((book) => {
              const isPromoActive = book.promotional_free_until && new Date(book.promotional_free_until) > new Date();
              const isFree = book.price === 0 || isPromoActive;
              
              return (
              <div className="book-card" key={book.id} style={{ position: 'relative' }}>
                {isPromoActive && (
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--brand-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, zIndex: 10, boxShadow: '0 4px 10px rgba(255,165,0,0.3)', transform: 'rotate(5deg)' }}>
                    ¡Gratis hoy!
                  </div>
                )}
                <Link href={`/book/${book.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div className="book-cover" style={{ backgroundImage: `url(${book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                </Link>
                <div className="book-info">
                  {book.category && <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{book.category}</span>}
                  
                  <Link href={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="book-title" style={{ marginTop: '0.25rem' }}>{book.title}</h3>
                  </Link>

                  <Link href={`/author/${book.author_id}`} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    <p className="book-author" style={{ margin: 0 }}>{book.profiles?.full_name || 'Autor Desconocido'}</p>
                  </Link>
                  
                  <div className="book-footer">
                    <span className="book-price">
                      {isFree ? <span style={{ color: 'var(--brand-primary)' }}>Gratis</span> : `$${book.price}`}
                      {isPromoActive && <span style={{ textDecoration: 'line-through', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>${book.price}</span>}
                    </span>
                    <Link href={`/book/${book.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', textDecoration: 'none' }}>Leer</Link>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </section>
    </div>
  );
}
