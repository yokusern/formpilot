import { NextRequest } from 'next/server'
import { stripe, PRO_PRICE_ID, APP_URL } from '@/lib/stripe'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

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

  const db = getAdminDb()
  const userDoc = await db.collection('fp_users').doc(uid).get()
  const existingCustomerId = userDoc.data()?.stripeCustomerId as string | undefined

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    ...(existingCustomerId
      ? { customer: existingCustomerId }
      : { customer_email: email }),
    success_url: `${APP_URL}/settings?success=1`,
    cancel_url: `${APP_URL}/settings`,
    locale: 'ja',
    metadata: { uid },
    subscription_data: { metadata: { uid } },
  })

  return Response.json({ url: session.url })
}
