'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { pingActivity } from '@/app/actions/activity'

export default function ActivityTracker() {
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Definimos si el usuario está actualmente "leyendo" o "escuchando" un libro
    // Esto se asume si está dentro de la ruta /reader/
    const isReading = pathname?.startsWith('/reader/')

    const ping = () => {
      pingActivity(isReading).catch(err => {
        // Ignoramos errores de red silenciosos para no molestar al usuario
        console.warn('Error en activity ping:', err)
      })
    }

    // Ping inmediato al cargar una nueva página
    ping()

    // Ping cada 1 minuto (60,000 ms)
    intervalRef.current = setInterval(ping, 60000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pathname])

  // Este componente no renderiza absolutamente nada visual
  return null
}
