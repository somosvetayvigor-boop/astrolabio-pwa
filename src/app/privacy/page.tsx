export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Política de Privacidad</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)' }}>
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Información que recopilamos</h2>
          <p>Al utilizar Astrolabio, recopilamos información básica para el funcionamiento de tu cuenta, como tu nombre, dirección de correo electrónico y el progreso de tus lecturas. Si decides publicar un libro, también recopilaremos la información necesaria para gestionar tu catálogo.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Uso de la información</h2>
          <p>Utilizamos tus datos exclusivamente para brindarte el servicio de lectura, personalizar tu experiencia, mantener la seguridad de tu cuenta y, en el caso de los autores, gestionar el cálculo de regalías y estadísticas de lectura.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Procesamiento de pagos</h2>
          <p>Los pagos y suscripciones son procesados de forma segura a través de nuestro proveedor (Stripe). Astrolabio no almacena ni tiene acceso a los números completos de tus tarjetas de crédito o débito.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4. Compartir información</h2>
          <p>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines publicitarios. Tu información solo es compartida de forma estrictamente necesaria con proveedores de servicios (como procesadores de pago o servidores de alojamiento) para que la plataforma pueda funcionar.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>5. Tus derechos</h2>
          <p>Tienes derecho a acceder, modificar o eliminar tu información personal en cualquier momento. Si deseas eliminar tu cuenta de forma permanente, puedes contactarnos o utilizar la opción correspondiente dentro de la aplicación.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>6. Contacto</h2>
          <p>Si tienes alguna pregunta sobre esta Política de Privacidad, no dudes en contactarnos a través de nuestros canales oficiales.</p>
        </section>
      </div>
    </div>
  )
}
