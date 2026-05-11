import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { paymentKey, orderId, amount, userId } = req.body as {
    paymentKey: string
    orderId: string
    amount: number
    userId: string
  }

  if (!paymentKey || !orderId || !amount || !userId) {
    return res.status(400).json({ error: '필수 항목이 누락됐습니다.' })
  }

  // 1. 토스페이먼츠 결제 검증
  const encoded = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')
  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  if (!tossRes.ok) {
    const err = await tossRes.json() as { message: string }
    return res.status(400).json({ error: err.message ?? '결제 검증에 실패했습니다.' })
  }

  // 2. 크레딧 100개 추가
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await supabase.rpc('add_credits_for_user', {
    target_user_id: userId,
    amount: 100,
  })

  if (error) {
    console.error('[payment/confirm] credits error:', error)
    return res.status(500).json({ error: '크레딧 추가 중 오류가 발생했습니다.' })
  }

  res.json({ ok: true })
}
