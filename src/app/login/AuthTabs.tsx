'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function AuthTabs({ errorMsg }: { errorMsg?: string }) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem' }}>
        Bienvenido a <span style={{ color: 'var(--brand-primary)' }}>Astrolabio</span>
      </h1>
      
      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('login')}
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'login' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'login' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          Iniciar Sesión
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'register' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'register' ? 600 : 400,
            cursor: 'pointer'
          }}
        >
          Crear Cuenta
        </button>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
          {errorMsg === 'true' ? 'Ocurrió un error. Verifica tus datos.' : errorMsg}
        </div>
      )}

      {activeTab === 'login' ? (
        <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email_login" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
            <input 
              id="email_login" 
              name="email" 
              type="email" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password_login" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Contraseña</label>
            <input 
              id="password_login" 
              name="password" 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            Entrar a mi cuenta
          </button>
        </form>
      ) : (
        <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="full_name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nombre Completo *</label>
            <input 
              id="full_name" 
              name="full_name" 
              type="text" 
              required 
              placeholder="Ej. Juan Pérez"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>

          <div>
            <label htmlFor="username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nombre de Usuario *</label>
            <input 
              id="username" 
              name="username" 
              type="text" 
              required
              placeholder="Ej. juanperez123"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>

          <div>
            <label htmlFor="display_preference" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>¿Cómo quieres aparecer en la tienda?</label>
            <select 
              id="display_preference" 
              name="display_preference"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            >
              <option value="real_name">Mostrar mi Nombre Completo</option>
              <option value="username">Mostrar mi Nombre de Usuario (Anónimo)</option>
            </select>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>

          <div>
            <label htmlFor="email_register" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email *</label>
            <input 
              id="email_register" 
              name="email" 
              type="email" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password_register" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Contraseña *</label>
            <input 
              id="password_register" 
              name="password" 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '0.875rem' }}>
            Registrarme ahora
          </button>
        </form>
      )}
    </div>
  )
}
