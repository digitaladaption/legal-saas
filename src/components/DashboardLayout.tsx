'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, FileText, Users, Calendar, Settings, 
  MessageSquare, Bot, Mail, Bell, Briefcase, Search,
  TrendingUp, Shield, Eye, DollarSign, Brain, Zap,
  Award, Building2, ChevronDown, ChevronRight
} from 'lucide-react'

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(false)

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cases', label: 'Cases', icon: Briefcase },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/tasks', label: 'Tasks', icon: MessageSquare },
  ]

  const aiItems = [
    { href: '/agent', label: 'AI Assistant', icon: Bot },
    { href: '/agent/email-automation', label: 'Email Automation', icon: Mail },
    { href: '/agent/integrations', label: 'Integrations', icon: Zap },
  ]

  const enterpriseItems = [
    { href: '/analytics', label: 'Advanced Analytics', icon: TrendingUp },
    { href: '/audit', label: 'Audit & Compliance', icon: Eye },
    { href: '/revenue', label: 'Revenue Optimization', icon: DollarSign },
    { href: '/enterprise/security', label: 'Enterprise Security', icon: Shield },
    { href: '/enterprise/ai-insights', label: 'AI Insights', icon: Brain },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const NavItem: React.FC<{ href: string; label: string; icon: any; badge?: string }> = ({ 
    href, label, icon: Icon, badge 
  }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive(href)
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge && (
        <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">LegalOS</div>
              <div className="text-xs text-gray-500">AI Operating System</div>
            </div>
          </Link>
        </div>

        <nav className="px-4 pb-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Core Features
            </h3>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              AI Powered
            </h3>
            <div className="space-y-1">
              {aiItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>

          {/* Enterprise Features */}
          <div>
            <div className="flex items-center justify-between px-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Enterprise
              </h3>
              <button
                onClick={() => setEnterpriseExpanded(!enterpriseExpanded)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {enterpriseExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {enterpriseExpanded && (
              <div className="space-y-1">
                {enterpriseItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            )}
            
            {!enterpriseExpanded && (
              <div className="px-3 py-2">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Enterprise Ready</span>
                  </div>
                  <p className="text-xs text-blue-700 mb-2">
                    Advanced analytics, compliance, and revenue optimization
                  </p>
                  <Link 
                    href="/enterprise" 
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Explore Features →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <NavItem href="/tickets" label="Tickets" icon={MessageSquare} badge="3" />
              <NavItem href="/admin" label="Admin Panel" icon={Settings} />
            </div>
          </div>
        </nav>

        {/* Bottom Section - Upgrade Prompt */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Upgrade to Enterprise</span>
            </div>
            <p className="text-xs text-green-700 mb-2">
              Unlock advanced AI, analytics, and enterprise security
            </p>
            <Link 
              href="/enterprise/pricing" 
              className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors"
            >
              View Plans
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases, documents, clients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">John Doe</div>
                  <div className="text-xs text-gray-500">Managing Partner</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout 