'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    if (!loading && user) router.push('/generate')
  }, [user, loading, router])

  const login = async () => {
    setLoginError('')
    setLoggingIn(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // ユーザーが自分で閉じた場合は何も表示しない
      } else if (code === 'auth/unauthorized-domain') {
        setLoginError('このドメインはFirebaseに未登録です。管理者に連絡してください。')
      } else {
        setLoginError('ログインに失敗しました。もう一度お試しください。')
      }
    } finally {
      setLoggingIn(false)
    }
  }

  if (loading || user) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black tracking-tighter mb-2">
              <span className="text-teal-400">Form</span>
              <span className="text-white">Pilot</span>
            </h1>
            <p className="text-slate-400 text-sm">案件URLを貼るだけで、採用される提案文をAIが生成</p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['3秒で完成', 'ランサーズ対応', 'ココナラ対応', '月5件無料'].map(t => (
              <span key={t} className="text-xs bg-slate-800 text-teal-400 border border-slate-700 px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>

          {/* Login card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <p className="text-center text-slate-300 text-sm mb-6">Googleアカウントで無料スタート</p>
            <button
              onClick={login}
              disabled={loggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-800 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
            >
              {loggingIn ? (
                <span className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
              )}
              {loggingIn ? 'ログイン中...' : 'Googleでログイン'}
            </button>

            {loginError && (
              <p className="text-red-400 text-xs text-center mt-3">{loginError}</p>
            )}

            <p className="text-center text-xs text-slate-500 mt-4">
              無料プラン：月5件まで生成可能
            </p>
          </div>
        </div>
      </div>
      <footer className="py-4 text-center text-xs text-slate-600">
        <p className="mb-1.5">© 2026 YO-KO（陽広）</p>
        <div className="flex items-center justify-center gap-3">
          <a href="https://x.com/Yoko_ai_dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">X</a>
          <a href="https://note.com/zen_ai_logic" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">note</a>
          <a href="https://www.instagram.com/yoncornrow/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://yokoportofolio.vercel.app" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Portfolio</a>
        </div>
      </footer>
    </div>
  )
}
