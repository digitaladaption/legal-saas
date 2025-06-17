'use client'

import { useAuth } from '@/components/AuthProvider'

export default function TestPage() {
  const { user, loading } = useAuth()

  console.log('🔧 Test Page: Render', { hasUser: !!user, loading })

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Page - Loading</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Auth Status</h2>
        <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
        <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        <p><strong>Loading:</strong> {loading.toString()}</p>
      </div>
    </div>
  )
} 