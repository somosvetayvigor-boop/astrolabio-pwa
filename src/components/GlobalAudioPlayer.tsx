'use client'

import { useState, useRef, useEffect, createContext, useContext, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import DownloadButton from './DownloadButton'

interface AudioContextType {
  playAudio: (bookId: string, url: string, title: string, author: string, coverUrl: string | null) => void;
  stopAudio: () => void;
  isPlaying: boolean;
  currentTrack: {
    bookId: string;
    url: string;
    title: string;
    author: string;
    coverUrl: string | null;
  } | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function useAudioPlayer() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudioPlayer must be used within AudioProvider');
  return context;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioContextType['currentTrack']>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse path into public URL if needed
  useEffect(() => {
    if (!currentTrack?.url) {
      setAudioUrl(null);
      return;
    }
    
    // For simplicity, we assume we fetch the signed URL or it's a public URL
    // Since audios bucket is private, we must fetch a signed URL
    const getAudioUrl = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from('audios').createSignedUrl(currentTrack.url, 60 * 60 * 24); // 24 hours
      if (data) {
        setAudioUrl(data.signedUrl);
      }
    };

    if (currentTrack.url.startsWith('http')) {
      setAudioUrl(currentTrack.url);
    } else {
      getAudioUrl();
    }
  }, [currentTrack?.url]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  const playAudio = (bookId: string, url: string, title: string, author: string, coverUrl: string | null) => {
    setCurrentTrack({ bookId, url, title, author, coverUrl });
    setIsPlaying(true);
    lastLoggedMinute.current = -1; // Reset tracker for new track
  };

  const stopAudio = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const lastLoggedMinute = useRef<number>(-1);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setProgress(current);
      setDuration(audioRef.current.duration || 0);
      
      // Calculate current minute (0, 1, 2, ...)
      const currentMinute = Math.floor(current / 60);
      
      // If we entered a new minute, log it to the server
      if (currentMinute > lastLoggedMinute.current && currentTrack?.bookId) {
        lastLoggedMinute.current = currentMinute;
        // Import and call logPageRead dynamically to avoid circular dependencies or server action issues in client component
        import('@/app/reader/[id]/actions').then(({ logPageRead }) => {
          logPageRead(currentTrack.bookId, `audio_min_${currentMinute}`).catch(console.error);
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AudioContext.Provider value={{ playAudio, stopAudio, isPlaying, currentTrack }}>
      {children}
      
      {/* Invisible Audio Element */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            if (currentTrack?.bookId) {
              import('@/app/reader/[id]/actions').then(({ markBookAsCompleted }) => {
                markBookAsCompleted(currentTrack.bookId).catch(console.error);
              });
            }
          }}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* Floating Player UI */}
      {currentTrack && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          zIndex: 9998, // Just below the chatbot
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          background: 'rgba(25, 25, 25, 0.95)' // Dark theme specific
        }}>
          {/* Cover Art */}
          <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', flexShrink: 0 }}>
            {currentTrack.coverUrl ? (
              <img src={currentTrack.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎧</div>
            )}
          </div>

          {/* Track Info */}
          <div style={{ flex: '0 1 200px', minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{currentTrack.title}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.author}</p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15 }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>⏪15</button>
            <button onClick={togglePlay} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-primary)', border: 'none', color: 'var(--brand-text)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPlaying ? '⏸' : '▶️'}
            </button>
            <button onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15 }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>15⏩</button>
            
            {audioUrl && <DownloadButton fileUrl={audioUrl} title={currentTrack.title} bookId={currentTrack.bookId} />}
          </div>

          {/* Progress Bar */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '40px', textAlign: 'right' }}>{formatTime(progress)}</span>
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={progress} 
              onChange={handleSeek}
              style={{ flex: 1, accentColor: 'var(--brand-primary)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '40px' }}>{formatTime(duration)}</span>
          </div>

          {/* Close Button */}
          <button onClick={stopAudio} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}>
            ✖
          </button>
        </div>
      )}
    </AudioContext.Provider>
  );
}
