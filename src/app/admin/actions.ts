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

export async function resetUserPasswordToDefault(targetUserId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { success: false, error: 'Permisos insuficientes' }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    password: '123456',
    email_confirm: true
  })

  if (error) {
    console.error('Error resetting password:', error)
    return { success: false, error: 'Hubo un error al reiniciar la contraseña' }
  }

  return { success: true }
}
