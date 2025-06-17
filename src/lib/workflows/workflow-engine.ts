/**
 * Workflow Engine
 * Handles business rule automation, document generation, case progression, and custom scripts
 */

export interface WorkflowRule {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  enabled: boolean
  priority: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface WorkflowTrigger {
  type: 'case_created' | 'case_updated' | 'task_completed' | 'document_uploaded' | 'deadline_approaching' | 'payment_received' | 'custom_event'
  event: string
  filters?: Record<string, any>
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists'
  value: any
  logical?: 'AND' | 'OR'
}

export interface WorkflowAction {
  type: 'send_email' | 'create_task' | 'update_case' | 'generate_document' | 'create_calendar_event' | 'send_notification' | 'run_script' | 'webhook'
  config: Record<string, any>
  delay?: number // seconds
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  trigger_data: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  error_message?: string
  execution_log: WorkflowStep[]
}

export interface WorkflowStep {
  step: string
  action: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  result?: any
  error?: string
  timestamp: string
}

export interface DocumentTemplate {
  id: string
  name: string
  description: string
  template_type: 'contract' | 'letter' | 'motion' | 'brief' | 'notice' | 'invoice' | 'custom'
  template_content: string
  variables: TemplateVariable[]
  output_format: 'pdf' | 'docx' | 'html'
  created_by: string
  created_at: string
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'list'
  required: boolean
  default_value?: any
  description?: string
}

export class WorkflowEngine {
  private rules: Map<string, WorkflowRule> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private templates: Map<string, DocumentTemplate> = new Map()

  constructor() {
    this.initializeDefaultRules()
    this.initializeDefaultTemplates()
  }

  /**
   * Register a new workflow rule
   */
  registerRule(rule: WorkflowRule): void {
    this.rules.set(rule.id, rule)
    console.log(`Workflow rule registered: ${rule.name}`)
  }

  /**
   * Trigger workflow execution based on an event
   */
  async triggerWorkflows(eventType: string, eventData: any): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = []
    
    // Find all rules that match this trigger
    const matchingRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled && rule.trigger.type === eventType)
      .sort((a, b) => b.priority - a.priority) // Higher priority first

    for (const rule of matchingRules) {
      try {
        // Check if conditions are met
        if (await this.evaluateConditions(rule.conditions, eventData)) {
          const execution = await this.executeWorkflow(rule, eventData)
          executions.push(execution)
        }
      } catch (error) {
        console.error(`Error executing workflow ${rule.name}:`, error)
      }
    }

    return executions
  }

  /**
   * Execute a specific workflow rule
   */
  async executeWorkflow(rule: WorkflowRule, triggerData: any): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflow_id: rule.id,
      trigger_data: triggerData,
      status: 'pending',
      started_at: new Date().toISOString(),
      execution_log: []
    }

    this.executions.set(execution.id, execution)

    try {
      execution.status = 'running'
      
      // Execute each action in sequence
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i]
        
        const step: WorkflowStep = {
          step: `action_${i + 1}`,
          action: action.type,
          status: 'running',
          timestamp: new Date().toISOString()
        }
        
        execution.execution_log.push(step)

        try {
          // Apply delay if specified
          if (action.delay && action.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, action.delay! * 1000))
          }

          // Execute the action
          const result = await this.executeAction(action, triggerData, execution)
          
          step.status = 'completed'
          step.result = result
        } catch (actionError) {
          step.status = 'failed'
          step.error = actionError instanceof Error ? actionError.message : 'Unknown error'
          console.error(`Action failed: ${action.type}`, actionError)
          
          // Stop execution on action failure
          execution.status = 'failed'
          execution.error_message = step.error
          break
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed'
      }
      
      execution.completed_at = new Date().toISOString()
      
    } catch (error) {
      execution.status = 'failed'
      execution.error_message = error instanceof Error ? error.message : 'Unknown error'
      execution.completed_at = new Date().toISOString()
    }

    return execution
  }

  /**
   * Execute a specific workflow action
   */
  private async executeAction(action: WorkflowAction, triggerData: any, execution: WorkflowExecution): Promise<any> {
    switch (action.type) {
      case 'send_email':
        return this.sendEmail(action.config, triggerData)
      case 'create_task':
        return this.createTask(action.config, triggerData)
      case 'update_case':
        return this.updateCase(action.config, triggerData)
      case 'generate_document':
        return this.generateDocument(action.config, triggerData)
      case 'create_calendar_event':
        return this.createCalendarEvent(action.config, triggerData)
      case 'send_notification':
        return this.sendNotification(action.config, triggerData)
      case 'run_script':
        return this.runCustomScript(action.config, triggerData, execution)
      case 'webhook':
        return this.callWebhook(action.config, triggerData)
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  /**
   * Evaluate workflow conditions
   */
  private async evaluateConditions(conditions: WorkflowCondition[], data: any): Promise<boolean> {
    if (conditions.length === 0) return true

    let result = true
    let currentLogical: 'AND' | 'OR' = 'AND'

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, data)
      
      if (currentLogical === 'AND') {
        result = result && conditionResult
      } else {
        result = result || conditionResult
      }
      
      currentLogical = condition.logical || 'AND'
    }

    return result
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: WorkflowCondition, data: any): boolean {
    const fieldValue = this.getNestedValue(data, condition.field)
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'contains':
        return String(fieldValue).includes(String(condition.value))
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)
      case 'less_than':
        return Number(fieldValue) < Number(condition.value)
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null
      default:
        return false
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Generate document from template
   */
  async generateDocument(config: any, data: any): Promise<any> {
    const templateId = config.template_id
    const template = this.templates.get(templateId)
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    let content = template.template_content
    
    // Replace variables in template
    for (const variable of template.variables) {
      const value = this.getNestedValue(data, variable.name) || variable.default_value || ''
      const regex = new RegExp(`{{${variable.name}}}`, 'g')
      content = content.replace(regex, String(value))
    }

    const document = {
      id: `doc_${Date.now()}`,
      template_id: templateId,
      name: config.document_name || `${template.name} - ${new Date().toLocaleDateString()}`,
      content: content,
      format: template.output_format,
      generated_at: new Date().toISOString(),
      data_used: data
    }

    console.log(`Document generated: ${document.name}`)
    return document
  }

  // Action implementations
  private async sendEmail(config: any, data: any): Promise<any> {
    console.log('Sending email:', { to: config.to, subject: config.subject })
    return { sent: true, message_id: `email_${Date.now()}` }
  }

  private async createTask(config: any, data: any): Promise<any> {
    const task = {
      id: `task_${Date.now()}`,
      title: config.title,
      description: config.description,
      created_at: new Date().toISOString()
    }
    console.log('Task created:', task)
    return task
  }

  private async updateCase(config: any, data: any): Promise<any> {
    console.log('Updating case:', { case_id: config.case_id, updates: config.updates })
    return { updated: true, case_id: config.case_id }
  }

  private async createCalendarEvent(config: any, data: any): Promise<any> {
    const event = {
      id: `event_${Date.now()}`,
      title: config.title,
      start_time: config.start_time,
      created_at: new Date().toISOString()
    }
    console.log('Calendar event created:', event)
    return event
  }

  private async sendNotification(config: any, data: any): Promise<any> {
    console.log('Sending notification:', { type: config.type, message: config.message })
    return { sent: true, notification_id: `notif_${Date.now()}` }
  }

  private async runCustomScript(config: any, data: any, execution: WorkflowExecution): Promise<any> {
    console.log('Running custom script:', { script: config.script_name })
    return { executed: true, script: config.script_name }
  }

  private async callWebhook(config: any, data: any): Promise<any> {
    console.log('Calling webhook:', { url: config.url, method: config.method || 'POST' })
    return { called: true, status: 200 }
  }

  /**
   * Initialize default workflow rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: WorkflowRule[] = [
      {
        id: 'new_case_welcome',
        name: 'New Case Welcome Email',
        description: 'Send welcome email when a new case is created',
        trigger: { type: 'case_created', event: 'case.created' },
        conditions: [],
        actions: [
          {
            type: 'send_email',
            config: {
              to: '{{client.email}}',
              subject: 'Welcome - Your Case Has Been Created',
              template: 'case_welcome'
            }
          }
        ],
        enabled: true,
        priority: 100,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    defaultRules.forEach(rule => this.registerRule(rule))
  }

  /**
   * Initialize default document templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: DocumentTemplate[] = [
      {
        id: 'engagement_letter',
        name: 'Engagement Letter',
        description: 'Standard client engagement letter',
        template_type: 'contract',
        template_content: `ENGAGEMENT LETTER

Date: {{current_date}}

{{client.name}}
{{client.address}}

Dear {{client.name}},

This letter confirms our agreement regarding legal representation in the matter of {{case.title}}.

Sincerely,
{{attorney.name}}`,
        variables: [
          { name: 'current_date', type: 'date', required: true },
          { name: 'client.name', type: 'text', required: true },
          { name: 'client.address', type: 'text', required: true },
          { name: 'case.title', type: 'text', required: true },
          { name: 'attorney.name', type: 'text', required: true }
        ],
        output_format: 'pdf',
        created_by: 'system',
        created_at: new Date().toISOString()
      }
    ]

    defaultTemplates.forEach(template => this.templates.set(template.id, template))
  }

  /**
   * Get workflow execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId)
  }

  /**
   * Get all executions for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(exec => exec.workflow_id === workflowId)
  }

  /**
   * Get all available templates
   */
  getTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get all workflow rules
   */
  getRules(): WorkflowRule[] {
    return Array.from(this.rules.values())
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine()

// Export factory function
export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine()
}
