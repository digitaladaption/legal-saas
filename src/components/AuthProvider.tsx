'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'
import type { UserWithRoles } from '@/lib/supabase'
import type { AuthContextType } from '@/lib/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserWithRoles | null>(null)
  const [loading, setLoading] = useState(true)

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔧 AuthProvider: Signing in user')
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('🔧 AuthProvider: Sign in result', { error: error?.message })
      return { error }
    } catch (error) {
      console.error('🔧 AuthProvider: Sign in exception:', error)
      return { error }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email
          }
        }
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }, [])

  const signOut = useCallback(async () => {
    console.log('🔧 AuthProvider: Signing out')
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    // Skip profile refresh for now
    console.log('🔧 AuthProvider: Profile refresh skipped')
  }, [])

  useEffect(() => {
    console.log('🔧 AuthProvider: Initializing')
    
    let supabase: any = null
    
    try {
      supabase = getSupabaseClient()
    } catch (error) {
      console.error('🔧 AuthProvider: Failed to create Supabase client:', error)
      setUser(null)
      setUserProfile(null)
      setLoading(false)
      return
    }
    
    const checkInitialSession = async () => {
      console.log('🔧 AuthProvider: Checking initial session')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('🔧 AuthProvider: Session check result', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          error: error?.message 
        })
        
        if (error) {
          console.error('🔧 AuthProvider: Session error:', error)
          setUser(null)
          setUserProfile(null)
        } else if (session?.user) {
          console.log('🔧 AuthProvider: Setting user from session')
          setUser(session.user)
          setUserProfile(null)
        } else {
          console.log('🔧 AuthProvider: No session found')
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('🔧 AuthProvider: Error checking initial session:', error)
        setUser(null)
        setUserProfile(null)
      } finally {
        console.log('🔧 AuthProvider: Setting loading to false')
        setLoading(false)
      }
    }

    checkInitialSession()

    let authListener: any = null
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log('🔧 AuthProvider: Auth state changed', { event, hasSession: !!session })
          
          try {
            if (event === 'SIGNED_IN' && session) {
              console.log('🔧 AuthProvider: User signed in')
              setUser(session.user)
              setUserProfile(null)
              setLoading(false)
            } else if (event === 'SIGNED_OUT') {
              console.log('🔧 AuthProvider: User signed out')
              setUser(null)
              setUserProfile(null)
              setLoading(false)
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('🔧 AuthProvider: Token refreshed')
              if (session?.user) {
                setUser(session.user)
              }
              setLoading(false)
            } else {
              console.log('🔧 AuthProvider: Other auth event:', event)
              setLoading(false)
            }
          } catch (error) {
            console.error('🔧 AuthProvider: Error in auth state change handler:', error)
            setLoading(false)
          }
        }
      )
      authListener = data
    } catch (error) {
      console.error('🔧 AuthProvider: Error setting up auth listener:', error)
      setLoading(false)
    }

    return () => {
      console.log('🔧 AuthProvider: Cleanup')
      try {
        if (authListener?.subscription) {
          authListener.subscription.unsubscribe()
        }
      } catch (error) {
        console.error('🔧 AuthProvider: Error during cleanup:', error)
      }
    }
  }, []) // Empty dependency array to prevent re-runs

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
