'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Copy,
  Eye,
  Save,
  X,
  Scale,
  Mail,
  Building,
  Users,
  Calendar
} from 'lucide-react'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  category: 'contract' | 'letter' | 'court_filing' | 'form' | 'agreement'
  template_type: string
  content: string
  variables: string[]
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

const TEMPLATE_CATEGORIES = [
  { value: 'contract', label: 'Contracts', icon: FileText, color: 'blue' },
  { value: 'letter', label: 'Legal Letters', icon: Mail, color: 'green' },
  { value: 'court_filing', label: 'Court Filings', icon: Scale, color: 'purple' },
  { value: 'form', label: 'Forms', icon: Building, color: 'orange' },
  { value: 'agreement', label: 'Agreements', icon: Users, color: 'indigo' }
]

const DOCUMENT_VARIABLES = [
  { key: '{{client_name}}', description: 'Client full name' },
  { key: '{{client_address}}', description: 'Client address' },
  { key: '{{client_phone}}', description: 'Client phone number' },
  { key: '{{client_email}}', description: 'Client email address' },
  { key: '{{case_title}}', description: 'Case title' },
  { key: '{{case_number}}', description: 'Case number' },
  { key: '{{attorney_name}}', description: 'Attorney name' },
  { key: '{{firm_name}}', description: 'Law firm name' },
  { key: '{{firm_address}}', description: 'Law firm address' },
  { key: '{{firm_phone}}', description: 'Law firm phone' },
  { key: '{{current_date}}', description: 'Current date' },
  { key: '{{contract_amount}}', description: 'Contract amount' },
  { key: '{{due_date}}', description: 'Due date' },
  { key: '{{court_name}}', description: 'Court name' },
  { key: '{{hearing_date}}', description: 'Hearing date' }
]

export default function DocumentTemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchDocumentTemplates()
  }, [])

  async function fetchDocumentTemplates() {
    try {
      // Mock document templates data
      const mockTemplates: DocumentTemplate[] = [
        {
          id: '1',
          name: 'Service Agreement Template',
          description: 'Standard legal services agreement for new clients',
          category: 'contract',
          template_type: 'Legal Services Agreement',
          content: `LEGAL SERVICES AGREEMENT

This Legal Services Agreement ("Agreement") is entered into on {{current_date}} between {{firm_name}}, a law firm ("Attorney"), and {{client_name}} ("Client").

1. SCOPE OF SERVICES
Attorney agrees to provide legal representation to Client in the matter of: {{case_title}}

2. FEES AND PAYMENT
Client agrees to pay Attorney fees totaling {{contract_amount}} for the services described herein.

3. CLIENT RESPONSIBILITIES
Client agrees to:
- Provide all necessary documents and information
- Respond promptly to Attorney's requests
- Pay fees as agreed upon

4. ATTORNEY RESPONSIBILITIES
Attorney agrees to:
- Provide competent legal representation
- Keep Client informed of case progress
- Maintain confidentiality

5. TERMINATION
Either party may terminate this agreement with written notice.

Attorney: {{attorney_name}}
{{firm_name}}
{{firm_address}}
{{firm_phone}}

Client Signature: ___________________ Date: ___________
{{client_name}}
{{client_address}}`,
          variables: ['{{current_date}}', '{{firm_name}}', '{{client_name}}', '{{case_title}}', '{{contract_amount}}', '{{attorney_name}}', '{{firm_address}}', '{{firm_phone}}', '{{client_address}}'],
          is_active: true,
          usage_count: 47,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-02-01T14:30:00Z'
        },
        {
          id: '2',
          name: 'Demand Letter Template',
          description: 'Professional demand letter for debt collection',
          category: 'letter',
          template_type: 'Demand Letter',
          content: `{{current_date}}

{{client_name}}
{{client_address}}

RE: DEMAND FOR PAYMENT

Dear {{client_name}},

This letter serves as formal demand for payment of the outstanding amount owed in connection with {{case_title}}.

AMOUNT DUE: {{contract_amount}}
DUE DATE: {{due_date}}

Please remit payment within 10 days of receipt of this letter. Failure to respond may result in legal action being taken against you, which could result in additional costs and fees.

If you have any questions regarding this matter, please contact our office immediately.

Sincerely,

{{attorney_name}}
{{firm_name}}
{{firm_address}}
{{firm_phone}}`,
          variables: ['{{current_date}}', '{{client_name}}', '{{client_address}}', '{{case_title}}', '{{contract_amount}}', '{{due_date}}', '{{attorney_name}}', '{{firm_name}}', '{{firm_address}}', '{{firm_phone}}'],
          is_active: true,
          usage_count: 23,
          created_at: '2024-01-20T09:00:00Z',
          updated_at: '2024-01-20T09:00:00Z'
        },
        {
          id: '3',
          name: 'Motion to Continue',
          description: 'Court motion to request case continuance',
          category: 'court_filing',
          template_type: 'Motion',
          content: `{{court_name}}

{{case_title}}
Case No. {{case_number}}

MOTION TO CONTINUE

TO THE HONORABLE COURT:

NOW COMES {{attorney_name}}, attorney for the {{client_name}}, and respectfully moves this Court for a continuance of the hearing currently scheduled for {{hearing_date}}.

GROUNDS FOR CONTINUANCE:

1. [Reason for continuance to be specified]

2. This motion is made in good faith and not for purposes of delay.

3. All parties have been notified of this motion.

WHEREFORE, {{attorney_name}} respectfully requests that this Court grant this Motion to Continue and reschedule the hearing to a date convenient to the Court and all parties.

Respectfully submitted,

{{attorney_name}}
Attorney for {{client_name}}
{{firm_name}}
{{firm_address}}
{{firm_phone}}

CERTIFICATE OF SERVICE

I hereby certify that a true and correct copy of the foregoing Motion to Continue was served upon all parties of record on {{current_date}}.

{{attorney_name}}`,
          variables: ['{{court_name}}', '{{case_title}}', '{{case_number}}', '{{attorney_name}}', '{{client_name}}', '{{hearing_date}}', '{{firm_name}}', '{{firm_address}}', '{{firm_phone}}', '{{current_date}}'],
          is_active: true,
          usage_count: 12,
          created_at: '2024-02-01T11:00:00Z',
          updated_at: '2024-02-01T11:00:00Z'
        },
        {
          id: '4',
          name: 'Non-Disclosure Agreement',
          description: 'Standard NDA for client confidentiality',
          category: 'agreement',
          template_type: 'NDA',
          content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on {{current_date}} between {{firm_name}} ("Disclosing Party") and {{client_name}} ("Receiving Party").

1. CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" shall include all information relating to {{case_title}}.

2. OBLIGATIONS
Receiving Party agrees to:
- Hold all Confidential Information in strict confidence
- Not disclose any Confidential Information to third parties
- Use Confidential Information solely for the purpose of {{case_title}}

3. TERM
This Agreement shall remain in effect indefinitely.

4. GOVERNING LAW
This Agreement shall be governed by applicable state law.

{{firm_name}}

By: {{attorney_name}}
Date: {{current_date}}

{{client_name}}

Signature: ___________________
Date: ___________`,
          variables: ['{{current_date}}', '{{firm_name}}', '{{client_name}}', '{{case_title}}', '{{attorney_name}}'],
          is_active: false,
          usage_count: 8,
          created_at: '2024-02-10T15:00:00Z',
          updated_at: '2024-02-10T15:00:00Z'
        }
      ]

      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error fetching document templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      description: '',
      category: 'contract',
      template_type: '',
      content: '',
      variables: [],
      is_active: true,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setShowEditor(true)
  }

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingTemplate({ ...template })
    setShowEditor(true)
  }

  const handleSaveTemplate = () => {
    if (!editingTemplate) return

    if (editingTemplate.id) {
      setTemplates(prev => 
        prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
      )
    } else {
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

  const generateDocument = (template: DocumentTemplate) => {
    // In a real implementation, this would open a form to fill in variables
    // and generate the actual document
    alert(`Generating document: ${template.name}\n\nIn a real implementation, this would open a form to fill in variables and generate the document.`)
  }

  const getCategoryInfo = (category: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.value === category) || TEMPLATE_CATEGORIES[0]
  }

  const insertVariable = (variable: string) => {
    if (!editingTemplate) return
    
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = editingTemplate.content.substring(0, start) + variable + editingTemplate.content.substring(end)
      
      setEditingTemplate({
        ...editingTemplate,
        content: newContent,
        variables: [...new Set([...editingTemplate.variables, variable])]
      })
    }
  }

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

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
          <h1 className="text-3xl font-bold text-gray-900">Document Templates</h1>
          <p className="text-gray-600 mt-2">Manage automated document generation templates</p>
        </div>
        <button 
          onClick={handleCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Templates
        </button>
        {TEMPLATE_CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.value
                  ? `bg-${category.color}-600 text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </button>
          )
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const categoryInfo = getCategoryInfo(template.category)
          const CategoryIcon = categoryInfo.icon
          
          return (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${categoryInfo.color}-100`}>
                    <CategoryIcon className={`h-5 w-5 text-${categoryInfo.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.template_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Usage: {template.usage_count} times</span>
                  <span>{template.variables.length} variables</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.variables.slice(0, 3).map((variable) => (
                    <span key={variable} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
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
                    onClick={() => generateDocument(template)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Generate
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
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Form */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                        <input
                          type="text"
                          value={editingTemplate.template_type}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, template_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Service Agreement, Demand Letter"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editingTemplate.category}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {TEMPLATE_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={editingTemplate.description}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of the template"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
                      <textarea
                        id="template-content"
                        value={editingTemplate.content}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Enter template content with variables..."
                      />
                    </div>
                  </div>

                  {/* Variables Panel */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Available Variables</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {DOCUMENT_VARIABLES.map((variable) => (
                        <div key={variable.key} className="text-sm">
                          <button
                            onClick={() => insertVariable(variable.key)}
                            className="w-full text-left p-2 rounded bg-white hover:bg-blue-50 border border-gray-200 transition-colors"
                          >
                            <code className="text-blue-600 font-mono text-xs block">{variable.key}</code>
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
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Document Preview</h3>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 bg-white max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{previewTemplate.content}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 