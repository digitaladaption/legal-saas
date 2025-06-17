'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  Calendar, 
  FileText, 
  Settings, 
  Plus, 
  Play, 
  Pause, 
  Edit,
  Trash2,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Bot,
  Zap,
  Link as LinkIcon,
  Brain
} from 'lucide-react'

interface AutomationRule {
  id: string
  name: string
  type: 'email' | 'calendar' | 'document'
  trigger: string
  status: 'active' | 'paused' | 'draft'
  last_run: string | null
  next_run: string | null
  success_count: number
  error_count: number
  created_at: string
}

export default function AutomationPage() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'email' | 'calendar' | 'documents'>('overview')

  useEffect(() => {
    fetchAutomationRules()
  }, [])

  async function fetchAutomationRules() {
    try {
      // Mock automation rules data for demo
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          name: 'New Client Welcome Email',
          type: 'email',
          trigger: 'client_created',
          status: 'active',
          last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          next_run: null,
          success_count: 127,
          error_count: 2,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Case Status Update Notification',
          type: 'email',
          trigger: 'case_status_changed',
          status: 'active',
          last_run: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          next_run: null,
          success_count: 89,
          error_count: 1,
          created_at: '2024-01-20T14:30:00Z'
        },
        {
          id: '3',
          name: 'Court Deadline Reminder',
          type: 'email',
          trigger: 'deadline_approaching',
          status: 'active',
          last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          success_count: 56,
          error_count: 0,
          created_at: '2024-02-01T09:00:00Z'
        },
        {
          id: '4',
          name: 'Weekly Calendar Sync',
          type: 'calendar',
          trigger: 'weekly_schedule',
          status: 'active',
          last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          next_run: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          success_count: 12,
          error_count: 0,
          created_at: '2024-02-10T08:00:00Z'
        },
        {
          id: '5',
          name: 'Contract Template Generator',
          type: 'document',
          trigger: 'contract_request',
          status: 'draft',
          last_run: null,
          next_run: null,
          success_count: 0,
          error_count: 0,
          created_at: '2024-06-09T16:00:00Z'
        }
      ]

      setAutomationRules(mockRules)
    } catch (error) {
      console.error('Error fetching automation rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'paused':
        return <Pause className="h-4 w-4" />
      case 'draft':
        return <Edit className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-blue-500" />
      case 'calendar':
        return <Calendar className="h-5 w-5 text-green-500" />
      case 'document':
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <Bot className="h-5 w-5 text-gray-500" />
    }
  }

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
          : rule
      )
    )
  }

  const stats = {
    totalRules: automationRules.length,
    activeRules: automationRules.filter(r => r.status === 'active').length,
    totalSuccess: automationRules.reduce((sum, r) => sum + r.success_count, 0),
    totalErrors: automationRules.reduce((sum, r) => sum + r.error_count, 0)
  }

  const automationModules = [
    {
      id: 'integrations',
      title: 'Integration Systems',
      description: 'Connect with external services like billing, court filing, legal research, and calendar systems',
      icon: <LinkIcon className="w-8 h-8" />,
      href: '/automation/integrations',
      status: 'active',
      features: ['Billing Integration', 'Court Filing', 'Legal Research', 'Calendar Sync'],
      connections: 12
    },
    {
      id: 'workflows',
      title: 'Workflow Engine',
      description: 'Automate business processes with custom rules, document generation, and case progression triggers',
      icon: <Settings className="w-8 h-8" />,
      href: '/automation/workflows',
      status: 'active',
      features: ['Business Rules', 'Document Generation', 'Case Progression', 'Custom Scripts'],
      connections: 8
    },
    {
      id: 'ai-automation',
      title: 'AI Automation',
      description: 'Leverage artificial intelligence for document review, contract analysis, and predictive insights',
      icon: <Brain className="w-8 h-8" />,
      href: '/automation/ai',
      status: 'coming-soon',
      features: ['Document Review', 'Contract Analysis', 'Predictive Analytics', 'Smart Recommendations'],
      connections: 0
    }
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-600 mt-2">Automate routine tasks and workflows</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" />
          New Automation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRules}</p>
            </div>
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
            </div>
            <Zap className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful Runs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalSuccess}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalErrors}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Bot },
              { id: 'email', name: 'Email Automation', icon: Mail },
              { id: 'calendar', name: 'Calendar Automation', icon: Calendar },
              { id: 'documents', name: 'Document Automation', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">All Automation Rules</h3>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      {getTypeIcon(rule.type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Trigger: {rule.trigger}</span>
                          <span>•</span>
                          <span>Success: {rule.success_count}</span>
                          <span>•</span>
                          <span>Errors: {rule.error_count}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(rule.status)}`}>
                        {getStatusIcon(rule.status)}
                        {rule.status}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title={rule.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Automation</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Email Rule
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Welcome Emails</h4>
                  <p className="text-sm text-gray-600">Automatically send welcome emails to new clients</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Configure
                  </button>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Status Updates</h4>
                  <p className="text-sm text-gray-600">Notify clients when case status changes</p>
                  <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Configure
                  </button>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-orange-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Deadline Reminders</h4>
                  <p className="text-sm text-gray-600">Alert teams about approaching deadlines</p>
                  <button className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700">
                    Configure
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {automationRules.filter(rule => rule.type === 'email').map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-500">Trigger: {rule.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Last sent: {rule.last_run ? new Date(rule.last_run).toLocaleString() : 'Never'}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                        {rule.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Calendar Automation</h3>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Calendar Rule
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 rounded-lg p-6">
                  <Calendar className="h-8 w-8 mb-3 text-green-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Court Date Scheduling</h4>
                  <p className="text-sm text-gray-600 mb-4">Automatically schedule court appearances and send calendar invites</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Set Up
                  </button>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <Users className="h-8 w-8 mb-3 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Meeting Coordination</h4>
                  <p className="text-sm text-gray-600 mb-4">Coordinate client meetings and team availability</p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                    Set Up
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {automationRules.filter(rule => rule.type === 'calendar').map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-500">Next run: {rule.next_run ? new Date(rule.next_run).toLocaleString() : 'Not scheduled'}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                      {rule.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Document Automation</h3>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Document Rule
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Contract Templates</h4>
                  <p className="text-sm text-gray-600">Generate contracts from templates</p>
                  <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                    Configure
                  </button>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Letters</h4>
                  <p className="text-sm text-gray-600">Automated letter generation</p>
                  <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                    Configure
                  </button>
                </div>
                
                <div className="bg-pink-50 rounded-lg p-6 text-center">
                  <Settings className="h-8 w-8 mx-auto mb-3 text-pink-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Court Filings</h4>
                  <p className="text-sm text-gray-600">Prepare filing documents</p>
                  <button className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">
                    Configure
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {automationRules.filter(rule => rule.type === 'document').map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-500">Trigger: {rule.trigger}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                      {rule.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automation Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automationModules.map((module) => (
          <Link
            key={module.id}
            href={module.href}
            className="group block"
          >
            <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-600 group-hover:text-blue-700">
                  {module.icon}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  module.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {module.status === 'active' ? 'Active' : 'Coming Soon'}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                {module.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {module.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Connected Services</span>
                  <span className="font-medium text-gray-900">{module.connections}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {module.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 