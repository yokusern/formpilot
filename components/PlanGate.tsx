'use client'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function PlanGate({ isPro, children }: { isPro: boolean; children: ReactNode }) {
  if (isPro) return <>{children}</>
  return (
    <div className="relative min-h-96">
      <div className="blur-sm pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl mx-auto mb-4">🔒</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Proプラン限定</h2>
          <p className="text-sm text-slate-500 mb-6">テンプレート保存・管理はProプランで利用できます。</p>
          <Link
            href="/settings"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Proにアップグレード — ¥980/月
          </Link>
        </div>
      </div>
    </div>
  )
}
