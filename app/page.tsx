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
        // noop
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a1019' }}>
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(20,184,166,0.2)', borderTopColor: '#14b8a6' }} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a1019', color: '#e8f0ed' }}>
      <div className="flex-1 flex flex-col justify-center px-8 py-16 max-w-md">

        <div className="mb-14">
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase mb-6" style={{ color: 'rgba(232,240,237,0.22)' }}>
            AI PROPOSAL ENGINE
          </p>
          <h1 className="text-5xl font-black tracking-[-0.04em] mb-3">
            <span style={{ color: '#14b8a6' }}>Form</span>Pilot
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,240,237,0.38)' }}>
            URLを貼るだけ。<br />
            案件の内容をAIが読んで、提案文を即生成。
          </p>
        </div>

        {/* 3-row feature list */}
        <div className="mb-12 space-y-0">
          {[
            'ランサーズ・ココナラのURLをペーストするだけ',
            'スキル・実績を登録すれば次回から省略',
            '月5件まで無料 — Proで無制限',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[10px] font-mono mt-0.5 shrink-0 w-4" style={{ color: 'rgba(232,240,237,0.2)' }}>
                {`0${i + 1}`}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,240,237,0.42)' }}>{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={login}
          disabled={loggingIn}
          className="flex items-center gap-3 w-full py-4 px-6 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: '#14b8a6',
            color: '#0a1019',
            borderRadius: '10px',
          }}
        >
          {loggingIn ? (
            <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(10,16,25,0.2)', borderTopColor: '#0a1019' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#0a1019" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#0a1019" fillOpacity={0.7} d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#0a1019" fillOpacity={0.5} d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#0a1019" fillOpacity={0.3} d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
          )}
          {loggingIn ? 'ログイン中...' : 'Googleでログイン — 無料で始める'}
        </button>

        {loginError && (
          <p className="text-xs mt-3 text-center" style={{ color: '#f87171' }}>{loginError}</p>
        )}
        <p className="text-[11px] mt-3 text-center" style={{ color: 'rgba(232,240,237,0.18)' }}>
          クレジットカード不要
        </p>
      </div>

      <footer className="px-8 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono" style={{ color: 'rgba(232,240,237,0.15)' }}>© 2026 YO-KO</p>
          <div className="flex gap-5">
            {[['X', 'https://x.com/Yoko_ai_dev'], ['note', 'https://note.com/zen_ai_logic'], ['Portfolio', 'https://yokoportofolio.vercel.app']].map(([l, h]) => (
              <a key={l} href={h} target="_blank" rel="noreferrer"
                className="text-[10px] font-mono tracking-wide transition-colors hover:text-white"
                style={{ color: 'rgba(232,240,237,0.2)' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
