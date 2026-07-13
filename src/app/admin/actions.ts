'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSubscriptionStatus(targetUserId: string, currentStatus: string | null) {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'No autorizado' }
  }

  // 2. Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { success: false, error: 'Permisos insuficientes' }
  }

  // 3. Toggle Status
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ subscription_status: newStatus })
    .eq('id', targetUserId)

  if (updateError) {
    console.error('Error toggling subscription:', updateError)
    return { success: false, error: 'Hubo un error al actualizar la suscripción' }
  }

  // Refresh admin page
  revalidatePath('/admin')
  
  return { success: true }
}
