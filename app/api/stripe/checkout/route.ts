import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getAdminAuth } from '@/lib/firebaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia' as const,
})

export async function POST(req: NextRequest) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) return Response.json({ error: '認証が必要です' }, { status: 401 })

  let uid: string, email: string | undefined
  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    uid = decoded.uid
    email = decoded.email
  } catch {
    return Response.json({ error: '認証エラー' }, { status: 401 })
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://formpilot.vercel.app'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, quantity: 1 }],
    customer_email: email,
    success_url: `${origin}/settings?success=1`,
    cancel_url: `${origin}/settings`,
    metadata: { uid },
  })

  return Response.json({ url: session.url })
}
