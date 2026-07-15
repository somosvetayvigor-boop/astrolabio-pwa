export default function PrivacidadPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Aviso de Privacidad</h1>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          En Astrolabio Books nos tomamos muy en serio la privacidad de tus datos.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          La información personal que proporciones (como tu correo electrónico o nombre de usuario) será utilizada exclusivamente para gestionar tu acceso, compras y lectura dentro de la plataforma, y nunca será compartida con terceros sin tu consentimiento explícito.
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          Última actualización: Julio 2026
        </p>
      </div>
    </div>
  )
}
