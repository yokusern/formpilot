export type Plan = 'free' | 'pro'
export type Platform = 'coconala' | 'lancers' | 'crowdworks' | 'other'
export type Tone = 'polite' | 'casual' | 'professional'
export type GenerationStatus = 'generated' | 'proposed' | 'accepted' | 'rejected'

export const FREE_LIMIT = 5

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'coconala', label: 'ココナラ' },
  { value: 'lancers', label: 'ランサーズ' },
  { value: 'crowdworks', label: 'クラウドワークス' },
  { value: 'other', label: 'その他' },
]

export const TONE_OPTIONS: { value: Tone; label: string; desc: string }[] = [
  { value: 'polite', label: '丁寧', desc: 'ていねい語・礼儀正しい' },
  { value: 'professional', label: 'プロ', desc: '実績強調・自信あり' },
  { value: 'casual', label: 'フレンドリー', desc: '親しみやすい・カジュアル' },
]

export const STATUS_CONFIG: Record<GenerationStatus, { label: string; color: string }> = {
  generated: { label: '生成済み', color: 'bg-slate-100 text-slate-600' },
  proposed: { label: '提案済み', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: '受注', color: 'bg-teal-100 text-teal-700' },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-600' },
}

export interface UserProfile {
  uid: string
  email: string
  name: string
  skills: string[]
  experience: string
  portfolioUrl: string
  strength: string
  plan: Plan
  createdAt: string
}

export interface Generation {
  id: string
  caseDescription: string
  platform: Platform
  tone: Tone
  generatedText: string
  status: GenerationStatus
  templateId: string | null
  createdAt: string
}

export interface Template {
  id: string
  name: string
  caseType: string
  basePrompt: string
  createdAt: string
}
