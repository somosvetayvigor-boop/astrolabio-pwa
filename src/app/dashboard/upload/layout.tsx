import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch author profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single();

  // We removed the strict Stripe redirect so users can upload free books
  return (
    <>
      {children}
    </>
  );
}
