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

  const { data: existing } = await supabaseAdmin
    .from('reading_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabaseAdmin
      .from('reading_progress')
      .update({ last_cfi: cfi, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      
    if (error) {
      console.error('Error updating progress:', error)
      return { success: false, error: error.message }
    }
  } else {
    const { error } = await supabaseAdmin
      .from('reading_progress')
      .insert({ book_id: bookId, user_id: user.id, last_cfi: cfi })
      
    if (error) {
      console.error('Error inserting progress:', error)
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}

export async function markBookAsCompleted(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('reading_progress')
    .update({ is_completed: true })
    .eq('user_id', user.id)
    .eq('book_id', bookId)

  if (error) {
    console.error('Error marking book as completed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
export async function logPageRead(bookId: string, locationIdentifier: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ignoramos el error 23505 que es el Unique Violation (ya leyó esta página)
  const { error } = await supabaseAdmin
    .from('pages_read_logs')
    .insert({ user_id: user.id, book_id: bookId, location_identifier: locationIdentifier })

  if (error && error.code !== '23505') {
    console.error('Error logging page read:', error)
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

import { revalidatePath } from 'next/cache'

export async function updateReadingStreak(clientDateStr?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('current_streak, last_read_date')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile for streak:', profileError)
    return { success: false, error: profileError.message }
  }

  // Use client's local date string if provided (e.g. '2026-07-17'), otherwise fallback to server UTC
  let todayStr = clientDateStr;
  if (!todayStr) {
    const today = new Date()
    todayStr = today.toLocaleDateString('en-CA') // YYYY-MM-DD
  }

  let newStreak = profile.current_streak || 0

  if (!profile.last_read_date) {
    newStreak = 1
  } else {
    // last_read_date is stored as YYYY-MM-DD string or ISO timestamp
    const lastReadStr = profile.last_read_date.includes('T') 
      ? profile.last_read_date.split('T')[0] 
      : profile.last_read_date

    if (lastReadStr !== todayStr) {
      // Check if it was yesterday
      const todayDate = new Date(todayStr + 'T12:00:00Z') // Safe parse
      const yesterdayDate = new Date(todayDate)
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0]

      if (lastReadStr === yesterdayStr) {
        newStreak += 1
      } else {
        // Streak broken
        newStreak = 1
      }
    } else {
      // Already read today, no change needed
      return { success: true, updated: false, streak: newStreak }
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ current_streak: newStreak, last_read_date: todayStr })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating streak:', updateError)
    return { success: false, error: updateError.message }
  }

  // Revalidate the layout so the Navbar picks up the new streak!
  revalidatePath('/', 'layout')

  return { success: true, updated: true, streak: newStreak }
}

export async function getComments(bookId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('book_comments')
    .select(`
      id,
      cfi,
      highlighted_text,
      comment_text,
      created_at,
      profiles:user_id ( full_name, avatar_url )
    `)
    .eq('book_id', bookId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function addComment(bookId: string, cfi: string, highlightedText: string, commentText: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('book_comments')
    .insert({
      book_id: bookId,
      user_id: user.id,
      cfi,
      highlighted_text: highlightedText,
      comment_text: commentText
    })

  if (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
