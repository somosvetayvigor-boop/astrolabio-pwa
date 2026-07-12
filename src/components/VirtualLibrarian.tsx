'use client'

import { useState } from 'react'
import { askLibrarian } from '@/app/actions/gemini'

export default function VirtualLibrarian({ isSubscribed }: { isSubscribed: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState<{role: 'user'|'ai', text: string}[]>([])
  const [loading, setLoading] = useState(false)

  if (!isSubscribed) return null; // Only for subscribed users

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');
    setLoading(true);

    const res = await askLibrarian(userMessage);
    
    setLoading(false);
    if (res.success) {
      setChat(prev => [...prev, { role: 'ai', text: res.text! }]);
    } else {
      setChat(prev => [...prev, { role: 'ai', text: `Error: ${res.error}` }]);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
          color: 'white', fontSize: '2rem', border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ✨
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '2rem',
          width: '350px', height: '500px', backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #6e8efb, #a777e3)', color: 'white' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✨ Bibliotecario de IA
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Recomendaciones exclusivas para suscriptores (Límite 2/día)</p>
          </div>

          {/* Chat History */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '12px 12px 12px 0', maxWidth: '85%' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Hola. Soy tu Bibliotecario Virtual impulsado por Gemini. ¿Qué tipo de libro te gustaría leer hoy?</p>
            </div>
            
            {chat.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                background: msg.role === 'user' ? 'var(--brand-primary)' : 'var(--bg-tertiary)', 
                color: msg.role === 'user' ? 'white' : 'inherit',
                padding: '0.75rem', 
                borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0', 
                maxWidth: '85%' 
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '0.5rem', opacity: 0.6 }}>
                <span style={{ fontSize: '0.9rem' }}>Escribiendo...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ej. 'Quiero un libro triste...'"
              style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !message.trim()}
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--brand-primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
