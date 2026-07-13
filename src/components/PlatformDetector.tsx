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
  }, [searchParams])

  return null // This component is invisible
}
