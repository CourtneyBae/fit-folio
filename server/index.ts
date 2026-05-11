import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { runAnalysis } from './analysis.js'

const app  = express()
const PORT = process.env.PORT ?? 3001
const CLIENT_URL = process.env.CLIENT_URL ?? ''

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (
      origin.includes('localhost') ||
      origin.endsWith('.vercel.app') ||
      origin === CLIENT_URL
    ) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 },
})

// ─── POST /api/analyses ───────────────────────────────────────────────────────

app.post('/api/analyses', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'PDF 파일이 필요합니다.' })
    return
  }

  const jdText: string = req.body.jdText ?? ''
  if (jdText.trim().length < 50) {
    res.status(400).json({ error: '채용공고를 50자 이상 입력해주세요.' })
    return
  }

  try {
    const result = await runAnalysis(req.file.buffer, jdText)
    res.json({ result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[analysis error]', msg)
    res.status(500).json({ error: `분석 중 오류: ${msg}` })
  }
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`)
})
