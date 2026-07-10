"use client"

import { useState } from 'react'
import { editBook } from '../../actions'

export default function EditBookForm({ book }: { book: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!agreedToTerms) {
      e.preventDefault();
      return;
    }
    setIsUploading(true)
  }

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
      <form action={editBook} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
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
          <label htmlFor="price" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Precio de Venta Directa ($ USD)</label>
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
