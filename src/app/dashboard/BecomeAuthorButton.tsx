'use client'

import { useState } from 'react'
import { becomeAuthor } from './actions'

export default function BecomeAuthorButton() {
  const [loading, setLoading] = useState(false)

  const handleBecomeAuthor = async () => {
    setLoading(true)
    const result = await becomeAuthor()
    if (result.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '3rem', border: '2px dashed var(--brand-primary)' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--brand-primary)' }}>¿Eres escritor? ✍️</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
        Desbloquea tu Panel de Autor completamente gratis. Podrás publicar tus propios libros, recibir donaciones directas de tus lectores y ganar regalías (KENPC) por cada página que lean de tus obras.
      </p>
      <button 
        onClick={handleBecomeAuthor} 
        disabled={loading} 
        className="btn btn-primary"
        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
      >
        {loading ? 'Activando...' : 'Activar Panel de Autor'}
      </button>
    </div>
  )
}
