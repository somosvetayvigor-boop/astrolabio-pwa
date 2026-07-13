export default function TermsOfService() {
  const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Términos y Condiciones de Uso de AstrolabioBooks</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)' }}>
        <p><strong>Última actualización:</strong> {currentDate}</p>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Aceptación de los Términos</h2>
          <p>Al descargar, registrarte, acceder o utilizar la aplicación AstrolabioBooks, aceptas estar legalmente vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Descripción del Servicio</h2>
          <p>AstrolabioBooks es una plataforma digital de lectura que ofrece acceso a obras literarias, incluyendo textos de dominio público, versiones modernizadas, adaptaciones exclusivas y contenido original. La aplicación opera bajo modelos de acceso gratuito y modelos de monetización, como el pago por página leída o la compra de ediciones especiales.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Cuentas de Usuario</h2>
          <p>Debes proporcionar información precisa y completa al crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.</p>
          <p><strong>Contenido de Usuario (Foto de Perfil):</strong> Si decides subir una fotografía o imagen de perfil, garantizas que posees los derechos sobre dicha imagen o cuentas con la autorización necesaria para utilizarla. Queda estrictamente prohibido subir imágenes que contengan material ofensivo, violento, explícito, que vulnere los derechos de terceros o que infrinja la ley. AstrolabioBooks se reserva el derecho de eliminar cualquier foto de perfil que incumpla estas normas sin previo aviso.</p>
          <p>AstrolabioBooks se reserva el derecho de suspender o cancelar cuentas que violen estos términos o realicen actividades fraudulentas.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4. Propiedad Intelectual y Derechos de Autor</h2>
          <p><strong>Obras Derivadas:</strong> Las adaptaciones, traducciones modernas exclusivas, maquetaciones, ilustraciones y portadas creadas para AstrolabioBooks son propiedad intelectual de la plataforma y están protegidas por las leyes de derechos de autor.</p>
          <p><strong>Restricciones:</strong> Queda estrictamente prohibida la reproducción, distribución, modificación o venta comercial del contenido exclusivo y de las obras derivadas alojadas en la aplicación sin autorización previa por escrito.</p>
          <p><strong>Dominio Público:</strong> AstrolabioBooks respeta los derechos morales de los autores originales en las obras de dominio público distribuidas en la plataforma.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>5. Pagos y Monetización</h2>
          <p>Los cargos por lectura de páginas, compra de libros o suscripciones se procesarán a través de las pasarelas de pago integradas en la aplicación.</p>
          <p>Todas las tarifas están sujetas a cambios, los cuales serán notificados a los usuarios con anticipación.</p>
          <p>No se realizarán reembolsos por páginas ya leídas o contenido digital consumido, salvo en los casos en que la ley lo exija.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>6. Limitación de Responsabilidad</h2>
          <p>AstrolabioBooks se proporciona "tal cual" y "según disponibilidad". No garantizamos que el servicio será ininterrumpido o libre de errores. La plataforma no será responsable de ningún daño indirecto, incidental o consecuente derivado del uso de la aplicación.</p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>7. Legislación Aplicable y Jurisdicción</h2>
          <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes vigentes en México. Cualquier controversia o disputa que surja en relación con el uso de la aplicación será sometida a la jurisdicción exclusiva de los tribunales competentes en Mérida, Yucatán.</p>
        </section>
      </div>
    </div>
  )
}
