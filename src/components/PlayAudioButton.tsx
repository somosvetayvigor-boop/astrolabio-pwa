'use client'

import { useAudioPlayer } from './GlobalAudioPlayer'

interface PlayAudioButtonProps {
  bookId: string;
  url: string;
  title: string;
  author: string;
  coverUrl: string | null;
  className?: string;
  style?: React.CSSProperties;
}

export default function PlayAudioButton({ bookId, url, title, author, coverUrl, className, style }: PlayAudioButtonProps) {
  const { playAudio, currentTrack, isPlaying, stopAudio } = useAudioPlayer();
  const isThisPlaying = currentTrack?.url === url && isPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation if it's inside a Link wrapper
    if (isThisPlaying) {
      playAudio(bookId, url, title, author, coverUrl);
    } else {
      playAudio(bookId, url, title, author, coverUrl);
    }
  };

  return (
    <button 
      onClick={handleClick} 
      className={className || "btn btn-secondary"} 
      style={{ ...style, display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10, position: 'relative' }}
    >
      {isThisPlaying ? '🎧 Escuchando...' : '▶️ Escuchar'}
    </button>
  );
}
