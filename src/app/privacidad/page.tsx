export default function PrivacidadPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Aviso de Privacidad</h1>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
          AstrolabioBooks es el responsable del tratamiento de tus datos personales. Tu privacidad es fundamental para nosotros, por lo que detallamos cómo manejamos tu información.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Datos Personales que Recopilamos</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Para el funcionamiento de la app, recopilamos:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li><strong>Datos de Identificación:</strong> Nombre, nombre de usuario y correo electrónico.</li>
          <li><strong>Datos Multimedia:</strong> Fotografía de perfil (subida de manera manual y voluntaria por el usuario).</li>
          <li><strong>Datos de Uso:</strong> Hábitos de lectura, páginas leídas y progreso en los libros (necesario para calcular el pago a los autores).</li>
          <li><strong>Nota sobre datos financieros:</strong> Como se mencionó, los datos de tarjetas, cobros y facturación son recopilados y gestionados directamente por Stripe. AstrolabioBooks no tiene acceso a esta información.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Finalidad del Tratamiento de Datos</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Tus datos se utilizan para:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li>Crear y gestionar tu cuenta.</li>
          <li>Mostrar tu nombre de usuario y foto de perfil dentro de la comunidad de la app.</li>
          <li>Calcular de forma precisa las páginas leídas para el sistema de monetización.</li>
          <li>Enviarte notificaciones relevantes sobre tu cuenta o nuevos libros.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Infraestructura y Servicios de Terceros</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Para ofrecerte un servicio rápido y seguro, tus datos y los archivos de la plataforma son procesados a través de proveedores de infraestructura tecnológica de primer nivel. Al usar AstrolabioBooks, aceptas que tu información interactúe con los siguientes servicios:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li><strong>Supabase:</strong> Para el alojamiento seguro de nuestra base de datos y la gestión de usuarios.</li>
          <li><strong>Cloudflare:</strong> Para la protección de la red, seguridad contra ataques y distribución rápida del contenido (CDN).</li>
          <li><strong>GitHub:</strong> Para el alojamiento del código fuente y despliegue de la aplicación.</li>
          <li><strong>Firebase:</strong> Exclusivamente para la gestión y envío de notificaciones push a tu dispositivo.</li>
          <li><strong>Stripe:</strong> Para el procesamiento de cualquier transacción financiera.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          Tienes derecho a conocer qué datos personales tenemos de ti, para qué los utilizamos y las condiciones del uso que les damos. Asimismo, es tu derecho solicitar la corrección de tu información en caso de que esté desactualizada, sea inexacta o incompleta; que la eliminemos de nuestros registros o bases de datos; así como oponerte al uso de tus datos personales para fines específicos.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
          Para ejercer cualquiera de tus Derechos ARCO o solicitar la eliminación permanente de tu cuenta y tus datos, deberás enviar una solicitud formal al correo electrónico: <strong>astrolabiobooks@gmail.com</strong>.
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>5. Modificaciones al Aviso de Privacidad</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
          Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad. Estas modificaciones estarán disponibles a través de nuestra aplicación.
        </p>

        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          Fecha de última actualización: 17 de julio de 2026
        </p>
      </div>
    </div>
  )
}
