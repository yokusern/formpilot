'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { ensureProfile, subscribeProfile } from '@/lib/firestore'
import { UserProfile } from '@/types'

interface AuthCtx {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) { setProfile(null); setLoading(false) }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    ensureProfile(user.uid, user.email ?? '', user.displayName ?? '').catch(() => {})
    return subscribeProfile(
      user.uid,
      (p) => { setProfile(p); setLoading(false) },
      () => setLoading(false),  // Firestore読み取りエラー時もloading解除
    )
  }, [user])

  return <Ctx.Provider value={{ user, profile, loading }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
