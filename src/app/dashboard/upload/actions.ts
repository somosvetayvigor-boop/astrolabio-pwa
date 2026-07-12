'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
export async function getSignedUrls(epubFilename: string, coverFilename: string | null) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'No estás autenticado.' }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Falta configurar la variable SUPABASE_SERVICE_ROLE_KEY en Vercel. Ve a Vercel > Settings > Environment Variables y agrégala.' }
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const timestamp = Date.now()
    const cleanEpubName = epubFilename.split('.').pop()
    const epubPath = `${user.id}-${timestamp}.${cleanEpubName}`
    
    let coverPath = null
    let coverSignedUrl = null

    // 1. Generate Signed URL for ePub
    const { data: epubData, error: epubError } = await supabaseAdmin.storage
      .from('epubs')
      .createSignedUploadUrl(epubPath)

    if (epubError || !epubData) {
      console.error('Error generando URL para epub:', epubError)
      return { error: 'Error al generar enlace seguro para el archivo ePub.' }
    }

    // 2. Generate Signed URL for Cover (if present)
    if (coverFilename) {
      const cleanCoverName = coverFilename.split('.').pop()
      coverPath = `${user.id}-${timestamp}.${cleanCoverName}`
      const { data: coverData, error: coverError } = await supabaseAdmin.storage
        .from('book-covers')
        .createSignedUploadUrl(coverPath)

      if (coverError || !coverData) {
        console.error('Error cover url:', coverError)
        return { error: `Error de Supabase (Cover): ${coverError?.message || 'Desconocido'}` }
      }
      coverSignedUrl = coverData.signedUrl
    }

    return {
      epub: { signedUrl: epubData.signedUrl, path: epubPath },
      cover: coverPath ? { signedUrl: coverSignedUrl, path: coverPath } : null
    }

  } catch (err: any) {
    console.error('getSignedUrls error:', err)
    return { error: err.message || 'Error desconocido del servidor.' }
  }
}

export async function insertBookData(data: {
  title: string,
  description: string,
  category: string,
  price: number,
  epubPath: string,
  coverPath: string | null,
  promoDays: number | null,
  isAlwaysFree: boolean
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'No estás autenticado.' }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let coverUrl = null
    if (data.coverPath) {
      const { data: publicUrlData } = supabaseAdmin.storage.from('book-covers').getPublicUrl(data.coverPath)
      coverUrl = publicUrlData.publicUrl
    }

    let promotional_free_until = null
    if (data.promoDays) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + data.promoDays)
      promotional_free_until = expirationDate.toISOString()
    }

    const { error: dbError } = await supabaseAdmin
      .from('books')
      .insert({
        author_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        cover_url: coverUrl,
        epub_file_url: data.epubPath, // Keep path for private bucket
        total_pages: 0,
        promotional_free_until
      })

    if (dbError) {
      console.error('Database insert error:', dbError)
      return { error: 'Error de base de datos al guardar el libro.' }
    }
  } catch (err: any) {
    console.error('insertBookData error:', err)
    return { error: err.message || 'Error interno al guardar datos del libro.' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
