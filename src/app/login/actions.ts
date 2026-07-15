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
    const username = formData.get('username') as string

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingProfile) {
      throw new Error('Ese nombre de usuario ya está ocupado. Por favor elige otro.')
    }

    // 2. Create Auth User
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
    const { data: authData, error } = await supabase.auth.signUp(data)
    
    if (error) {
      errorMessage = error.message
    } else if (authData?.user) {
      // 3. Save profile data
      const profileData = {
        id: authData.user.id,
        full_name: formData.get('full_name') as string,
        username,
        display_preference: formData.get('display_preference') as string,
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData)
        
      if (profileError) {
        console.error('Error saving profile:', profileError)
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

export async function resetPasswordForEmail(formData: FormData) {
  let errorMessage = ''
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.astrolabiobooks.com'
    const resetUrl = `${siteUrl}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    })
    
    if (error) errorMessage = error.message
  } catch (err: any) {
    errorMessage = err.message || 'Error de servidor'
  }

  if (errorMessage) {
    redirect(`/forgot-password?error=${encodeURIComponent(errorMessage)}`)
  }

  redirect(`/forgot-password?success=true`)
}

export async function updatePassword(formData: FormData) {
  let errorMessage = ''
  let supabase = null;
  try {
    supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
      password: password
    })
    
    if (error) errorMessage = error.message
  } catch (err: any) {
    errorMessage = err.message || 'Error de servidor'
  }

  if (errorMessage) {
    redirect(`/reset-password?error=${encodeURIComponent(errorMessage)}`)
  }

  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect('/login?error=PIN+actualizado.+Por+favor+inicia+sesión+de+nuevo.')
}
