import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { uploadPdfToGemini, generateAnalysis } from '../server/analysis.js'

export const maxDuration = 60

function isOverloadError(err: unknown): boolean {
  if (!err) return false
  const e = err as Record<string, unknown>
  const status = Number(e.status ?? e.statusCode ?? e.httpStatus ?? 0)
  if (status === 503 || status === 429) return true
  const msg = String(e.message ?? '')
  return (
    msg.includes('503') ||
    msg.includes('Service Unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('429') ||
    msg.includes('Too Many Requests') ||
    msg.includes('RESOURCE_EXHAUSTED')
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.body as { id: string }
  if (!id) return res.status(400).json({ error: '분석 ID 누락.' })

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: record } = await supabase
    .from('analyses')
    .select('status, gemini_file_uri, gemini_file_name, storage_path, jd_text, user_id')
    .eq('id', id)
    .single()

  if (!record) return res.status(404).json({ error: '분석을 찾을 수 없습니다.' })

  if (record.status === 'done') {
    const { data } = await supabase.from('analyses').select('result').eq('id', id).single()
    return res.json({ status: 'done', result: data?.result })
  }

  if (record.status === 'error') {
    // 재시도 허용: pending으로 리셋
    await supabase.from('analyses').update({ status: 'pending' }).eq('id', id)
  }

  try {
    // PDF → Gemini 업로드 (이전 시도에서 완료됐으면 스킵)
    let fileUri: string = record.gemini_file_uri
    let fileName: string = record.gemini_file_name

    if (!fileUri) {
      const { data: pdfData, error: dlError } = await supabase.storage
        .from('portfolios').download(record.storage_path)
      if (dlError || !pdfData) throw new Error('PDF 다운로드 실패')

      const buffer = Buffer.from(await pdfData.arrayBuffer())
      const uploaded = await uploadPdfToGemini(buffer)
      fileUri = uploaded.fileUri
      fileName = uploaded.fileName

      await supabase.from('analyses')
        .update({ gemini_file_uri: fileUri, gemini_file_name: fileName })
        .eq('id', id)
    }

    // Gemini 추론
    let result
    try {
      result = await generateAnalysis(fileUri, record.jd_text)
    } catch (geminiErr) {
      const overload = isOverloadError(geminiErr)
      const geminiMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr)
      const geminiStatus = (geminiErr as Record<string, unknown>)?.status ?? 'none'
      console.error('[analyses-run] Gemini error | overload:', overload, '| status:', geminiStatus, '| msg:', geminiMsg)

      if (overload) {
        // 과부하: status=pending 유지 → 클라이언트 폴링이 재시도
        return res.status(503).json({ error: '분석 서버가 일시적으로 과부하 상태입니다.' })
      }
      throw geminiErr
    }

    // 결과 저장
    await supabase.from('analyses')
      .update({ status: 'done', result })
      .eq('id', id)

    // 정리
    await supabase.storage.from('portfolios').remove([record.storage_path]).catch(() => {})
    if (fileName) {
      const { GoogleAIFileManager } = await import('@google/generative-ai/server')
      const fm = new GoogleAIFileManager(process.env.GEMINI_API_KEY!)
      await fm.deleteFile(fileName).catch(() => {})
    }

    res.json({ status: 'done', result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.'
    console.error('[analyses-run] fatal error:', msg)

    await supabase.from('analyses').update({ status: 'error' }).eq('id', id)

    const { data: profile } = await supabase
      .from('profiles').select('credits').eq('id', record.user_id).single()
    if (profile) {
      await supabase.from('profiles')
        .update({ credits: profile.credits + 10 })
        .eq('id', record.user_id)
    }

    res.status(500).json({ error: msg })
  }
}
