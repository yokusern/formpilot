'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { saveGeneration } from '@/lib/firestore'
import { FREE_LIMIT, Platform, Tone } from '@/types'
// FREE_LIMIT used in the info banner

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'lancers',    label: 'ランサーズ' },
  { value: 'coconala',   label: 'ココナラ' },
  { value: 'crowdworks', label: 'クラウドワークス' },
  { value: 'other',      label: 'その他' },
]

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: 'polite',       label: '丁寧',       desc: '誠実・信頼感重視' },
  { value: 'professional', label: 'プロ',       desc: '実績・能力アピール' },
  { value: 'casual',       label: 'カジュアル', desc: '親しみやすい雰囲気' },
]

export default function GeneratePage() {
  const { user, profile } = useAuth()
  const isPro = profile?.plan === 'pro'

  const [platform, setPlatform] = useState<Platform>('lancers')
  const [tone, setTone]         = useState<Tone>('polite')
  const [caseDesc, setCaseDesc] = useState('')
  const [myProfile, setMyProfile] = useState('')
  const [streaming, setStreaming]  = useState(false)
  const [output, setOutput]        = useState('')
  const [error, setError]          = useState('')
  const [saved, setSaved]          = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const generate = async () => {
    if (!user || !caseDesc.trim()) return
    setStreaming(true)
    setOutput('')
    setError('')
    setSaved(false)

    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform, tone, caseDesc, myProfile }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'エラーが発生しました')
      }

      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value)
        full += chunk
        setOutput(full)
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
      }

      // save to Firestore
      await saveGeneration(user.uid, { platform, tone, caseDescription: caseDesc, generatedText: full, status: 'generated', templateId: null })
      setSaved(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setStreaming(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">提案文を生成</h1>
        <p className="text-slate-400 text-sm">案件情報を入力してAIに提案文を書かせてください。</p>
      </div>

      {/* Free plan notice */}
      {!isPro && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-slate-800 border border-slate-700 text-slate-400">
          <span>ℹ️</span>
          <span>無料プラン：月{FREE_LIMIT}件まで生成可能</span>
          <a href="/settings" className="ml-auto text-xs text-teal-400 hover:text-teal-300 transition-colors">
            Proで無制限に →
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-5">
          {/* Platform */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">プラットフォーム</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    platform === p.value
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">トーン</label>
            <div className="flex gap-2">
              {TONES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    tone === t.value
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Case description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              案件の内容 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={caseDesc}
              onChange={e => setCaseDesc(e.target.value)}
              placeholder="例：ランサーズで見つけたLP制作の案件。予算5万円、納期2週間、WordPressで構築希望。飲食店向けのシンプルなデザイン。"
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          {/* My profile (optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              自分のスキル・経歴（任意）
            </label>
            <textarea
              value={myProfile}
              onChange={e => setMyProfile(e.target.value)}
              placeholder="例：TypeScript/Next.js歴2年。LP10件制作実績あり。レスポンシブ対応・SEO基本設定込み。"
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <button
            onClick={generate}
            disabled={streaming || !caseDesc.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-teal-500 hover:bg-teal-400 text-white"
          >
            {streaming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                生成中...
              </span>
            ) : '✦ 提案文を生成'}
          </button>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">生成結果</label>
            {output && !streaming && (
              <div className="flex items-center gap-2">
                {saved && <span className="text-xs text-teal-400">✓ 保存済み</span>}
                <button
                  onClick={copyToClipboard}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  コピー
                </button>
              </div>
            )}
          </div>

          <div
            ref={outputRef}
            className={`flex-1 min-h-[420px] bg-slate-800 border rounded-xl p-5 text-sm overflow-y-auto relative ${
              streaming || output ? 'border-teal-500/30' : 'border-slate-700'
            }`}
          >
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            {!error && !output && !streaming && (
              <p className="text-slate-600 text-sm">左のフォームを埋めて「生成」を押してください</p>
            )}
            {(output || streaming) && (
              <p className={`text-slate-200 whitespace-pre-wrap leading-relaxed ${streaming && !output ? '' : streaming ? 'cursor-blink' : ''}`}>
                {output}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
