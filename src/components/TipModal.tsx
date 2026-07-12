'use client'

import { useState } from 'react'

interface TipModalProps {
  bookId: string
  onClose: () => void
}

export default function TipModal({ bookId, onClose }: TipModalProps) {
  const [amount, setAmount] = useState<number>(20)
  const [loading, setLoading] = useState(false)

  const handleTip = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          amount,
          returnUrl: window.location.href,
        })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Error al procesar la propina')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión')
    } finally {
      setLoading(false)
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
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>💖 Invitar un Café al Autor</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          El 90% de tu propina va directamente al autor de esta obra.
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {[20, 50, 100, 200].map(val => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: amount === val ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                backgroundColor: amount === val ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                color: amount === val ? 'var(--brand-primary)' : 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ${val}
            </button>
          ))}
        </div>

        <button 
          onClick={handleTip} 
          disabled={loading}
          className="btn btn-primary" 
          style={{ width: '100%', marginBottom: '1rem', padding: '1rem', fontSize: '1.1rem' }}
        >
          {loading ? 'Procesando...' : `Apoyar con $${amount} MXN`}
        </button>
        <button 
          onClick={onClose} 
          style={{ 
            width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', 
            color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
