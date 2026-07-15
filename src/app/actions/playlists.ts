'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPlaylist(title: string, description: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión para crear listas.' }
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      user_id: user.id,
      title,
      description,
      is_public: isPublic
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating playlist:', error)
    return { error: 'Hubo un error al crear la lista.' }
  }

  revalidatePath('/playlists')
  revalidatePath('/library')
  return { data }
}

export async function addBookToPlaylist(playlistId: string, bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión.' }
  }

  const { error } = await supabase
    .from('playlist_books')
    .insert({
      playlist_id: playlistId,
      book_id: bookId
    })

  if (error) {
    // If error is unique constraint, it means book is already in playlist.
    if (error.code === '23505') {
      return { error: 'Este libro ya está en la lista.' }
    }
    console.error('Error adding book to playlist:', error)
    return { error: 'Hubo un error al agregar el libro.' }
  }

  revalidatePath(`/playlists/${playlistId}`)
  revalidatePath(`/book/${bookId}`)
  return { success: true }
}

export async function removeBookFromPlaylist(playlistId: string, bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión.' }
  }

  const { error } = await supabase
    .from('playlist_books')
    .delete()
    .match({
      playlist_id: playlistId,
      book_id: bookId
    })

  if (error) {
    console.error('Error removing book from playlist:', error)
    return { error: 'Hubo un error al quitar el libro.' }
  }

  revalidatePath(`/playlists/${playlistId}`)
  return { success: true }
}

export async function getUserPlaylists() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [] }
  }

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user playlists:', error)
    return { data: [] }
  }

  return { data }
}
