import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Astrolabio | Navegando por historias",
  description: "Lee y vende libros. Apoya a escritores independientes.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <a href="/catalog" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Catálogo</a>
              <a href="/dashboard" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Panel de Autor</a>
              <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
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
