'use client'

import { useState } from 'react'
import { toggleSubscriptionStatus } from './actions'

interface Book {
  id: string
  title: string
  price: number
}

interface UserCardProps {
  user: {
    id: string
    full_name: string
    avatar_url: string | null
    subscription_status: string | null
    current_streak: number
    completedCount: number
    books: Book[]
  }
}

export default function UserCard({ user }: UserCardProps) {
  const [showBooks, setShowBooks] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const isPremium = user.subscription_status === 'active'

  const handleTogglePremium = async () => {
    setIsUpdating(true)
    const result = await toggleSubscriptionStatus(user.id, user.subscription_status)
    if (!result.success) {
      alert(result.error)
    }
    setIsUpdating(false)
  }

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem', border: isPremium ? '2px solid #fbbf24' : '1px solid var(--border-color)', position: 'relative' }}>
      
      {isPremium && (
        <div style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#fbbf24', borderRadius: '50%', padding: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 10 }}>
          👑
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
        )}
        
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{user.full_name || 'Usuario Anónimo'}</h3>
          <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>ID: {user.id.substring(0, 8)}...</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Racha</p>
          <p style={{ margin: 0, fontWeight: 700 }}>🔥 {user.current_streak || 0}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Completados</p>
          <p style={{ margin: 0, fontWeight: 700 }}>📚 {user.completedCount || 0}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Publicados</p>
          <p style={{ margin: 0, fontWeight: 700 }}>✍️ {user.books.length}</p>
        </div>
      </div>

      <button 
        onClick={handleTogglePremium} 
        disabled={isUpdating}
        className={isPremium ? "btn" : "btn btn-primary"}
        style={{ width: '100%', opacity: isUpdating ? 0.7 : 1, padding: '0.5rem', backgroundColor: isPremium ? 'var(--bg-secondary)' : undefined, color: isPremium ? 'var(--text-primary)' : undefined, border: isPremium ? '1px solid var(--border-color)' : undefined }}
      >
        {isUpdating ? 'Actualizando...' : isPremium ? 'Revocar Premium' : 'Otorgar Premium'}
      </button>

      {user.books.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <button 
            onClick={() => setShowBooks(!showBooks)}
            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem' }}
          >
            {showBooks ? 'Ocultar Libros ▲' : `Ver ${user.books.length} Libros ▼`}
          </button>
          
          {showBooks && (
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', maxHeight: '150px', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {user.books.map(book => (
                  <li key={book.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }} title={book.title}>{book.title}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: book.price === 0 ? '#10b981' : 'var(--text-primary)' }}>
                      {book.price === 0 ? 'Gratis' : `$${book.price} MXN`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
