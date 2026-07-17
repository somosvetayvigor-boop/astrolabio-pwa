'use client'

import { useEffect, useRef } from 'react'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { createClient } from '@/utils/supabase/client'

export default function PushSetup({ userId }: { userId: string | null }) {
  const isRegistered = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    if (isRegistered.current) return
    if (!Capacitor.isNativePlatform()) return

    const registerPush = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions()

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions()
        }

        if (permStatus.receive !== 'granted') {
          console.log('User denied push permissions')
          return
        }

        await PushNotifications.register()
      } catch (e) {
        console.error('Error during push registration:', e)
      }
    }

    registerPush()
    isRegistered.current = true
  }, [userId])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const setupListeners = async () => {
      await PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value)
        if (userId) {
          // Guardar el token en la base de datos
          await supabase
            .from('profiles')
            .update({ push_token: token.value })
            .eq('id', userId)
        }
      })

      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error)
      })

      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received:', notification)
      })

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed:', notification)
      })
    }

    setupListeners()

    return () => {
      PushNotifications.removeAllListeners()
    }
  }, [userId])

  return null
}
