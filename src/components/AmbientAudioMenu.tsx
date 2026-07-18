'use client';

import React, { useState, useRef, useEffect } from 'react';

type Track = {
  id: string;
  name: string;
  url: string;
  icon: string;
};

// Local immersive audio tracks
const AMBIENT_TRACKS: Track[] = [
  { id: 'none', name: 'Sin Audio', url: '', icon: '🔇' },
  { id: 'rain', name: 'Lluvia de Noche', url: '/audio/lluvia.mp3', icon: '🌧️' },
  { id: 'nature', name: 'Naturaleza', url: '/audio/naturaleza.mp3', icon: '🍃' },
  { id: 'meditation', name: 'Meditación', url: '/audio/meditacion.mp3', icon: '🧘' },
  { id: 'night', name: 'Búhos de Noche', url: '/audio/noche.mp3', icon: '🦉' }
];

export default function AmbientAudioMenu({ wrapperText }: { wrapperText: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('none');
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Ref for clicking outside
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create audio element on mount
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const selectTrack = (track: Track) => {
    setSelectedTrackId(track.id);
    
    if (track.url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = track.url;
        audioRef.current.load();
        
        // Play directly in the click event to bypass mobile browser gesture restrictions
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(err => {
            console.error("Audio playback failed:", err);
            setIsPlaying(false);
          });
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioRef.current.src) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error(err));
    }
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const activeTrack = AMBIENT_TRACKS.find(t => t.id === selectedTrackId);
  const showEqualizer = isPlaying && selectedTrackId !== 'none';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: selectedTrackId !== 'none' ? 'var(--brand-primary)' : wrapperText, 
          fontSize: '1.25rem', 
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Ambiente Inmersivo"
      >
        🎧
        {showEqualizer && (
          <span style={{ 
            position: 'absolute', top: '-5px', right: '-5px',
            display: 'flex', gap: '2px', alignItems: 'flex-end', height: '10px'
          }}>
            <span style={{ width: '3px', backgroundColor: 'var(--brand-primary)', animation: 'eq 1s ease-in-out infinite alternate', height: '100%' }}></span>
            <span style={{ width: '3px', backgroundColor: 'var(--brand-primary)', animation: 'eq 1.2s ease-in-out infinite alternate-reverse', height: '70%' }}></span>
            <span style={{ width: '3px', backgroundColor: 'var(--brand-primary)', animation: 'eq 0.8s ease-in-out infinite alternate', height: '80%' }}></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', left: 0, top: '100%', marginTop: '0.5rem',
          backgroundColor: 'var(--bg-secondary)', 
          padding: '1.5rem', borderRadius: 'var(--radius-md)', 
          boxShadow: 'var(--shadow-lg)', zIndex: 100,
          border: '1px solid var(--border-color)',
          width: '280px',
          color: 'var(--text-primary)'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Audios Inmersivos
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {AMBIENT_TRACKS.map(track => (
              <button
                key={track.id}
                onClick={() => selectTrack(track)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  backgroundColor: selectedTrackId === track.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                  color: selectedTrackId === track.id ? 'var(--brand-primary)' : 'var(--text-primary)',
                  fontWeight: selectedTrackId === track.id ? 600 : 400,
                  transition: 'background-color 0.2s'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{track.icon}</span>
                {track.name}
              </button>
            ))}
          </div>

          {selectedTrackId !== 'none' && (
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, opacity: 0.8 }}>Reproduciendo...</div>
                <button 
                  onClick={togglePlayPause}
                  style={{ background: 'var(--brand-primary)', color: '#000', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1rem', opacity: 0.7 }}>🔉</span>
                <input 
                  type="range" 
                  min="0" max="1" step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--brand-primary)' }}
                />
                <span style={{ fontSize: '1rem', opacity: 0.7 }}>🔊</span>
              </div>
            </div>
          )}

          <style>{`
            @keyframes eq {
              0% { height: 30%; }
              100% { height: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
