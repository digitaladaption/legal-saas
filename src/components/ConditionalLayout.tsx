'use client'

import { usePathname } from 'next/navigation'
import DashboardLayout from './DashboardLayout'
import AuthGuard from './AuthGuard'

// Public routes that should not have dashboard layout
const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/unauthorized'
]

// Simple auth layout for public routes
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (isPublicRoute) {
    // For public routes, use AuthGuard with simple layout
    return (
      <AuthGuard>
        <AuthLayout>
          {children}
        </AuthLayout>
      </AuthGuard>
    )
  }

  // For protected routes, use DashboardLayout (which already includes AuthGuard)
  // No need to wrap with AuthGuard again
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
} 