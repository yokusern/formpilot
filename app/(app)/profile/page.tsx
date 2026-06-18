'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { saveProfile } from '@/lib/firestore'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [name, setName]         = useState(profile?.name ?? '')
  const [skillsText, setSkills] = useState(profile?.skills?.join(', ') ?? '')
  const [experience, setExp]    = useState(profile?.experience ?? '')
  const [strength, setStrength] = useState(profile?.strength ?? '')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean)
    await saveProfile(user.uid, { name, skills, experience, strength })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">プロフィール</h1>
        <p className="text-slate-400 text-sm">入力しておくと生成精度が上がります。</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">表示名</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例：田中 太郎"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">スキル（カンマ区切り）</label>
          <input
            value={skillsText}
            onChange={e => setSkills(e.target.value)}
            placeholder="例：TypeScript, Next.js, GAS, LP制作"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">経験・実績</label>
          <textarea
            value={experience}
            onChange={e => setExp(e.target.value)}
            placeholder="例：LP制作10件。GAS自動化で業務効率化3件。Next.js歴2年。"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">強み・一言PR</label>
          <textarea
            value={strength}
            onChange={e => setStrength(e.target.value)}
            placeholder="例：迅速・丁寧な対応が強み。大学でプログラミングを学びながら個人開発を続けています。"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          {saved ? '✓ 保存しました' : saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}
