'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadBook(formData: FormData) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Extract form data
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const epubFile = formData.get('epubFile') as File
  const coverFile = formData.get('coverFile') as File

  if (!epubFile || !title) {
    throw new Error('Title and ePub file are required')
  }

  // Generate unique filenames to prevent collisions
  const fileExtEpub = epubFile.name.split('.').pop()
  const epubFileName = `${user.id}-${Date.now()}.${fileExtEpub}`
  
  let coverUrl = null
  let epubUrl = null

  // 3. Upload Cover Image (if provided)
  if (coverFile && coverFile.size > 0) {
    const fileExtCover = coverFile.name.split('.').pop()
    const coverFileName = `${user.id}-${Date.now()}.${fileExtCover}`
    
    const { data: coverData, error: coverError } = await supabase
      .storage
      .from('book-covers')
      .upload(coverFileName, coverFile)
      
    if (!coverError && coverData) {
      const { data: { publicUrl } } = supabase.storage.from('book-covers').getPublicUrl(coverFileName)
      coverUrl = publicUrl
    }
  }

  // 4. Upload ePub File
  const { data: epubData, error: epubError } = await supabase
    .storage
    .from('epubs')
    .upload(epubFileName, epubFile)

  if (epubError) {
    throw new Error('Error uploading ePub file')
  }

  // The epubUrl is the path inside the bucket. We keep it as a path because the bucket is private.
  epubUrl = epubData.path

  // 5. Insert Book Record in Database
  const { error: dbError } = await supabase
    .from('books')
    .insert({
      author_id: user.id,
      title,
      description,
      price,
      cover_url: coverUrl,
      epub_file_url: epubUrl,
      total_pages: 0 // Will be calculated later or left as 0 for MVP
    })

  if (dbError) {
    throw new Error('Error saving book metadata')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
