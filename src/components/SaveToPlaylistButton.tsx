'use client'

import { useState } from 'react'
import SaveToPlaylistModal from './SaveToPlaylistModal'

export default function SaveToPlaylistButton({ bookId }: { bookId: string }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)',
          background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.875rem'
        }}
        title="Guardar en lista"
      >
        <span>➕</span> Guardar
      </button>
      
      {showModal && <SaveToPlaylistModal bookId={bookId} onClose={() => setShowModal(false)} />}
    </>
  )
}
