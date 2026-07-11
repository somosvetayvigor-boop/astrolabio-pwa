'use client'

import { useState } from 'react'
import { getAvatarSignedUrl, updateProfileData } from './actions'

export default function ProfileEditForm({ initialBio, initialAvatarUrl }: { initialBio?: string, initialAvatarUrl?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const formData = new FormData(e.currentTarget)
      const bio = formData.get('bio') as string
      const avatarFile = formData.get('avatarFile') as File

      let finalAvatarPath = null

      if (avatarFile && avatarFile.size > 0) {
        // 1. Get signed url
        const urlsResult = await getAvatarSignedUrl(avatarFile.name)
        if (urlsResult.error) throw new Error(urlsResult.error)
        
        // 2. Upload to Supabase
        const uploadRes = await fetch(urlsResult.signedUrl!, {
          method: 'PUT',
          body: avatarFile,
          headers: { 'Content-Type': avatarFile.type }
        })

        if (!uploadRes.ok) throw new Error('Error al subir la foto directo a Supabase.')
        
        finalAvatarPath = urlsResult.path!
      }

      // 3. Update Profile DB
      const dbResult = await updateProfileData({ bio, avatarPath: finalAvatarPath })
      if (dbResult && dbResult.error) throw new Error(dbResult.error)

    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Mi Perfil de Autor</h2>
      
      {errorMessage && (
        <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid red', color: 'red', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {initialAvatarUrl ? (
            <img src={initialAvatarUrl} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              👤
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label htmlFor="avatarFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Foto de Perfil</label>
            <input type="file" id="avatarFile" name="avatarFile" accept="image/*" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <label htmlFor="bio" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Biografía</label>
          <textarea 
            id="bio" 
            name="bio" 
            rows={4}
            defaultValue={initialBio}
            placeholder="Cuéntale a tus lectores sobre ti..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}>
          {isSubmitting ? 'Guardando...' : 'Guardar Perfil'}
        </button>
      </form>
    </div>
  )
}
