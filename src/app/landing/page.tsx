import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import InstallButton from '@/components/InstallButton'
import './landing.css'

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
    <div className="landing-page bg-gradient-mesh" style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center', position: 'relative' }}>
        <div className="container animate-fade-in">
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            fontWeight: 800, 
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto 1.5rem auto'
          }}>
            Historias independientes, <br/>
            <span className="text-gradient">sin intermediarios.</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '600px', 
            margin: '0 auto 3rem auto',
            lineHeight: 1.6
          }} className="animate-fade-in animate-delay-1">
            Lee historias increíbles de autores emergentes en cualquier dispositivo, sin conexión a internet. Apoya directamente a los creadores.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }} className="animate-fade-in animate-delay-2">
            <InstallButton />
            <Link href="https://app.astrolabiobooks.com/dashboard" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
              ✍️ Publicar mi Libro
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>📱</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Lectura Offline</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Instala la app nativa en 1 segundo. Tus libros se guardan automáticamente para leer sin conexión en el avión o en el metro.</p>
            </div>

            <div className="glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>💸</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Apoya Directo al Autor</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Gracias a Stripe Connect, el 70% de tu dinero va directo a la cuenta bancaria del escritor en tiempo real. Sin trucos.</p>
            </div>

            <div className="glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🎨</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Soporte Total</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Disfruta novelas puras en formato EPUB (con modo oscuro y cambio de letra) o maravíllate con cómics y cuentos en PDF.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalogo" className="container" style={{ paddingTop: '6rem', paddingBottom: '8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Descubre tu próxima aventura</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Filtra nuestro catálogo y encuentra joyas literarias escondidas.</p>
        </div>
        
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
          <form method="GET" action="/#catalogo" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="text" 
              name="q" 
              placeholder="Buscar por título..." 
              defaultValue={searchParams.q || ''} 
              style={{ flex: '1 1 300px', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
            />
            <select 
              name="cat" 
              defaultValue={searchParams.cat || ''}
              style={{ flex: '1 1 200px', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
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
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Filtrar</button>
            
            {(searchParams.q || searchParams.cat) && (
              <Link href="/#catalogo" className="btn btn-secondary" style={{ padding: '1rem 2rem' }}>Limpiar</Link>
            )}
          </form>
        </div>
        
        {featuredBooks.length === 0 ? (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔭</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>No encontramos resultados</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Intenta con otra búsqueda o categoría.</p>
          </div>
        ) : (
          <div className="book-grid">
            {featuredBooks.map((book) => (
              <div className="book-card" key={book.id}>
                <Link href={`https://app.astrolabiobooks.com/book/${book.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div className="book-cover" style={{ backgroundImage: `url(${book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                </Link>
                <div className="book-info">
                  {book.category && <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{book.category}</span>}
                  
                  <Link href={`https://app.astrolabiobooks.com/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="book-title" style={{ marginTop: '0.25rem' }}>{book.title}</h3>
                  </Link>

                  <Link href={`https://app.astrolabiobooks.com/author/${book.author_id}`} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    <p className="book-author" style={{ margin: 0 }}>{book.profiles?.full_name || 'Autor Desconocido'}</p>
                  </Link>
                  
                  <div className="book-footer">
                    <span className="book-price">${book.price}</span>
                    <Link href={`https://app.astrolabiobooks.com/book/${book.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', textDecoration: 'none' }}>Leer</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.jpeg" alt="Astrolabio Logo" style={{ height: '40px', width: 'auto', borderRadius: '50%' }} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.05em' }}>ASTROLABIO</span>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>© 2024 Astrolabio Books. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
