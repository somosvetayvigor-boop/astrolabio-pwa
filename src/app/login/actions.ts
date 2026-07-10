'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  let errorMessage = ''
  try {
    const supabase = await createClient()
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) errorMessage = error.message
  } catch (err: any) {
    errorMessage = err.message || 'Error de servidor'
  }

  if (errorMessage) {
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  let errorMessage = ''
  try {
    const supabase = await createClient()
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
    const { data: authData, error } = await supabase.auth.signUp(data)
    
    if (error) {
      errorMessage = error.message
    } else if (authData?.user) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const profileData = {
        id: authData.user.id,
        full_name: formData.get('full_name') as string,
        username: formData.get('username') as string,
        display_preference: formData.get('display_preference') as string,
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData)
        
      if (profileError) {
        console.error('Error saving profile:', profileError)
        // We don't block the login, but log the error
      }
    }
  } catch (err: any) {
    errorMessage = err.message || 'Error de servidor'
  }

  if (errorMessage) {
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/')
}
