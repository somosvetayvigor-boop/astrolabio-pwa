'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadBook(formData: FormData) {
  try {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'No estás autenticado.' }
    }

    // 2. Extract form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const price = parseFloat(formData.get('price') as string)
    const epubFile = formData.get('epubFile') as File
    const coverFile = formData.get('coverFile') as File

    if (!epubFile || !title) {
      return { error: 'El título y el archivo ePub son requeridos.' }
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Falta configurar la variable SUPABASE_SERVICE_ROLE_KEY en Vercel. Ve a Vercel > Settings > Environment Variables y agrégala.' }
    }

    // Generate unique filenames to prevent collisions
    const fileExtEpub = epubFile.name.split('.').pop()
    const epubFileName = `${user.id}-${Date.now()}.${fileExtEpub}`
    
    let coverUrl = null
    let epubUrl = null

    // Create an admin client to bypass RLS for MVP since we haven't set up Storage/DB policies
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Upload Cover Image (if provided)
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

    // 4. Upload ePub File
    const { data: epubData, error: epubError } = await supabaseAdmin
      .storage
      .from('epubs')
      .upload(epubFileName, epubFile)

    if (epubError) {
      console.error('Supabase upload error:', epubError)
      return { error: 'Error al subir archivo a Supabase: Verifica que creaste los buckets "epubs" y "book-covers" en Storage.' }
    }

    epubUrl = epubData.path

    // 5. Insert Book Record in Database
    const { error: dbError } = await supabaseAdmin
      .from('books')
      .insert({
        author_id: user.id,
        title,
        description,
        category,
        price,
        cover_url: coverUrl,
        epub_file_url: epubUrl,
        total_pages: 0
      })

    if (dbError) {
      console.error('Database insert error:', dbError)
      return { error: 'Error de base de datos al guardar el libro.' }
    }

  } catch (err: any) {
    console.error('Upload exception:', err)
    return { error: err.message || 'Error desconocido del servidor.' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
