'use client'

import { useState, useEffect } from 'react'
import { isFileCached, downloadFileToCache, removeFileFromCache, requestPersistentStorage } from '@/utils/OfflineManager'
import { saveProgress } from '@/app/reader/[id]/actions'

export default function DownloadButton({ fileUrl, title, bookId }: { fileUrl: string, title?: string, bookId?: string }) {
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    checkStatus()
  }, [fileUrl])

  const checkStatus = async () => {
    if (!fileUrl) return
    const cached = await isFileCached(fileUrl)
    setIsDownloaded(cached)
  }

  const handleToggleDownload = async () => {
    if (!fileUrl) return

    if (isDownloaded) {
      // Remove
      const removed = await removeFileFromCache(fileUrl)
      if (removed) setIsDownloaded(false)
    } else {
      // Download
      setIsDownloading(true)
      setProgress(0)
      
      // Request persistence first
      await requestPersistentStorage()
      
      const success = await downloadFileToCache(fileUrl, (p) => setProgress(p))
      setIsDownloading(false)
      if (success) {
        setIsDownloaded(true)
        if (bookId) {
          saveProgress(bookId, 'audio').catch(console.error)
        }
        if (title) alert(`"${title}" guardado para escuchar offline.`)
      } else {
        alert('Hubo un error al descargar el archivo.')
      }
    }
  }

  if (!fileUrl) return null

  return (
    <button
      onClick={handleToggleDownload}
      disabled={isDownloading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        backgroundColor: isDownloaded ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
        color: isDownloaded ? '#22c55e' : 'var(--text-secondary)',
        cursor: isDownloading ? 'wait' : 'pointer',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'all 0.2s'
      }}
      title={isDownloaded ? 'Eliminar descarga' : 'Descargar para offline'}
    >
      {isDownloading ? (
        <>
          <div style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Descargando...
        </>
      ) : isDownloaded ? (
        <>
          <span>✓</span> Descargado
        </>
      ) : (
        <>
          <span>⬇️</span> Descargar
        </>
      )}
    </button>
  )
}
