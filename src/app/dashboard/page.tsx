import Link from "next/link";
import Stripe from "stripe";
import { createClient } from '@/utils/supabase/server';
import { deleteBook } from './actions';
import DeleteButton from './DeleteButton';
import ProfileEditForm from './ProfileEditForm';
import ChangePinForm from './ChangePinForm';
import StripeConnectButton from './StripeConnectButton';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch author profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  let isStripeConnected = false;
  let bankName = '';
  let last4 = '';

  if (profile?.stripe_account_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2024-06-20' as any,
      });
      const account = await stripe.accounts.retrieve(profile.stripe_account_id);
      // Stripe considera que la cuenta está conectada de verdad cuando puede recibir pagos (payouts_enabled)
      isStripeConnected = account.payouts_enabled;

      if (isStripeConnected && account.external_accounts && account.external_accounts.data.length > 0) {
        const ext = account.external_accounts.data[0] as any;
        bankName = ext.bank_name || ext.brand || 'Banco';
        last4 = ext.last4 || '';
      }
    } catch (error) {
      console.error('Error fetching Stripe account:', error);
    }
  }

  // Fetch real books for the user
  const { data: myBooks } = await supabase
    .from('books')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch pages read for the author's books
  let totalPagesRead = 0;
  if (myBooks && myBooks.length > 0) {
    const bookIds = myBooks.map(b => b.id);
    const { count, error: countError } = await supabase
      .from('pages_read_logs')
      .select('*', { count: 'exact', head: true })
      .in('book_id', bookIds);
      
    if (count) totalPagesRead = count;
  }

  // Stats
  const authorStats = {
    totalSales: "$0.00", // (Ventas directas aún no implementadas en dashboard)
    pagesRead: totalPagesRead.toString(),
    royalties: `$${(totalPagesRead * 0.69).toFixed(2)} MXN`, // Estimación ficticia del fondo
    booksPublished: myBooks?.length || 0
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Panel de Autor</h1>
        <Link href="/dashboard/upload" className="btn btn-primary">
          + Subir Nuevo Libro
        </Link>
      </div>

      <StripeConnectButton isConnected={isStripeConnected} bankName={bankName} last4={last4} />

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Mi Perfil de Autor</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <strong>Email de acceso:</strong> {user.email}
        </p>
        
        <ProfileEditForm 
          initialBio={profile?.bio || ''} 
          initialAvatarUrl={profile?.avatar_url || null}
          initialFullName={profile?.full_name || ''}
          initialUsername={profile?.username || ''}
          initialDisplayPref={profile?.display_preference || 'full_name'}
        />

        <ChangePinForm />
      </section>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ventas Totales</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{authorStats.totalSales}</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Páginas Leídas (KENPC)</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{authorStats.pagesRead}</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Libros Publicados</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{authorStats.booksPublished}</p>
        </div>
      </div>

      {/* Books List */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Mis Libros Publicados</h2>
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Título</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Precio</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!myBooks || myBooks.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aún no has publicado ningún libro.
                </td>
              </tr>
            ) : (
              myBooks.map((book) => (
                <tr key={book.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{book.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>${book.price}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(book.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/book/${book.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Ver</Link>
                    <Link href={`/dashboard/edit/${book.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--brand-primary)' }}>Editar</Link>
                    <DeleteButton bookId={book.id} deleteAction={deleteBook} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
