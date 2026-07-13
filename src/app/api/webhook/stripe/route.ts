import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20' as any,
  });

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  // We use the service role key to bypass RLS and insert the purchase record
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing stripe signature or endpoint secret');
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.mode === 'subscription') {
      // Handle subscription checkout
      const userId = session.client_reference_id || session.metadata?.userId;
      
      if (userId) {
        // Update user profile to active subscription
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', userId);
          
        if (error) {
          console.error('Error activating subscription in DB:', error);
        } else {
          console.log(`Successfully activated subscription for user ${userId}`);
        }
      } else {
        console.error('Missing userId for subscription session');
      }
    } else {
      // Handle standard book purchase
      const bookId = session.metadata?.bookId;
      const userId = session.metadata?.userId || session.client_reference_id;

      if (bookId && userId) {
        // Insert purchase record into Supabase
        const { error } = await supabase
          .from('purchases')
          .insert({
            user_id: userId,
            book_id: bookId,
            stripe_session_id: session.id,
          });

        if (error) {
          console.error('Error inserting purchase record:', error);
          // We still return 200 to Stripe so it doesn't retry, but we log the error.
          // In a production app, you might want a retry queue or alerting.
        } else {
          console.log(`Successfully recorded purchase of book ${bookId} for user ${userId}`);
        }
      } else {
        console.error('Missing bookId or userId in session metadata');
      }
    }
  } else if (event.type === 'customer.subscription.deleted') {
    // Handle subscription cancellation
    const subscription = event.data.object as Stripe.Subscription;
    // We need to find the user with this subscription. 
    // Usually, we would save the customer ID or subscription ID in the profiles table.
    // For simplicity, if we don't have it, we might need to look it up by customer email
    // Or we can retrieve the customer from Stripe and use their email to find the Supabase user.
    
    try {
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (!customer.deleted && customer.email) {
        // Find the user by email through the admin API or by querying profiles if email is there
        // Note: Supabase auth.users is not directly queryable via service_role easily without raw SQL,
        // but we can query 'profiles' if we had email there. Since we don't, 
        // the best practice is to save customer_id to profiles when they first subscribe.
        // For now, let's just log it. To implement fully, we should save customer_id during checkout.
        console.log(`Subscription deleted for customer email: ${customer.email}. Need to update DB.`);
      }
    } catch (e) {
      console.error('Error handling subscription deletion:', e);
    }
  }

  return NextResponse.json({ received: true });
}
