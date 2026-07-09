'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ePub, { Book, Rendition } from 'epubjs'

export default function EpubViewer({ bookId, bookTitle, epubUrl }: { bookId: string, bookTitle: string, epubUrl: string }) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!viewerRef.current || !epubUrl) return

    // Initialize the ePub book
    const newBook = ePub(epubUrl)
    setBook(newBook)

    // Render it to the DOM
    const newRendition = newBook.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none', // Better for mobile/single column reading
    })
    
    // Apply basic styling matching Astrolabio
    newRendition.themes.default({
      'body': {
        'font-family': 'Georgia, serif',
        'color': '#111a28',
        'background': '#fdfbf7',
        'line-height': '1.8',
        'font-size': '1.125rem'
      }
    })

    setRendition(newRendition)
    newRendition.display()

    // Setup locations for progress tracking (calculates total pages)
    newBook.ready.then(() => {
      return newBook.locations.generate(1600) // 1600 characters per "page"
    }).then((locations) => {
      // Listen for page turns
      newRendition.on('relocated', (location: any) => {
        const percentage = newBook.locations.percentageFromCfi(location.start.cfi)
        setProgress(Math.round(percentage * 100))
        
        // TODO: Send this progress back to Supabase to calculate KENPC payouts
      })
    })

    return () => {
      newBook.destroy()
    }
  }, [epubUrl])

  const next = () => {
    if (rendition) rendition.next()
  }

  const prev = () => {
    if (rendition) rendition.prev()
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Reader Toolbar */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/book/${bookId}`} style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>← Volver</Link>
        <div style={{ fontWeight: 600 }}>{bookTitle}</div>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{progress}% Leído</div>
      </div>

      {/* Reader Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Previous Page Button */}
        <button onClick={prev} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50px', zIndex: 10, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          ‹
        </button>

        {/* ePub content renders here */}
        <div ref={viewerRef} style={{ width: '100%', height: '100%', padding: '2rem 50px' }}></div>
        
        {/* Next Page Button */}
        <button onClick={next} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50px', zIndex: 10, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          ›
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--brand-primary)', transition: 'width 0.3s' }}></div>
      </div>
    </div>
  )
}
