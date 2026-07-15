import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await supabaseAdmin.from('profiles').select('*')
  const profile = profiles?.find(p => JSON.stringify(p).toLowerCase().includes('astrid'))

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado en profiles' })
  }

  const { data: userResponse, error } = await supabaseAdmin.auth.admin.getUserById(profile.id)
  
  if (error || !userResponse.user) {
    return NextResponse.json({ error: error?.message || 'Usuario no en auth.users', profile })
  }

  const targetUser = userResponse.user

  return NextResponse.json({ 
    profile_id: profile.id,
    auth_email: targetUser.email,
    confirmed_at: targetUser.email_confirmed_at,
    banned_until: targetUser.banned_until,
    identities: targetUser.identities?.map(i => i.provider),
    app_metadata: targetUser.app_metadata
  })
}
