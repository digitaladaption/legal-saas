'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { AUTH_ROUTES } from '@/lib/auth'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/unauthorized'
]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  console.log('🔧 AuthGuard: Render', { 
    hasUser: !!user, 
    loading,
    pathname, 
    userId: user?.id,
    isPublicRoute: PUBLIC_ROUTES.includes(pathname)
  })

  useEffect(() => {
    console.log('🔧 AuthGuard: useEffect', { 
      hasUser: !!user, 
      loading,
      pathname,
      userId: user?.id
    })
    
    // Don't do anything while loading
    if (loading) {
      console.log('🔧 AuthGuard: Still loading, waiting...')
      return
    }
    
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
    console.log('🔧 AuthGuard: Auth resolved', { 
      hasUser: !!user, 
      isPublicRoute,
      pathname 
    })
    
    // If user is authenticated and on a public route, redirect to dashboard
    if (user && isPublicRoute) {
      console.log('🔧 AuthGuard: Authenticated user on public route, redirecting to dashboard')
      router.push(AUTH_ROUTES.DASHBOARD)
      return
    }
    
    // If user is not authenticated and on a protected route, redirect to signin
    if (!user && !isPublicRoute) {
      console.log('🔧 AuthGuard: Unauthenticated user on protected route, redirecting to signin')
      router.push(AUTH_ROUTES.SIGN_IN)
      return
    }
    
    console.log('🔧 AuthGuard: No redirect needed, showing content')
  }, [user, loading, pathname, router])

  // Show loading spinner while auth state is being determined
  if (loading) {
    console.log('🔧 AuthGuard: Showing loading spinner')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-gray-600">Loading...</div>
      </div>
    )
  }

  console.log('🔧 AuthGuard: Rendering children')
  return <>{children}</>
} 