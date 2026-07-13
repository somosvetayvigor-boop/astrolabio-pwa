import { resetPasswordForEmail } from '@/app/login/actions'
import Link from 'next/link'

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMsg = searchParams?.error;
  const isSuccess = searchParams?.success === 'true';

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
          Recuperar PIN
        </h1>
        
        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y tu carpeta de spam).
            </p>
            <Link href="/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', padding: '0.875rem', textDecoration: 'none' }}>
              Volver al Inicio de Sesión
            </Link>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos instrucciones para crear un nuevo PIN.
            </p>

            {errorMsg && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                {errorMsg}
              </div>
            )}

            <form action={resetPasswordForEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Correo Electrónico</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                Enviar Enlace
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                Cancelar y volver
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
