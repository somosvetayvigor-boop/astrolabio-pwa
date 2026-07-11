'use client'

import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  bookId: string
  bookTitle: string
  epubUrl: string // It's actually a PDF url, we reuse the prop name
  isSample: boolean
}

export default function PdfViewer({ bookId, bookTitle, epubUrl, isSample }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [isReady, setIsReady] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  
  const router = useRouter()

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    // If sample, limit to 20% of pages or at least 3 pages
    let maxPages = numPages;
    if (isSample) {
      maxPages = Math.max(3, Math.floor(numPages * 0.2));
    }
    setNumPages(maxPages)
    setIsReady(true)
  }

  const prev = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1)
    }
  }

  const next = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1)
    }
  }

  const sampleEnded = isSample && pageNumber >= numPages;

  // Swipe gesture handling
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && !sampleEnded) {
      next() // Swipe left means go forward
    }
    if (isRightSwipe) {
      prev() // Swipe right means go backward
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <span>← Volver</span>
        </button>
        <div style={{ fontWeight: 600, fontSize: '1rem', flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 1rem' }}>
          {bookTitle}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
          {isReady ? `${Math.round((pageNumber / numPages) * 100)}%` : 'Cargando...'}
        </div>
      </div>

      {/* Reader Area */}
      <div 
        style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        
        {/* PDF Document Area */}
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            filter: sampleEnded ? 'blur(4px)' : 'none', 
            transition: 'filter 0.3s' 
          }}
        >
          <Document
            file={epubUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div style={{ padding: '2rem' }}>Cargando libro ilustrado...</div>}
          >
            <Page 
              pageNumber={pageNumber} 
              width={windowWidth > 800 ? 800 : windowWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading=""
            />
          </Document>
        </div>

      </div>

      {/* Paywall Overlay */}
      {sampleEnded && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10, 10, 10, 0.7)', zIndex: 200 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '400px', margin: '0 1.5rem', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Fin de la Muestra</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)' }}>
              Has llegado al límite de páginas gratuitas para este libro. Adquiere el libro completo para continuar leyendo las aventuras.
            </p>
            <Link href={`/book/${bookId}`} className="btn btn-primary" style={{ display: 'block', padding: '1rem', textDecoration: 'none' }}>
              Ver opciones de compra
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
