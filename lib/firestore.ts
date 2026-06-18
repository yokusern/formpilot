import {
  doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
  collection, query, orderBy, onSnapshot,
  serverTimestamp, Timestamp, DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import { UserProfile, Generation, Template, GenerationStatus } from '@/types'

// ── UserProfile ──────────────────────────────────────────

export async function ensureProfile(uid: string, email: string, displayName: string) {
  const ref = doc(db, 'fp_users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      name: displayName,
      skills: [],
      experience: '',
      portfolioUrl: '',
      strength: '',
      plan: 'free',
      createdAt: serverTimestamp(),
    })
  }
}

export function subscribeProfile(
  uid: string,
  cb: (p: UserProfile | null) => void,
  onError?: () => void,
) {
  return onSnapshot(
    doc(db, 'fp_users', uid),
    (snap) => {
      if (!snap.exists()) { cb(null); return }
      const d = snap.data()
      cb({
        uid: d.uid,
        email: d.email,
        name: d.name ?? '',
        skills: d.skills ?? [],
        experience: d.experience ?? '',
        portfolioUrl: d.portfolioUrl ?? '',
        strength: d.strength ?? '',
        plan: d.plan ?? 'free',
        createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : '',
      })
    },
    () => { cb(null); onError?.() },
  )
}

export async function saveProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'fp_users', uid), { ...data, updatedAt: serverTimestamp() })
}

// ── Generations ──────────────────────────────────────────

function toGen(id: string, d: DocumentData): Generation {
  return {
    id,
    caseDescription: d.caseDescription ?? '',
    platform: d.platform ?? 'other',
    tone: d.tone ?? 'polite',
    generatedText: d.generatedText ?? '',
    status: d.status ?? 'generated',
    templateId: d.templateId ?? null,
    createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : '',
  }
}

export async function saveGeneration(
  uid: string,
  data: Omit<Generation, 'id' | 'createdAt'>
) {
  return addDoc(collection(db, 'fp_users', uid, 'generations'), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateGenerationStatus(uid: string, genId: string, status: GenerationStatus) {
  await updateDoc(doc(db, 'fp_users', uid, 'generations', genId), { status })
}

export async function deleteGeneration(uid: string, genId: string) {
  await deleteDoc(doc(db, 'fp_users', uid, 'generations', genId))
}

export function subscribeGenerations(uid: string, cb: (g: Generation[]) => void) {
  return onSnapshot(
    query(collection(db, 'fp_users', uid, 'generations'), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map(d => toGen(d.id, d.data())))
  )
}

// ── Templates ────────────────────────────────────────────

function toTemplate(id: string, d: DocumentData): Template {
  return {
    id,
    name: d.name ?? '',
    caseType: d.caseType ?? '',
    basePrompt: d.basePrompt ?? '',
    createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : '',
  }
}

export async function addTemplate(uid: string, data: Omit<Template, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'fp_users', uid, 'templates'), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function deleteTemplate(uid: string, templateId: string) {
  await deleteDoc(doc(db, 'fp_users', uid, 'templates', templateId))
}

export function subscribeTemplates(uid: string, cb: (t: Template[]) => void) {
  return onSnapshot(
    query(collection(db, 'fp_users', uid, 'templates'), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map(d => toTemplate(d.id, d.data())))
  )
}
