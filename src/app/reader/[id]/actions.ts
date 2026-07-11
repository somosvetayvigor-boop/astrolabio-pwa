'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

export async function saveProgress(bookId: string, cfi: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('reading_progress')
    .upsert(
      { book_id: bookId, user_id: user.id, last_cfi: cfi, updated_at: new Date().toISOString() },
      { onConflict: 'book_id,user_id' }
    )

  if (error) {
    console.error('Error saving progress:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getProgress(bookId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: null }

  const { data, error } = await supabase
    .from('reading_progress')
    .select('last_cfi')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error getting progress:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data?.last_cfi || null }
}
