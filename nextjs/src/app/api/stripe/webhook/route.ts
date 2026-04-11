import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature');
  const secret    = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 400 });
  }

  // Verify signature (simplified — in production use stripe.webhooks.constructEvent)
  let event: { type: string; data: { object: Record<string, unknown> } };
  try { event = JSON.parse(body); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const obj = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const userId = obj.metadata && (obj.metadata as Record<string,string>)['user_id'];
    const plan   = obj.metadata && (obj.metadata as Record<string,string>)['plan'];
    if (userId && plan) {
      await adminClient.from('subscriptions').upsert({
        user_id: userId, plan, status: 'active',
        stripe_customer_id: obj.customer as string,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      }, { onConflict: 'user_id' });
      await adminClient.from('profiles').update({ plan }).eq('id', userId);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const userId = obj.metadata && (obj.metadata as Record<string,string>)['user_id'];
    if (userId) {
      await adminClient.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', userId);
      await adminClient.from('profiles').update({ plan: 'free' }).eq('id', userId);
    }
  }

  return NextResponse.json({ received: true });
}
