'use client'

import { useState } from 'react'
import { toggleBookVisibility } from './actions'

export default function AdminVisibilityToggle({ bookId, initialIsHidden }: { bookId: string, initialIsHidden: boolean }) {
  const [isHidden, setIsHidden] = useState(initialIsHidden)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const result = await toggleBookVisibility(bookId, !isHidden)
      if (result.success) {
        setIsHidden(!isHidden)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      console.error(err)
      alert('Ocurrió un error.')
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🛡️</span> Panel de Administrador
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Este libro está actualmente <strong>{isHidden ? 'OCULTO' : 'VISIBLE'}</strong> al público.
      </p>
      <button 
        onClick={handleToggle}
        disabled={loading}
        className="btn"
        style={{ 
          backgroundColor: isHidden ? '#10b981' : '#ef4444', 
          color: 'white',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Procesando...' : isHidden ? 'Hacer Visible de Nuevo' : 'Ocultar Libro por Disputa'}
      </button>
    </div>
  )
}
