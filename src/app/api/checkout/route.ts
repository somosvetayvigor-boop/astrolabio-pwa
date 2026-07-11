import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

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

    const { bookId } = await request.json();
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    // Get book details from Supabase
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.price <= 0) {
      return NextResponse.json({ error: 'Book is free' }, { status: 400 });
    }

    // Determine the base URL dynamically based on environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'));

    // Fetch author's Stripe Account ID
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', book.author_id)
      .single();

    const authorStripeId = authorProfile?.stripe_account_id;

    // Create Stripe Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: book.title,
              description: book.description || `Libro en Astrolabio`,
              images: book.cover_url ? [book.cover_url] : [],
            },
            unit_amount: Math.round(book.price * 100), // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&book_id=${book.id}`,
      cancel_url: `${baseUrl}/book/${book.id}`,
      client_reference_id: user.id, // We'll use this in the webhook to identify the user
      metadata: {
        bookId: book.id,
        userId: user.id,
      },
    };

    // If author has a connected account, split the payment
    if (authorStripeId) {
      // Platform fee (e.g., 30%)
      const platformFeePercent = 0.30;
      const applicationFeeAmount = Math.round((book.price * 100) * platformFeePercent);

      sessionConfig.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: authorStripeId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
