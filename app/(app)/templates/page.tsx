'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { subscribeTemplates, addTemplate, deleteTemplate } from '@/lib/firestore'
import { Template } from '@/types'
import PlanGate from '@/components/PlanGate'

function TemplatesContent() {
  const { user } = useAuth()
  const [items, setItems]   = useState<Template[]>([])
  const [name, setName]     = useState('')
  const [body, setBody]     = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeTemplates(user.uid, setItems)
  }, [user])

  const add = async () => {
    if (!user || !name.trim() || !body.trim()) return
    setAdding(true)
    await addTemplate(user.uid, { name, basePrompt: body, caseType: '' })
    setName('')
    setBody('')
    setAdding(false)
  }

  const remove = async (id: string) => {
    if (!user) return
    if (!confirm('このテンプレートを削除しますか？')) return
    await deleteTemplate(user.uid, id)
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">テンプレートを追加</h2>
        <div className="space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="テンプレート名（例：LP制作・丁寧系）"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="テンプレート本文..."
            rows={5}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
          />
          <button
            onClick={add}
            disabled={adding || !name.trim() || !body.trim()}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {adding ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">テンプレートがまだありません。</p>
      ) : (
        <div className="space-y-3">
          {items.map(t => (
            <div key={t.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                <button
                  onClick={() => remove(t.id)}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors shrink-0"
                >
                  削除
                </button>
              </div>
              <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed line-clamp-4">{t.basePrompt}</p>
              <button
                onClick={() => navigator.clipboard.writeText(t.basePrompt)}
                className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                コピー →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TemplatesPage() {
  const { profile } = useAuth()
  const isPro = profile?.plan === 'pro'

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">テンプレート</h1>
        <p className="text-slate-400 text-sm">よく使う提案文のひな形を保存して再利用できます。</p>
      </div>
      <PlanGate isPro={isPro}>
        <TemplatesContent />
      </PlanGate>
    </div>
  )
}
