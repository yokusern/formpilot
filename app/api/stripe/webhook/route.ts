import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { getAdminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook error', { status: 400 })
  }

  const db = getAdminDb()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const uid = session.metadata?.uid
    const customerId = typeof session.customer === 'string' ? session.customer : null
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null
    if (uid) {
      await db.collection('fp_users').doc(uid).set({
        plan: 'pro',
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
      }, { merge: true })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const uid = sub.metadata?.uid
    if (uid) {
      const active = sub.status === 'active' || sub.status === 'trialing'
      await db.collection('fp_users').doc(uid).set({ plan: active ? 'pro' : 'free' }, { merge: true })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const uid = sub.metadata?.uid
    if (uid) {
      await db.collection('fp_users').doc(uid).set({
        plan: 'free',
        stripeSubscriptionId: null,
      }, { merge: true })
    }
  }

  return new Response('ok')
}
