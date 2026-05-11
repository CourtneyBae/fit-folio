import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'

interface ProModalProps {
  open: boolean
  reason: 'guest_limit' | 'user_limit'
  onClose: () => void
}

export default function ProModal({ open, reason, onClose }: ProModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-[#78776c] hover:text-[#111110] transition-colors"
              >
                <X size={18} />
              </button>

              {/* Content */}
              {reason === 'guest_limit' ? (
                <>
                  <p className="text-[#111110] text-lg font-semibold mb-2">로그인이 필요합니다</p>
                  <p className="text-[#78776c] text-sm leading-relaxed mb-6">
                    로그인하면 30크레딧이 지급돼요.<br />
                    1회 분석에 10크레딧이 사용되며, 무료로 3번 분석할 수 있어요.
                  </p>
                  <a
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full bg-[#111110] text-[#f4f4f0] rounded-full py-3 text-sm font-medium hover:bg-[#2a2a28] transition-colors"
                  >
                    Google로 로그인하기
                    <ArrowRight size={15} />
                  </a>
                </>
              ) : (
                <>
                  <p className="text-[#111110] text-lg font-semibold mb-2">크레딧이 부족해요</p>
                  <p className="text-[#78776c] text-sm leading-relaxed mb-2">
                    Pro로 업그레이드하면 무제한으로 분석할 수 있어요.
                  </p>
                  <ul className="text-[#78776c] text-sm space-y-1 mb-6 pl-4 list-disc">
                    <li>무제한 JD 분석</li>
                    <li>상세 리포트 전체 제공</li>
                    <li>PDF 다운로드</li>
                  </ul>
                  <button
                    className="flex items-center justify-center gap-2 w-full bg-[#111110] text-[#f4f4f0] rounded-full py-3 text-sm font-medium hover:bg-[#2a2a28] transition-colors mb-3"
                  >
                    Pro 업그레이드 (출시 예정)
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full text-center text-[#78776c] text-sm hover:text-[#111110] transition-colors"
                  >
                    나중에
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
