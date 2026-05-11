import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import SiteNav from '@/components/SiteNav'
import { useAuth } from '@/contexts/AuthContext'

export default function ChargePage() {
  const { user, loading, credits } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  const handleCharge = async () => {
    if (!user) return
    const tossPayments = await loadTossPayments(import.meta.env.VITE_TOSS_CLIENT_KEY as string)
    const payment = tossPayments.payment({ customerKey: user.id })
    await payment.requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: 10000 },
      orderId: `credit_${user.id}_${Date.now()}`,
      orderName: 'FitFolio 크레딧 100개',
      customerName: user.name,
      customerEmail: user.email,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
    })
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-white">
      <SiteNav scrolled={true} />

      <main className="pt-32 pb-24">
        <div className="max-w-md mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-5">Credits</p>
            <h1 className="text-[#111110] text-3xl font-bold tracking-tight mb-2">크레딧 충전</h1>
            <p className="text-[#78776c] text-sm leading-relaxed mb-10">
              현재 <span className="font-semibold text-[#111110]">{credits}크레딧</span> 보유 중
            </p>

            {/* 패키지 카드 */}
            <div className="border border-[#111110] rounded-2xl p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={16} className="text-[#111110]" />
                    <span className="text-[#111110] text-base font-semibold">크레딧 100개</span>
                  </div>
                  <p className="text-[#78776c] text-sm">분석 10회 가능</p>
                </div>
                <p className="text-[#111110] text-xl font-bold">₩10,000</p>
              </div>

              <ul className="space-y-1.5 mb-6">
                {['포트폴리오 × JD 분석 10회', '역량 분석 · 수정 액션 · 페르소나 리뷰', '분석 기록 영구 저장'].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-[#78776c] text-sm">
                    <span className="w-1 h-1 rounded-full bg-[#78776c] shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCharge}
                className="w-full flex items-center justify-center gap-2 bg-[#111110] text-[#f4f4f0] rounded-full py-3.5 text-sm font-medium hover:bg-[#2a2a28] transition-colors"
              >
                카드로 충전하기
                <ArrowRight size={14} />
              </button>
            </div>

            <p className="text-center text-[#78776c] text-xs leading-relaxed">
              결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
