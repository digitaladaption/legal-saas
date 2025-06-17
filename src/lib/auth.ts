import { createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import type { UserWithRoles } from './supabase'

export interface AuthContextType {
  user: User | null
  userProfile: UserWithRoles | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth route protection
export function requireAuth(user: User | null): boolean {
  return user !== null
}

export function requireRole(userProfile: UserWithRoles | null, requiredPermission: string): boolean {
  if (!userProfile || !userProfile.user_roles) return false
  
  return userProfile.user_roles.some(userRole => {
    const role = userRole.role
    if (!role) return false
    
    // Check specific permission
    return (role as any)[requiredPermission] === true
  })
}

// Redirect paths
export const AUTH_ROUTES = {
  SIGN_IN: '/auth/signin',
  SIGN_UP: '/auth/signup',
  DASHBOARD: '/',
  UNAUTHORIZED: '/auth/unauthorized'
} as const 