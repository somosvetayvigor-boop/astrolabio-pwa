'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PremiumPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlayStore, setIsPlayStore] = useState(false)

  import('react').then(({ useEffect }) => {
    useEffect(() => {
      if (typeof window !== 'undefined') {
        setIsPlayStore(localStorage.getItem('isPlayStore') === 'true')
      }
    }, [])
  })

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
      })
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Error al conectar con Stripe.')
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError('Error de conexión.')
      setLoading(false)
    }
  }

  // Handle return from Stripe
  const searchParams = useSearchParams();
  import('react').then(({ useEffect }) => {
    useEffect(() => {
      if (searchParams.get('success') === 'true') {
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else if (searchParams.get('canceled') === 'true') {
        setError('El pago fue cancelado.')
      }
    }, [searchParams, router])
  })

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

        {isPlayStore ? (
          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,165,0,0.1)', color: '#ff9800', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            Por políticas de Google, las suscripciones deben realizarse directamente en nuestro sitio web oficial.
          </div>
        ) : success ? (
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
              * Serás redirigido a la pasarela de pago segura de Stripe.
            </p>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
