export default function TerminosPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Términos y Condiciones</h1>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          Bienvenido a Astrolabio. Actualmente estamos actualizando nuestros términos y condiciones de servicio.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          El uso de esta plataforma implica la aceptación de las reglas básicas de comportamiento, derechos de autor y transacciones establecidas por Astrolabio Books.
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          Última actualización: Julio 2026
        </p>
      </div>
    </div>
  )
}
