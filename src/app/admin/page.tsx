import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import UserCard from './UserCard'

export default async function AdminPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  // 3. Fetch all profiles and their books
  // We use Supabase Admin client to bypass RLS and read all profiles if necessary,
  // but if profiles are public, we can just use the normal client.
  // We'll use the normal client first.
  const { data: allProfiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, subscription_status, current_streak')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching profiles:', error)
  }

  // Fetch emails using Admin client
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  if (authError) {
    console.error('Error fetching auth users:', authError)
  }

  // Fetch all books to map them to authors
  const { data: allBooks } = await supabase
    .from('books')
    .select('id, title, price, author_id')

  // Fetch all completed books logs to calculate badges
  const { data: completedLogs } = await supabase
    .from('reading_progress')
    .select('user_id')
    .eq('is_completed', true)

  // Fetch error logs
  const { data: errorLogs } = await supabaseAdmin
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Map books, emails and completed counts to profiles
  const usersWithBooks = allProfiles?.map(p => {
    const userBooks = allBooks?.filter(b => b.author_id === p.id) || []
    const completedCount = completedLogs?.filter(log => log.user_id === p.id).length || 0
    const authUser = authUsers?.find(u => u.id === p.id)
    return {
      ...p,
      books: userBooks,
      completedCount,
      email: authUser?.email || null
    }
  }) || []

  const totalPremium = usersWithBooks.filter(u => u.subscription_status === 'active').length
  const totalFree = usersWithBooks.length - totalPremium

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Panel de Administración 👑</h1>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👑</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Premium</p>
              <p style={{ margin: 0, fontWeight: 700 }}>{totalPremium}</p>
            </div>
          </div>
          <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Gratis</p>
              <p style={{ margin: 0, fontWeight: 700 }}>{totalFree}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {usersWithBooks.map((u: any) => (
          <UserCard key={u.id} user={u} />
        ))}
      </div>

      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4rem', marginBottom: '2rem' }}>Bitácora de Errores (Logs) 🐛</h2>
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Contexto</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Correo</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {errorLogs && errorLogs.length > 0 ? (
              errorLogs.map((log: any) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {new Date(log.created_at).toLocaleString('es-MX')}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <span style={{ backgroundColor: log.context === 'signup' ? '#dbeafe' : '#fef3c7', color: log.context === 'signup' ? '#1e3a8a' : '#92400e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                      {log.context}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{log.user_email || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#991b1b' }}>{log.error_message}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay errores registrados. ¡Todo funciona perfecto!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
