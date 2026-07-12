'use client'

import { useState, useEffect } from 'react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If prompt isn't available, redirect to the app directly
      window.location.href = 'https://app.astrolabiobooks.com'
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  // If already installed, the button just opens the app
  if (isInstalled) {
    return (
      <a href="https://app.astrolabiobooks.com" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
        📖 Abrir Aplicación
      </a>
    )
  }

  // If installable (or fallback to redirect), show install button
  return (
    <button 
      onClick={handleInstallClick} 
      className="btn btn-primary" 
      style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', border: 'none', cursor: 'pointer' }}
    >
      📱 Instalar App Gratis
    </button>
  )
}
