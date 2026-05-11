import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Upload, ScanLine, FileText, CheckCircle2 } from 'lucide-react'
import SiteNav from '@/components/SiteNav'

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const

/** Hero: load-time stagger container */
const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } },
}

/** Hero item: blur + fade + rise */
const heroItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
}

/** Scroll sections: single element */
const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
}

/** Scroll sections: stagger container for card grids */
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/** Scroll sections: stagger child */
const staggerItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
}

const VIEWPORT = { once: true, margin: '-60px' } as const

// ─── Hero ─────────────────────────────────────────────────────────────────────

const noiseSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

function Hero() {
  return (
    <section className="relative bg-[#111110] overflow-hidden pt-40 pb-32">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: noiseSvg, backgroundRepeat: 'repeat', opacity: 0.035 }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start"
        >
          <motion.div variants={heroItem}>
            <div className="inline-flex items-center border border-white/15 rounded-full px-4 py-1.5 mb-10">
              <span className="text-[#a8a89e] text-xs font-medium">포트폴리오 JD 핏 진단 서비스</span>
            </div>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="text-[#f4f4f0] font-bold leading-[1.15] tracking-tight mb-7"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
          >
            지원 전,<br />
            포트폴리오가<br />
            이 JD에 맞는지<br />
            알아보세요
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="text-[#a8a89e] text-lg leading-relaxed max-w-md mb-12"
          >
            포트폴리오 PDF와 채용공고를 올리면, AI가 강점 역량·부족한 경험·수정 가능한 액션을 정리해 드립니다.
          </motion.p>

          <motion.div
            variants={heroItem}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <a
              href="/analyze"
              className="inline-flex items-center gap-2 bg-[#f4f4f0] text-[#111110] rounded-full px-7 py-3.5 text-sm font-medium hover:bg-white transition-colors"
            >
              무료로 분석 시작
              <ArrowRight size={15} />
            </a>
            <span className="text-[#a8a89e] text-sm">가입하면 1회 무료 분석</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Problem ──────────────────────────────────────────────────────────────────

const problems = [
  {
    num: '01',
    title: '어떤 프로젝트를 강조해야 할지 모르겠어요',
    desc: 'JD마다 원하는 역량이 다른데, 매번 처음부터 판단해야 합니다. 확신 없이 제출하게 되는 경우가 많습니다.',
  },
  {
    num: '02',
    title: '내 포트폴리오가 채용담당자 눈에 어떻게 보이는지 알기 어려워요',
    desc: '지인 피드백은 너무 주관적이고, 현직자 피드백은 시간이 오래 걸립니다.',
  },
  {
    num: '03',
    title: '뭘 먼저 수정해야 할지 모르겠어요',
    desc: '지원 직전까지 포트폴리오를 붙잡고 있지만, 어디서부터 손대야 할지 몰라 결국 그대로 제출하게 됩니다.',
  },
]

function Problem() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-5"
        >
          Problem
        </motion.p>
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#111110] text-4xl font-bold tracking-tight leading-tight mb-16 max-w-sm"
        >
          지원 직전마다<br />반복되는 고민
        </motion.h2>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {problems.map((p) => (
            <motion.div key={p.num} variants={staggerItem} className="bg-white border border-[#e4e4e0] rounded-2xl p-7">
              <span className="text-[#78776c] text-xs font-medium">{p.num}</span>
              <h3 className="text-[#111110] text-[17px] font-semibold leading-snug mt-4 mb-4">{p.title}</h3>
              <p className="text-[#78776c] text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Upload,
    step: '01',
    title: '포트폴리오 업로드',
    desc: 'PDF 파일을 올려주세요. 텍스트 기반 PDF라면 바로 분석이 시작됩니다.',
  },
  {
    icon: ScanLine,
    step: '02',
    title: '채용공고 입력',
    desc: '지원하려는 JD를 붙여넣으세요. URL이나 텍스트 모두 가능합니다.',
  },
  {
    icon: FileText,
    step: '03',
    title: '분석 결과 확인',
    desc: '강점, 부족 역량, 프로젝트별 수정 포인트를 리포트로 받아보세요.',
  },
]

function HowItWorks() {
  return (
    <section className="bg-[#111110] py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#a8a89e] text-xs font-medium uppercase tracking-widest mb-5"
        >
          How it works
        </motion.p>
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#f4f4f0] text-4xl font-bold tracking-tight leading-tight mb-16"
        >
          3분이면 충분합니다
        </motion.h2>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <motion.div key={s.step} variants={staggerItem} className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[#a8a89e] text-xs font-medium">{s.step}</span>
                  <Icon size={20} className="text-[#a8a89e]" />
                </div>
                <h3 className="text-[#f4f4f0] text-[17px] font-semibold mb-3">{s.title}</h3>
                <p className="text-[#a8a89e] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Report Preview ───────────────────────────────────────────────────────────

const strengthBadges = ['협업 경험', '문제 정의', '사용자 흐름 설계']
const gapBadges = ['사용자 리서치', '데이터 기반 의사결정']
const missingBadges = ['성과 지표']

function ReportPreview() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          >
            <motion.p variants={staggerItem} className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-5">Result</motion.p>
            <motion.h2 variants={staggerItem} className="text-[#111110] text-4xl font-bold tracking-tight leading-tight mb-6">
              이런 결과를<br />받아볼 수 있어요
            </motion.h2>
            <motion.p variants={staggerItem} className="text-[#78776c] text-base leading-relaxed mb-8">
              추상적인 평가 대신, 수정 가능한 형태로 제공합니다. 어디를, 어떻게, 왜 수정해야 하는지 함께 알려드립니다.
            </motion.p>
            <motion.ul variants={staggerItem} className="space-y-4">
              {[
                'JD 기준 강점·부족 역량 비교',
                '프로젝트별 수정 포인트 제안',
                '실제 문장 수정 예시 제공',
                '우선순위별 액션 아이템',
              ].map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#16a34a] shrink-0" />
                  <span className="text-[#111110] text-sm">{text}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right: Mock report */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
            className="bg-[#f8f8f6] rounded-2xl p-7 space-y-6"
          >
            <div>
              <span className="text-[#78776c] text-[11px] font-medium uppercase tracking-widest">전체 요약</span>
              <p className="text-[#111110] text-sm leading-relaxed mt-3">
                협업 경험과 문제 정의 과정은 명확하게 드러납니다. 다만{' '}
                <span className="font-semibold">데이터 기반 의사결정</span>과{' '}
                <span className="font-semibold">성과 지표 표현</span>을 보강하면 이 JD 기준 경쟁력이 더 높아집니다.
              </p>
            </div>

            <div className="border-t border-[#e4e4e0] pt-6">
              <span className="text-[#78776c] text-[11px] font-medium uppercase tracking-widest">역량 분석</span>
              <div className="flex flex-wrap gap-2 mt-4">
                {strengthBadges.map((b) => (
                  <span key={b} className="bg-[#dcfce7] text-[#16a34a] rounded-full px-3 py-1 text-xs font-medium">{b}</span>
                ))}
                {gapBadges.map((b) => (
                  <span key={b} className="bg-[#fef3c7] text-[#d97706] rounded-full px-3 py-1 text-xs font-medium">{b}</span>
                ))}
                {missingBadges.map((b) => (
                  <span key={b} className="bg-[#fee2e2] text-[#dc2626] rounded-full px-3 py-1 text-xs font-medium">{b}</span>
                ))}
              </div>
            </div>

            <div className="border-t border-[#e4e4e0] pt-6">
              <span className="text-[#78776c] text-[11px] font-medium uppercase tracking-widest">수정 액션</span>
              <div className="mt-4 bg-white border border-[#e4e4e0] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="bg-[#fee2e2] text-[#dc2626] rounded-full px-2.5 py-0.5 text-[11px] font-medium shrink-0 mt-0.5">
                    우선
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#111110] text-sm font-semibold mb-2">커머스 리텐션 프로젝트 성과 지표 추가</p>
                    <p className="text-[#78776c] text-xs leading-relaxed mb-3">
                      "사용자 흐름을 개선하여 편의성을 높였습니다"
                    </p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ArrowRight size={11} className="text-[#78776c]" />
                      <span className="text-[#78776c] text-xs font-medium">수정 제안</span>
                    </div>
                    <p className="text-[#111110] text-xs leading-relaxed bg-[#f8f8f6] rounded-lg p-3">
                      "회원가입 단계를 4단계에서 2단계로 줄여 가입 완료율을 31% 향상시켰습니다"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: '지원 직전에 어떤 프로젝트를 앞에 두어야 할지 항상 고민이었는데, 쓰고 나서 바로 감이 잡혔어요. JD 기준으로 정리해주니까 판단이 훨씬 빠르더라고요.',
    name: '김아름',
    role: '주니어 프로덕트 디자이너 · 1년차',
  },
  {
    quote: '포트폴리오 피드백을 몇 번 받았는데 다 추상적이었거든요. 여기서는 수정 예시 문장까지 줘서 그냥 바꿨어요. 실제로 쓸 수 있는 피드백이 나온다는 게 달랐어요.',
    name: '박지훈',
    role: '프로덕트 디자이너 · 4년차',
  },
  {
    quote: '여러 JD에 같은 포트폴리오를 넣어봤는데 결과가 다 달라요. 어떤 JD에는 강점이, 어떤 JD에는 약점이 됩니다. 지원 전략 짜는 데 많이 도움됐어요.',
    name: '이수연',
    role: '프로덕트 디자이너 · 3년차',
  },
]

function Testimonials() {
  return (
    <section className="bg-[#f8f8f6] py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-5"
        >
          Testimonials
        </motion.p>
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#111110] text-4xl font-bold tracking-tight leading-tight mb-16"
        >
          디자이너들의 이야기
        </motion.h2>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={staggerItem} className="bg-white border border-[#e4e4e0] rounded-2xl p-7 flex flex-col">
              <p className="text-[#111110] text-sm leading-relaxed flex-1 mb-7">"{t.quote}"</p>
              <div>
                <p className="text-[#111110] text-sm font-semibold">{t.name}</p>
                <p className="text-[#78776c] text-xs mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const freeFeatures = ['1회 분석 무료', '역량 비교 분석', '프로젝트별 피드백', '수정 액션 제안']
const proFeatures = ['무제한 분석', '상세 리포트 전체 제공', 'PDF 다운로드', '여러 JD 비교', 'AI 문장 개선 제안']

function Pricing() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-5"
        >
          Pricing
        </motion.p>
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#111110] text-4xl font-bold tracking-tight leading-tight mb-4"
        >
          지금은 무료로<br />시작하세요
        </motion.h2>
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="text-[#78776c] text-base leading-relaxed mb-16 max-w-sm"
        >
          가입 시 1회 무료 분석이 제공됩니다.
        </motion.p>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl"
        >
          <motion.div variants={staggerItem} className="bg-white border border-[#e4e4e0] rounded-2xl p-7">
            <p className="text-[#78776c] text-xs font-medium uppercase tracking-widest mb-4">Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[#111110] text-4xl font-bold">₩0</span>
            </div>
            <p className="text-[#78776c] text-sm mb-8">1회 무료 분석</p>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-[#16a34a] shrink-0" />
                  <span className="text-[#111110] text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="/analyze"
              className="block w-full text-center bg-[#111110] text-[#f4f4f0] rounded-full py-2.5 text-sm font-medium hover:bg-[#2a2a28] transition-colors"
            >
              무료로 시작
            </a>
          </motion.div>

          <motion.div variants={staggerItem} className="bg-[#f8f8f6] border border-[#e4e4e0] rounded-2xl p-7">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#78776c] text-xs font-medium uppercase tracking-widest">Pro</p>
              <span className="bg-[#111110] text-[#f4f4f0] rounded-full px-3 py-1 text-[11px] font-medium">출시 예정</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[#111110] text-4xl font-bold">₩9,900</span>
            </div>
            <p className="text-[#78776c] text-sm mb-8">월 구독 · 무제한 분석</p>
            <ul className="space-y-3 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-[#16a34a] shrink-0" />
                  <span className="text-[#111110] text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full text-center border border-[#e4e4e0] bg-transparent text-[#78776c] rounded-full py-2.5 text-sm font-medium cursor-not-allowed"
            >
              출시 알림 받기
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="bg-[#111110] py-32">
      <motion.div
        variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}
        className="max-w-6xl mx-auto px-6 md:px-8 text-center"
      >
        <motion.p variants={staggerItem} className="text-[#a8a89e] text-xs font-medium uppercase tracking-widest mb-6">
          Get started
        </motion.p>
        <motion.h2
          variants={staggerItem}
          className="text-[#f4f4f0] font-bold tracking-tight leading-tight mb-6"
          style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
        >
          지금 첫 분석을<br />시작해보세요
        </motion.h2>
        <motion.p variants={staggerItem} className="text-[#a8a89e] text-base mb-12">
          가입 시 1회 무료 분석 제공
        </motion.p>
        <motion.div variants={staggerItem}>
          <a
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[#f4f4f0] text-[#111110] rounded-full px-8 py-3.5 text-sm font-medium hover:bg-white transition-colors"
          >
            무료로 분석 시작
            <ArrowRight size={15} />
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#111110] border-t border-white/10 py-8">
      <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[#f4f4f0] text-sm font-bold">FitFolio</span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-[#a8a89e] text-xs hover:text-[#f4f4f0] transition-colors">개인정보처리방침</a>
          <a href="#" className="text-[#a8a89e] text-xs hover:text-[#f4f4f0] transition-colors">이용약관</a>
          <span className="text-[#a8a89e] text-xs">© 2025 FitFolio</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (!sentinelRef.current) return
      setScrolled(sentinelRef.current.getBoundingClientRect().top <= 64)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div>
      <SiteNav scrolled={scrolled} />
      <main>
        <Hero />
        {/* sentinel: Hero/라이트섹션 경계 — 이 엘리먼트가 nav 높이(64px)에 닿으면 GNB 전환 */}
        <div ref={sentinelRef} />
        <Problem />
        <HowItWorks />
        <ReportPreview />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
