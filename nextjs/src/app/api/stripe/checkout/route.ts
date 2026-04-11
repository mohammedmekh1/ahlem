import { NextRequest, NextResponse } from 'next/server';
import { createSSRSaaSClient } from '@/lib/supabase/server';

const PRICE_IDS: Record<string, string> = {
  pro:        process.env.STRIPE_PRO_PRICE_ID        || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const priceId  = PRICE_IDS[plan];
    if (!priceId) return NextResponse.json({ error: 'خطة غير صالحة أو Stripe غير مُعدّ' }, { status: 400 });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: 'STRIPE_SECRET_KEY غير موجود في .env' }, { status: 500 });

    const supabase = await createSSRSaaSClient();
    const { data: { user } } = await supabase.getSupabaseClient().auth.getUser();
    if (!user) return NextResponse.json({ error: 'غير مسجّل دخول' }, { status: 401 });

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode':                             'subscription',
        'line_items[0][price]':             priceId,
        'line_items[0][quantity]':          '1',
        'success_url':                      `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url':                       `${origin}/pricing?cancelled=true`,
        'customer_email':                   user.email!,
        'metadata[user_id]':               user.id,
        'metadata[plan]':                  plan,
        'subscription_data[metadata][user_id]': user.id,
        'subscription_data[metadata][plan]':    plan,
      }),
    });

    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message || 'Stripe error');
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'خطأ' }, { status: 500 });
  }
}
