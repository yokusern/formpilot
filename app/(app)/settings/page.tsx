'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

function SettingsContent() {
  const { user, profile } = useAuth()
  const params = useSearchParams()
  const success = params.get('success') === '1'
  const isPro = profile?.plan === 'pro'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkout = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const j = await res.json()
      if (j.url) window.location.href = j.url
      else setError(j.error || 'エラーが発生しました')
    } catch {
      setError('ネットワークエラー')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl px-5 py-4 text-sm">
          ✓ Proプランへのアップグレードが完了しました！
        </div>
      )}

      {/* Current plan */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">現在のプラン</h2>
        {isPro ? (
          <div className="flex items-center gap-3">
            <span className="bg-teal-500/20 text-teal-400 px-3 py-1.5 rounded-lg text-sm font-semibold">✓ Pro</span>
            <span className="text-slate-400 text-sm">無制限生成 · 履歴 · テンプレート</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg text-sm font-medium">Free</span>
              <span className="text-slate-400 text-sm">月5件まで生成可能</span>
            </div>
            <button
              onClick={checkout}
              disabled={loading}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              {loading ? '処理中...' : 'Proにアップグレード — ¥500/月'}
            </button>
            {error && <p className="mt-2 text-red-400 text-xs">{error}</p>}
            <div className="mt-4 space-y-2">
              {[
                '✦ 月の生成数が無制限に',
                '✦ テンプレート保存・管理',
                '✦ 生成履歴の無制限保存',
              ].map(f => (
                <p key={f} className="text-sm text-slate-400">{f}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">アカウント</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>メール：{user?.email}</p>
          <p>UID：{user?.uid}</p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">設定・プラン</h1>
        <p className="text-slate-400 text-sm">プランの変更やアカウント情報を確認できます。</p>
      </div>
      <Suspense fallback={<div className="text-slate-500 text-sm">読み込み中...</div>}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
