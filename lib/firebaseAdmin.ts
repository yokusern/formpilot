import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
  return initializeApp({
    credential: cert(JSON.parse(sa) as Parameters<typeof cert>[0]),
  })
}

export function getAdminDb() {
  getAdminApp()
  return getFirestore()
}

export function getAdminAuth() {
  getAdminApp()
  return getAuth()
}

export { Timestamp }
