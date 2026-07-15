import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import VirtualLibrarian from '@/components/VirtualLibrarian'
import PlayAudioButton from '@/components/PlayAudioButton'

export const revalidate = 0; // Dynamic rendering for the home page

export default async function Home(props: { searchParams: Promise<{ q?: string, cat?: string, format?: string }> }) {
  const searchParams = await props.searchParams;
  const currentFormat = searchParams.format || 'ebook';
  const supabase = await createClient()

  let isSubscribed = false;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single();
    isSubscribed = profile?.subscription_status === 'active';
  }

  let query = supabase
    .from('books')
    .select('*, profiles!inner(full_name)')
    .eq('format_type', currentFormat)
    .or('is_hidden.is.null,is_hidden.eq.false')
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch books for the Quote of the Day
  const { data: booksWithQuotes } = await supabase
    .from('books')
    .select('id, title, quote, profiles!inner(full_name)')
    .not('quote', 'is', null)
    .neq('quote', '')
    .limit(50)

  let randomQuoteBook = null;
  if (booksWithQuotes && booksWithQuotes.length > 0) {
    randomQuoteBook = booksWithQuotes[Math.floor(Math.random() * booksWithQuotes.length)];
  }

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
      <section className="hero" style={{ 
        backgroundImage: 'linear-gradient(rgba(17, 26, 40, 0.7), rgba(17, 26, 40, 0.8)), url("/hero-bg.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff'
      }}>
        <div className="container">
          <h1>Descubre historias increíbles. <br />Apoya a creadores independientes.</h1>
          <p>Lee miles de libros de autores emergentes. Paga por libro o suscríbete para leer sin límites, mientras los autores ganan por cada página que disfrutas.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="#catalogo" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Explorar Catálogo</Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Publicar mi Libro</Link>
          </div>
        </div>
      </section>

      {randomQuoteBook && (
        <section className="container" style={{ marginTop: '3rem', marginBottom: '1rem' }}>
          <Link href={`/book/${randomQuoteBook.id}`} style={{ textDecoration: 'none' }}>
            <div className="glass" style={{ 
              padding: '2.5rem 2rem', 
              borderRadius: 'var(--radius-lg)', 
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontSize: '8rem', color: 'rgba(212, 175, 55, 0.1)', lineHeight: 1, fontFamily: 'serif' }}>"</div>
              
              <h2 style={{ fontSize: '1rem', color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: 700 }}>Frase del Día</h2>
              
              <p style={{ 
                fontSize: '1.5rem', 
                fontStyle: 'italic', 
                color: 'var(--text-primary)', 
                lineHeight: 1.6,
                maxWidth: '800px',
                margin: '0 auto 2rem auto',
                position: 'relative',
                zIndex: 1
              }}>
                “{randomQuoteBook.quote}”
              </p>
              
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'var(--text-secondary)',
                margin: 0,
                textAlign: 'right',
                maxWidth: '800px',
                marginInline: 'auto'
              }}>
                — {randomQuoteBook.profiles?.full_name}, <span style={{ fontWeight: 600 }}>{randomQuoteBook.title}</span>
              </p>
            </div>
          </Link>
        </section>
      )}

      <section id="catalogo" className="container" style={{ paddingBottom: '4rem', paddingTop: randomQuoteBook ? '2rem' : '4rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Catálogo</h2>
        
        {/* Format Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <Link href={`/?format=ebook#catalogo`} style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: currentFormat === 'ebook' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: currentFormat === 'ebook' ? 700 : 500, borderBottom: currentFormat === 'ebook' ? '2px solid var(--brand-primary)' : 'none' }}>
            📖 Libros Digitales
          </Link>
          <Link href={`/?format=audiobook#catalogo`} style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: currentFormat === 'audiobook' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: currentFormat === 'audiobook' ? 700 : 500, borderBottom: currentFormat === 'audiobook' ? '2px solid var(--brand-primary)' : 'none' }}>
            🎧 Audiolibros & Podcasts
          </Link>
        </div>

        <form method="GET" action="/#catalogo" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input type="hidden" name="format" value={currentFormat} />
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
                  <div className="book-cover" style={{ backgroundImage: `url(${book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#0d1117' }}></div>
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
                    {book.format_type === 'audiobook' && book.audio_url ? (
                      <PlayAudioButton 
                        bookId={book.id}
                        url={book.audio_url}
                        title={book.title}
                        author={book.profiles?.full_name || 'Autor Desconocido'}
                        coverUrl={book.cover_url}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      />
                    ) : (
                      <Link href={`/book/${book.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', textDecoration: 'none' }}>Leer</Link>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </section>

      <VirtualLibrarian isSubscribed={isSubscribed} />
    </div>
  );
}
