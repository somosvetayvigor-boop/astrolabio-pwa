'use client'

import { useState, useEffect } from 'react'

export default function StripeConnectButton({ 
  isConnected, 
  bankName, 
  last4 
}: { 
  isConnected: boolean, 
  bankName?: string, 
  last4?: string 
}) {
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [isPlayStore, setIsPlayStore] = useState(false)

  useEffect(() => {
    // Detectar si venimos de la app de Google Play (TWA)
    if (document.referrer.includes('android-app://')) {
      sessionStorage.setItem('isPlayStore', 'true')
    }
    
    if (sessionStorage.getItem('isPlayStore') === 'true') {
      setIsPlayStore(true)
    }

    // Check URL params for success/refresh
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe_connect') === 'success') {
      setSuccessMsg('¡Tu cuenta bancaria fue conectada con éxito! Ya puedes recibir pagos.')
      // Remove query param to clean URL
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
      })
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Ocurrió un error al conectar con Stripe.')
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión.')
      setLoading(false)
    }
  }

  if (isPlayStore) {
    return (
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>
          Configuración de Pagos
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          Por políticas de la tienda de aplicaciones, la conexión de cuentas bancarias y regalías debe realizarse directamente desde nuestro sitio web. Por favor, inicia sesión en <strong style={{ userSelect: 'text', WebkitUserSelect: 'text', cursor: 'text' }}>www.astrolabiobooks.com</strong> desde el navegador, no importa si es desde el celular o la computadora.
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: isConnected ? 'rgba(46, 204, 113, 0.1)' : 'rgba(212, 175, 55, 0.05)', borderRadius: 'var(--radius-md)', border: `1px solid ${isConnected ? 'rgba(46, 204, 113, 0.3)' : 'rgba(212, 175, 55, 0.2)'}` }}>
      {successMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}
      
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {isConnected ? '✅ Cuenta Bancaria Conectada' : '🏦 Conecta tu Cuenta Bancaria'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
        {isConnected 
          ? `Tu cuenta de Stripe Connect está activa. Recibirás tu porcentaje de ventas directamente en tu cuenta ${bankName && last4 ? `(${bankName} ****${last4})` : 'de banco'}.`
          : 'Para poder poner a la venta tus libros y recibir regalías (el 70% de cada venta), necesitas conectar una cuenta bancaria a través de Stripe, nuestra pasarela de pagos segura.'}
      </p>
      
      {!isConnected && (
        <button 
          onClick={handleConnect} 
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#635BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? 'Conectando...' : 'Conectar con Stripe'}
        </button>
      )}
    </div>
  )
}
