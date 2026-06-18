import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'
import { FREE_LIMIT } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'placeholder' })

function buildSystemPrompt(platform: string, tone: string): string {
  const platformLabel: Record<string, string> = {
    lancers: 'ランサーズ', coconala: 'ココナラ', crowdworks: 'クラウドワークス', other: 'フリーランスサイト'
  }
  const toneGuide: Record<string, string> = {
    polite: '丁寧で誠実な文体。「〜させていただきます」「〜と存じます」を適切に使う。',
    professional: '実績・能力を前面に出した自信のある文体。数値や具体例を積極的に使う。',
    casual: '親しみやすいが礼儀を守った文体。硬すぎず、でも軽すぎない。',
  }
  return `あなたはフリーランスの受注率を高める提案文のエキスパートです。
${platformLabel[platform] || 'フリーランスサイト'}向けの提案文を書いてください。

文体：${toneGuide[tone] || toneGuide.polite}

以下のルールを厳守してください：
1. 300〜500文字程度で簡潔に（長すぎる提案は読まれない）
2. 冒頭で案件への理解・共感を1文で示す
3. 自分が「なぜこの案件に向いているか」を具体的に示す
4. 実績・スキルを自然に盛り込む（ない場合はポテンシャルを示す）
5. 締めは「〜ぜひお話しさせてください」「〜ご連絡お待ちしております」系で
6. マークダウン記号は使わない。プレーンテキストのみ。`
}

function buildUserPrompt(caseDesc: string, myProfile: string): string {
  return `案件情報：
${caseDesc}
${myProfile ? `\n自分のスキル・経歴：\n${myProfile}` : ''}

上記の案件に対する提案文を書いてください。`
}

async function getUsedThisMonth(uid: string): Promise<number> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const snap = await getAdminDb()
    .collection('fp_users').doc(uid).collection('generations')
    .where('createdAt', '>=', start)
    .count()
    .get()
  return snap.data().count
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return Response.json({ error: '認証が必要です' }, { status: 401 })

  let uid: string
  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    uid = decoded.uid
  } catch {
    return Response.json({ error: '認証エラー' }, { status: 401 })
  }

  // Check plan & limit
  const userDoc = await getAdminDb().collection('fp_users').doc(uid).get()
  const plan = userDoc.data()?.plan ?? 'free'

  if (plan !== 'pro') {
    const used = await getUsedThisMonth(uid)
    if (used >= FREE_LIMIT) {
      return Response.json({ error: `今月の生成上限（${FREE_LIMIT}件）に達しました。Proプランで無制限に使えます。` }, { status: 429 })
    }
  }

  const { platform, tone, caseDesc, myProfile } = await req.json()
  if (!caseDesc?.trim()) return Response.json({ error: '案件情報を入力してください' }, { status: 400 })

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    max_tokens: 800,
    messages: [
      { role: 'system', content: buildSystemPrompt(platform, tone) },
      { role: 'user',   content: buildUserPrompt(caseDesc, myProfile) },
    ],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  })
}
