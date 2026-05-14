import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import SiteNav from '@/components/SiteNav'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface AnalysisSummary {
  id: string
  jd_text: string
  result: { overall_score: number; fit_verdict: string; overall_summary: string } | null
  status: string | null
  created_at: string
}

const EASE = [0.16, 1, 0.3, 1] as const

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
}

function verdictLabel(v: string) {
  return { strong_fit: '강한 적합', potential_fit: '잠재적 적합', weak_fit: '보완 필요' }[v] ?? '분석 완료'
}

function verdictClass(v: string) {
  return {
    strong_fit:    'bg-[#dcfce7] text-[#16a34a]',
    potential_fit: 'bg-[#fef3c7] text-[#d97706]',
    weak_fit:      'bg-[#fee2e2] text-[#dc2626]',
  }[v] ?? 'bg-[#f4f4f4] text-[#78776c]'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MyPage() {
  const { user, loading, credits } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    supabase
      .from('analyses')
      .select('id, jd_text, result, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAnalyses((data ?? []) as AnalysisSummary[])
        setFetching(false)
      })
  }, [user])

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-white">
      <SiteNav scrolled={true} />

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">

          {/* 헤더 */}
          <motion.div
            variants={staggerContainer} initial="hidden" animate="visible"
            className="mb-14"
          >
            <motion.p variants={staggerItem} className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-5">
              My Page
            </motion.p>
            <motion.div variants={staggerItem} className="flex items-center gap-4 mb-6">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#111110] flex items-center justify-center text-[#f4f4f0] text-lg font-semibold">
                  {user.name[0]}
                </div>
              )}
              <div>
                <p className="text-[#111110] text-lg font-semibold">{user.name}</p>
                <p className="text-[#78776c] text-sm">{user.email}</p>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="flex items-center gap-6 border-t border-[#e4e4e0] pt-6">
              <div>
                <span className={cn('text-2xl font-bold', credits <= 10 ? 'text-[#dc2626]' : 'text-[#111110]')}>
                  {credits}
                </span>
                <span className="text-[#78776c] text-sm ml-1.5">크레딧 남음</span>
              </div>
              <div>
                <span className="text-[#111110] text-2xl font-bold">{analyses.length}</span>
                <span className="text-[#78776c] text-sm ml-1.5">분석 완료</span>
              </div>
              <a
                href="/analyze"
                className="ml-auto inline-flex items-center gap-2 bg-[#111110] text-[#f4f4f0] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#2a2a28] transition-colors"
              >
                새 분석
                <ArrowRight size={14} />
              </a>
            </motion.div>
          </motion.div>

          {/* 분석 기록 */}
          <div>
            <h2 className="text-[#111110] text-lg font-semibold mb-6">분석 기록</h2>

            {fetching ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border-2 border-[#111110] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#78776c] text-sm mb-4">아직 분석 기록이 없어요</p>
                <a href="/analyze" className="text-[#111110] text-sm font-medium underline underline-offset-2">
                  첫 분석 시작하기
                </a>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer} initial="hidden" animate="visible"
                className="space-y-3"
              >
                {analyses.map((a) => (
                  <motion.button
                    key={a.id}
                    variants={staggerItem}
                    onClick={() => navigate(`/report?id=${a.id}`)}
                    className="w-full text-left bg-white border border-[#e4e4e0] rounded-2xl p-5 hover:border-[#111110] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#78776c] text-xs mb-2">{formatDate(a.created_at)}</p>
                        <p className="text-[#111110] text-sm leading-relaxed line-clamp-2">
                          {a.jd_text.slice(0, 100)}…
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {a.result ? (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-[#111110]">{a.result.overall_score}</span>
                              <span className="text-[#78776c] text-xs">/100</span>
                            </div>
                            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', verdictClass(a.result.fit_verdict))}>
                              {verdictLabel(a.result.fit_verdict)}
                            </span>
                          </>
                        ) : (
                          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-[#f4f4f4] text-[#78776c]">
                            {a.status === 'error' ? '분석 실패' : '처리 중'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-3">
                      <span className="text-[#78776c] text-xs group-hover:text-[#111110] transition-colors flex items-center gap-1">
                        {a.result ? '결과 보기' : '계속하기'} <ArrowRight size={11} />
                      </span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
