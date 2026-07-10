import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// We use the service role key to bypass RLS and insert the purchase record
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: Request) {
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
    
    // Retrieve metadata from the session
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

  return NextResponse.json({ received: true });
}
