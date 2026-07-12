'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ePub, { Book, Rendition } from 'epubjs'
import { saveProgress, getProgress, updateReadingStreak } from './actions'

export default function EpubViewer({ bookId, bookTitle, epubUrl, isSample = false }: { bookId: string, bookTitle: string, epubUrl: string, isSample?: boolean }) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const [progress, setProgress] = useState(0)
  const [sampleEnded, setSampleEnded] = useState(false)
  const visitedLocations = useRef<Set<string>>(new Set())
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light')
  const [fontSize, setFontSize] = useState(100)
  const [showSettings, setShowSettings] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Load preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('reader_theme') as 'light' | 'dark' | 'sepia'
    const savedFontSize = localStorage.getItem('reader_fontSize')
    if (savedTheme) setTheme(savedTheme)
    if (savedFontSize) setFontSize(parseInt(savedFontSize))
  }, [])

  useEffect(() => {
    if (!viewerRef.current || !epubUrl) return

    let newBook: Book | null = null

    // Fetch the EPUB file as an ArrayBuffer to avoid URL extension parsing bugs in epub.js
    fetch(epubUrl)
      .then(res => {
        if (!res.ok) throw new Error('Error downloading epub')
        return res.arrayBuffer()
      })
      .then(buffer => {
        if (!viewerRef.current) return
        
        // Initialize the ePub book with the ArrayBuffer
        newBook = ePub(buffer)
        setBook(newBook)

        // Render it to the DOM
        const newRendition = newBook.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none', // Use paginated layout (Kindle style)
    })

    // Inject CSS to fix image overflow in fixed-layout or poorly formatted epubs
    newRendition.hooks.content.register((contents: any) => {
      contents.addStylesheetRules({
        "img, video, audio, object, svg": {
          "max-width": "100% !important",
          "max-height": "100% !important",
          "object-fit": "contain !important"
        },
        "div, p, span, figure": {
          "max-width": "100% !important"
        }
      });
    });
    
    // Register themes
    newRendition.themes.register('light', {
      body: { background: '#fdfbf7', color: '#111a28', 'font-family': 'Georgia, serif', 'line-height': '1.8' }
    })
    newRendition.themes.register('dark', {
      body: { background: '#111a28', color: '#fdfbf7', 'font-family': 'Georgia, serif', 'line-height': '1.8' }
    })
    newRendition.themes.register('sepia', {
      body: { background: '#f4ecd8', color: '#433422', 'font-family': 'Georgia, serif', 'line-height': '1.8' }
    })

    newRendition.themes.select(theme)
    newRendition.themes.fontSize(`${fontSize}%`)

    setRendition(newRendition)

    if (!isSample) {
      getProgress(bookId).then(res => {
        if (res.success && res.data) {
          newRendition.display(res.data)
        } else {
          newRendition.display()
        }
      })
    } else {
      newRendition.display()
    }

    let saveTimeout: NodeJS.Timeout

    // Setup locations for progress tracking (calculates total pages)
    newBook!.ready.then(() => {
      return newBook!.locations.generate(1600) // 1600 characters per "page"
    }).then((locations) => {
      // Listen for page turns
      newRendition.on('relocated', (location: any) => {
        const percentage = newBook!.locations.percentageFromCfi(location.start.cfi)
        setProgress(Math.round(percentage * 100))
        
        if (isSample) {
          visitedLocations.current.add(location.start.cfi)
          // 1 for the cover, plus 5 reading pages = 6
          if (visitedLocations.current.size > 6) {
            setSampleEnded(true)
          }
        } else {
          clearTimeout(saveTimeout)
          saveTimeout = setTimeout(() => {
            saveProgress(bookId, location.start.cfi)
            // Update reading streak silently
            updateReadingStreak().catch(console.error)
          }, 2000)
        }
      })
    })

    }) // End of .then(buffer => { ... })
    .catch(err => {
      console.error('Error loading epub:', err)
    })

    return () => {
      if (newBook) newBook.destroy()
    }
  }, [epubUrl])

  // Apply theme and font size when they change
  useEffect(() => {
    if (rendition) {
      rendition.themes.select(theme)
      rendition.themes.fontSize(`${fontSize}%`)
      localStorage.setItem('reader_theme', theme)
      localStorage.setItem('reader_fontSize', fontSize.toString())
    }
  }, [theme, fontSize, rendition])

  const next = () => {
    if (rendition) rendition.next()
  }

  const prev = () => {
    if (rendition) rendition.prev()
  }

  // Audio / TTS Logic
  useEffect(() => {
    // Cleanup audio when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!rendition) return;

    try {
      const contents = (rendition as any).getContents();
      if (contents && contents.length > 0) {
        const text = contents[0].document.body.innerText;
        if (!text || text.trim() === '') {
          alert('No se encontró texto en esta página para leer en voz alta. Es posible que solo contenga imágenes.');
          return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES'; // We can default to spanish
        
        utterance.onend = () => {
          setIsPlayingAudio(false);
        }
        
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      } else {
        alert('No se pudo extraer el texto de esta página.');
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  }

  // Theme colors for the UI wrapper
  const wrapperBg = theme === 'light' ? '#fdfbf7' : theme === 'dark' ? '#111a28' : '#f4ecd8';
  const wrapperText = theme === 'light' ? '#111a28' : theme === 'dark' ? '#fdfbf7' : '#433422';

  return (
    <div style={{ backgroundColor: wrapperBg, color: wrapperText, height: '100vh', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s' }}>
      
      {/* Reader Toolbar */}
      <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(128,128,128,0.2)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <Link href={`/book/${bookId}`} style={{ fontWeight: 600, color: 'var(--brand-primary)', whiteSpace: 'nowrap' }}>← Volver</Link>
        <div style={{ fontWeight: 600, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '35%' }}>{bookTitle}</div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontWeight: 600, opacity: 0.5 }}>{progress}% Leído</div>
          
          <button 
            onClick={toggleAudio}
            style={{ background: 'none', border: 'none', color: wrapperText, fontSize: '1.25rem', cursor: 'pointer', opacity: isPlayingAudio ? 1 : 0.8 }}
            title={isPlayingAudio ? "Pausar Audiolibro" : "Escuchar Capítulo"}
          >
            {isPlayingAudio ? '⏸️' : '🎧'}
          </button>

          <button 
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
              } else {
                document.exitFullscreen();
              }
            }}
            style={{ background: 'none', border: 'none', color: wrapperText, fontSize: '1.25rem', cursor: 'pointer', opacity: 0.8 }}
            title="Pantalla Completa"
          >
            ⛶
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: 'none', border: 'none', color: wrapperText, fontSize: '1.25rem', cursor: 'pointer', opacity: 0.8 }}
          >
            Aa
          </button>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '1rem',
            marginTop: '0.5rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '1rem',
            zIndex: 50,
            minWidth: '200px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Tamaño de Letra</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setFontSize(f => Math.max(80, f - 10))} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer' }}>A-</button>
                <span style={{ fontSize: '0.875rem', flex: 1, textAlign: 'center' }}>{fontSize}%</span>
                <button onClick={() => setFontSize(f => Math.min(200, f + 10))} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer' }}>A+</button>
              </div>
            </div>
            
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Color de Fondo</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setTheme('light')} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: theme === 'light' ? '2px solid var(--brand-primary)' : '1px solid #ddd', background: '#fdfbf7', color: '#111a28', cursor: 'pointer' }}>Día</button>
                <button onClick={() => setTheme('sepia')} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: theme === 'sepia' ? '2px solid var(--brand-primary)' : '1px solid #ddd', background: '#f4ecd8', color: '#433422', cursor: 'pointer' }}>Sepia</button>
                <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: theme === 'dark' ? '2px solid var(--brand-primary)' : '1px solid #444', background: '#111a28', color: '#fdfbf7', cursor: 'pointer' }}>Noche</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reader Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Previous Page Button */}
        <button onClick={prev} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50px', zIndex: 10, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          ‹
        </button>

        {/* ePub content renders here */}
        <div ref={viewerRef} style={{ width: '100%', height: '100%', padding: '1rem 40px', filter: sampleEnded ? 'blur(4px)' : 'none', transition: 'filter 0.3s', overflow: 'hidden' }}></div>
        
        {/* Next Page Button */}
        <button onClick={next} disabled={sampleEnded} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50px', zIndex: 10, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-tertiary)', cursor: sampleEnded ? 'not-allowed' : 'pointer' }}>
          ›
        </button>

        {/* Sample Ended Overlay */}
        {sampleEnded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(253, 251, 247, 0.85)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: '#111a28' }}>
              Fin de la muestra gratis
            </h2>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#111a28', maxWidth: '400px' }}>
              Esperamos que te esté gustando la historia. ¡Compra el libro completo para seguir navegando!
            </p>
            <Link href={`/book/${bookId}`} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Ver detalles y Comprar
            </Link>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--brand-primary)', transition: 'width 0.3s' }}></div>
      </div>
    </div>
  )
}
