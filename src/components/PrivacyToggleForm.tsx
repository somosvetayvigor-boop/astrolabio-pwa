'use client'

import { useState } from 'react'
import { toggleLeaderboardPrivacy } from '@/app/actions/leaderboard'

export default function PrivacyToggleForm({ initialIsPublic }: { initialIsPublic: boolean }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked
    setIsPublic(newValue)
    setLoading(true)
    const { success, error } = await toggleLeaderboardPrivacy(newValue)
    setLoading(false)
    if (!success) {
      setIsPublic(!newValue) // Revert on failure
      alert(error || 'Ocurrió un error al actualizar la privacidad.')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>Participar en La Montaña del Lector</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Si desactivas esto, desaparecerás del ranking público y nadie verá tus estadísticas.
        </p>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
        <input 
          type="checkbox" 
          checked={isPublic} 
          onChange={handleToggle}
          disabled={loading}
          style={{ opacity: 0, width: 0, height: 0 }} 
        />
        <span style={{
          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: isPublic ? 'var(--brand-primary)' : 'var(--text-tertiary)',
          transition: '.4s', borderRadius: '34px', opacity: loading ? 0.5 : 1
        }}>
          <span style={{
            position: 'absolute', content: '""', height: '18px', width: '18px',
            left: isPublic ? '28px' : '4px', bottom: '4px', backgroundColor: 'white',
            transition: '.4s', borderRadius: '50%'
          }} />
        </span>
      </label>
    </div>
  )
}
