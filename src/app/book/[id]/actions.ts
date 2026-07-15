'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(bookId: string, rating: number, comment: string) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Must be logged in to review')
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 2. Insert Review in Database
  const { error: dbError } = await supabaseAdmin
    .from('reviews')
    .insert({
      book_id: bookId,
      user_id: user.id,
      rating,
      comment
    })

  if (dbError) {
    console.error('Database insert error:', dbError)
    // If it's a unique constraint violation, they already reviewed
    if (dbError.code === '23505') {
        throw new Error('Ya has calificado este libro antes.')
    }
    throw new Error('Could not submit review')
  }

  revalidatePath(`/book/${bookId}`)
  return { success: true }
}

export async function toggleBookVisibility(bookId: string, isHidden: boolean) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'No autorizado' }
  }

  // Verifica si es admin
  const isAdmin = user.email === 'astrolabiobooks@gmail.com' || user.email?.includes('vetayvigor');
  if (!isAdmin) {
    return { error: 'No tienes permisos de administrador' }
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: dbError } = await supabaseAdmin
    .from('books')
    .update({ is_hidden: isHidden })
    .eq('id', bookId)

  if (dbError) {
    console.error('Database update error:', dbError)
    return { error: 'Error al actualizar la base de datos. Asegúrate de haber creado la columna is_hidden.' }
  }

  revalidatePath(`/book/${bookId}`)
  revalidatePath('/')
  revalidatePath('/dashboard')
  
  return { success: true }
}
