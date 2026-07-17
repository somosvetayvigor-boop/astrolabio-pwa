'use client'

import { useState } from 'react'
import { addComment } from '@/app/reader/[id]/actions'
import { askReadingAssistant, askDictionary } from '@/app/actions/gemini'
import { addHighlight } from '@/app/actions/highlights'

interface AddCommentModalProps {
  bookId: string
  cfi: string
  highlightedText: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddCommentModal({ bookId, cfi, highlightedText, onClose, onSuccess }: AddCommentModalProps) {
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [dictLoading, setDictLoading] = useState(false)
  const [highlightLoading, setHighlightLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [dictResponse, setDictResponse] = useState<string | null>(null)

  const handleQuickHighlight = async () => {
    setHighlightLoading(true)
    const res = await addHighlight(bookId, cfi, highlightedText)
    setHighlightLoading(false)

    if (res.success) {
      onSuccess() // Close modal and let reader know
    } else {
      alert(res.error || 'Error al guardar el subrayado')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setLoading(true)
    const res = await addComment(bookId, cfi, highlightedText, commentText)
    setLoading(false)

    if (res.success) {
      onSuccess()
    } else {
      alert(res.error || 'Error al guardar el comentario')
    }
  }

  const handleAskAI = async () => {
    if (!commentText.trim()) {
      alert('Escribe tu duda o pregunta sobre este texto antes de consultar a la IA.');
      return;
    }

    setAiLoading(true);
    setAiResponse(null);
    const res = await askReadingAssistant(bookId, highlightedText, commentText);
    setAiLoading(false);

    if (res.success) {
      setAiResponse(res.text!);
    } else {
      alert(res.error || 'Error al consultar a la IA');
    }
  }

  const handleDictionary = async () => {
    setDictLoading(true);
    setDictResponse(null);
    const res = await askDictionary(highlightedText);
    setDictLoading(false);

    if (res.success) {
      setDictResponse(res.text!);
    } else {
      alert(res.error || 'Error al buscar en el diccionario');
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
        padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%',
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>¿Qué deseas hacer con este texto?</h3>
        
        <div style={{ borderLeft: '3px solid var(--brand-primary)', paddingLeft: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '0.5rem' }}>
          "{highlightedText.substring(0, 100)}{highlightedText.length > 100 ? '...' : ''}"
        </div>

        <form onSubmit={handleSubmit}>
          <textarea 
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Escribe tu opinión para que otros la lean, o escribe una duda para que la IA te la explique..."
            required
            style={{ 
              width: '100%', minHeight: '100px', padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
              Cancelar
            </button>
            <button type="button" onClick={handleQuickHighlight} disabled={loading || aiLoading || highlightLoading || dictLoading} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #facc15', background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {highlightLoading ? '...' : '🖍️ Solo Subrayar'}
            </button>
            <button type="button" onClick={handleDictionary} disabled={loading || aiLoading || highlightLoading || dictLoading} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #22c55e', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {dictLoading ? '...' : '📖 Diccionario'}
            </button>
            <button type="button" onClick={handleAskAI} disabled={loading || aiLoading || highlightLoading || dictLoading} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, #6e8efb, #a777e3)', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {aiLoading ? 'Pensando...' : '✨ Explicar con IA'}
            </button>
            <button type="submit" disabled={loading || aiLoading || highlightLoading || dictLoading} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--brand-primary)', color: 'var(--brand-text)', cursor: 'pointer', fontWeight: 600 }}>
              {loading ? '...' : '💬 Publicar Nota'}
            </button>
          </div>
        </form>

        {aiResponse && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(110, 142, 251, 0.1)', borderLeft: '4px solid #6e8efb', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#6e8efb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✨ Respuesta de la IA</h4>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiResponse}</p>
          </div>
        )}
        
        {dictResponse && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📖 Diccionario</h4>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{dictResponse}</p>
          </div>
        )}
      </div>
    </div>
  )
}
