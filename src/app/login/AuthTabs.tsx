'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { createClient } from '@/utils/supabase/client'

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

      <button 
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/api/auth/callback`,
            }
          });
        }}
        style={{ 
          width: '100%', 
          padding: '0.875rem', 
          backgroundColor: '#fff', 
          color: '#333', 
          border: '1px solid #ccc', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem', 
          fontSize: '1rem', 
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, borderTop: '1px solid var(--border-color)' }}></div>
        <span style={{ margin: '0 1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>o usa tu correo</span>
        <div style={{ flex: 1, borderTop: '1px solid var(--border-color)' }}></div>
      </div>

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
            <label htmlFor="password_login" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>PIN de 6 dígitos</label>
            <input 
              id="password_login" 
              name="password" 
              type="password" 
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              title="Tu PIN debe ser de 6 números"
              placeholder="Ej. 123456"
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', letterSpacing: '0.2em', fontFamily: 'monospace' }} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            Entrar a mi cuenta
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="/forgot-password" style={{ color: 'var(--brand-primary)', fontSize: '0.875rem', textDecoration: 'none' }}>¿Olvidaste tu PIN?</a>
          </div>
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
            <label htmlFor="password_register" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Crea un PIN de 6 dígitos *</label>
            <input 
              id="password_register" 
              name="password" 
              type="password" 
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              title="Tu PIN debe ser de 6 números"
              placeholder="Ej. 123456"
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', letterSpacing: '0.2em', fontFamily: 'monospace' }} 
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
