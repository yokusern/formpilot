import { NextRequest } from 'next/server'
import { stripe, APP_URL } from '@/lib/stripe'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) return Response.json({ error: '認証が必要です' }, { status: 401 })

  let uid: string
  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    uid = decoded.uid
  } catch {
    return Response.json({ error: '認証エラー' }, { status: 401 })
  }

  const db = getAdminDb()
  const userDoc = await db.collection('fp_users').doc(uid).get()
  const customerId = userDoc.data()?.stripeCustomerId as string | undefined

  if (!customerId) {
    return Response.json({ error: 'Stripeアカウントが見つかりません' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/settings`,
  })

  return Response.json({ url: portalSession.url })
}
