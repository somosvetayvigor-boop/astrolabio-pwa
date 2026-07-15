'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { isFileCached } from '@/utils/OfflineManager'

export default function OfflineBooksList({ books }: { books: any[] }) {
  const [offlineBooks, setOfflineBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOfflineStatus()
  }, [books])

  const checkOfflineStatus = async () => {
    const cached = []
    for (const book of books) {
      if (book.audio_url) {
        const isCached = await isFileCached(book.audio_url)
        if (isCached) cached.push(book)
      }
    }
    setOfflineBooks(cached)
    setLoading(false)
  }

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Buscando descargas offline...</p>

  if (offlineBooks.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No tienes audiolibros descargados para escuchar sin conexión.</p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Ve a cualquier audiolibro y toca "Descargar".</p>
      </div>
    )
  }

  return (
    <div className="books-grid">
      {offlineBooks.map((book: any) => (
        <div key={book.id} className="book-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href={`/reader/${book.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="book-cover" style={{ backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 10, right: 10, background: '#22c55e', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
              {book.cover_url && <img src={book.cover_url} alt="Cover" className="book-cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />}
            </div>
            <div className="book-info" style={{ padding: '1rem', flex: 1 }}>
              <h3 className="book-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>{book.title}</h3>
              <p className="book-author" style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Por {book.profiles?.full_name || 'Autor'}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
