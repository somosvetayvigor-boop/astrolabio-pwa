'use client';

import { useState } from 'react';

export default function BuyButton({ bookId, price }: { bookId: string, price: number }) {
  const [loading, setLoading] = useState(false);

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

  return (
    <button 
      onClick={handleBuy}
      disabled={loading}
      className="btn btn-secondary" 
      style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', flex: 1, opacity: loading ? 0.7 : 1 }}
    >
      {loading ? 'Procesando...' : `Comprar por $${price}`}
    </button>
  );
}
