'use client'

import { useState } from 'react'
import { addComment } from '@/app/reader/[id]/actions'

interface AddCommentModalProps {
  bookId: string
  cfi: string
  highlightedText: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddCommentModal({ bookId, cfi, highlightedText, onClose, onSuccess }: AddCommentModalProps) {
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setLoading(true)
    const res = await addComment(bookId, cfi, highlightedText, commentText)
    setLoading(false)

    if (res.success) {
      onSuccess()
    } else {
      alert(res.error || 'Error al guardar el comentario')
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
        padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%',
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>💬 Deja un comentario</h3>
        
        <div style={{ borderLeft: '3px solid var(--brand-primary)', paddingLeft: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '0.5rem' }}>
          "{highlightedText.substring(0, 100)}{highlightedText.length > 100 ? '...' : ''}"
        </div>

        <form onSubmit={handleSubmit}>
          <textarea 
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="¿Qué opinas de esta parte?"
            required
            style={{ 
              width: '100%', minHeight: '100px', padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem' }}
            >
              {loading ? 'Guardando...' : 'Comentar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
