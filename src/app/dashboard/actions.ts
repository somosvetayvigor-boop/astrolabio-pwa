'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteBook(formData: FormData) {
  const supabase = await createClient()
  const bookId = formData.get('bookId') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify the book belongs to the user
  const { data: book } = await supabaseAdmin
    .from('books')
    .select('author_id')
    .eq('id', bookId)
    .single()

  if (book && book.author_id === user.id) {
    // Delete the book record
    const { error } = await supabaseAdmin
      .from('books')
      .delete()
      .eq('id', bookId)

    if (error) {
      console.error('Error deleting book:', error)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
}

export async function updateBookData(data: {
  bookId: string,
  title: string,
  description: string,
  price: number,
  epubPath: string | null,
  coverPath: string | null
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'No estás autenticado.' }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify ownership
    const { data: book } = await supabaseAdmin
      .from('books')
      .select('*')
      .eq('id', data.bookId)
      .single()

    if (!book || book.author_id !== user.id) {
      return { error: 'No autorizado' }
    }

    let coverUrl = book.cover_url
    let epubUrl = book.epub_file_url

    if (data.coverPath) {
      const { data: publicUrlData } = supabaseAdmin.storage.from('book-covers').getPublicUrl(data.coverPath)
      coverUrl = publicUrlData.publicUrl
    }

    if (data.epubPath) {
      epubUrl = data.epubPath
    }

    const { error: updateError } = await supabaseAdmin
      .from('books')
      .update({
        title: data.title,
        description: data.description,
        price: data.price,
        cover_url: coverUrl,
        epub_file_url: epubUrl
      })
      .eq('id', data.bookId)

    if (updateError) {
      console.error('Error updating book:', updateError)
      return { error: 'Could not update book' }
    }
  } catch (err: any) {
    return { error: err.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/book/${data.bookId}`)
  revalidatePath('/')
  redirect('/dashboard')
}

export async function getAvatarSignedUrl(avatarFilename: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'No estás autenticado.' }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const cleanName = avatarFilename.split('.').pop()
    const avatarPath = `${user.id}-${Date.now()}.${cleanName}`
    
    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .createSignedUploadUrl(avatarPath)
      
    if (error || !data) {
      console.error('Error avatar url:', error)
      return { error: 'Verifica que el bucket "avatars" exista en Storage.' }
    }

    return { signedUrl: data.signedUrl, path: avatarPath }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateProfileData(data: { bio: string, avatarPath: string | null }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'No estás autenticado.' }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updates: any = { bio: data.bio }
    if (data.avatarPath) {
      const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(data.avatarPath)
      updates.avatar_url = publicUrlData.publicUrl
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw new Error('Could not update profile')
  } catch (err: any) {
    console.error(err)
    return { error: err.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
