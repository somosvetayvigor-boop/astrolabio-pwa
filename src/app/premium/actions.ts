'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function activatePremiumSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para suscribirte.' }
  }

  // En producción, esto se haría a través de webhooks de Stripe.
  // Por ahora, actualizamos directamente el estado en la base de datos para probar el flujo.
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'active' })
    .eq('id', user.id)

  if (error) {
    console.error('Error activating subscription:', error)
    return { success: false, error: 'Hubo un error al activar tu suscripción.' }
  }

  revalidatePath('/', 'layout')
  
  return { success: true }
}
