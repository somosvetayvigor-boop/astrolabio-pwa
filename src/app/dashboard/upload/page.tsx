"use client"

import { getSignedUrls, insertBookData } from './actions'
import { useState } from 'react'

export default function UploadBookPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progressText, setProgressText] = useState<string | null>(null)
  
  const [isAlwaysFree, setIsAlwaysFree] = useState(false)
  const [isPromoFree, setIsPromoFree] = useState(false)
  const [formatType, setFormatType] = useState<'ebook' | 'audiobook' | 'podcast'>('ebook')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    
    setIsUploading(true)
    setErrorMessage(null)
    setProgressText('Preparando archivos...')

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const quote = formData.get('quote') as string
      const category = formData.get('category') as string
      let price = parseFloat(formData.get('price') as string)
      const epubFile = formData.get('epubFile') as File | null
      const audioFile = formData.get('audioFile') as File | null
      const coverFile = formData.get('coverFile') as File
      const promoDays = formData.get('promoDays') ? parseInt(formData.get('promoDays') as string) : null

      if (isAlwaysFree) price = 0;

      if (formatType === 'ebook' && (!epubFile || epubFile.size === 0 || !title)) {
        throw new Error('El título y el archivo ePub son requeridos.')
      }

      if ((formatType === 'audiobook' || formatType === 'podcast') && (!audioFile || audioFile.size === 0 || !title)) {
        throw new Error('El título y el archivo de Audio son requeridos.')
      }

      // 1. Obtener URLs de subida directa
      setProgressText('Generando rutas seguras de subida...')
      const epubName = epubFile && epubFile.size > 0 ? epubFile.name : null;
      const audioName = audioFile && audioFile.size > 0 ? audioFile.name : null;
      const urlsResult = await getSignedUrls(epubName, audioName, coverFile && coverFile.size > 0 ? coverFile.name : null)
      
      if (urlsResult.error) {
        throw new Error(urlsResult.error)
      }

      const { epub, audio, cover } = urlsResult as any

      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // 2. Subir ePub directamente a Supabase (si aplica)
      if (epub && epubFile) {
        setProgressText('Subiendo libro digital (esto puede tardar unos minutos si es muy pesado, no cierres la ventana)...')
        
        const epubToken = new URL(epub.signedUrl).searchParams.get('token')
        if (!epubToken) throw new Error('Error al extraer token ePub.')
        
        const { error: epubUploadError } = await supabase.storage
          .from('epubs')
          .uploadToSignedUrl(epub.path, epubToken, epubFile)
          
        if (epubUploadError) {
          throw new Error('Falló la subida del archivo ePub directo a Supabase: ' + epubUploadError.message)
        }
      }

      // 2.5. Subir Audio directamente a Supabase (si aplica)
      if (audio && audioFile) {
        setProgressText('Subiendo audiolibro/podcast (esto puede tardar varios minutos, no cierres la ventana)...')
        
        const audioToken = new URL(audio.signedUrl).searchParams.get('token')
        if (!audioToken) throw new Error('Error al extraer token de Audio.')
        
        const { error: audioUploadError } = await supabase.storage
          .from('audios')
          .uploadToSignedUrl(audio.path, audioToken, audioFile)
          
        if (audioUploadError) {
          throw new Error('Falló la subida del archivo de audio directo a Supabase: ' + audioUploadError.message)
        }
      }

      // 3. Subir portada directamente (si hay)
      let finalCoverPath = null
      if (cover && coverFile && coverFile.size > 0) {
        setProgressText('Subiendo portada...')
        
        const coverToken = new URL(cover.signedUrl).searchParams.get('token')
        if (!coverToken) throw new Error('Error al extraer token de portada.')

        const { error: coverUploadError } = await supabase.storage
          .from('book-covers')
          .uploadToSignedUrl(cover.path, coverToken, coverFile)
          
        if (coverUploadError) {
          throw new Error('Falló la subida de la portada directo a Supabase: ' + coverUploadError.message)
        }
        finalCoverPath = cover.path
      }

      // 4. Guardar datos en la base de datos
      setProgressText('Guardando información del contenido...')
      const dbResult = await insertBookData({
        title,
        description,
        quote,
        category,
        price,
        epubPath: epub?.path || null,
        audioPath: audio?.path || null,
        formatType,
        coverPath: finalCoverPath,
        promoDays: isPromoFree ? promoDays : null,
        isAlwaysFree
      })

      if (dbResult && dbResult.error) {
        throw new Error(dbResult.error)
      }

      // Redirección manejada por el Server Action o éxito silencioso

    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message || 'Error desconocido al subir el libro.')
      setIsUploading(false)
      setProgressText(null)
    }
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Subir Nuevo Libro</h1>
      
      {errorMessage && (
        <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid red', color: 'red', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
          {errorMessage}
        </div>
      )}

      {progressText && (
        <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
          ⏳ {progressText}
        </div>
      )}

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => setFormatType('ebook')}
              style={{ flex: '1 1 200px', padding: '1rem', borderRadius: 'var(--radius-md)', border: formatType === 'ebook' ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)', backgroundColor: formatType === 'ebook' ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '1.1rem' }}
            >
              📖 Libro Digital
            </button>
            <button 
              type="button" 
              onClick={() => setFormatType('audiobook')}
              style={{ flex: '1 1 200px', padding: '1rem', borderRadius: 'var(--radius-md)', border: formatType === 'audiobook' ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)', backgroundColor: formatType === 'audiobook' ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '1.1rem' }}
            >
              🎧 Audiolibro
            </button>
            <button 
              type="button" 
              onClick={() => setFormatType('podcast')}
              style={{ flex: '1 1 200px', padding: '1rem', borderRadius: 'var(--radius-md)', border: formatType === 'podcast' ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)', backgroundColor: formatType === 'podcast' ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '1.1rem' }}
            >
              🎙️ Podcast
            </button>
          </div>

          <div>
            <label htmlFor="title" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Título del Libro *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              placeholder="Ej. El misterio de la noche"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Sinopsis / Descripción</label>
            <textarea 
              id="description" 
              name="description" 
              rows={4}
              placeholder="De qué trata tu libro..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }} 
            ></textarea>
          </div>

          <div>
            <label htmlFor="quote" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Frase Inspiradora / Gancho (Opcional)</label>
            <textarea 
              id="quote" 
              name="quote" 
              rows={2}
              maxLength={200}
              placeholder="Ej. La lluvia es hermosa y me dejaba acariciarla..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }} 
            ></textarea>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Elige una frase de tu libro que atrape al lector. Podría aparecer en la página principal para promocionar tu obra.
            </p>
          </div>

          <div>
            <label htmlFor="category" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Categoría / Género *</label>
            <select 
              id="category" 
              name="category" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              <option value="">Selecciona una categoría...</option>
              <option value="Aventura">Aventura</option>
              <option value="Ficción Histórica">Ficción Histórica</option>
              <option value="Romance">Romance</option>
              <option value="Ciencia Ficción">Ciencia Ficción</option>
              <option value="Fantasía">Fantasía</option>
              <option value="Terror / Suspenso">Terror / Suspenso</option>
              <option value="Desarrollo Personal">Desarrollo Personal</option>
              <option value="Artículos Científicos">Artículos Científicos</option>
              <option value="Infantil (0-5 años)">Infantil (0-5 años)</option>
              <option value="Infantil (6-9 años)">Infantil (6-9 años)</option>
              <option value="Infantil (10-12 años)">Infantil (10-12 años)</option>
              <option value="Poesía">Poesía</option>
              <option value="Biografía">Biografía</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Opciones de Precio y Promociones</h3>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isAlwaysFree} onChange={(e) => { setIsAlwaysFree(e.target.checked); if(e.target.checked) setIsPromoFree(false); }} style={{ accentColor: 'var(--brand-primary)' }} />
              <strong>Libro 100% Gratuito Siempre</strong>
            </label>

            {!isAlwaysFree && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={isPromoFree} onChange={(e) => setIsPromoFree(e.target.checked)} style={{ accentColor: 'var(--brand-primary)' }} />
                <span>Promoción: <strong>Gratis por tiempo limitado</strong></span>
              </label>
            )}

            {!isAlwaysFree && isPromoFree && (
              <div>
                <label htmlFor="promoDays" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>¿Por cuántos días será gratis?</label>
                <input type="number" id="promoDays" name="promoDays" min="1" max="30" defaultValue="5" required={isPromoFree} style={{ width: '100px', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }} /> días
              </div>
            )}

            {!isAlwaysFree && (
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor="price" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Precio Base ({isPromoFree ? 'después de promoción' : 'Venta Directa'}) ($ MXN) *</label>
                <input 
                  type="number" 
                  id="price" 
                  name="price" 
                  min="0"
                  step="0.01"
                  defaultValue="0.00"
                  required={!isAlwaysFree}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
                />
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }}></div>

          <div>
            <label htmlFor="coverFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Portada del Libro (Imagen)</label>
            <input 
              type="file" 
              id="coverFile" 
              name="coverFile" 
              accept="image/*"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
            />
          </div>

          {formatType === 'ebook' && (
            <div>
              <label htmlFor="epubFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Archivo del Libro (.epub o .pdf) *</label>
              <input 
                type="file" 
                id="epubFile" 
                name="epubFile" 
                accept=".epub,.pdf"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
              />
              <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                💡 <strong>Regla de oro de formatos:</strong> <br/>
                - <strong>PDF:</strong> Para libros con imágenes en cada página (cuentos, cómics) donde la imagen y el texto tienen que estar estrictamente juntos.<br/>
                - <strong>EPUB:</strong> Para libros de solo texto o con imágenes sin correlación estricta con el texto (novelas, artículos).
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: '0.5rem 0 0 0' }}>
                Si tienes tu libro en Word, conviértelo gratis usando: 
                <a 
                  href="https://convertio.co/es/document-epub/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', marginLeft: '0.25rem' }}
                >Convertio</a>.
              </p>
              </div>
            </div>
          )}

          {(formatType === 'audiobook' || formatType === 'podcast') && (
            <div>
              <label htmlFor="audioFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Archivo de Audio (.mp3 o .m4a) *</label>
              <input 
                type="file" 
                id="audioFile" 
                name="audioFile" 
                accept="audio/mp3,audio/mpeg,audio/mp4,audio/m4a"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
              />
              <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  💡 <strong>Recomendación:</strong> Usa archivos .mp3 comprimidos para que carguen más rápido en la plataforma. Límite sugerido por archivo: 50MB.
                </p>
              </div>
            </div>
          )}

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
                <strong style={{ color: 'var(--text-primary)' }}>Declaración de Derechos de Autor:</strong> Declaro bajo pena de perjurio que soy el autor original de esta obra, poseo los derechos legales para su distribución, o que la obra es de dominio público y es responsabilidad exclusiva de quien lo sube. Acepto que cualquier infracción de derechos resultará en la eliminación de mi cuenta y la retención de ganancias.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isUploading || !agreedToTerms}
            style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1.125rem', opacity: (!agreedToTerms || isUploading) ? 0.5 : 1 }}
          >
            {isUploading ? 'Subiendo y procesando...' : 'Publicar Libro'}
          </button>
        </form>
      </div>
    </div>
  )
}
