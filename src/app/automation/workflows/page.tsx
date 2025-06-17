'use client'

import { useEffect, useState } from 'react'
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  FileText,
  Mail,
  Calendar,
  Bell,
  Code,
  Webhook,
  Clock,
  Filter,
  Eye,
  MoreVertical
} from 'lucide-react'

import { WorkflowRule, WorkflowExecution, DocumentTemplate, workflowEngine } from '@/lib/workflows/workflow-engine'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'rules' | 'executions' | 'templates'>('rules')
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null)

  useEffect(() => {
    fetchWorkflowData()
  }, [])

  const fetchWorkflowData = async () => {
    try {
      setLoading(true)
      
      // Get data from workflow engine
      const rulesData = workflowEngine.getRules()
      const templatesData = workflowEngine.getTemplates()
      
      // Mock execution data
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec_1',
          workflow_id: 'new_case_welcome',
          trigger_data: {
            case_id: 'case_123',
            client: { name: 'John Smith', email: 'john@example.com' },
            case: { title: 'Contract Dispute' }
          },
          status: 'completed',
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000).toISOString(),
          execution_log: [
            {
              step: 'action_1',
              action: 'send_email',
              status: 'completed',
              result: { sent: true, message_id: 'email_123' },
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'exec_2',
          workflow_id: 'new_case_welcome',
          trigger_data: {
            case_id: 'case_124',
            client: { name: 'Jane Doe', email: 'jane@example.com' },
            case: { title: 'Employment Issue' }
          },
          status: 'failed',
          started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15 * 1000).toISOString(),
          error_message: 'Failed to send email: Invalid email address',
          execution_log: [
            {
              step: 'action_1',
              action: 'send_email',
              status: 'failed',
              error: 'Invalid email address',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]

      setWorkflows(rulesData)
      setExecutions(mockExecutions)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error fetching workflow data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email':
        return <Mail className="w-4 h-4" />
      case 'create_task':
        return <CheckCircle className="w-4 h-4" />
      case 'update_case':
        return <Edit className="w-4 h-4" />
      case 'generate_document':
        return <FileText className="w-4 h-4" />
      case 'create_calendar_event':
        return <Calendar className="w-4 h-4" />
      case 'send_notification':
        return <Bell className="w-4 h-4" />
      case 'run_script':
        return <Code className="w-4 h-4" />
      case 'webhook':
        return <Webhook className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const toggleWorkflow = async (workflowId: string, enabled: boolean) => {
    try {
      // Mock toggle - in real app would call API
      setWorkflows(prev => 
        prev.map(workflow => 
          workflow.id === workflowId 
            ? { ...workflow, enabled: !enabled, updated_at: new Date().toISOString() }
            : workflow
        )
      )
      console.log(`Workflow ${workflowId} ${enabled ? 'disabled' : 'enabled'}`)
    } catch (error) {
      console.error('Error toggling workflow:', error)
    }
  }

  const testWorkflow = async (workflow: WorkflowRule) => {
    try {
      // Mock test execution
      const testData = {
        case_id: 'test_case',
        client: { name: 'Test Client', email: 'test@example.com' },
        case: { title: 'Test Case' }
      }

      const execution = await workflowEngine.executeWorkflow(workflow, testData)
      
      alert(`Workflow test ${execution.status === 'completed' ? 'passed' : 'failed'}`)
      
      // Refresh executions
      fetchWorkflowData()
    } catch (error) {
      alert(`Workflow test failed: ${error}`)
    }
  }

  const generateDocument = async (template: DocumentTemplate) => {
    try {
      const testData = {
        current_date: new Date().toLocaleDateString(),
        'client.name': 'John Smith',
        'client.address': '123 Main St, City, State 12345',
        'case.title': 'Contract Dispute Matter',
        'attorney.name': 'Attorney Johnson'
      }

      const document = await workflowEngine.generateDocument(
        { template_id: template.id, document_name: `Test ${template.name}` },
        testData
      )

      alert(`Document generated: ${document.name}`)
    } catch (error) {
      alert(`Document generation failed: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading workflows...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Engine</h1>
          <p className="text-gray-600">
            Automate business processes with rules, document generation, and custom scripts
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Workflow Rules ({workflows.length})
          </button>
          <button
            onClick={() => setSelectedTab('executions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'executions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Execution History ({executions.length})
          </button>
          <button
            onClick={() => setSelectedTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Document Templates ({templates.length})
          </button>
        </nav>
      </div>

      {/* Workflow Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Workflow Rules</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="text-xs text-gray-500">Priority: {workflow.priority}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                    
                    {/* Trigger */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        <span>Trigger: {workflow.trigger.type.replace('_', ' ')}</span>
                      </div>
                      {workflow.conditions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Filter className="w-4 h-4" />
                          <span>{workflow.conditions.length} condition(s)</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {workflow.actions.map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {getActionIcon(action.type)}
                          <span>{action.type.replace('_', ' ')}</span>
                          {action.delay && action.delay > 0 && (
                            <span className="text-blue-500">
                              ({action.delay}s delay)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testWorkflow(workflow)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="Test Workflow"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWorkflow(workflow.id, workflow.enabled)}
                      className={`p-2 rounded-lg ${
                        workflow.enabled
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                      title={workflow.enabled ? 'Disable Workflow' : 'Enable Workflow'}
                    >
                      {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setSelectedWorkflow(workflow)}
                      className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution History Tab */}
      {selectedTab === 'executions' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Execution History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {executions.map((execution) => {
              const workflow = workflows.find(w => w.id === execution.workflow_id)
              return (
                <div key={execution.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {workflow?.name || 'Unknown Workflow'}
                        </h3>
                        {getStatusBadge(execution.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(execution.started_at).toLocaleString()}
                        </span>
                      </div>
                      
                      {execution.error_message && (
                        <p className="text-sm text-red-600 mb-2">
                          Error: {execution.error_message}
                        </p>
                      )}

                      <div className="text-sm text-gray-600 mb-3">
                        <span>Duration: </span>
                        {execution.completed_at ? (
                          <span>
                            {Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s
                          </span>
                        ) : (
                          <span>Running...</span>
                        )}
                      </div>

                      {/* Execution Log */}
                      <div className="space-y-1">
                        {execution.execution_log.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${
                              step.status === 'completed' ? 'bg-green-500' :
                              step.status === 'failed' ? 'bg-red-500' :
                              step.status === 'running' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`} />
                            <span className="text-gray-600">{step.action.replace('_', ' ')}</span>
                            {step.status === 'failed' && step.error && (
                              <span className="text-red-600">- {step.error}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Document Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Document Templates</h2>
            <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              New Template
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {template.template_type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {template.output_format.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{template.variables.length} variable(s)</span>
                      <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateDocument(template)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="Generate Test Document"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 