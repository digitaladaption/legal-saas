import { NextRequest, NextResponse } from 'next/server'
import { workflowEngine, WorkflowRule, WorkflowExecution } from '@/lib/workflows/workflow-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'rules', 'executions', 'templates'
    const workflowId = searchParams.get('workflow_id')
    
    switch (type) {
      case 'rules':
        const rules = workflowEngine.getRules()
        return NextResponse.json({ success: true, data: rules })
      
      case 'executions':
        if (workflowId) {
          const executions = workflowEngine.getWorkflowExecutions(workflowId)
          return NextResponse.json({ success: true, data: executions })
        }
        // Return all executions (in real app, this would be paginated)
        return NextResponse.json({ success: true, data: [] })
      
      case 'templates':
        const templates = workflowEngine.getTemplates()
        return NextResponse.json({ success: true, data: templates })
      
      default:
        // Return overview
        const overview = {
          rules: workflowEngine.getRules(),
          templates: workflowEngine.getTemplates(),
          stats: {
            total_rules: workflowEngine.getRules().length,
            active_rules: workflowEngine.getRules().filter(r => r.enabled).length,
            total_templates: workflowEngine.getTemplates().length
          }
        }
        return NextResponse.json({ success: true, data: overview })
    }
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    
    switch (action) {
      case 'create_rule':
        const newRule: WorkflowRule = {
          id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data
        }
        
        workflowEngine.registerRule(newRule)
        return NextResponse.json({ success: true, data: newRule })
      
      case 'trigger_workflow':
        const { event_type, event_data } = data
        const executions = await workflowEngine.triggerWorkflows(event_type, event_data)
        return NextResponse.json({ success: true, data: executions })
      
      case 'test_workflow':
        const { workflow_id, test_data } = data
        const rules = workflowEngine.getRules()
        const workflow = rules.find(r => r.id === workflow_id)
        
        if (!workflow) {
          return NextResponse.json(
            { success: false, error: 'Workflow not found' },
            { status: 404 }
          )
        }
        
        const execution = await workflowEngine.executeWorkflow(workflow, test_data)
        return NextResponse.json({ success: true, data: execution })
      
      case 'generate_document':
        const { template_id, document_data, document_name } = data
        const document = await workflowEngine.generateDocument(
          { template_id, document_name },
          document_data
        )
        return NextResponse.json({ success: true, data: document })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing workflow request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflow_id, updates } = body
    
    // Mock update - in real implementation, would update the workflow rule
    console.log(`Updating workflow ${workflow_id}:`, updates)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Workflow updated successfully',
      data: { workflow_id, updates, updated_at: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflow_id')
    
    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      )
    }
    
    // Mock delete - in real implementation, would remove the workflow rule
    console.log(`Deleting workflow ${workflowId}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Workflow deleted successfully',
      data: { workflow_id: workflowId, deleted_at: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
} 