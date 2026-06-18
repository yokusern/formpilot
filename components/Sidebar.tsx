'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { FREE_LIMIT } from '@/types'

const NAV = [
  { href: '/generate', label: '提案文を生成', icon: '✦' },
  { href: '/history',  label: '生成履歴',     icon: '◷' },
  { href: '/templates',label: 'テンプレート',  icon: '▦', proOnly: true },
  { href: '/profile',  label: 'プロフィール',  icon: '◉' },
  { href: '/settings', label: '設定・プラン',  icon: '◈' },
]

export default function Sidebar() {
  const { user, profile } = useAuth()
  const pathname = usePathname()
  const isPro = profile?.plan === 'pro'

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-slate-900 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800">
        <span className="text-xl font-black tracking-tighter">
          <span className="text-teal-400">Form</span>
          <span className="text-white">Pilot</span>
        </span>
        <p className="text-xs text-slate-500 mt-0.5">提案文を3秒で</p>
      </div>

      {/* Usage meter (free plan) */}
      {!isPro && profile && (
        <div className="mx-4 mt-4 bg-slate-800 rounded-lg px-3 py-2.5">
          <p className="text-xs text-slate-400 mb-1.5">今月の残り生成数</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-teal-400 font-mono font-bold shrink-0">
              {FREE_LIMIT}件/月
            </span>
          </div>
        </div>
      )}
      {isPro && (
        <div className="mx-4 mt-4">
          <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-md font-medium">
            ✓ Pro — 無制限
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 mt-5 space-y-0.5">
        {NAV.map(({ href, label, icon, proOnly }) => {
          const locked = proOnly && !isPro
          const active = pathname === href
          return (
            <Link
              key={href}
              href={locked ? '/settings' : href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-teal-500 text-white'
                  : locked
                  ? 'text-slate-600 cursor-default'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{label}</span>
              {locked && (
                <span className="ml-auto text-xs bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">
                  Pro
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold">
            {(profile?.name || user?.displayName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.name || user?.displayName || '未設定'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors text-left"
        >
          ログアウト
        </button>
      </div>
    </aside>
  )
}
