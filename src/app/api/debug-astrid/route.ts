import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    return NextResponse.json({ error: error.message })
  }

  const targetUser = users.find(u => u.email === 'astridsofia.delsar@gmail.com')

  if (!targetUser) {
    return NextResponse.json({ error: 'Usuario NO existe en auth.users' })
  }

  return NextResponse.json({ 
    id: targetUser.id,
    email: targetUser.email,
    confirmed_at: targetUser.email_confirmed_at,
    banned_until: targetUser.banned_until,
    identities: targetUser.identities?.map(i => i.provider),
    app_metadata: targetUser.app_metadata
  })
}
