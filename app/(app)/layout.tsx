'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="ml-56 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
