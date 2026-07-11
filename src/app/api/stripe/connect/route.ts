import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20' as any,
    });
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine the base URL dynamically based on environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'));

    // Check if user already has a stripe_account_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let accountId = profile.stripe_account_id;

    // If no account exists, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'MX', // Defaulting to MX, Stripe handles international
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      });
      
      accountId = account.id;

      // Save the new account ID to Supabase
      // Need admin client to bypass RLS if user can't update their own profile easily
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to save stripe_account_id:', updateError);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard?stripe_connect=refresh`,
      return_url: `${baseUrl}/dashboard?stripe_connect=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
