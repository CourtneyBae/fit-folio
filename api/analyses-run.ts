import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { uploadPdfToGemini, generateAnalysis } from '../server/analysis.js'

export const maxDuration = 60

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
    // 재시도 허용: pending으로 리셋 (크레딧은 이미 환불됐으므로 재차감 없음)
    await supabase.from('analyses').update({ status: 'pending' }).eq('id', id)
  }

  try {
    // PDF → Gemini 업로드 (이전 시도에서 완료됐으면 스킵 — 재시도 안전)
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

      // fileUri 저장 → 다음 재시도 시 업로드 단계 스킵
      await supabase.from('analyses')
        .update({ gemini_file_uri: fileUri, gemini_file_name: fileName })
        .eq('id', id)
    }

    // Gemini 추론 (503 과부하 시 최대 3회 재시도)
    let result
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await generateAnalysis(fileUri, record.jd_text)
        break
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        const isTransient = msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand') || msg.includes('overloaded')
        if (isTransient && attempt < 2) {
          await new Promise(r => setTimeout(r, 4000 * (attempt + 1)))
          continue
        }
        throw err
      }
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
    console.error('[analyses-run]', msg)

    const isTransient = msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand') || msg.includes('overloaded')

    if (isTransient) {
      // 임시 오류: status를 pending 유지 → 클라이언트 폴링이 재시도
      return res.status(503).json({ error: msg })
    }

    // 영구 오류: error로 마킹 + 크레딧 환불
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
