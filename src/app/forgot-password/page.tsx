import { resetPasswordForEmail, verifyResetOTP } from '@/app/login/actions'
import Link from 'next/link'

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ error?: string, verify?: string, email?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMsg = searchParams?.error;
  const isVerify = searchParams?.verify === 'true';
  const email = searchParams?.email || '';

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
          Recuperar PIN
        </h1>
        
        {isVerify ? (
          <>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Ingresa el correo, el código de 6 dígitos que recibiste y tu nuevo PIN.
            </p>
            
            {errorMsg && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                {errorMsg}
              </div>
            )}

            <form action={verifyResetOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email_verify" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Correo Electrónico</label>
                <input 
                  id="email_verify" 
                  name="email" 
                  type="email" 
                  defaultValue={email}
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="token" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Código de 6 dígitos del correo</label>
                <input 
                  id="token" 
                  name="token" 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ej. 123456"
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', letterSpacing: '0.2em', fontFamily: 'monospace' }} 
                />
              </div>

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
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', letterSpacing: '0.2em', fontFamily: 'monospace' }} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                Verificar y Actualizar PIN
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                Cancelar y volver
              </Link>
            </div>
          </>
        ) : (
          <>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un código para crear un nuevo PIN.
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
                Enviar Código
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href="/forgot-password?verify=true" style={{ color: 'var(--brand-primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
                ¿Ya tienes un código? Ingresarlo aquí
              </Link>
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
