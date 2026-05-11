import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { identify, reset } from '@/lib/mixpanel'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  credits: number
  refetchCredits: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  credits: 0,
  refetchCredits: async () => {},
  logout: async () => {},
})

function toAuthUser(u: User): AuthUser {
  return {
    id: u.id,
    name: u.user_metadata?.full_name ?? u.email ?? '',
    email: u.email ?? '',
    avatarUrl: u.user_metadata?.avatar_url ?? null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)

  const fetchCredits = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()
    if (error) console.error('[profiles]', error.code, error.message)
    setCredits(data?.credits ?? 0)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(toAuthUser(session.user))
        fetchCredits(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const authUser = toAuthUser(session.user)
        setUser(authUser)
        fetchCredits(session.user.id)
        if (event === 'SIGNED_IN') {
          identify(authUser.id, { name: authUser.name, email: authUser.email })
        }
      } else {
        setUser(null)
        setCredits(0)
        if (event === 'SIGNED_OUT') reset()
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refetchCredits = async () => {
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (supaUser) await fetchCredits(supaUser.id)
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, credits, refetchCredits, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
