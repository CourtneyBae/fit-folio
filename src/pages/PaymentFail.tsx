import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

export default function PaymentFail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const message = searchParams.get('message') ?? '결제가 취소됐어요.'

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 bg-[#fee2e2] rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-[#dc2626]" />
        </div>
        <h1 className="text-[#111110] text-2xl font-bold tracking-tight mb-2">결제 실패</h1>
        <p className="text-[#78776c] text-sm leading-relaxed mb-8">{message}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center bg-[#111110] text-[#f4f4f0] rounded-full px-6 py-3 text-sm font-medium hover:bg-[#2a2a28] transition-colors"
        >
          돌아가기
        </button>
      </motion.div>
    </div>
  )
}
