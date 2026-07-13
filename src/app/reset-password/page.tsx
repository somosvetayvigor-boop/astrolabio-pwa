import { updatePassword } from '@/app/login/actions'

export default async function ResetPasswordPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMsg = searchParams?.error;

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

        <form action={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            Actualizar PIN
          </button>
        </form>
      </div>
    </div>
  )
}
