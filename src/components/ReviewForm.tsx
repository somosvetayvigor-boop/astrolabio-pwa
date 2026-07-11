'use client'

import { useState } from 'react'
import { submitReview } from '@/app/book/[id]/actions'

export default function ReviewForm({ bookId }: { bookId: string }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Por favor selecciona una calificación en estrellas.')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      await submitReview(bookId, rating, comment)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al enviar la reseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(76, 175, 80, 0.3)', textAlign: 'center' }}>
        <h3 style={{ color: '#4caf50', marginBottom: '0.5rem', fontWeight: 700 }}>¡Gracias por tu reseña!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tu opinión ayuda a otros lectores a descubrir historias increíbles.</p>
      </div>
    )
  }

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Deja una reseña</h3>
      
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Stars */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: star <= (hoverRating || rating) ? '#f59e0b' : 'var(--text-tertiary)',
                transition: 'color 0.2s',
                padding: '0.25rem'
              }}
            >
              ★
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te pareció el libro? (Opcional)"
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
        />

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting} 
          style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', opacity: isSubmitting ? 0.5 : 1 }}
        >
          {isSubmitting ? 'Enviando...' : 'Publicar Reseña'}
        </button>
      </form>
    </div>
  )
}
