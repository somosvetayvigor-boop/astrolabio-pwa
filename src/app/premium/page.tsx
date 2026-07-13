'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { activatePremiumSubscription } from './actions'

export default function PremiumPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    
    const result = await activatePremiumSubscription()
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } else {
      setError(result.error || 'Ocurrió un error inesperado.')
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--brand-primary), #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Astrolabio Premium
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
        Lee todo el catálogo sin límites. Apoya directamente a tus autores independientes favoritos con cada página que lees y cada minuto que escuchas.
      </p>

      <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', border: '1px solid var(--brand-primary)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>$99 MXN <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>/ mes</span></h2>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0', textAlign: 'left', display: 'inline-block' }}>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✅ Acceso ilimitado a todos los Ebooks
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎧 Acceso ilimitado a Audiolibros y Podcasts
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💖 El 70% de tu pago va directo a los creadores
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🚫 Cancela en cualquier momento
          </li>
        </ul>

        {success ? (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            ¡Bienvenido a Astrolabio Premium! Redirigiendo al catálogo...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleSubscribe} 
              disabled={loading}
              className="btn btn-primary" 
              style={{ padding: '1rem 3rem', fontSize: '1.25rem', width: '100%', maxWidth: '300px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Activando...' : 'Suscribirse ahora'}
            </button>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
              * Modo de prueba. No se realizarán cargos reales a tu tarjeta.
            </p>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
