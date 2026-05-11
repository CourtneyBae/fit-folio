import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { track } from '@/lib/mixpanel'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, refetchCredits } = useAuth()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')

  useEffect(() => {
    if (!user) return

    const paymentKey = searchParams.get('paymentKey')
    const orderId    = searchParams.get('orderId')
    const amount     = Number(searchParams.get('amount'))

    if (!paymentKey || !orderId || !amount) { setStatus('error'); return }

    fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount, userId: user.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) { refetchCredits(); track('Credits Charged', { amount: 10000, credits: 100 }); setStatus('done') }
        else setStatus('error')
      })
      .catch(() => setStatus('error'))
  }, [user])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-[#111110] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[#78776c] text-sm">결제 확인 중...</p>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-[#16a34a]" />
            </div>
            <h1 className="text-[#111110] text-2xl font-bold tracking-tight mb-2">충전 완료!</h1>
            <p className="text-[#78776c] text-sm leading-relaxed mb-8">
              100크레딧이 추가됐어요.<br />이제 10회 더 분석할 수 있어요.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/analyze')}
                className="inline-flex items-center justify-center gap-2 bg-[#111110] text-[#f4f4f0] rounded-full px-6 py-3 text-sm font-medium hover:bg-[#2a2a28] transition-colors"
              >
                분석 시작하기
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/mypage')}
                className="text-[#78776c] text-sm hover:text-[#111110] transition-colors"
              >
                마이페이지로
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-[#fee2e2] rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-[#dc2626]" />
            </div>
            <h1 className="text-[#111110] text-2xl font-bold tracking-tight mb-2">결제 확인 실패</h1>
            <p className="text-[#78776c] text-sm leading-relaxed mb-8">
              결제 확인 중 문제가 발생했어요.<br />고객센터로 문의해 주세요.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-[#78776c] text-sm hover:text-[#111110] transition-colors"
            >
              홈으로 돌아가기
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
