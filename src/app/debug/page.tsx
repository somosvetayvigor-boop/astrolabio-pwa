import { createClient } from '@/utils/supabase/server'
export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>No user</div>

  const { data: readingProgress, error: rpError } = await supabase
    .from('reading_progress')
    .select('*, books(*)')
    .eq('user_id', user.id)

  const { data: purchases, error: purError } = await supabase
    .from('purchases')
    .select('*, books(*)')
    .eq('user_id', user.id)

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Debug Info</h1>
      <h2>Reading Progress</h2>
      <pre>{JSON.stringify({ readingProgress, error: rpError }, null, 2)}</pre>
      <h2>Purchases</h2>
      <pre>{JSON.stringify({ purchases, error: purError }, null, 2)}</pre>
    </div>
  )
}
