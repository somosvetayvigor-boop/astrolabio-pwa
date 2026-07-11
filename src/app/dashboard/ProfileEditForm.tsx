'use client'

import { useState } from 'react'
import { getAvatarSignedUrl, updateProfileData } from './actions'

export default function ProfileEditForm({ initialBio, initialAvatarUrl, initialFullName, initialUsername, initialDisplayPref }: { initialBio?: string, initialAvatarUrl?: string, initialFullName?: string, initialUsername?: string, initialDisplayPref?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl || null)
  const [username, setUsername] = useState(initialUsername || '')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(val)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData(e.currentTarget)
      const bio = formData.get('bio') as string
      const fullName = formData.get('full_name') as string
      const usernameVal = formData.get('username') as string
      const displayPreference = formData.get('display_preference') as string
      const avatarFile = formData.get('avatarFile') as File | null

      let finalAvatarPath = null

      if (avatarFile && avatarFile.size > 0) {
        // 1. Get signed url
        const urlsResult = await getAvatarSignedUrl(avatarFile.name)
        if (urlsResult.error) throw new Error(urlsResult.error)
        
        // 2. Upload to Supabase using client SDK
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const token = new URL(urlsResult.signedUrl!).searchParams.get('token')
        
        if (!token) throw new Error('Token inválido generado por el servidor.')

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .uploadToSignedUrl(urlsResult.path!, token, avatarFile)

        if (uploadError) {
          throw new Error('Error al subir foto: ' + uploadError.message)
        }
        
        finalAvatarPath = urlsResult.path!
      }

      // 3. Update Profile DB
      const dbResult = await updateProfileData({ bio, fullName, username: usernameVal, displayPreference, avatarPath: finalAvatarPath })
      if (dbResult && dbResult.error) {
        throw new Error(dbResult.error)
      } else {
        setSuccessMessage('¡Perfil guardado con éxito!')
      }

    } catch (error: any) {
      if (error.message && error.message.includes('NEXT_REDIRECT')) {
        return;
      }
      console.error(error)
      setErrorMessage(error.message)
    } finally {
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

      {successMessage && (
        <div style={{ backgroundColor: 'rgba(0,255,0,0.1)', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              👤
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label htmlFor="avatarFile" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Foto de Perfil</label>
            <input type="file" id="avatarFile" name="avatarFile" accept="image/*" onChange={handleFileChange} style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <label htmlFor="full_name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Nombre Completo (Público)</label>
          <input 
            type="text" 
            id="full_name" 
            name="full_name" 
            required
            defaultValue={initialFullName}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
            placeholder="Ej. Juan Pérez o tu pseudónimo"
          />
        </div>

        <div>
          <label htmlFor="username" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Nombre de Usuario Único</label>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ padding: '0.75rem', color: 'var(--text-tertiary)', borderRight: '1px solid var(--border-color)' }}>@</span>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              value={username}
              onChange={handleUsernameChange}
              style={{ width: '100%', padding: '0.75rem', border: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} 
              placeholder="juanperez"
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Solo minúsculas, números y guiones bajos (_)</p>
        </div>

        <div>
          <label htmlFor="display_preference" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Preferencia de Visualización</label>
          <select 
            id="display_preference" 
            name="display_preference" 
            defaultValue={initialDisplayPref || "full_name"}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            <option value="full_name">Mostrar mi Nombre Completo</option>
            <option value="username">Mostrar mi Nombre de Usuario (Anónimo)</option>
          </select>
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
