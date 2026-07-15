import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { notFound } from "next/navigation";
import BuyButton from '@/components/BuyButton';
import ReviewForm from '@/components/ReviewForm';
import AdminVisibilityToggle from './AdminVisibilityToggle';
import { incrementBookViews } from '@/app/actions/activity';
import SaveToPlaylistButton from '@/components/SaveToPlaylistButton';
import DownloadButton from '@/components/DownloadButton';

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

  // Increment views asynchronously so it doesn't block rendering
  incrementBookViews(book.id).catch(console.error);

  // Fetch Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('book_id', book.id)
    .order('created_at', { ascending: false });

  const averageRating = reviews?.length 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const { data: { user } } = await supabase.auth.getUser()
  
  const isPromoActive = book.promotional_free_until && new Date(book.promotional_free_until) > new Date();
  const isFree = book.price === 0 || isPromoActive;

  let hasPurchased = false;
  let isSubscribed = false;

  if (user) {
    const { data: userProfile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single();
    isSubscribed = userProfile?.subscription_status === 'active';

    if (book.author_id === user.id || isFree || isSubscribed) {
      hasPurchased = true; // Conceptual bypass, allow them to read
    } else {
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', book.id)
        .single();
      if (purchase) hasPurchased = true;
    }
  }

  const isAdmin = user?.email === 'astrolabiobooks@gmail.com' || user?.email?.includes('vetayvigor');

  const hasReviewed = user && reviews?.some(r => r.user_id === user.id);
  const defaultCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', gap: '4rem', flexDirection: 'row', flexWrap: 'wrap', marginBottom: '4rem' }}>
        
        {/* Book Cover */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <div className="book-cover" style={{ backgroundImage: `url(${book.cover_url || defaultCover})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#0d1117', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', aspectRatio: '2/3', width: '100%' }}></div>
        </div>

        {/* Book Info */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.1 }}>{book.title}</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            por <Link href={`/author/${book.author_id}`} style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>{book.profiles?.full_name || 'Autor Desconocido'}</Link>
          </p>

          {/* Average Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span style={{ color: '#f59e0b', fontSize: '1.25rem' }}>
              {Number(averageRating) > 0 ? '★'.repeat(Math.round(Number(averageRating))) + '☆'.repeat(5 - Math.round(Number(averageRating))) : '☆☆☆☆☆'}
            </span>
            <span style={{ fontWeight: 600 }}>{Number(averageRating) > 0 ? averageRating : 'Sin reseñas'}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>({reviews?.length || 0} valoraciones)</span>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Precio</p>
              <p style={{ fontWeight: 600 }}>
                {isFree ? <span style={{ color: 'var(--brand-primary)' }}>Gratis</span> : `$${book.price} MXN`}
                {isPromoActive && <span style={{ textDecoration: 'line-through', color: 'var(--text-tertiary)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>${book.price} MXN</span>}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Publicación</p>
              <p style={{ fontWeight: 600 }}>{new Date(book.created_at).toLocaleDateString()}</p>
            </div>
            {hasPurchased && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <SaveToPlaylistButton bookId={book.id} />
              </div>
            )}
            {!hasPurchased && user && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <SaveToPlaylistButton bookId={book.id} />
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Sinopsis</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
            {book.description || 'Sin descripción disponible.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', flexWrap: 'wrap' }}>
            {hasPurchased ? (
              <Link href={`/reader/${book.id}`} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', flex: 1, textAlign: 'center' }}>
                {isSubscribed && !isFree && book.author_id !== user?.id ? '✨ Leer con Premium' : '📖 Leer Libro Completo'}
              </Link>
            ) : (
              <>
                <Link href={`/reader/${book.id}`} className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <span>👀 Leer Muestra Gratis</span>
                </Link>
                {isFree ? (
                  <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', flex: 1, textAlign: 'center' }}>
                    Registrarse para leer gratis
                  </Link>
                ) : (
                  <div style={{ flex: 1 }}>
                    <BuyButton bookId={book.id} price={book.price} />
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a 
              href={`mailto:astrolabiobooks@gmail.com?subject=Denuncia%20de%20Copyright%20-%20Libro%20ID:%20${book.id}&body=Hola,%20soy%20el%20autor%20original%20de%20esta%20obra%20y%20quiero%20denunciar%20plagio.%20El%20título%20del%20libro%20es:%20${book.title}`}
              style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              🚩 Denunciar por Derechos de Autor
            </a>
          </div>

          {isAdmin && (
            <AdminVisibilityToggle bookId={book.id} initialIsHidden={book.is_hidden || false} />
          )}

        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Reseñas de los lectores</h2>
        
        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap-reverse' }}>
          
          <div style={{ flex: '2 1 400px' }}>
            {!reviews || reviews.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Aún no hay reseñas para este libro.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {reviews.map((review: any) => (
                  <div key={review.id} style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      {review.profiles?.avatar_url ? (
                        <img src={review.profiles.avatar_url} alt={review.profiles.full_name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                      )}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.1rem' }}>{review.profiles?.full_name || 'Lector'}</p>
                        <p style={{ color: '#f59e0b', fontSize: '0.875rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 300px' }}>
            {hasPurchased && !hasReviewed && (
              <ReviewForm bookId={book.id} />
            )}
            {!hasPurchased && (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Debes comprar este libro para dejar una reseña.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
