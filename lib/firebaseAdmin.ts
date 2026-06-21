import { App, initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

let _app: App | null = null

function getAdminApp(): App {
  if (_app) return _app
  if (getApps().length > 0) { _app = getApps()[0]; return _app }
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!sa) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
  _app = initializeApp({ credential: cert(JSON.parse(sa) as Parameters<typeof cert>[0]) })
  return _app
}

export function getAdminDb() { return getFirestore(getAdminApp()) }
export function getAdminAuth() { return getAuth(getAdminApp()) }
export { Timestamp }
