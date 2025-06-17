'use client'

import { useEffect, useState } from 'react'
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save,
  X,
  FileText,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  trigger_type: 'client_welcome' | 'case_status_update' | 'deadline_reminder' | 'appointment_confirmation' | 'document_request'
  is_active: boolean
  variables: string[]
  created_at: string
  updated_at: string
}

const TRIGGER_TYPES = [
  { value: 'client_welcome', label: 'Client Welcome', icon: Users, color: 'blue' },
  { value: 'case_status_update', label: 'Case Status Update', icon: AlertCircle, color: 'green' },
  { value: 'deadline_reminder', label: 'Deadline Reminder', icon: Calendar, color: 'orange' },
  { value: 'appointment_confirmation', label: 'Appointment Confirmation', icon: Calendar, color: 'purple' },
  { value: 'document_request', label: 'Document Request', icon: FileText, color: 'indigo' }
]

const AVAILABLE_VARIABLES = [
  { key: '{{client_name}}', description: 'Client full name' },
  { key: '{{client_first_name}}', description: 'Client first name' },
  { key: '{{case_title}}', description: 'Case title' },
  { key: '{{case_status}}', description: 'Current case status' },
  { key: '{{attorney_name}}', description: 'Assigned attorney name' },
  { key: '{{firm_name}}', description: 'Law firm name' },
  { key: '{{deadline_date}}', description: 'Deadline date' },
  { key: '{{appointment_date}}', description: 'Appointment date and time' },
  { key: '{{portal_link}}', description: 'Client portal link' },
  { key: '{{document_name}}', description: 'Document name' }
]

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)

  useEffect(() => {
    fetchEmailTemplates()
  }, [])

  async function fetchEmailTemplates() {
    try {
      // Mock email templates data
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Client Welcome Email',
          subject: 'Welcome to {{firm_name}} - Your Case: {{case_title}}',
          body: `Dear {{client_name}},

Welcome to {{firm_name}}! We're pleased to represent you in your case: {{case_title}}.

Your assigned attorney is {{attorney_name}}, who will be your primary point of contact throughout this process.

You can access your case information and documents through our secure client portal: {{portal_link}}

If you have any questions, please don't hesitate to contact us.

Best regards,
{{firm_name}} Team`,
          trigger_type: 'client_welcome',
          is_active: true,
          variables: ['{{client_name}}', '{{firm_name}}', '{{case_title}}', '{{attorney_name}}', '{{portal_link}}'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Case Status Update',
          subject: 'Case Update: {{case_title}}',
          body: `Dear {{client_name}},

We wanted to update you on the progress of your case: {{case_title}}.

Status Update: Your case status has been changed to "{{case_status}}".

{{attorney_name}} will follow up with you within the next 24-48 hours with more details.

You can view the latest updates in your client portal: {{portal_link}}

Best regards,
{{attorney_name}}
{{firm_name}}`,
          trigger_type: 'case_status_update',
          is_active: true,
          variables: ['{{client_name}}', '{{case_title}}', '{{case_status}}', '{{attorney_name}}', '{{firm_name}}', '{{portal_link}}'],
          created_at: '2024-01-20T14:30:00Z',
          updated_at: '2024-02-01T09:15:00Z'
        },
        {
          id: '3',
          name: 'Deadline Reminder',
          subject: 'Important Deadline Approaching - {{case_title}}',
          body: `Dear {{client_name}},

This is a reminder about an important deadline for your case: {{case_title}}.

Deadline: {{deadline_date}}

Please ensure all required documents and information are submitted before this date. If you have any questions or need assistance, please contact {{attorney_name}} immediately.

Access your case details: {{portal_link}}

Best regards,
{{attorney_name}}
{{firm_name}}`,
          trigger_type: 'deadline_reminder',
          is_active: true,
          variables: ['{{client_name}}', '{{case_title}}', '{{deadline_date}}', '{{attorney_name}}', '{{firm_name}}', '{{portal_link}}'],
          created_at: '2024-02-01T09:00:00Z',
          updated_at: '2024-02-01T09:00:00Z'
        },
        {
          id: '4',
          name: 'Appointment Confirmation',
          subject: 'Appointment Confirmation - {{appointment_date}}',
          body: `Dear {{client_name}},

This confirms your appointment with {{attorney_name}} regarding your case: {{case_title}}.

Appointment Details:
Date & Time: {{appointment_date}}
Location: {{firm_name}} Office

Please bring any relevant documents we've requested. If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
{{firm_name}}`,
          trigger_type: 'appointment_confirmation',
          is_active: false,
          variables: ['{{client_name}}', '{{attorney_name}}', '{{case_title}}', '{{appointment_date}}', '{{firm_name}}'],
          created_at: '2024-02-10T16:00:00Z',
          updated_at: '2024-02-10T16:00:00Z'
        }
      ]

      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error fetching email templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      subject: '',
      body: '',
      trigger_type: 'client_welcome',
      is_active: true,
      variables: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setShowEditor(true)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate({ ...template })
    setShowEditor(true)
  }

  const handleSaveTemplate = () => {
    if (!editingTemplate) return

    if (editingTemplate.id) {
      // Update existing template
      setTemplates(prev => 
        prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
      )
    } else {
      // Create new template
      const newTemplate = {
        ...editingTemplate,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setTemplates(prev => [newTemplate, ...prev])
    }

    setShowEditor(false)
    setEditingTemplate(null)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    }
  }

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => 
      prev.map(t => 
        t.id === templateId ? { ...t, is_active: !t.is_active } : t
      )
    )
  }

  const getTriggerTypeInfo = (type: string) => {
    return TRIGGER_TYPES.find(t => t.value === type) || TRIGGER_TYPES[0]
  }

  const insertVariable = (variable: string) => {
    if (!editingTemplate) return
    
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newBody = editingTemplate.body.substring(0, start) + variable + editingTemplate.body.substring(end)
      
      setEditingTemplate({
        ...editingTemplate,
        body: newBody,
        variables: [...new Set([...editingTemplate.variables, variable])]
      })
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-2">Manage automated email templates for different triggers</p>
        </div>
        <button 
          onClick={handleCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => {
          const triggerInfo = getTriggerTypeInfo(template.trigger_type)
          const TriggerIcon = triggerInfo.icon
          
          return (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${triggerInfo.color}-100`}>
                    <TriggerIcon className={`h-5 w-5 text-${triggerInfo.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{triggerInfo.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                <p className="text-sm text-gray-600 truncate">{template.subject}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.slice(0, 3).map((variable) => (
                    <span key={variable} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {variable}
                    </span>
                  ))}
                  {template.variables.length > 3 && (
                    <span className="text-xs text-gray-500">+{template.variables.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Duplicate">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTemplateStatus(template.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      template.is_active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {template.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Template Editor Modal */}
      {showEditor && editingTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingTemplate.id ? 'Edit Template' : 'Create New Template'}
                  </h3>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter template name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                      <select
                        value={editingTemplate.trigger_type}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, trigger_type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {TRIGGER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                      <input
                        type="text"
                        value={editingTemplate.subject}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email subject"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                      <textarea
                        id="template-body"
                        value={editingTemplate.body}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email body..."
                      />
                    </div>
                  </div>

                  {/* Variables Panel */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Available Variables</h4>
                    <div className="space-y-2">
                      {AVAILABLE_VARIABLES.map((variable) => (
                        <div key={variable.key} className="text-sm">
                          <button
                            onClick={() => insertVariable(variable.key)}
                            className="w-full text-left p-2 rounded bg-white hover:bg-blue-50 border border-gray-200 transition-colors"
                          >
                            <code className="text-blue-600 font-mono text-xs">{variable.key}</code>
                            <div className="text-gray-500 text-xs mt-1">{variable.description}</div>
                          </button>
                        </div>
                      ))}
                    </div>
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
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setPreviewTemplate(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Subject:</div>
                    <div className="font-medium">{previewTemplate.subject}</div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{previewTemplate.body}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 