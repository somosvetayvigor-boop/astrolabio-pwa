"use client"

import { useState } from 'react'
import { updateBookData } from '../../actions'
import { getSignedUrls } from '../../upload/actions'

export default function EditBookForm({ book }: { book: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progressText, setProgressText] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    
    setIsUploading(true)
    setErrorMessage(null)
    setProgressText('Preparando archivos...')

    try {
      const formData = new FormData(e.currentTarget)
      const bookId = formData.get('bookId') as string
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const price = parseFloat(formData.get('price') as string)
      
      const coverFile = formData.get('coverFile') as File | null
      const epubFile = formData.get('epubFile') as File | null

      let finalEpubPath = null
      let finalCoverPath = null

      const hasEpub = epubFile && epubFile.size > 0
      const hasCover = coverFile && coverFile.size > 0

      if (hasEpub || hasCover) {
        // 1. Obtain signed URLs
        setProgressText('Generando enlaces de subida seguros...')
        const urlsResult = await getSignedUrls(
          hasEpub ? epubFile.name : 'dummy.epub',
          hasCover ? coverFile.name : null
        )

        if (urlsResult.error) throw new Error(urlsResult.error)
        
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()

        // 2. Upload ePub
        if (hasEpub && urlsResult.epub) {
          setProgressText('Subiendo libro (esto puede tardar unos minutos si es muy pesado, no cierres la ventana)...')
          
          const epubToken = new URL(urlsResult.epub.signedUrl).searchParams.get('token')
          if (!epubToken) throw new Error('Error al extraer token ePub.')
          
          const { error: epubUploadError } = await supabase.storage
            .from('epubs')
            .uploadToSignedUrl(urlsResult.epub.path, epubToken, epubFile)

          if (epubUploadError) {
            throw new Error('Falló la subida del archivo ePub directo a Supabase: ' + epubUploadError.message)
          }
          finalEpubPath = urlsResult.epub.path
        }

        // 3. Upload Cover
        if (hasCover && urlsResult.cover && urlsResult.cover.signedUrl) {
          setProgressText('Subiendo nueva portada...')
          const coverToken = new URL(urlsResult.cover.signedUrl).searchParams.get('token')
          if (!coverToken) throw new Error('Error al extraer token de portada.')

          const { error: coverUploadError } = await supabase.storage
            .from('book-covers')
            .uploadToSignedUrl(urlsResult.cover.path, coverToken, coverFile)
            
          if (coverUploadError) {
            throw new Error('Falló la subida de la portada directo a Supabase: ' + coverUploadError.message)
          }
          finalCoverPath = urlsResult.cover.path
        }
      }

      // 4. Update Database Record
      setProgressText('Actualizando datos en la base de datos...')
      const dbResult = await updateBookData({
        bookId,
        title,
        description,
        price,
        epubPath: finalEpubPath,
        coverPath: finalCoverPath
      })

      if (dbResult && dbResult.error) {
        throw new Error(dbResult.error)
      }

    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message || 'Error desconocido.')
      setIsUploading(false)
      setProgressText(null)
    }
  }

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
      {errorMessage && (
        <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid red', color: 'red', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {progressText && (
        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>
          ⏳ {progressText}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <input type="hidden" name="bookId" value={book.id} />

        <div>
          <label htmlFor="title" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Título del Libro *</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required 
            defaultValue={book.title}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
          />
        </div>

        <div>
          <label htmlFor="description" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Sinopsis / Descripción</label>
          <textarea 
            id="description" 
            name="description" 
            rows={4}
            defaultValue={book.description}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }} 
          ></textarea>
        </div>

        <div>
          <label htmlFor="price" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Precio de Venta Directa ($ MXN)</label>
          <input 
            type="number" 
            id="price" 
            name="price" 
            min="0"
            step="0.01"
            defaultValue={book.price}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }}></div>

        <div>
          <label htmlFor="coverFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Actualizar Portada (Opcional)</label>
          <input 
            type="file" 
            id="coverFile" 
            name="coverFile" 
            accept="image/*"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
          />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Deja esto en blanco si quieres mantener la portada actual.
          </p>
        </div>

        <div>
          <label htmlFor="epubFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Actualizar Archivo .epub (Opcional)</label>
          <input 
            type="file" 
            id="epubFile" 
            name="epubFile" 
            accept=".epub"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
          />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Deja esto en blanco si quieres mantener el archivo actual.
          </p>
          <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.2)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              💡 <strong>Nota:</strong> Astrolabio solo acepta formato <code>.epub</code> para garantizar la mejor experiencia de lectura interactiva. <br/>
              Si tienes tu libro en Word o PDF, te recomendamos convertirlo primero usando esta herramienta gratuita:
            </p>
            <a 
              href="https://convertio.co/es/document-epub/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--brand-primary)', fontSize: '0.875rem', textDecoration: 'underline', fontWeight: 600 }}
            >
              Convertir a EPUB gratis en Convertio ↗
            </a>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212, 175, 55, 0.2)', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              style={{ marginTop: '0.25rem', width: '1.2rem', height: '1.2rem', accentColor: 'var(--brand-primary)' }}
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Declaración de Derechos de Autor:</strong> Declaro bajo pena de perjurio que soy el autor original de esta obra o poseo los derechos legales para su venta y distribución. Acepto que cualquier infracción de derechos de autor resultará en la eliminación de mi cuenta y la retención de mis ganancias.
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isUploading || !agreedToTerms}
          style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1.125rem', opacity: (!agreedToTerms || isUploading) ? 0.5 : 1 }}
        >
          {isUploading ? 'Guardando cambios...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  )
}
