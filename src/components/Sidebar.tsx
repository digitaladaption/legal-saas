'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  FolderOpen,
  Users,
  FileText,
  Calendar,
  Settings,
  Scale,
  BarChart3,
  CheckSquare,
  LogOut,
  User,
  Shield,
  Bot,
  Brain,
  MessageSquare,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './AuthProvider'
import { RoleGuard } from '@/lib/rbac'
import RealTimeUpdates from './RealTimeUpdates'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    permission: null
  },
  {
    name: 'Cases',
    href: '/cases',
    icon: FolderOpen,
    permission: null
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
    permission: null
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
    permission: null
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    permission: null
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    permission: null
  },
  {
    name: 'Tickets',
    href: '/tickets',
    icon: FileText,
    permission: null
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'can_view_financials'
  },
  {
    name: 'Automation',
    href: '/automation',
    icon: Bot,
    permission: null
  },
  {
    name: 'AI & ML',
    href: '/ai',
    icon: Brain,
    permission: null
  },
  {
    name: 'AI Agent',
    href: '/agent',
    icon: MessageSquare,
    permission: null
  },
  {
    name: 'Integrations',
    href: '/agent/integrations',
    icon: Zap,
    permission: null
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Shield,
    permission: 'can_access_admin'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: null
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { userProfile, signOut } = useAuth()

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true
    return RoleGuard.canAccessAdmin(userProfile) || 
           RoleGuard.canViewFinancials(userProfile)
  })

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center">
          <Scale className="h-8 w-8 text-blue-600" />
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">LawFirmAI</h1>
            <p className="text-sm text-gray-500">Case Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5',
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.display_name || userProfile?.email || 'User'}
              </p>
              {userProfile?.primary_role && (
                <p className="text-xs text-gray-500 truncate">
                  {userProfile.primary_role.display_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RealTimeUpdates />
            <button
              onClick={handleSignOut}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Role badges */}
        {userProfile?.user_roles && userProfile.user_roles.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs">
            {userProfile.user_roles.slice(0, 2).map((userRole) => (
              <span
                key={userRole.id}
                className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800"
              >
                {userRole.role?.department}
              </span>
            ))}
            {userProfile.user_roles.length > 2 && (
              <span className="text-gray-500">
                +{userProfile.user_roles.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 