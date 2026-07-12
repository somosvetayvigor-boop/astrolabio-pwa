import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, bookId, returnUrl } = body;

    if (!amount || !bookId) {
      return NextResponse.json({ error: 'Faltan datos (amount o bookId)' }, { status: 400 });
    }

    // 1. Get the book to find the author ID
    const { data: book, error: bookError } = await supabaseAdmin
      .from('books')
      .select('title, author_id')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
    }

    // 2. Get the author's stripe_account_id
    const { data: author, error: authorError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', book.author_id)
      .single();

    if (authorError || !author || !author.stripe_account_id) {
      return NextResponse.json({ error: 'El autor no puede recibir pagos en este momento.' }, { status: 400 });
    }

    // 3. Create Stripe Checkout Session
    // We keep 10% as Astrolabio fee, 90% goes to author (or any other config)
    // For now, Astrolabio keeps 10% platform fee.
    const platformFee = Math.round(amount * 100 * 0.10); // 10% in cents
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Propina para el autor de "${book.title}"`,
              description: 'Apoyo directo al creador en Astrolabio',
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: author.stripe_account_id,
        },
      },
      success_url: `${returnUrl}?success=tip`,
      cancel_url: `${returnUrl}?canceled=tip`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Tip Checkout Error:', err.message);
    return NextResponse.json({ error: 'Error al procesar el pago de la propina.' }, { status: 500 });
  }
}
