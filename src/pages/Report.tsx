import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Analytics } from '@/lib/analytics'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, ArrowRight, ChevronDown, Link2, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Types (mirrors server/analysis.ts) ──────────────────────────────────────

interface CompanyCulture {
  values: string[]
  work_style: string
  ideal_candidate: string
}

interface ProjectMatch {
  project_name: string
  score: number
  strengths: string[]
  gaps: string[]
}

interface SkillAnalysis {
  skill: string
  type: 'required' | 'preferred'
  score: number
  evidence: string
  gap: string | null
}

interface Strength {
  title: string
  detail: string
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  skill: string
  action: string
  reason: string
  before: string
  after: string
}

interface PersonaReviews {
  senior_designer: { comment: string; score: number }
  hiring_manager:  { comment: string; score: number }
  interviewer:     { questions: string[] }
}

interface AnalysisResult {
  overall_score: number
  overall_summary: string
  jd_required_skills: string[]
  jd_preferred_skills: string[]
  company_culture: CompanyCulture
  skill_analysis: SkillAnalysis[]
  project_matches: ProjectMatch[]
  strengths: Strength[]
  recommendations: Recommendation[]
  fit_verdict: 'strong_fit' | 'potential_fit' | 'weak_fit'
  persona_reviews: PersonaReviews
}

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const


const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
}

const VIEWPORT = { once: true, margin: '-40px' } as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreConfig(score: number) {
  if (score >= 70) return { label: '강점', className: 'bg-[#dcfce7] text-[#16a34a]' }
  if (score >= 40) return { label: '보완', className: 'bg-[#fef3c7] text-[#d97706]' }
  return { label: '부족', className: 'bg-[#fee2e2] text-[#dc2626]' }
}

function verdictConfig(verdict: AnalysisResult['fit_verdict']) {
  const map = {
    strong_fit:    { label: '강한 적합',    className: 'bg-[#dcfce7] text-[#16a34a]' },
    potential_fit: { label: '잠재적 적합',  className: 'bg-[#fef3c7] text-[#d97706]' },
    weak_fit:      { label: '보완 필요',    className: 'bg-[#fee2e2] text-[#dc2626]' },
  }
  return map[verdict] ?? map['potential_fit']
}

function priorityConfig(priority: Recommendation['priority']) {
  const map = {
    high:   { label: '우선 수정',  className: 'bg-[#fee2e2] text-[#dc2626]' },
    medium: { label: '권장 수정',  className: 'bg-[#fef3c7] text-[#d97706]' },
    low:    { label: '참고 사항',  className: 'bg-[#f4f4f4] text-[#78776c]' },
  }
  return map[priority] ?? map['medium']
}



// ─── Report Nav ──────────────────────────────────────────────────────────────

function ReportNav() {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('링크가 복사됐습니다')
    Analytics.resultCopied()
  }

  const savePdf = () => {
    toast.info('곧 출시될 예정입니다')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <a href="/" className="text-[#111110] font-bold text-base tracking-tight hover:opacity-70 transition-opacity">
          FitFolio
        </a>

        <div className="flex items-center gap-3">
          <a
            href="/analyze"
            className="text-[#78776c] text-sm hover:text-[#111110] transition-colors"
          >
            새 분석
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 border border-[#e4e4e0] rounded-full px-4 py-2 text-sm text-[#111110] hover:bg-[#f8f8f6] transition-colors outline-none">
              저장하기
              <ChevronDown size={14} className="text-[#78776c]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={copyLink} className="flex items-center gap-2 cursor-pointer">
                <Link2 size={14} />
                링크 복사
              </DropdownMenuItem>
              <DropdownMenuItem onClick={savePdf} className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <FileDown size={14} />
                  PDF로 저장
                </span>
                <span className="bg-[#111110] text-white text-xs rounded-full px-2 py-0.5 leading-none">
                  유료
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

// ─── Loading ──────────────────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  { label: '포트폴리오 업로드 완료', duration: 0 },
  { label: 'JD 요구 역량 분석 중', duration: 6000 },
  { label: '강점과 연결 포인트 탐색 중', duration: 28000 },
  { label: '리포트 생성 중', duration: 52000 },
]

const ANTICIPATION_MESSAGES = [
  '포트폴리오의 강점을 찾고 있어요',
  'JD와의 연결 포인트를 분석하고 있어요',
  '채용담당자 시선으로 검토하고 있어요',
  '프로젝트별 JD 매치 점수를 계산하고 있어요',
  '수정하면 임팩트 있는 부분을 정리하는 중이에요',
  '세 가지 시선으로 포트폴리오를 읽고 있어요',
]

function LoadingState({ message: _ }: { message: string }) {
  const [activeStep, setActiveStep] = useState(0)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const timers = PROGRESS_STEPS.slice(1).map((step, i) =>
      setTimeout(() => setActiveStep(i + 1), step.duration)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((s) => (s + 1) % ANTICIPATION_MESSAGES.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        {/* 단계 표시 */}
        <div className="space-y-4 mb-10">
          {PROGRESS_STEPS.map((step, i) => {
            const isDone = i < activeStep
            const isActive = i === activeStep
            return (
              <div key={step.label} className="flex items-center gap-3">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500',
                  isDone ? 'bg-[#111110]' : isActive ? 'border-2 border-[#111110]' : 'border-2 border-[#e4e4e0]',
                )}>
                  {isDone && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-[#111110] animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  'text-sm transition-colors duration-500',
                  isDone ? 'text-[#78776c] line-through' : isActive ? 'text-[#111110] font-medium' : 'text-[#a8a89e]',
                )}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* 기대 메시지 */}
        <div className="border-t border-[#e4e4e0] pt-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-[#78776c] text-sm text-center leading-relaxed"
            >
              {ANTICIPATION_MESSAGES[msgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


// ─── 01 Summary ──────────────────────────────────────────────────────────────

function SummarySection({ result }: { result: AnalysisResult }) {
  const verdict = verdictConfig(result.fit_verdict)
  const strengths = result.skill_analysis.filter((s) => s.score >= 70).length
  const gaps      = result.skill_analysis.filter((s) => s.score >= 40 && s.score < 70).length
  const missing   = result.skill_analysis.filter((s) => s.score < 40).length

  return (
    <motion.div
      variants={staggerContainer} initial="hidden" animate="visible"
      className="mb-16"
    >
      {/* 2-column: score left / summary right */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
        {/* Left: score + verdict */}
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-8xl font-bold text-[#111110] leading-none tracking-tight">
              {result.overall_score}
            </span>
            <span className="text-2xl text-[#78776c]">/100</span>
          </div>
          <span className={cn('rounded-full px-4 py-1.5 text-sm font-medium', verdict.className)}>
            {verdict.label}
          </span>
        </div>

        {/* Right: summary */}
        <p className="text-[#111110] text-lg leading-relaxed pt-1">
          {result.overall_summary}
        </p>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={staggerItem}
        className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[#e4e4e0] pt-6"
      >
        {[
          { value: strengths, label: '강점 역량' },
          { value: gaps,      label: '보완 필요' },
          { value: missing,   label: '부족 역량' },
          { value: result.recommendations.length, label: '수정 제안' },
        ].map(({ value, label }) => (
          <div key={label}>
            <span className="text-[#111110] text-2xl font-bold">{value}</span>
            <span className="text-[#78776c] text-sm ml-2">{label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── 02 JD 요구 역량 + 회사 문화 ────────────────────────────────────────────

function JdSkillsSection({ result }: { result: AnalysisResult }) {
  const { company_culture: c } = result
  return (
    <motion.div
      variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
      className="border-t border-[#e4e4e0] pt-14 mb-14"
    >
      <motion.h2 variants={staggerItem} onViewportEnter={() => Analytics.resultSectionViewed('JD 요구 역량')} className="text-[#111110] text-2xl font-semibold tracking-tight mb-6">
        JD 요구 역량
      </motion.h2>

      <motion.div variants={staggerItem} className="space-y-5 mb-10">
        <div>
          <p className="text-[#78776c] text-xs font-medium mb-3">필수 역량</p>
          <div className="flex flex-wrap gap-2">
            {result.jd_required_skills.map((skill) => (
              <span key={skill} className="bg-[#111110] text-[#f4f4f0] rounded-full px-3 py-1 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[#78776c] text-xs font-medium mb-3">우대 역량</p>
          <div className="flex flex-wrap gap-2">
            {result.jd_preferred_skills.map((skill) => (
              <span key={skill} className="bg-[#f4f4f4] text-[#78776c] rounded-full px-3 py-1 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 회사 문화 */}
      <motion.div variants={staggerItem}>
        <p className="text-[#78776c] text-xs font-medium mb-4">회사 문화</p>
        <div className="bg-[#f8f8f6] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[#78776c] text-xs font-medium mb-2">핵심 가치</p>
            <div className="flex flex-wrap gap-1.5">
              {c.values.map((v) => (
                <span key={v} className="bg-white border border-[#e4e4e0] rounded-full px-2.5 py-0.5 text-xs text-[#111110]">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[#78776c] text-xs font-medium mb-2">일하는 방식</p>
            <p className="text-[#111110] text-sm leading-relaxed">{c.work_style}</p>
          </div>
          <div>
            <p className="text-[#78776c] text-xs font-medium mb-2">원하는 인재상</p>
            <p className="text-[#111110] text-sm leading-relaxed">{c.ideal_candidate}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── 03 페르소나 리뷰 ─────────────────────────────────────────────────────────

type PersonaTab = 'senior_designer' | 'hiring_manager' | 'interviewer'

const PERSONA_TABS: { id: PersonaTab; label: string }[] = [
  { id: 'senior_designer', label: '시니어 디자이너' },
  { id: 'hiring_manager',  label: '채용 담당자' },
  { id: 'interviewer',     label: '면접관' },
]

function PersonaReviewSection({ result }: { result: AnalysisResult }) {
  const [active, setActive] = useState<PersonaTab>('senior_designer')
  const pr = result.persona_reviews

  return (
    <div className="border-t border-[#e4e4e0] pt-16 mb-16">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
        <motion.h2 variants={staggerItem} onViewportEnter={() => Analytics.resultSectionViewed('페르소나 리뷰')} className="text-[#111110] text-2xl font-semibold tracking-tight mb-6">
          세 시선으로 본 포트폴리오
        </motion.h2>

        {/* Tab buttons */}
        <motion.div variants={staggerItem} className="flex gap-2 mb-6 flex-wrap">
          {PERSONA_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                active === tab.id
                  ? 'bg-[#111110] text-[#f4f4f0]'
                  : 'border border-[#e4e4e0] text-[#78776c] hover:text-[#111110] hover:border-[#111110]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div variants={staggerItem}>
          <AnimatePresence mode="wait">
            {active === 'senior_designer' && (
              <motion.div
                key="senior"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-[#f8f8f6] rounded-2xl p-6"
              >
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-[#111110] text-3xl font-bold">{pr.senior_designer.score}</span>
                  <span className="text-[#78776c] text-base">/10</span>
                </div>
                <p className="text-[#111110] text-sm leading-relaxed">{pr.senior_designer.comment}</p>
              </motion.div>
            )}
            {active === 'hiring_manager' && (
              <motion.div
                key="hiring"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-[#f8f8f6] rounded-2xl p-6"
              >
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-[#111110] text-3xl font-bold">{pr.hiring_manager.score}</span>
                  <span className="text-[#78776c] text-base">/10</span>
                </div>
                <p className="text-[#111110] text-sm leading-relaxed">{pr.hiring_manager.comment}</p>
              </motion.div>
            )}
            {active === 'interviewer' && (
              <motion.div
                key="interviewer"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-[#f8f8f6] rounded-2xl p-6"
              >
                <p className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-4">면접에서 물어볼 수 있는 질문</p>
                <ul className="space-y-4">
                  {pr.interviewer.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#78776c] text-xs font-medium shrink-0 mt-0.5">Q{i + 1}</span>
                      <p className="text-[#111110] text-sm leading-relaxed">{q}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── 04 프로젝트별 매치 ───────────────────────────────────────────────────────

function ProjectMatchesSection({ result }: { result: AnalysisResult }) {
  const sorted = [...result.project_matches].sort((a, b) => b.score - a.score)

  return (
    <div className="border-t border-[#e4e4e0] pt-14 mb-14">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
        <motion.h2 variants={staggerItem} onViewportEnter={() => Analytics.resultSectionViewed('프로젝트별 JD 매치')} className="text-[#111110] text-2xl font-semibold tracking-tight mb-6">
          프로젝트별 JD 매치
        </motion.h2>

        <motion.div variants={staggerContainer} className="space-y-4">
          {sorted.map((pm) => {
            const sc = scoreConfig(pm.score)
            return (
              <motion.div key={pm.project_name} variants={staggerItem}
                className="bg-white border border-[#e4e4e0] rounded-2xl p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <p className="text-[#111110] text-base font-semibold">{pm.project_name}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', sc.className)}>
                      {sc.label}
                    </span>
                    <span className="text-[#78776c] text-xs">{pm.score}점</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-1 bg-[#f8f8f6] rounded-full overflow-hidden mb-5">
                  <motion.div
                    className={cn('h-full rounded-full', {
                      'bg-[#16a34a]': pm.score >= 70,
                      'bg-[#d97706]': pm.score >= 40 && pm.score < 70,
                      'bg-[#dc2626]': pm.score < 40,
                    })}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pm.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <p className="text-[#78776c] text-[11px] font-medium uppercase tracking-widest mb-2">강점</p>
                    <ul className="space-y-1.5">
                      {pm.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-[#16a34a] shrink-0 mt-0.5" />
                          <span className="text-[#111110] text-sm">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[#78776c] text-[11px] font-medium uppercase tracking-widest mb-2">보완 필요</p>
                    <ul className="space-y-1.5">
                      {pm.gaps.map((g) => (
                        <li key={g} className="flex items-start gap-2">
                          <AlertCircle size={13} className="text-[#d97706] shrink-0 mt-0.5" />
                          <span className="text-[#111110] text-sm">{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── 04 역량 분석 ─────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: SkillAnalysis }) {
  const score = scoreConfig(skill.score)

  return (
    <div className="bg-white border border-[#e4e4e0] rounded-2xl p-6">
      {/* 상단: 역량명 + 배지 + 점수 바 */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[#111110] text-base font-semibold leading-snug">{skill.skill}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-[#f4f4f4] text-[#78776c] rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {skill.type === 'required' ? '필수' : '우대'}
          </span>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', score.className)}>
            {score.label}
          </span>
        </div>
      </div>

      <div className="h-1 bg-[#f8f8f6] rounded-full overflow-hidden mb-4">
        <motion.div
          className={cn('h-full rounded-full', {
            'bg-[#16a34a]': skill.score >= 70,
            'bg-[#d97706]': skill.score >= 40 && skill.score < 70,
            'bg-[#dc2626]': skill.score < 40,
          })}
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        />
      </div>

      {/* 하단: evidence + gap */}
      <p className="text-[#78776c] text-sm leading-relaxed">{skill.evidence}</p>
      {skill.gap && (
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[#e4e4e0]">
          <AlertCircle size={13} className="text-[#d97706] shrink-0 mt-0.5" />
          <p className="text-[#111110] text-sm leading-relaxed">{skill.gap}</p>
        </div>
      )}
    </div>
  )
}

function SkillAnalysisSection({ result }: { result: AnalysisResult }) {
  const sorted = [...result.skill_analysis].sort((a, b) => b.score - a.score)

  return (
    <div className="border-t border-[#e4e4e0] pt-14 mb-14">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
        <motion.h2 variants={staggerItem} onViewportEnter={() => Analytics.resultSectionViewed('역량 분석')} className="text-[#111110] text-2xl font-semibold tracking-tight mb-6">
          역량 분석
        </motion.h2>
      </motion.div>

      <motion.div
        variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
        className="grid grid-cols-1 gap-4"
      >
        {sorted.map((skill) => (
          <motion.div key={skill.skill} variants={staggerItem}>
            <SkillCard skill={skill} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ─── 05 강점 (Peak-End Rule: 긍정적 피크 설계) ────────────────────────────────

function StrengthsSection({ result }: { result: AnalysisResult }) {
  return (
    <div className="border-t border-[#e4e4e0] pt-14 mb-14">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
        <motion.h2 variants={staggerItem} onViewportEnter={() => Analytics.resultSectionViewed('이미 갖춘 강점')} className="text-[#111110] text-2xl font-semibold tracking-tight mb-2">
          이미 갖춘 강점
        </motion.h2>
        <motion.p variants={staggerItem} className="text-[#78776c] text-sm leading-relaxed mb-8">
          이 역량들은 JD와 잘 맞습니다. 인터뷰에서 적극적으로 어필하세요.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {result.strengths.map((s) => (
            <motion.div
              key={s.title}
              variants={staggerItem}
              className="bg-[#f8f8f6] rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-[#16a34a] shrink-0" />
                <p className="text-[#111110] text-sm font-semibold">{s.title}</p>
              </div>
              <p className="text-[#78776c] text-sm leading-relaxed">{s.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── 06 수정 액션 ─────────────────────────────────────────────────────────────

function RecommendationsSection({ result }: { result: AnalysisResult }) {
  const sorted = [...result.recommendations].sort(
    (a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]),
  )

  return (
    <div className="border-t border-[#e4e4e0] pt-16 mb-16">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
        <motion.h2 variants={staggerItem} onViewportEnter={() => Analytics.resultSectionViewed('수정 액션')} className="text-[#111110] text-2xl font-semibold tracking-tight mb-2">
          수정 액션
        </motion.h2>
        <motion.p variants={staggerItem} className="text-[#78776c] text-sm leading-relaxed mb-8">
          이 항목을 수정하지 않으면 채용담당자에게 약점으로 보일 수 있습니다.
        </motion.p>

        <motion.div variants={staggerContainer} className="space-y-4">
          {sorted.map((rec, i) => {
            const p = priorityConfig(rec.priority)
            return (
              <motion.div key={i} variants={staggerItem} className="bg-white border border-[#e4e4e0] rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap shrink-0 mt-0.5', p.className)}>
                    {p.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#78776c] text-xs font-medium mb-1">{rec.skill}</p>
                    <p className="text-[#111110] text-sm font-semibold leading-snug">{rec.action}</p>
                  </div>
                </div>
                <p className="text-[#78776c] text-sm leading-relaxed mb-5">{rec.reason}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#fafafa] border border-[#e4e4e0] rounded-xl p-4">
                    <p className="text-[#78776c] text-xs font-medium mb-2">현재</p>
                    <p className="text-[#78776c] text-sm leading-relaxed">{rec.before}</p>
                  </div>
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                    <p className="text-[#16a34a] text-xs font-medium mb-2">수정 예시</p>
                    <p className="text-[#111110] text-sm leading-relaxed">{rec.after}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div variants={staggerItem} className="mt-8 flex justify-center">
          <a
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[#111110] text-[#f4f4f0] rounded-full px-6 py-3 text-sm font-medium hover:bg-[#2a2a28] transition-colors"
          >
            다른 JD로 분석하기
            <ArrowRight size={15} />
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Pro 업그레이드 유도 ──────────────────────────────────────────────────────

const DUMMY_REVIEWS = [
  {
    label: '시니어 디자이너',
    score: '8/10',
    text: '온보딩 플로우 페이지는 사용자 흐름 설계 측면에서 꽤 잘 돼 있어요. 다만 의사결정 근거가 보이지 않아서...',
  },
  {
    label: '채용 담당자',
    text: '이 페이지만 놓고 보면 JD에서 요구하는 데이터 역량이 잘 드러나지 않아요. 성과 지표를 앞에 배치하면...',
  },
]

function ProUpgradeSection() {
  return (
    <div className="border-t border-[#e4e4e0] pt-16 mb-16">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
        <motion.h2 variants={staggerItem} className="text-[#111110] text-2xl font-semibold tracking-tight mb-2">
          페이지별 상세 리뷰
        </motion.h2>
        <motion.p variants={staggerItem} className="text-[#78776c] text-sm leading-relaxed mb-8">
          각 페이지를 시니어 디자이너, 채용 담당자, 면접관 시선으로 분석해드려요.
        </motion.p>

        <motion.div variants={staggerItem} className="relative">
          {/* 블러 처리된 샘플 카드 */}
          <div className="space-y-4 select-none pointer-events-none" style={{ filter: 'blur(4px)', opacity: 0.6 }}>
            {DUMMY_REVIEWS.map((r, i) => (
              <div key={i} className="bg-[#f8f8f6] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#78776c] text-xs font-medium">{r.label}</span>
                  {r.score && <span className="text-[#111110] text-sm font-bold">{r.score}</span>}
                </div>
                <p className="text-[#111110] text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>

          {/* 오버레이 + CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <button
              onClick={() => toast.info('업데이트 예정입니다', { description: '곧 Pro 플랜과 함께 출시될 예정이에요.' })}
              className="inline-flex items-center gap-2 bg-[#111110] text-[#f4f4f0] rounded-full px-6 py-3 text-sm font-medium hover:bg-[#2a2a28] transition-colors shadow-lg"
            >
              Pro에서 확인하기
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Report() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loadingMsg, setLoadingMsg] = useState('분석 준비 중...')

  const runAnalysis = async (id: string) => {
    setLoadingMsg('AI 분석 중...')
    try {
      const res = await fetch('/api/analyses-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.status === 504 || res.status === 408) {
        // 타임아웃 → 로딩 유지하며 폴링으로 전환
        startPolling(id)
        return
      }

      const data = await res.json()
      if (res.ok && data.status === 'done') {
        Analytics.analysisCompleted({ score: data.result?.overall_score, verdict: data.result?.fit_verdict })
        setResult(data.result as AnalysisResult)
        setStatus('done')
      } else if (res.status === 500) {
        // 서버 에러도 일단 폴링으로 전환 (분석이 백그라운드에서 완료될 수 있음)
        startPolling(id)
      } else {
        setStatus('error')
      }
    } catch {
      // 네트워크 에러 → 폴링으로 전환
      startPolling(id)
    }
  }

  const startPolling = (id: string) => {
    setLoadingMsg('분석 처리 중입니다...')
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const { data } = await supabase
        .from('analyses').select('status, result').eq('id', id).single()

      if (data?.status === 'done' && data.result) {
        clearInterval(interval)
        Analytics.analysisCompleted({ score: (data.result as AnalysisResult)?.overall_score, verdict: (data.result as AnalysisResult)?.fit_verdict })
        setResult(data.result as AnalysisResult)
        setStatus('done')
      } else if (data?.status === 'error') {
        clearInterval(interval)
        setStatus('error')
      } else if (attempts % 3 === 0) {
        // 15초마다 재시도 (로딩 화면 유지)
        clearInterval(interval)
        runAnalysis(id)
      } else if (attempts > 36) {
        // 3분 초과 시 에러
        clearInterval(interval)
        setStatus('error')
      }
    }, 5000)
  }

  useEffect(() => {
    const id = searchParams.get('id')

    if (id) {
      supabase.from('analyses').select('status, result').eq('id', id).single()
        .then(({ data }) => {
          if (data?.status === 'done' && data.result) {
            setResult(data.result as AnalysisResult)
            setStatus('done')
          } else if (data?.status === 'error') {
            setStatus('error')
          } else {
            runAnalysis(id)
          }
        })
    } else {
      const stored = localStorage.getItem('fitfolio_result')
      if (stored) {
        try { setResult(JSON.parse(stored)); setStatus('done') }
        catch { setStatus('error') }
      } else {
        setStatus('error')
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white">
      <ReportNav />

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <AnimatePresence mode="wait">
            {status === 'loading' ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <LoadingState message={loadingMsg} />
              </motion.div>
            ) : status === 'error' || !result ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-[#111110] text-lg font-semibold">결과를 불러올 수 없습니다</p>
                <a href="/analyze" className="text-[#78776c] text-sm hover:text-[#111110] transition-colors underline underline-offset-2">
                  다시 분석하기
                </a>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <SummarySection result={result} />
                <JdSkillsSection result={result} />
                <PersonaReviewSection result={result} />
                <ProjectMatchesSection result={result} />
                <SkillAnalysisSection result={result} />
                <StrengthsSection result={result} />
                <RecommendationsSection result={result} />
                <ProUpgradeSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  )
}
