import Link from 'next/link';

export default async function SuccessPage(props: { searchParams: Promise<{ book_id?: string }> }) {
  const searchParams = await props.searchParams;
  const bookId = searchParams.book_id;

  return (
    <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--brand-primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Tu compra ha sido procesada de manera segura. Ya puedes disfrutar de tu libro en cualquier momento.
      </p>
      
      {bookId ? (
        <Link href={`/reader/${bookId}`} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
          Empezar a Leer
        </Link>
      ) : (
        <Link href="/" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
          Volver al Catálogo
        </Link>
      )}
    </div>
  );
}
