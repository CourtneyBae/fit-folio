import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 15

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: '로그인이 필요합니다.' })

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return res.status(401).json({ error: '인증에 실패했습니다.' })

  const { storagePath, jdText } = req.body as { storagePath: string; jdText: string }
  if (!storagePath || !jdText?.trim()) return res.status(400).json({ error: '필수 항목이 누락됐습니다.' })

  // 크레딧 확인 및 차감
  const { data: profile } = await supabase
    .from('profiles').select('credits').eq('id', user.id).single()

  if (!profile || profile.credits < 10) {
    return res.status(403).json({ error: '크레딧이 부족합니다.' })
  }

  await supabase.from('profiles')
    .update({ credits: profile.credits - 10 })
    .eq('id', user.id)

  // 분석 레코드 생성
  const { data: analysis, error } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      jd_text: jdText,
      storage_path: storagePath,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !analysis) {
    await supabase.from('profiles')
      .update({ credits: profile.credits })
      .eq('id', user.id)
    return res.status(500).json({ error: '분석 시작에 실패했습니다.' })
  }

  res.json({ id: analysis.id })
}
