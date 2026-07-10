"use client"

import { useState } from 'react'
import { editBook } from '../../actions'

export default function EditBookForm({ book }: { book: any }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isUploading}
          style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1.125rem' }}
        >
          {isUploading ? 'Guardando cambios...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  )
}
