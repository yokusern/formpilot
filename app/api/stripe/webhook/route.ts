import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '@/lib/firebaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia' as const,
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch {
    return new Response('Webhook error', { status: 400 })
  }

  const getUid = (obj: Stripe.Subscription | Stripe.Invoice): string | null => {
    if ('metadata' in obj && typeof obj.metadata?.uid === 'string') return obj.metadata.uid
    return null
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const uid = session.metadata?.uid
    if (uid) {
      await getAdminDb().collection('fp_users').doc(uid).set({ plan: 'pro' }, { merge: true })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const uid = getUid(sub)
    if (uid) {
      await getAdminDb().collection('fp_users').doc(uid).set({ plan: 'free' }, { merge: true })
    }
  }

  return new Response('ok')
}
