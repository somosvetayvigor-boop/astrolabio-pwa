'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Handle both implicit flow (hash) and PKCE flow (?code=)
    const setupSession = async () => {
      const supabase = createClient();
      
      // Check for PKCE code in URL search params
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const errorDescription = searchParams.get('error_description');

      if (errorDescription) {
        setErrorMsg('Error: ' + errorDescription);
        return;
      }

      if (code) {
        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setErrorMsg('El enlace ha expirado o es inválido. Solicita uno nuevo.');
        }
        return;
      }

      // If no code, check session directly (in case of implicit flow or existing session)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) {
            setErrorMsg('Enlace inválido o expirado. Por favor solicita uno nuevo.');
        }
      }
    };
    setupSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    
    setLoading(false);
    
    if (error) {
      setErrorMsg('Error: ' + error.message);
    } else {
      setSuccessMsg('¡PIN actualizado correctamente!');
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push('/login?error=PIN+actualizado.+Por+favor+inicia+sesión+de+nuevo.');
      }, 2000);
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
          Crear Nuevo PIN
        </h1>
        
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          Crea un nuevo PIN de 6 dígitos para acceder a tu cuenta.
        </p>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nuevo PIN de 6 dígitos</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              title="Tu PIN debe ser de 6 números"
              placeholder="Ej. 123456"
              required 
              disabled={loading || !!successMsg}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', letterSpacing: '0.2em', fontFamily: 'monospace' }} 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !!successMsg} style={{ width: '100%', padding: '0.875rem' }}>
            {loading ? 'Actualizando...' : 'Actualizar PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}
