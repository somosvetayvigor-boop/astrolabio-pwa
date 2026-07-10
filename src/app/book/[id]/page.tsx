import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { notFound } from "next/navigation";
import BuyButton from '@/components/BuyButton';

export default async function BookDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: book, error } = await supabase
    .from('books')
    .select('*, profiles(full_name)')
    .eq('id', params.id)
    .single()

  if (error || !book) {
    notFound()
  }

  const defaultCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"

  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ display: 'flex', gap: '4rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* Book Cover */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <div className="book-cover" style={{ backgroundImage: `url(${book.cover_url || defaultCover})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', aspectRatio: '2/3', width: '100%' }}></div>
        </div>

        {/* Book Info */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1 }}>{book.title}</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>por <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{book.profiles?.full_name || 'Autor Desconocido'}</span></p>
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Precio</p>
              <p style={{ fontWeight: 600 }}>${book.price}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Publicación</p>
              <p style={{ fontWeight: 600 }}>{new Date(book.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Sinopsis</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
            {book.description || 'Sin descripción disponible.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <Link href={`/reader/${book.id}`} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', flex: 1, textAlign: 'center' }}>
              Leer Ahora
            </Link>
            {book.price > 0 && (
              <BuyButton bookId={book.id} price={book.price} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
