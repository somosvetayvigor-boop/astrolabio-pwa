'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ePub, { Book, Rendition } from 'epubjs'
import { saveProgress, getProgress, updateReadingStreak } from './actions'
import TipModal from '@/components/TipModal'
import AddCommentModal from '@/components/AddCommentModal'
import CommentsSidebar from '@/components/CommentsSidebar'

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
  const isAutoReadingRef = useRef(false)
  const [showTipModal, setShowTipModal] = useState(false)
  
  const [selectedCfi, setSelectedCfi] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [showAddCommentModal, setShowAddCommentModal] = useState(false)
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false)

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

        // Auto-read next page if active
        if (isAutoReadingRef.current) {
          setTimeout(() => {
            // Need to dispatch a custom event or call a global function because playPage isn't strictly in this scope easily,
            // but wait, we can just trigger window.dispatchEvent
            window.dispatchEvent(new CustomEvent('epub-auto-read-next'));
          }, 400);
        }
      })

      // Listen for text selection
      newRendition.on('selected', (cfiRange: string, contents: any) => {
        newBook!.getRange(cfiRange).then((range) => {
          if (range) {
            const text = range.toString()
            setSelectedCfi(cfiRange)
            setSelectedText(text)
            setShowAddCommentModal(true)
          }
        })
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
    if (isAutoReadingRef.current) toggleAudio(); // Stop audio on manual turn
    if (rendition) rendition.next()
  }

  const prev = () => {
    if (isAutoReadingRef.current) toggleAudio(); // Stop audio on manual turn
    if (rendition) rendition.prev()
  }

  // Audio / TTS Logic
  useEffect(() => {
    // Pre-load voices
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
    }
    
    // Listen for auto-read relocated event
    const handleAutoRead = () => {
      if (isAutoReadingRef.current) {
        playPage();
      }
    };
    window.addEventListener('epub-auto-read-next', handleAutoRead);

    // Cleanup audio when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      window.removeEventListener('epub-auto-read-next', handleAutoRead);
    }
  }, [rendition])

  const playPage = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !rendition) return;
    
    window.speechSynthesis.cancel(); // Clear any existing audio

    try {
      const contents = (rendition as any).getContents();
      if (contents && contents.length > 0) {
        const text = contents[0].document.body.innerText;
        if (!text || text.trim() === '') {
          // If empty page, just turn to next page automatically
          if (isAutoReadingRef.current) rendition.next();
          return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find Latin American voice
        const voices = window.speechSynthesis.getVoices();
        let voice = voices.find(v => v.lang === 'es-MX' || v.lang === 'es-US' || v.lang === 'es_MX' || v.lang === 'es_US');
        if (!voice) voice = voices.find(v => v.lang === 'es-LA' || v.lang === 'es_LA');
        if (!voice) voice = voices.find(v => v.lang.startsWith('es'));
        
        if (voice) {
          utterance.voice = voice;
        }
        utterance.lang = 'es-MX'; // Fallback
        
        utterance.onend = (e) => {
          // If finished naturally and still in auto-read mode, turn page
          // (We check isAutoReadingRef to ensure user didn't pause)
          if (isAutoReadingRef.current) {
            rendition.next();
          }
        }

        utterance.onerror = () => {
          // Silent catch for cancel events
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("Audio error:", e);
      setIsPlayingAudio(false);
      isAutoReadingRef.current = false;
    }
  }

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    if (isAutoReadingRef.current) {
      // Pause
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      isAutoReadingRef.current = false;
    } else {
      // Play
      setIsPlayingAudio(true);
      isAutoReadingRef.current = true;
      playPage();
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
          <button 
            onClick={() => setShowCommentsSidebar(true)}
            style={{ backgroundColor: 'transparent', border: 'none', color: wrapperText, fontSize: '1.25rem', cursor: 'pointer' }}
            title="Ver Comentarios"
          >
            💬
          </button>

          <button 
            onClick={() => setShowTipModal(true)}
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            title="Invitar un Café al Autor"
          >
            💖 Apoyar
          </button>
          
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
            style={{ background: 'none', border: 'none', color: wrapperText, fontSize: '1.25rem', cursor: 'pointer' }}
            title="Configuración de Lectura"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {/* Settings Panel */}
        {showSettings && (
          <div style={{ 
            position: 'absolute', right: '1rem', top: '1rem', 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '1rem', borderRadius: 'var(--radius-md)', 
            boxShadow: 'var(--shadow-lg)', zIndex: 50,
            border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tema</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setTheme('light')} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: theme === 'light' ? '2px solid var(--brand-primary)' : '1px solid #ddd', background: '#fdfbf7', color: '#111a28', cursor: 'pointer' }}>Día</button>
                <button onClick={() => setTheme('sepia')} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: theme === 'sepia' ? '2px solid var(--brand-primary)' : '1px solid #ddd', background: '#f4ecd8', color: '#433422', cursor: 'pointer' }}>Sepia</button>
                <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: theme === 'dark' ? '2px solid var(--brand-primary)' : '1px solid #444', background: '#111a28', color: '#fdfbf7', cursor: 'pointer' }}>Noche</button>
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tamaño de Letra</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={() => setFontSize(Math.max(50, fontSize - 10))} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>A-</button>
                <span style={{ fontSize: '0.85rem', width: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>{fontSize}%</span>
                <button onClick={() => setFontSize(Math.min(200, fontSize + 10))} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>A+</button>
              </div>
            </div>
          </div>
        )}
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

      {showTipModal && (
        <TipModal bookId={bookId} onClose={() => setShowTipModal(false)} />
      )}

      {showAddCommentModal && selectedCfi && selectedText && (
        <AddCommentModal
          bookId={bookId}
          cfi={selectedCfi}
          highlightedText={selectedText}
          onClose={() => setShowAddCommentModal(false)}
          onSuccess={() => {
            setShowAddCommentModal(false)
            setShowCommentsSidebar(true)
            if (rendition) {
              const contents = (rendition as any).getContents();
              if (contents && contents.length > 0) {
                contents[0].window.getSelection()?.removeAllRanges()
              }
            }
          }}
        />
      )}

      <CommentsSidebar 
        bookId={bookId} 
        isOpen={showCommentsSidebar} 
        onClose={() => setShowCommentsSidebar(false)}
        onCommentClick={(cfi) => {
          if (rendition) {
            rendition.display(cfi)
          }
        }}
      />
    </div>
  )
}
