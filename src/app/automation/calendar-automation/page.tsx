'use client'

import { useEffect, useState } from 'react'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  Scale,
  Bell,
  Settings,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  X,
  Save
} from 'lucide-react'

interface CalendarAutomation {
  id: string
  name: string
  description: string
  automation_type: 'court_scheduling' | 'meeting_coordination' | 'deadline_tracking' | 'reminder_system'
  trigger: string
  schedule_pattern: string
  recipients: string[]
  is_active: boolean
  last_run: string | null
  next_run: string | null
  success_count: number
  error_count: number
  created_at: string
}

const AUTOMATION_TYPES = [
  { 
    value: 'court_scheduling', 
    label: 'Court Scheduling', 
    icon: Scale, 
    color: 'purple',
    description: 'Automatically schedule court appearances and deadlines'
  },
  { 
    value: 'meeting_coordination', 
    label: 'Meeting Coordination', 
    icon: Users, 
    color: 'blue',
    description: 'Coordinate client meetings and team availability'
  },
  { 
    value: 'deadline_tracking', 
    label: 'Deadline Tracking', 
    icon: Clock, 
    color: 'orange',
    description: 'Track and remind about important deadlines'
  },
  { 
    value: 'reminder_system', 
    label: 'Reminder System', 
    icon: Bell, 
    color: 'green',
    description: 'Send automated reminders for events and tasks'
  }
]

export default function CalendarAutomationPage() {
  const [automations, setAutomations] = useState<CalendarAutomation[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<CalendarAutomation | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    fetchCalendarAutomations()
  }, [])

  async function fetchCalendarAutomations() {
    try {
      // Mock calendar automation data
      const mockAutomations: CalendarAutomation[] = [
        {
          id: '1',
          name: 'Court Date Notifications',
          description: 'Automatically notify all parties 7 days before court hearings',
          automation_type: 'court_scheduling',
          trigger: 'court_date_created',
          schedule_pattern: '7 days before',
          recipients: ['attorneys', 'clients', 'paralegals'],
          is_active: true,
          last_run: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          next_run: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          success_count: 45,
          error_count: 1,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Client Meeting Scheduler',
          description: 'Coordinate client meetings based on attorney availability',
          automation_type: 'meeting_coordination',
          trigger: 'meeting_request',
          schedule_pattern: 'business_hours_only',
          recipients: ['attorneys', 'clients'],
          is_active: true,
          last_run: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          next_run: null,
          success_count: 28,
          error_count: 0,
          created_at: '2024-01-20T14:30:00Z'
        },
        {
          id: '3',
          name: 'Filing Deadline Alerts',
          description: 'Send alerts 3 days before filing deadlines',
          automation_type: 'deadline_tracking',
          trigger: 'deadline_approaching',
          schedule_pattern: '3 days before',
          recipients: ['attorneys', 'paralegals'],
          is_active: true,
          last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          next_run: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          success_count: 67,
          error_count: 3,
          created_at: '2024-02-01T09:00:00Z'
        },
        {
          id: '4',
          name: 'Daily Appointment Reminders',
          description: 'Send daily reminder emails for upcoming appointments',
          automation_type: 'reminder_system',
          trigger: 'daily_schedule',
          schedule_pattern: 'daily_at_9am',
          recipients: ['attorneys', 'staff'],
          is_active: false,
          last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          next_run: null,
          success_count: 156,
          error_count: 5,
          created_at: '2024-02-10T16:00:00Z'
        }
      ]

      setAutomations(mockAutomations)
    } catch (error) {
      console.error('Error fetching calendar automations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAutomation = () => {
    setEditingAutomation({
      id: '',
      name: '',
      description: '',
      automation_type: 'court_scheduling',
      trigger: '',
      schedule_pattern: '',
      recipients: [],
      is_active: true,
      last_run: null,
      next_run: null,
      success_count: 0,
      error_count: 0,
      created_at: new Date().toISOString()
    })
    setShowEditor(true)
  }

  const handleEditAutomation = (automation: CalendarAutomation) => {
    setEditingAutomation({ ...automation })
    setShowEditor(true)
  }

  const handleSaveAutomation = () => {
    if (!editingAutomation) return

    if (editingAutomation.id) {
      setAutomations(prev => 
        prev.map(a => a.id === editingAutomation.id ? editingAutomation : a)
      )
    } else {
      const newAutomation = {
        ...editingAutomation,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      setAutomations(prev => [newAutomation, ...prev])
    }

    setShowEditor(false)
    setEditingAutomation(null)
  }

  const handleDeleteAutomation = (automationId: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      setAutomations(prev => prev.filter(a => a.id !== automationId))
    }
  }

  const toggleAutomationStatus = (automationId: string) => {
    setAutomations(prev => 
      prev.map(a => 
        a.id === automationId ? { ...a, is_active: !a.is_active } : a
      )
    )
  }

  const getTypeInfo = (type: string) => {
    return AUTOMATION_TYPES.find(t => t.value === type) || AUTOMATION_TYPES[0]
  }

  const filteredAutomations = selectedType === 'all' 
    ? automations 
    : automations.filter(a => a.automation_type === selectedType)

  const stats = {
    total: automations.length,
    active: automations.filter(a => a.is_active).length,
    totalSuccess: automations.reduce((sum, a) => sum + a.success_count, 0),
    totalErrors: automations.reduce((sum, a) => sum + a.error_count, 0)
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
          <h1 className="text-3xl font-bold text-gray-900">Calendar Automation</h1>
          <p className="text-gray-600 mt-2">Automate scheduling, deadlines, and reminders</p>
        </div>
        <button 
          onClick={handleCreateAutomation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
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
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
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
          All Automations
        </button>
        {AUTOMATION_TYPES.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedType === type.value
                  ? `bg-${type.color}-600 text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </button>
          )
        })}
      </div>

      {/* Automation Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {AUTOMATION_TYPES.map((type) => {
          const Icon = type.icon
          const count = automations.filter(a => a.automation_type === type.value).length
          
          return (
            <div key={type.value} className={`bg-${type.color}-50 rounded-lg p-6 text-center`}>
              <Icon className={`h-8 w-8 mx-auto mb-3 text-${type.color}-600`} />
              <h4 className="font-semibold text-gray-900 mb-2">{type.label}</h4>
              <p className="text-sm text-gray-600 mb-3">{type.description}</p>
              <div className="text-lg font-bold text-gray-900">{count} rules</div>
            </div>
          )
        })}
      </div>

      {/* Automations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAutomations.map((automation) => {
            const typeInfo = getTypeInfo(automation.automation_type)
            const TypeIcon = typeInfo.icon
            
            return (
              <div key={automation.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${typeInfo.color}-100`}>
                      <TypeIcon className={`h-6 w-6 text-${typeInfo.color}-600`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{automation.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{automation.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>Trigger: {automation.trigger}</span>
                        <span>•</span>
                        <span>Pattern: {automation.schedule_pattern}</span>
                        <span>•</span>
                        <span>Recipients: {automation.recipients.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-500">Success: {automation.success_count}</div>
                      <div className="text-gray-500">Errors: {automation.error_count}</div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      automation.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {automation.is_active ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      {automation.is_active ? 'Active' : 'Paused'}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAutomationStatus(automation.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title={automation.is_active ? 'Pause' : 'Activate'}
                      >
                        {automation.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEditAutomation(automation)}
                        className="p-2 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAutomation(automation.id)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Automation Editor Modal */}
      {showEditor && editingAutomation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingAutomation.id ? 'Edit Automation' : 'Create New Automation'}
                  </h3>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Automation Name</label>
                    <input
                      type="text"
                      value={editingAutomation.name}
                      onChange={(e) => setEditingAutomation({ ...editingAutomation, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter automation name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Automation Type</label>
                    <select
                      value={editingAutomation.automation_type}
                      onChange={(e) => setEditingAutomation({ ...editingAutomation, automation_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {AUTOMATION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingAutomation.description}
                      onChange={(e) => setEditingAutomation({ ...editingAutomation, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what this automation does"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                      <input
                        type="text"
                        value={editingAutomation.trigger}
                        onChange={(e) => setEditingAutomation({ ...editingAutomation, trigger: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., court_date_created"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Pattern</label>
                      <input
                        type="text"
                        value={editingAutomation.schedule_pattern}
                        onChange={(e) => setEditingAutomation({ ...editingAutomation, schedule_pattern: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 7 days before"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                    <input
                      type="text"
                      value={editingAutomation.recipients.join(', ')}
                      onChange={(e) => setEditingAutomation({ 
                        ...editingAutomation, 
                        recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., attorneys, clients, paralegals (comma separated)"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAutomation}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Automation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 