"use client"

import { uploadBook } from './actions'
import { useState } from 'react'

export default function UploadBookPage() {
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Form is submitted via Server Action by default in Next.js 14/15,
    // but we can set a loading state here if we manually handle it or just use useFormStatus.
    // For simplicity, we'll just set loading on submit.
    setIsUploading(true)
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Subir Nuevo Libro</h1>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <form action={uploadBook} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
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
            <label htmlFor="price" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Precio de Venta Directa ($ USD)</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              min="0"
              step="0.01"
              defaultValue="0.00"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              Pon 0 si solo quieres ganar dinero por hoja leída (KENPC).
            </p>
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

          <div>
            <label htmlFor="epubFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Archivo del Libro (.epub) *</label>
            <input 
              type="file" 
              id="epubFile" 
              name="epubFile" 
              accept=".epub"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isUploading}
            style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1.125rem' }}
          >
            {isUploading ? 'Subiendo y procesando...' : 'Publicar Libro'}
          </button>
        </form>
      </div>
    </div>
  )
}
