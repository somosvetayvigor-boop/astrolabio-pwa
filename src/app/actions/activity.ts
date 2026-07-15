'use server'

import { createClient } from '@/utils/supabase/server'

export async function pingActivity(isReading: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No user' }

  const updateData: any = {
    last_active_at: new Date().toISOString()
  }

  // Si está leyendo, aumentamos el tiempo de lectura usando RPC o haciendo un select + update
  // Idealmente se usa RPC, pero como no queremos crear funciones SQL complejas, lo hacemos aquí.
  // Nota: en un sistema de alta concurrencia esto puede fallar (race condition), pero para esta app está bien.
  if (isReading) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_reading_minutes')
      .eq('id', user.id)
      .single()
      
    if (profile) {
      updateData.total_reading_minutes = (profile.total_reading_minutes || 0) + 1
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    console.error('Error ping activity:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function incrementBookViews(bookId: string) {
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select('views')
    .eq('id', bookId)
    .single()
    
  if (book) {
    await supabase
      .from('books')
      .update({ views: (book.views || 0) + 1 })
      .eq('id', bookId)
  }
}
