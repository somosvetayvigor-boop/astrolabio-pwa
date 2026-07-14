'use client';

import { useState, useEffect } from 'react';

export default function BuyButton({ bookId, price }: { bookId: string, price: number }) {
  const [loading, setLoading] = useState(false);
  const [isPlayStore, setIsPlayStore] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPlayStore(sessionStorage.getItem('isPlayStore') === 'true');
    }
  }, []);

  const handleBuy = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(`Error: ${data.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Hubo un error al procesar el pago. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (isPlayStore) {
    return (
      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,165,0,0.1)', border: '1px solid #ff9800', borderRadius: 'var(--radius-md)' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Por políticas de Google, la compra individual de libros debe realizarse directamente desde nuestro sitio web oficial: <strong style={{ userSelect: 'text', WebkitUserSelect: 'text', cursor: 'text' }}>www.astrolabiobooks.com</strong>
        </p>
      </div>
    );
  }

  return (
    <button 
      onClick={handleBuy}
      disabled={loading}
      className="btn btn-secondary" 
      style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', flex: 1, opacity: loading ? 0.7 : 1 }}
    >
      {loading ? 'Procesando...' : `Comprar por $${price} MXN`}
    </button>
  );
}
