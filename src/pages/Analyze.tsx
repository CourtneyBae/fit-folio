import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, X, FileText, AlertCircle, ArrowRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import SiteNav from '@/components/SiteNav'
import ProModal from '@/components/ProModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Analytics } from '@/lib/analytics'

// ─── Animation ───────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MAX_MB = 40
const MAX_BYTES = MAX_MB * 1024 * 1024

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)}KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// ─── Dropzone ────────────────────────────────────────────────────────────────

interface DropzoneProps {
  file: File | null
  error: string | null
  onFile: (f: File) => void
  onClear: () => void
}

function Dropzone({ file, error, onFile, onClear }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div className="flex flex-col">
      {file ? (
        /* ── 업로드 완료 상태 ── */
        <div className="bg-[#f8f8f6] rounded-2xl p-6 min-h-[320px] flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-white border border-[#e4e4e0] rounded-xl p-3 shrink-0">
              <FileText size={22} className="text-[#111110]" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[#111110] text-sm font-medium leading-snug break-all">{file.name}</p>
              <p className="text-[#78776c] text-xs mt-1">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={onClear}
              className="text-[#78776c] hover:text-[#111110] transition-colors p-1 shrink-0"
              aria-label="파일 제거"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-auto pt-6">
            <div className="flex items-center gap-2 text-[#16a34a]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span className="text-xs font-medium">업로드 완료</span>
            </div>
            <button
              onClick={() => { onClear(); setTimeout(() => inputRef.current?.click(), 50) }}
              className="text-[#78776c] text-xs hover:text-[#111110] transition-colors underline underline-offset-2"
            >
              다른 파일로 교체
            </button>
          </div>
        </div>
      ) : (
        /* ── 드롭존 ── */
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={cn(
            'min-h-[320px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
            dragging
              ? 'border-[#111110] bg-[#f8f8f6]'
              : 'border-[#e4e4e0] hover:border-[#111110] hover:bg-[#f8f8f6]',
          )}
        >
          <Upload size={24} className="text-[#78776c]" />
          <div className="text-center">
            <p className="text-[#111110] text-sm font-medium">
              {dragging ? 'PDF를 놓아주세요' : 'PDF를 드래그하거나 클릭해서 올려주세요'}
            </p>
            <p className="text-[#78776c] text-xs mt-1">최대 {MAX_MB}MB · PDF만 지원</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[#dc2626] text-xs">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
    </div>
  )
}

// ─── JD Input ────────────────────────────────────────────────────────────────

interface JdInputProps {
  value: string
  onChange: (v: string) => void
}

function JdInput({ value, onChange }: JdInputProps) {
  const tooShort = value.length > 0 && value.trim().length < 50

  return (
    <div className="flex flex-col">
      <div className="relative flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'채용공고 내용을 붙여넣어 주세요.\n\n포지션 소개, 주요 업무, 자격 요건, 우대 사항 등\n어떤 형식이든 괜찮습니다.'}
          className={cn(
            'w-full min-h-[320px] bg-[#f8f8f6] border rounded-2xl px-4 py-3 text-sm text-[#111110]',
            'placeholder:text-[#a8a89e] leading-relaxed resize-none',
            'focus:outline-none transition-colors',
            tooShort
              ? 'border-[#d97706]'
              : 'border-[#e4e4e0] focus:border-[#111110]',
          )}
        />
        <span
          className={cn(
            'absolute bottom-3 right-4 text-[11px] pointer-events-none select-none',
            tooShort ? 'text-[#d97706]' : 'text-[#a8a89e]',
          )}
        >
          {value.length}자
        </span>
      </div>

      {tooShort && (
        <p className="mt-2 flex items-center gap-1.5 text-[#d97706] text-xs">
          <AlertCircle size={12} />
          채용공고를 50자 이상 입력해주세요
        </p>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Analyze() {
  const { user, loading, refetchCredits } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [jdText, setJdText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [proModal, setProModal] = useState<'guest_limit' | 'user_limit' | null>(null)

  const handleFile = (f: File) => {
    setFileError(null)
    if (f.type !== 'application/pdf') { setFileError('PDF 파일만 지원합니다.'); return }
    if (f.size > MAX_BYTES) { setFileError(`파일 크기는 ${MAX_MB}MB 이하여야 합니다.`); return }
    setPdfFile(f)
    Analytics.pdfUploaded({ fileSize: f.size })
  }

  const canSubmit = pdfFile !== null && jdText.trim().length >= 50

  const handleSubmit = async () => {
    if (!canSubmit || isAnalyzing) return
    setAnalyzeError(null)

    if (!user) { setProModal('guest_limit'); return }

    // UX 크레딧 확인 (서버에서도 검증)
    const { data: profile } = await supabase
      .from('profiles').select('credits').eq('id', user.id).single()
    if ((profile?.credits ?? 0) < 10) { setProModal('user_limit'); return }

    setIsAnalyzing(true)
    Analytics.jdInputted({ length: jdText.length })
    Analytics.analysisStarted({ jdLength: jdText.length, pdfSize: pdfFile!.size })

    // PDF → Supabase Storage 업로드
    const storagePath = `${user.id}/${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(storagePath, pdfFile!, { contentType: 'application/pdf' })

    if (uploadError) {
      setAnalyzeError('PDF 업로드에 실패했습니다. 다시 시도해주세요.')
      setIsAnalyzing(false)
      return
    }

    // 분석 레코드 생성 (서버에서 크레딧 차감)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ storagePath, jdText }),
      })
      const data = await res.json()

      if (!res.ok) {
        await supabase.storage.from('portfolios').remove([storagePath])
        throw new Error(data.error ?? '분석 시작에 실패했습니다.')
      }

      await refetchCredits()
      navigate(`/report?id=${data.id}`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '분석에 실패했습니다. 다시 시도해주세요.'
      Analytics.analysisFailed({ error: errMsg })
      setAnalyzeError(errMsg)
      setIsAnalyzing(false)
    }
  }

  const hint =
    !pdfFile && !jdText.trim() ? 'PDF와 채용공고를 모두 입력해주세요' :
    !pdfFile ? '포트폴리오 PDF를 올려주세요' :
    jdText.trim().length < 50 ? '채용공고를 조금 더 입력해주세요' :
    '준비 완료'

  return (
    <div className="min-h-screen bg-white">
      <SiteNav scrolled={true} />
      <ProModal
        open={proModal !== null}
        reason={proModal ?? 'guest_limit'}
        onClose={() => setProModal(null)}
      />

      <main className="pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-8">

          {/* ── Header ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-14"
          >
            <motion.p
              variants={staggerItem}
              className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-5"
            >
              Analyze
            </motion.p>
            <motion.h1
              variants={staggerItem}
              className="text-[#111110] text-4xl font-bold tracking-tight leading-tight mb-4"
            >
              포트폴리오와 JD를<br />올려주세요
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="text-[#78776c] text-base leading-relaxed max-w-lg"
            >
              포트폴리오 PDF와 채용공고를 함께 분석해 강점, 부족 역량, 수정 방향을 제안합니다.
            </motion.p>
          </motion.div>

          {/* ── Form ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
          >
            {/* 좌: 포트폴리오 */}
            <motion.div variants={staggerItem} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[#111110] text-sm font-semibold">포트폴리오</span>
                <span className="text-[#78776c] text-xs">PDF 파일</span>
              </div>
              <Dropzone
                file={pdfFile}
                error={fileError}
                onFile={handleFile}
                onClear={() => { setPdfFile(null); setFileError(null) }}
              />
            </motion.div>

            {/* 우: 채용공고 */}
            <motion.div variants={staggerItem} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[#111110] text-sm font-semibold">채용공고</span>
                <span className="text-[#78776c] text-xs">JD 텍스트</span>
              </div>
              <JdInput value={jdText} onChange={setJdText} />
            </motion.div>
          </motion.div>

          {/* ── Submit ── */}
          <motion.div
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isAnalyzing}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-sm font-medium transition-colors',
                canSubmit && !isAnalyzing
                  ? 'bg-[#111110] text-[#f4f4f0] hover:bg-[#2a2a28]'
                  : 'bg-[#e4e4e0] text-[#a8a89e] cursor-not-allowed',
              )}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  분석 시작
                  <ArrowRight size={15} />
                </>
              )}
            </button>
            <p className="text-[#a8a89e] text-xs">{hint}</p>
            {analyzeError && (
              <p className="flex items-center gap-1.5 text-[#dc2626] text-xs">
                <AlertCircle size={12} />
                {analyzeError}
              </p>
            )}
          </motion.div>

          {/* ── 개인정보 캡션 ── */}
          <div className="mt-16 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#78776c]">
              <Lock size={12} />
              <p className="text-xs font-medium">보안 처리</p>
            </div>
            <p className="text-center text-[#a8a89e] text-xs leading-relaxed max-w-sm">
              업로드된 파일은 분석 목적으로만 사용됩니다.<br />
              분석 완료 후 서버와 AI 모델에서 즉시 삭제되며,<br />
              제3자와 공유되지 않습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
