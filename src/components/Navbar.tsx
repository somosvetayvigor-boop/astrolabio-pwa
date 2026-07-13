"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import InstallPWA from './InstallPWA'
import { logout } from '@/app/login/actions'

export default function Navbar({ user, streak = 0, isAdmin = false, isPremium = false }: { user: any, streak?: number, isAdmin?: boolean, isPremium?: boolean }) {
  const pathname = usePathname()
  
  // Hide navbar on the reader page to allow fullscreen reading
  if (pathname && pathname.startsWith('/reader/')) {
    return null
  }

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.jpeg" alt="Astrolabio Logo" className="logo-pulse" style={{ height: '50px', width: 'auto', borderRadius: '50%' }} />
          Astrolabio
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <InstallPWA />
          <Link href="/#catalogo" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Catálogo</Link>
          {user ? (
            <>
              {isPremium && (
                <div title="Suscripción Activa" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(212, 175, 55, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '1rem', color: 'var(--brand-primary)', fontWeight: 600, border: '1px solid var(--brand-primary)' }}>
                  ✨ Premium
                </div>
              )}
              <div title="Racha de lectura diaria" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(255,165,0,0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', color: '#ff9800', fontWeight: 600 }}>
                🔥 {streak}
              </div>
              <Link href="/library" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Mi Biblioteca</Link>
              <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Panel de Autor</Link>
              {isAdmin && (
                <Link href="/admin" style={{ color: '#fbbf24', fontWeight: 600 }}>👑 Panel Admin</Link>
              )}
              <form action={logout}>
                <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cerrar Sesión</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
