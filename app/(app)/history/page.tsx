'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { subscribeGenerations, updateGenerationStatus, deleteGeneration } from '@/lib/firestore'
import { Generation, GenerationStatus, PLATFORM_OPTIONS } from '@/types'

const STATUS_OPTIONS: { value: GenerationStatus; label: string; color: string }[] = [
  { value: 'generated', label: '未提案', color: 'bg-slate-700 text-slate-300' },
  { value: 'proposed',  label: '提案済み', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'accepted',  label: '受注',  color: 'bg-teal-500/20 text-teal-400' },
  { value: 'rejected',  label: '不採用', color: 'bg-red-500/20 text-red-400' },
]

export default function HistoryPage() {
  const { user } = useAuth()
  const [items, setItems]   = useState<Generation[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    return subscribeGenerations(user.uid, setItems)
  }, [user])

  const updateStatus = async (id: string, status: GenerationStatus) => {
    if (!user) return
    await updateGenerationStatus(user.uid, id, status)
  }

  const remove = async (id: string) => {
    if (!user) return
    if (!confirm('この履歴を削除しますか？')) return
    await deleteGeneration(user.uid, id)
    if (expanded === id) setExpanded(null)
  }

  const copyText = (text: string) => navigator.clipboard.writeText(text)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">生成履歴</h1>
        <p className="text-slate-400 text-sm">過去に生成した提案文の一覧です。</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-4">◷</p>
          <p>まだ履歴がありません。</p>
          <a href="/generate" className="inline-block mt-4 text-sm text-teal-400 hover:underline">
            提案文を生成する →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const statusInfo = STATUS_OPTIONS.find(s => s.value === item.status) ?? STATUS_OPTIONS[0]
            const isOpen = expanded === item.id
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

            return (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-750"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  <span className={`text-xs px-2 py-1 rounded-md font-medium shrink-0 ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs text-slate-500 shrink-0">
                    {PLATFORM_OPTIONS.find(p => p.value === item.platform)?.label ?? item.platform}
                  </span>
                  <p className="text-sm text-slate-300 truncate flex-1 min-w-0">{item.caseDescription}</p>
                  <span className="text-xs text-slate-600 shrink-0">{dateStr}</span>
                  <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-700 pt-4 space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-2">提案文</p>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-900 rounded-lg p-4">
                        {item.generatedText}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={item.status}
                        onChange={e => updateStatus(item.id, e.target.value as GenerationStatus)}
                        className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => copyText(item.generatedText)}
                        className="text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        コピー
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-xs text-red-400/60 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
