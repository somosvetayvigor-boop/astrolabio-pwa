'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function EscritoresPage() {
  const [pagesRead, setPagesRead] = useState(5000);
  const [booksSold, setBooksSold] = useState(50);
  
  // Estimates based on hypothetical rates: 
  // $0.005 per page read, $5 average net per book sold
  const estimatedPageRevenue = pagesRead * 0.005;
  const estimatedSalesRevenue = booksSold * 5;
  const totalRevenue = estimatedPageRevenue + estimatedSalesRevenue;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        padding: '6rem 2rem',
        textAlign: 'center',
        backgroundImage: 'linear-gradient(rgba(17, 26, 40, 0.85), rgba(17, 26, 40, 0.95)), url("https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1600&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Monetiza tu pasión desde la <span style={{ color: 'var(--brand-primary)' }}>primera página.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Únete a la plataforma donde los autores independientes retienen el control total de sus obras. Gana dinero por cada página leída de los suscriptores y recibe pagos directos por cada venta.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', borderRadius: '50px' }}>
              Empieza a Publicar Hoy
            </Link>
          </div>
        </div>
      </section>

      {/* Modelos de Ingresos */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem', fontWeight: 700 }}>
          Dos formas de ganar dinero
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Pago por página */}
          <div className="glass" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', borderTop: '4px solid var(--brand-primary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📖</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Pago por Página Leída</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Los suscriptores VIP tienen acceso ilimitado a tu catálogo. Tú ganas dinero automáticamente por cada página que ellos leen, proveniente del fondo global de suscripciones.
            </p>
          </div>

          {/* Venta Directa */}
          <div className="glass" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', borderTop: '4px solid #10b981' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💰</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Venta Directa de Libros</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Tanto usuarios gratuitos como suscriptores pueden comprar tu libro de por vida. Tú pones el precio y te llevas el porcentaje más alto del mercado en ventas directas.
            </p>
          </div>
        </div>
      </section>

      {/* Calculadora */}
      <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 700 }}>
            Proyecta tus Ingresos Mensuales
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Calculadora estimada. Las cifras reales pueden variar según el fondo de suscripciones y el precio de tus obras.
          </p>

          <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
            
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '1.125rem' }}>Páginas leídas por mes (Suscriptores)</label>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '1.125rem' }}>{pagesRead.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="500" 
                value={pagesRead} 
                onChange={(e) => setPagesRead(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '1.125rem' }}>Libros vendidos al mes (Venta Directa)</label>
                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.125rem' }}>{booksSold}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="5" 
                value={booksSold} 
                onChange={(e) => setBooksSold(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
              />
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Ingreso Total Estimado</p>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span>Lecturas: ${estimatedPageRevenue.toFixed(2)}</span>
                <span>Ventas: ${estimatedSalesRevenue.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>¿Listo para compartir tus historias?</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Configura tu perfil de autor en minutos, sube tu primer EPUB o Audiolibro y empieza a llegar a miles de lectores apasionados.
        </p>
        <Link href="/dashboard" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem', borderRadius: '50px' }}>
          Ir a mi Dashboard
        </Link>
      </section>
    </div>
  );
}
