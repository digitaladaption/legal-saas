'use client'

import { useAuth } from '@/components/AuthProvider'
import { Users, FolderOpen, CheckSquare, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { user, loading } = useAuth()

  console.log('🔧 Dashboard: Render', { hasUser: !!user, loading })

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard (Simplified)</h1>
        <p className="text-gray-600 mt-2">Welcome to your law firm management system</p>
        {user && (
          <p className="text-sm text-gray-500 mt-1">Logged in as: {user.email}</p>
        )}
      </div>

      {/* Stats Grid - Static for now */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <FolderOpen className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">No database queries</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">Static data</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">Database disabled</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <CheckSquare className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-500">Testing mode</span>
          </div>
        </div>
      </div>

      {/* Simple message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Status</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">✅ Authentication: Working</p>
          <p className="text-sm text-gray-600">⏸️ Database queries: Disabled for testing</p>
          <p className="text-sm text-gray-600">🔧 Layout: Simplified version</p>
        </div>
      </div>
    </div>
  )
}
