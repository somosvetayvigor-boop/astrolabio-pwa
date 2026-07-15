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
    return NextResponse.json({ error: 'Usuario astridsofia.delsar@gmail.com no encontrado.' })
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
    password: '123456'
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message })
  }

  return NextResponse.json({ success: true, message: 'La contraseña de astridsofia.delsar@gmail.com ha sido cambiada a 123456 con éxito.' })
}
