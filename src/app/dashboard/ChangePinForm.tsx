'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ChangePinForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const newPin = formData.get('pin') as string

    if (!newPin || newPin.length !== 6) {
      setMessage({ text: 'El PIN debe ser de 6 números.', type: 'error' })
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPin })

    if (error) {
      setMessage({ text: 'Error al cambiar PIN: ' + error.message, type: 'error' })
    } else {
      setMessage({ text: '¡PIN cambiado correctamente!', type: 'success' })
      e.currentTarget.reset()
    }
    
    setLoading(false)
  }

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Cambiar mi PIN de seguridad</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Actualiza tu PIN de 6 dígitos para iniciar sesión en tu cuenta.
      </p>

      {message && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1rem', 
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
          color: message.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '0.875rem', 
          fontWeight: 500 
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="new_pin" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nuevo PIN</label>
          <input 
            type="password" 
            id="new_pin"
            name="pin"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="Ej. 123456"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', letterSpacing: '0.2em', fontFamily: 'monospace' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px', padding: '0 1.5rem' }}>
          {loading ? 'Guardando...' : 'Cambiar PIN'}
        </button>
      </form>
    </div>
  )
}
