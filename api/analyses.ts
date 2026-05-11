import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { runAnalysis } from '../server/analysis.js'

export const maxDuration = 60

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { storagePath, jdText } = req.body as { storagePath: string; jdText: string }

  if (!storagePath || !jdText || jdText.trim().length < 50) {
    return res.status(400).json({ error: '필수 항목이 누락됐습니다.' })
  }

  // 서비스 롤 클라이언트 (RLS 우회)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Supabase Storage에서 PDF 다운로드
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('portfolios')
    .download(storagePath)

  if (downloadError || !fileData) {
    return res.status(500).json({ error: 'PDF 파일을 읽을 수 없습니다.' })
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  try {
    const result = await runAnalysis(buffer, jdText)
    res.json({ result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.'
    console.error('[analysis]', msg)
    res.status(500).json({ error: msg })
  } finally {
    // 분석 후 Storage에서 PDF 삭제
    await supabase.storage.from('portfolios').remove([storagePath])
  }
}
