'use client'

import { useEffect, useState } from 'react'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Scale,
  Search,
  Calendar,
  Globe,
  Database,
  Zap,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  ExternalLink
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'billing' | 'court_filing' | 'legal_research' | 'calendar'
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  description: string
  api_endpoint?: string
  credentials_configured: boolean
  last_sync?: string
  sync_frequency: string
  features: string[]
  webhook_url?: string
  created_at: string
  updated_at: string
}

const INTEGRATION_TYPES = [
  {
    type: 'billing',
    name: 'Billing Systems',
    icon: DollarSign,
    description: 'Connect with QuickBooks, Xero, and other accounting systems',
    providers: ['QuickBooks', 'Xero', 'FreshBooks', 'Bill4Time'],
    color: 'bg-green-100 text-green-800'
  },
  {
    type: 'court_filing',
    name: 'Court Filing',
    icon: Scale,
    description: 'Integrate with CM/ECF and state court e-filing systems',
    providers: ['CM/ECF', 'Texas Online', 'NY Courts', 'CA Courts'],
    color: 'bg-blue-100 text-blue-800'
  },
  {
    type: 'legal_research',
    name: 'Legal Research',
    icon: Search,
    description: 'Access Westlaw, LexisNexis, and legal databases',
    providers: ['Westlaw', 'LexisNexis', 'Fastcase', 'Google Scholar'],
    color: 'bg-purple-100 text-purple-800'
  },
  {
    type: 'calendar',
    name: 'Calendar Systems',
    icon: Calendar,
    description: 'Sync with Google Calendar, Outlook, and scheduling tools',
    providers: ['Google Calendar', 'Outlook', 'Apple Calendar', 'CalDAV'],
    color: 'bg-orange-100 text-orange-800'
  }
]

const POPULAR_INTEGRATIONS = [
  // Billing Integrations
  { type: 'billing', provider: 'QuickBooks Online', description: 'Sync client billing and payments' },
  { type: 'billing', provider: 'Xero', description: 'Accounting and invoice management' },
  { type: 'billing', provider: 'FreshBooks', description: 'Time tracking and billing' },
  { type: 'billing', provider: 'Bill4Time', description: 'Legal billing and time tracking' },
  
  // Court Filing Integrations
  { type: 'court_filing', provider: 'CM/ECF', description: 'Federal court electronic filing' },
  { type: 'court_filing', provider: 'TexasOnline', description: 'Texas state court filing' },
  { type: 'court_filing', provider: 'New York Courts E-Filing', description: 'NY state court system' },
  { type: 'court_filing', provider: 'California Courts', description: 'CA court e-filing portal' },
  
  // Legal Research Integrations
  { type: 'legal_research', provider: 'Westlaw', description: 'Legal research and case law' },
  { type: 'legal_research', provider: 'LexisNexis', description: 'Legal database and analytics' },
  { type: 'legal_research', provider: 'Fastcase', description: 'Affordable legal research' },
  { type: 'legal_research', provider: 'Google Scholar', description: 'Free legal research' },
  
  // Calendar Integrations
  { type: 'calendar', provider: 'Microsoft Outlook', description: 'Email and calendar sync' },
  { type: 'calendar', provider: 'Google Calendar', description: 'Google Workspace integration' },
  { type: 'calendar', provider: 'Calendly', description: 'Client scheduling automation' },
  { type: 'calendar', provider: 'Acuity Scheduling', description: 'Advanced scheduling features' }
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupIntegration, setSetupIntegration] = useState<any>(null)
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      // Mock data - in real app would fetch from API
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'QuickBooks Online',
          type: 'billing',
          provider: 'QuickBooks',
          status: 'connected',
          description: 'Sync invoices and payments with QuickBooks Online',
          api_endpoint: 'https://quickbooks.api.intuit.com',
          credentials_configured: true,
          last_sync: '2024-06-15T10:30:00Z',
          sync_frequency: 'hourly',
          features: ['Invoice Creation', 'Payment Tracking', 'Client Sync', 'Expense Management'],
          webhook_url: 'https://api.lawfirm.com/webhooks/quickbooks',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-06-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'CM/ECF Integration',
          type: 'court_filing',
          provider: 'CM/ECF',
          status: 'connected',
          description: 'File documents electronically with federal courts',
          api_endpoint: 'https://ecf.uscourts.gov',
          credentials_configured: true,
          last_sync: '2024-06-14T16:45:00Z',
          sync_frequency: 'daily',
          features: ['Document Filing', 'Case Status Updates', 'Docket Retrieval', 'Service Lists'],
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-06-14T16:45:00Z'
        },
        {
          id: '3',
          name: 'Westlaw Research',
          type: 'legal_research',
          provider: 'Westlaw',
          status: 'connected',
          description: 'Access legal research and case law databases',
          api_endpoint: 'https://api.westlaw.com',
          credentials_configured: true,
          sync_frequency: 'manual',
          features: ['Case Law Search', 'Shepardizing', 'Statute Research', 'Form Library'],
          created_at: '2024-01-20T00:00:00Z',
          updated_at: '2024-06-10T12:00:00Z'
        },
        {
          id: '4',
          name: 'Google Calendar',
          type: 'calendar',
          provider: 'Google Calendar',
          status: 'error',
          description: 'Sync appointments and court dates with Google Calendar',
          api_endpoint: 'https://www.googleapis.com/calendar/v3',
          credentials_configured: false,
          sync_frequency: 'real-time',
          features: ['Event Sync', 'Reminder Notifications', 'Availability Checking', 'Meeting Invites'],
          created_at: '2024-03-01T00:00:00Z',
          updated_at: '2024-06-01T09:15:00Z'
        }
      ]
      
      setIntegrations(mockIntegrations)
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'disconnected':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'pending':
        return <RefreshCw className="h-4 w-4" />
      case 'disconnected':
        return <X className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeInfo = (type: string) => {
    return INTEGRATION_TYPES.find(t => t.type === type) || INTEGRATION_TYPES[0]
  }

  const filteredIntegrations = integrations.filter(integration => 
    selectedType === 'all' || integration.type === selectedType
  )

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    pending: integrations.filter(i => i.status === 'pending').length,
    errors: integrations.filter(i => i.status === 'error').length
  }

  const handleSetupIntegration = (provider: any) => {
    setSetupIntegration(provider)
    setShowSetupModal(true)
  }

  const handleTestConnection = async (integrationId: string) => {
    setConfiguring(integrationId)
    // Simulate API test
    setTimeout(() => {
      setConfiguring(null)
      // Update integration status
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected', last_sync: new Date().toISOString() }
          : integration
      ))
    }, 2000)
  }

  const testConnection = async (integration: Integration) => {
    try {
      console.log(`Testing connection for ${integration.name}`)
      // Mock test - would actually test API connection
      alert(`Testing connection to ${integration.name}... Connection successful!`)
    } catch (error) {
      alert(`Connection test failed: ${error}`)
    }
  }

  const syncNow = async (integration: Integration) => {
    try {
      console.log(`Syncing ${integration.name}`)
      // Mock sync
      alert(`Syncing ${integration.name}... Sync completed successfully!`)
    } catch (error) {
      alert(`Sync failed: ${error}`)
    }
  }

  const toggleCredentialsVisibility = (integrationId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }))
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Integration Systems</h1>
          <p className="text-gray-600 mt-2">Connect external services and automate workflows</p>
        </div>
        <button 
          onClick={() => setShowSetupModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Integration
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Integrations
        </button>
        {INTEGRATION_TYPES.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.type}
              onClick={() => setSelectedType(type.type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedType === type.type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {type.name}
            </button>
          )
        })}
      </div>

      {/* Integrations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configured Integrations</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredIntegrations.length > 0 ? (
            filteredIntegrations.map((integration) => {
              const typeInfo = getTypeInfo(integration.type)
              const TypeIcon = typeInfo.icon
              
              return (
                <div key={integration.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <TypeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>Provider: {integration.provider}</span>
                          <span>•</span>
                          <span>Sync: {integration.sync_frequency}</span>
                          {integration.last_sync && (
                            <>
                              <span>•</span>
                              <span>Last sync: {new Date(integration.last_sync).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {integration.features?.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)}
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestConnection(integration.id)}
                          disabled={configuring === integration.id}
                          className="p-2 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                          title="Test Connection"
                        >
                          {configuring === integration.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="Configure"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center">
              <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations configured</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first integration</p>
              <button 
                onClick={() => setShowSetupModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Integration
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Available Integrations Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Integration</h2>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Integration Categories */}
              {INTEGRATION_TYPES.map((category) => {
                const CategoryIcon = category.icon
                const categoryIntegrations = POPULAR_INTEGRATIONS.filter(p => p.type === category.type)
                
                return (
                  <div key={category.type} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <CategoryIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryIntegrations.map((provider, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{provider.provider}</h4>
                            <button
                              onClick={() => handleSetupIntegration(provider)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Setup
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">{provider.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 