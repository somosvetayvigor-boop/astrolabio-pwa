import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Astrolabio | Navegando por historias",
  description: "Lee y vende libros. Apoya a escritores independientes.",
  manifest: "/manifest.json",
};

import { createClient } from '@/utils/supabase/server';
import { logout } from '@/app/login/actions';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="es">
      <body className={`${inter.variable}`}>
        <nav className="navbar">
          <div className="container navbar-container">
            <a href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo.jpg" alt="Astrolabio Logo" style={{ height: '40px', width: 'auto', borderRadius: '50%' }} />
              Astrolabio
            </a>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a href="/#catalogo" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Catálogo</a>
              {user ? (
                <>
                  <a href="/dashboard" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Panel de Autor</a>
                  <form action={logout}>
                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cerrar Sesión</button>
                  </form>
                </>
              ) : (
                <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
              )}
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
