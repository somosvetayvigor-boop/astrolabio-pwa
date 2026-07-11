"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import InstallPWA from './InstallPWA'
import { logout } from '@/app/login/actions'

export default function Navbar({ user }: { user: any }) {
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
              <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Panel de Autor</Link>
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
