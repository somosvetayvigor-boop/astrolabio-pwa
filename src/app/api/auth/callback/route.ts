import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData?.user) {
      // Check if profile exists
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (!existingProfile) {
        // Create profile for OAuth user
        // Generate a random username base on email or random string
        const baseUsername = authData.user.email ? authData.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : 'user'
        const randomString = Math.random().toString(36).substring(2, 7)
        const username = `${baseUsername}_${randomString}`

        const fullName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || 'Lector'
        const avatarUrl = authData.user.user_metadata?.avatar_url || authData.user.user_metadata?.picture || null

        await supabaseAdmin.from('profiles').insert({
          id: authData.user.id,
          username: username,
          full_name: fullName,
          avatar_url: avatarUrl,
          display_preference: 'full_name'
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}${next}`)
}
