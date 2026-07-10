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

export async function editBook(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const bookId = formData.get('bookId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  
  const coverFile = formData.get('coverFile') as File | null
  const epubFile = formData.get('epubFile') as File | null

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify ownership
  const { data: book } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single()

  if (!book || book.author_id !== user.id) {
    throw new Error('Unauthorized')
  }

  let coverUrl = book.cover_url
  let epubUrl = book.epub_file_url

  // Upload new cover if provided
  if (coverFile && coverFile.size > 0) {
    const fileExtCover = coverFile.name.split('.').pop()
    const coverFileName = `${user.id}-${Date.now()}.${fileExtCover}`
    
    const { data: coverData, error: coverError } = await supabaseAdmin
      .storage
      .from('book-covers')
      .upload(coverFileName, coverFile)
      
    if (!coverError && coverData) {
      const { data: { publicUrl } } = supabaseAdmin.storage.from('book-covers').getPublicUrl(coverFileName)
      coverUrl = publicUrl
    }
  }

  // Upload new epub if provided
  if (epubFile && epubFile.size > 0) {
    const fileExtEpub = epubFile.name.split('.').pop()
    const epubFileName = `${user.id}-${Date.now()}.${fileExtEpub}`
    
    const { data: epubData, error: epubError } = await supabaseAdmin
      .storage
      .from('epubs')
      .upload(epubFileName, epubFile)
      
    if (!epubError && epubData) {
      epubUrl = epubData.path
    }
  }

  // Update record
  const { error: updateError } = await supabaseAdmin
    .from('books')
    .update({
      title,
      description,
      price,
      cover_url: coverUrl,
      epub_file_url: epubUrl
    })
    .eq('id', bookId)

  if (updateError) {
    console.error('Error updating book:', updateError)
    throw new Error('Could not update book')
  }

  revalidatePath('/dashboard')
  revalidatePath(`/book/${bookId}`)
  revalidatePath('/')
  redirect('/dashboard')
}
