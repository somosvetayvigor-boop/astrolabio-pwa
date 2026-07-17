export default function TerminosPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Términos y Condiciones</h1>
      
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Descripción del Servicio y Cuentas de Usuario</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          AstrolabioBooks es una plataforma digital que permite a los usuarios leer, publicar y monetizar obras literarias.
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li><strong>Registro:</strong> Para utilizar la app, requerimos que proporciones tu nombre, un nombre de usuario y un correo electrónico.</li>
          <li><strong>Foto de Perfil:</strong> Tienes la opción de subir manualmente una fotografía de perfil desde la galería de tu dispositivo. Al hacerlo, garantizas que tienes los derechos sobre esa imagen y que no contiene material ofensivo, violento o ilegal.</li>
          <li><strong>Restricción de Edad:</strong> Debes tener al menos 13 años para crear una cuenta de lector. Para publicar libros y recibir o realizar pagos, debes ser mayor de 18 años o contar con la supervisión de un tutor legal.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Publicación de Libros y Monetización para Autores</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Los autores pueden subir sus obras a la plataforma y elegir cómo monetizarlas:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li><strong>Modelos de Ingreso:</strong> Las obras pueden generar ingresos mediante venta directa del libro digital o a través de un modelo de pago por página leída, según la configuración que elija el comprador/lector.</li>
          <li><strong>Gestión de Pagos y Datos Fiscales:</strong> Todos los procesamientos de pago, cobros a lectores y dispersión de regalías a los autores se realizan exclusivamente a través de Stripe. AstrolabioBooks no almacena tarjetas de crédito, cuentas bancarias ni datos fiscales; los autores deberán proporcionar esta información directamente a Stripe conforme a sus propios términos legales.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Protocolo de Propiedad Intelectual (Notificación y Retirada - DMCA)</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
          AstrolabioBooks respeta los derechos de autor y actúa como un intermediario neutral. Si un autor o tercero considera que un libro subido a la plataforma infringe sus derechos de autor, aplicaremos el siguiente protocolo:
        </p>
        <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
          <li><strong>Reporte y Cuarentena:</strong> Al recibir un reporte formal con pruebas de titularidad, el libro será puesto en "cuarentena" (oculto del público) temporalmente para proteger la plataforma.</li>
          <li><strong>Contra-notificación:</strong> Se notificará al usuario que subió el libro, dándole la oportunidad de presentar pruebas de su autoría o derecho de uso.</li>
          <li><strong>Resolución y Plazo Legal:</strong> Si ambas partes presentan pruebas contradictorias, el libro permanecerá oculto y se otorgará un plazo de 14 días al reclamante original para presentar un comprobante de acción legal o demanda. Si transcurridos los 14 días no se presenta dicho comprobante, el libro será restaurado en la plataforma. AstrolabioBooks no actuará como juez ni tribunal en disputas de titularidad.</li>
        </ol>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Limitación de Responsabilidad y Jurisdicción</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
          AstrolabioBooks proporciona su infraestructura técnica "tal cual". No nos hacemos responsables por interrupciones del servicio derivadas de fallas en servidores externos. Para la interpretación, cumplimiento y ejecución de los presentes términos, las partes se someten expresamente a las leyes vigentes y a la jurisdicción de los tribunales competentes en la ciudad de Mérida, Yucatán, México, renunciando a cualquier otro fuero que pudiera corresponderles.
        </p>

        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          Fecha de última actualización: 17 de julio de 2026
        </p>
      </div>
    </div>
  )
}
