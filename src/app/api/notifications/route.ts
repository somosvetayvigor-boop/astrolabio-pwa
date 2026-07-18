import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { createClient } from '@/utils/supabase/server';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Parse the JSON string from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    
    if (Object.keys(serviceAccount).length > 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully.');
    } else {
      console.warn('Firebase Service Account Key is missing or empty.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication. For production, you might want to restrict this to admins or specific service roles
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, title, body: messageBody, data } = body;

    if (!targetUserId || !title || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the target user's push token
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', targetUserId)
      .single();

    if (profileError || !targetProfile?.push_token) {
      return NextResponse.json({ error: 'Target user has no push token registered' }, { status: 404 });
    }

    // Send the notification using Firebase Admin
    const message = {
      notification: {
        title,
        body: messageBody,
      },
      data: data || {},
      token: targetProfile.push_token,
    };

    const response = await admin.messaging().send(message);

    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Notification sending error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
