'use client'

import { useAudioPlayer } from './GlobalAudioPlayer'

interface PlayAudioButtonProps {
  url: string;
  title: string;
  author: string;
  coverUrl: string | null;
  className?: string;
  style?: React.CSSProperties;
}

export default function PlayAudioButton({ url, title, author, coverUrl, className, style }: PlayAudioButtonProps) {
  const { playAudio, currentTrack, isPlaying, stopAudio } = useAudioPlayer();
  const isThisPlaying = currentTrack?.url === url && isPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation if it's inside a Link wrapper
    if (isThisPlaying) {
      // Just let it keep playing, or maybe pause it, but standard is to pause?
      // For simplicity, we just trigger play which might reset it. Actually, if we click play on playing track, let's pause.
      // Wait, stopAudio clears it. Let's just do playAudio. If they want to pause, they use the global player.
      playAudio(url, title, author, coverUrl);
    } else {
      playAudio(url, title, author, coverUrl);
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
