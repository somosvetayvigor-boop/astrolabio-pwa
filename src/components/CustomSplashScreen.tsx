"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function CustomSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if we've already shown it this session
    const hasShownSplash = sessionStorage.getItem("splashShown");
    
    if (hasShownSplash) {
      setShowSplash(false);
      return;
    }

    // Mark as shown for this session
    sessionStorage.setItem("splashShown", "true");

    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Completely remove after 3 seconds (allowing 0.5s for fade out)
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999, // Super high z-index to cover everything
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        backgroundImage: 'url("/splash-bg.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Semi-transparent dark overlay to make the logo pop if the background is bright */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: -1
      }}></div>

      <div style={{
        width: '250px',
        height: '250px',
        position: 'relative',
        animation: 'pulse 2s infinite ease-in-out',
        filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid rgba(212, 175, 55, 0.5)',
      }}>
        <Image 
          src="/logo.jpeg" 
          alt="Astrolabio Logo" 
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
          100% { transform: scale(0.95); }
        }
      `}} />
    </div>
  );
}
