'use client'

import { useState, useEffect } from 'react'
import { getComments } from '@/app/reader/[id]/actions'

interface Comment {
  id: string
  cfi: string
  highlighted_text: string
  comment_text: string
  created_at: string
  profiles: { full_name: string, avatar_url: string } | null
}

export default function CommentsSidebar({ bookId, isOpen, onClose, onCommentClick }: { bookId: string, isOpen: boolean, onClose: () => void, onCommentClick: (cfi: string) => void }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getComments(bookId).then(res => {
        if (res.success && res.data) {
          setComments(res.data as any)
        }
        setLoading(false)
      })
    }
  }, [isOpen, bookId])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: '300px',
      backgroundColor: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)',
      boxShadow: '-5px 0 15px rgba(0,0,0,0.1)', zIndex: 9000,
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Comentarios</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando comentarios...</p>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            <p>Aún no hay comentarios.</p>
            <p style={{ fontSize: '0.85rem' }}>Selecciona texto en el libro para ser el primero en comentar.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map(c => {
              const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
              return (
              <div key={c.id} style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <img 
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'Anon'}`} 
                    alt="Avatar" 
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{profile?.full_name || 'Usuario Anónimo'}</span>
                </div>
                {c.highlighted_text && (
                  <div 
                    onClick={() => onCommentClick(c.cfi)}
                    style={{ borderLeft: '3px solid var(--brand-primary)', paddingLeft: '0.5rem', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', cursor: 'pointer', backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '0.25rem' }}
                  >
                    "{c.highlighted_text}"
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.comment_text}</p>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
