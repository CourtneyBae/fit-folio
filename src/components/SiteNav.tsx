import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, ChevronDown, LayoutDashboard } from 'lucide-react'

interface SiteNavProps {
  scrolled: boolean
}

export default function SiteNav({ scrolled }: SiteNavProps) {
  const { user, loading, credits, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const textClass = cn(
    'font-bold text-base tracking-tight transition-colors duration-300',
    scrolled ? 'text-[#111110]' : 'text-[#f4f4f0]',
  )

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.75)' : 'rgba(17,17,16,0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <a href="/" className={textClass}>FitFolio</a>

        <div className="flex items-center gap-3">
          {!loading && (
            user ? (
              /* 로그인 상태 */
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                      scrolled ? 'bg-[#111110] text-[#f4f4f0]' : 'bg-[#f4f4f0] text-[#111110]',
                    )}>
                      {user.name[0]}
                    </div>
                  )}
                  <span className={cn('text-sm font-medium hidden sm:block transition-colors duration-300', scrolled ? 'text-[#111110]' : 'text-[#f4f4f0]')}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={cn('transition-colors duration-300', scrolled ? 'text-[#78776c]' : 'text-[#a8a89e]')} />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-[#e4e4e0] rounded-2xl py-1 w-44 shadow-lg">
                      <div className="px-4 py-2.5 border-b border-[#e4e4e0]">
                        <p className="text-[#111110] text-sm font-medium truncate">{user.name}</p>
                        <p className="text-[#78776c] text-xs truncate">{user.email}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={cn('text-xs font-medium', credits <= 10 ? 'text-[#dc2626]' : 'text-[#78776c]')}>
                            ✦ {credits}크레딧
                          </p>
                          <a href="/payment/charge" onClick={() => setMenuOpen(false)} className="text-[10px] text-[#78776c] hover:text-[#111110] underline underline-offset-2 transition-colors">
                            충전
                          </a>
                        </div>
                      </div>
                      <a
                        href="/mypage"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#78776c] hover:text-[#111110] hover:bg-[#f8f8f6] transition-colors"
                      >
                        <LayoutDashboard size={14} />
                        마이페이지
                      </a>
                      <button
                        onClick={() => { logout(); setMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#78776c] hover:text-[#111110] hover:bg-[#f8f8f6] transition-colors"
                      >
                        <LogOut size={14} />
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* 비로그인 상태 */
              <a
                href="/login"
                className={cn(
                  'text-sm font-medium transition-colors duration-300',
                  scrolled ? 'text-[#111110]' : 'text-[#f4f4f0]',
                )}
              >
                로그인
              </a>
            )
          )}

          <a
            href="/analyze"
            className={cn(
              'rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300',
              scrolled
                ? 'bg-[#111110] text-[#f4f4f0] hover:bg-[#2a2a28]'
                : 'bg-[#f4f4f0] text-[#111110] hover:bg-white',
            )}
          >
            분석 시작
          </a>
        </div>
      </div>
    </nav>
  )
}
