'use server'

import { createClient } from '@/utils/supabase/server'

export interface SocialHighlight {
  cfi_range: string
  text_content: string
  count: number
  is_current_user: boolean
}

export async function addHighlight(bookId: string, cfiRange: string, textContent: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not logged in' }

  // Check if this user already highlighted this exact CFI
  const { data: existing } = await supabase
    .from('social_highlights')
    .select('id')
    .eq('book_id', bookId)
    .eq('user_id', user.id)
    .eq('cfi_range', cfiRange)
    .single()

  if (existing) {
    return { success: true, message: 'Already highlighted' }
  }

  const { error } = await supabase
    .from('social_highlights')
    .insert({
      book_id: bookId,
      user_id: user.id,
      cfi_range: cfiRange,
      text_content: textContent
    })

  if (error) {
    console.error('Error adding highlight:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getSocialHighlights(bookId: string): Promise<{ success: boolean, data?: SocialHighlight[], error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: highlights, error } = await supabase
    .from('social_highlights')
    .select('user_id, cfi_range, text_content')
    .eq('book_id', bookId)

  if (error) {
    console.error('Error fetching highlights:', error)
    return { success: false, error: error.message }
  }

  // Aggregate highlights by cfi_range
  const grouped: Record<string, SocialHighlight> = {}

  highlights.forEach(h => {
    if (!grouped[h.cfi_range]) {
      grouped[h.cfi_range] = {
        cfi_range: h.cfi_range,
        text_content: h.text_content,
        count: 0,
        is_current_user: false
      }
    }
    grouped[h.cfi_range].count++
    if (user && h.user_id === user.id) {
      grouped[h.cfi_range].is_current_user = true
    }
  })

  // Convert map to array
  const aggregatedArray = Object.values(grouped)

  return { success: true, data: aggregatedArray }
}
