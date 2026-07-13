export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Política de Privacidad de AstrolabioBooks</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)' }}>
        <p><strong>Última actualización:</strong> {currentDate}</p>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Información que Recopilamos</h2>
          <p>Para brindarte la mejor experiencia de lectura, recopilamos los siguientes tipos de información:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><strong>Datos de Registro:</strong> Nombre, dirección de correo electrónico y contraseña (encriptada) proporcionados al crear una cuenta.</li>
            <li><strong>Contenido subido por el usuario:</strong> Fotografía o imagen de perfil que decidas cargar de manera opcional para personalizar tu cuenta dentro de la plataforma.</li>
            <li><strong>Datos de Uso y Hábitos de Lectura:</strong> Títulos leídos, número de páginas consumidas, tiempo de lectura, progreso en los libros y marcadores guardados.</li>
            <li><strong>Datos de Transacciones:</strong> Historial de compras y registros de pago por página leída (los datos financieros sensibles son procesados por terceros de forma segura y no se almacenan en nuestros servidores).</li>
            <li><strong>Datos del Dispositivo:</strong> Modelo de dispositivo, sistema operativo y dirección IP para optimizar el rendimiento de la aplicación.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Uso de la Información</h2>
          <p>Utilizamos los datos recopilados exclusivamente para los siguientes propósitos:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Proporcionar, mantener y mejorar las funciones de la aplicación.</li>
            <li>Calcular y procesar de manera precisa los cobros en el modelo de pago por página leída.</li>
            <li>Personalizar tu experiencia ofreciendo recomendaciones de lectura (como sugerencias del administrador "Capitán Libro").</li>
            <li>Mostrar y almacenar tu foto de perfil para identificar tu cuenta y personalizar visualmente tu experiencia y tu interacción dentro de la aplicación.</li>
            <li>Enviar notificaciones importantes sobre actualizaciones, cambios en las políticas o nuevas ediciones disponibles.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Compartición de Datos</h2>
          <p>AstrolabioBooks no vende, alquila ni comercializa tu información personal. Solo compartiremos tus datos en los siguientes casos:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Con proveedores de servicios de terceros (como procesadores de pago o servicios en la nube como Supabase) estrictamente necesarios para operar la aplicación.</li>
            <li>Cuando sea requerido por ley o en respuesta a una solicitud legal válida de las autoridades competentes.</li>
            <li>Tu nombre de usuario y foto de perfil podrán ser visibles para el equipo de administración (Capitán Libro) y, en caso de habilitarse funciones sociales como comentarios o reseñas, podrían ser visibles para otros usuarios de la comunidad.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4. Seguridad de los Datos</h2>
          <p>Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger tu información personal contra accesos no autorizados, pérdida o alteración. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>5. Derechos ARCO</h2>
          <p>De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México, tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (Derechos ARCO) al tratamiento de tu información. Puedes ejercer estos derechos en cualquier momento contactando a nuestro equipo de soporte a través del correo electrónico: soporte@astrolabiobooks.com.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>6. Cambios en esta Política</h2>
          <p>Nos reservamos el derecho de actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cualquier cambio significativo a través de un aviso en la aplicación o mediante un correo electrónico a la dirección asociada con tu cuenta.</p>
        </section>
      </div>
    </div>
  )
}
