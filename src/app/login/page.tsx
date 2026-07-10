import { login, signup } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMsg = searchParams?.error;

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
          Bienvenido a <span style={{ color: 'var(--brand-primary)' }}>Astrolabio</span>
        </h1>
        
        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            {errorMsg === 'true' ? 'Ocurrió un error. Verifica tus datos.' : errorMsg}
          </div>
        )}
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Contraseña</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            />
          </div>

          <button formAction={login} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            Iniciar Sesión
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
            ¿No tienes cuenta?
          </div>

          <button formAction={signup} className="btn btn-secondary" style={{ width: '100%', padding: '0.875rem' }}>
            Registrarse
          </button>
        </form>
      </div>
    </div>
  )
}
