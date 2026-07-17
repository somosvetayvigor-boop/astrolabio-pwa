'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PlatformDetector() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // If the URL has ?source=playstore, save it to localStorage permanently
    if (searchParams.get('source') === 'playstore') {
      localStorage.setItem('isPlayStore', 'true')
    }

    // Global catch for Supabase Auth redirect fallback
    // If Supabase falls back to the home page, it appends ?code=... or #access_token=...
    const hash = window.location.hash;
    const type = searchParams.get('type') || (hash && hash.includes('type=recovery') ? 'recovery' : null);
    
    if (type === 'recovery' && window.location.pathname !== '/reset-password') {
      // Redirect to reset password page with all params so it can be handled there
      window.location.href = `/reset-password${window.location.search}${hash}`;
    }
  }, [searchParams])

  return null // This component is invisible
}
