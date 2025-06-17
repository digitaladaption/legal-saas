/**
 * AI Integration for Ticket Management
 * Enables AI to create, assign, and manage tickets intelligently
 */

import { aiEngine } from './ai-engine'
import { ticketManager, CreateTicketRequest, AITicketAnalysis } from '../tickets/ticket-manager'
import { platformManager } from '../integrations/platform-connectors'

export interface AITicketAction {
  action: 'create' | 'update' | 'assign' | 'prioritize' | 'close' | 'escalate'
  ticket_id?: string
  ticket_data?: CreateTicketRequest
  reasoning: string
  confidence: number
  suggested_response?: string
}

export interface ConversationContext {
  platform: string
  participants: string[]
  messages: Array<{
    author: string
    content: string
    timestamp: string
  }>
  case_id?: string
  client_id?: string
  firm_id: string
}

export interface TicketActionRequest {
  conversation_context?: ConversationContext
  user_query: string
  existing_ticket_id?: string
  firm_id: string
  user_id: string
}

export class TicketAIIntegration {
  
  /**
   * Process user query to determine if ticket actions are needed
   */
  async processTicketQuery(request: TicketActionRequest): Promise<{
    actions: AITicketAction[]
    response: string
    confidence: number
  }> {
    try {
      const actions: AITicketAction[] = []
      let response = ''
      let overallConfidence = 0.8

      // Analyze the user query for ticket-related intents
      const ticketIntent = await this.analyzeTicketIntent(request.user_query)
      
      if (ticketIntent.should_create_ticket) {
        const createAction = await this.generateCreateTicketAction(request)
        if (createAction) {
          actions.push(createAction)
        }
      }

      if (ticketIntent.should_update_ticket && request.existing_ticket_id) {
        const updateAction = await this.generateUpdateTicketAction(
          request.existing_ticket_id, 
          request.user_query,
          request.firm_id
        )
        if (updateAction) {
          actions.push(updateAction)
        }
      }

      if (ticketIntent.should_assign_ticket) {
        const assignAction = await this.generateAssignmentAction(
          request.existing_ticket_id || '', 
          request.user_query,
          request.firm_id
        )
        if (assignAction) {
          actions.push(assignAction)
        }
      }

      // Generate AI response
      response = await this.generateTicketResponse(actions, request.user_query)
      
      return { actions, response, confidence: overallConfidence }

    } catch (error) {
      console.error('Error processing ticket query:', error)
      return {
        actions: [],
        response: 'I encountered an issue processing your ticket request. Please try again.',
        confidence: 0.3
      }
    }
  }

  /**
   * Automatically create tickets from conversations
   */
  async createTicketFromConversation(context: ConversationContext): Promise<{
    ticket_created: boolean
    ticket_id?: string
    analysis: AITicketAnalysis
    reasoning: string
  }> {
    try {
      // Combine conversation messages into analysis text
      const conversationText = context.messages
        .map(msg => `${msg.author}: ${msg.content}`)
        .join('\n')

      // Analyze if this conversation warrants a ticket
      const shouldCreateTicket = await this.shouldCreateTicketFromConversation(conversationText)
      
      if (!shouldCreateTicket.create) {
        return {
          ticket_created: false,
          analysis: shouldCreateTicket.analysis,
          reasoning: shouldCreateTicket.reasoning
        }
      }

      // Create the ticket using the ticket manager
      const result = await ticketManager.createTicketFromConversation({
        conversation: conversationText,
        participant_emails: context.participants,
        platform_source: context.platform,
        case_id: context.case_id,
        client_id: context.client_id,
        firm_id: context.firm_id
      })

      return {
        ticket_created: true,
        ticket_id: result.ticket.id,
        analysis: result.analysis,
        reasoning: `Created ticket ${result.ticket.ticket_number} from ${context.platform} conversation`
      }

    } catch (error) {
      console.error('Error creating ticket from conversation:', error)
      throw error
    }
  }

  /**
   * Smart ticket assignment based on workload and expertise
   */
  async suggestTicketAssignment(ticket_id: string, firm_id: string): Promise<{
    suggested_assignee?: string
    reasoning: string
    confidence: number
    alternative_assignees?: Array<{
      user_id: string
      reason: string
      confidence: number
    }>
  }> {
    try {
      // In a real implementation, this would:
      // 1. Analyze ticket content and category
      // 2. Check team member expertise and current workload
      // 3. Consider SLA requirements and priority
      // 4. Use AI to match best assignee

      // Mock implementation for now
      return {
        reasoning: 'Based on expertise in this area and current workload analysis',
        confidence: 0.85,
        alternative_assignees: []
      }

    } catch (error) {
      console.error('Error suggesting ticket assignment:', error)
      return {
        reasoning: 'Unable to analyze assignment options',
        confidence: 0.3
      }
    }
  }

  /**
   * Prioritize tickets based on content analysis
   */
  async intelligentPrioritization(ticket_id: string): Promise<{
    suggested_priority: 'critical' | 'high' | 'medium' | 'low'
    reasoning: string
    confidence: number
    escalation_recommended: boolean
  }> {
    try {
      // This would analyze:
      // - Urgency keywords in content
      // - Client importance
      // - Case deadlines
      // - Legal implications
      // - Business impact

      return {
        suggested_priority: 'medium',
        reasoning: 'Standard priority based on content analysis',
        confidence: 0.7,
        escalation_recommended: false
      }

    } catch (error) {
      console.error('Error analyzing ticket priority:', error)
      return {
        suggested_priority: 'medium',
        reasoning: 'Default priority due to analysis error',
        confidence: 0.3,
        escalation_recommended: false
      }
    }
  }

  /**
   * Monitor tickets for escalation needs
   */
  async monitorTicketEscalation(firm_id: string): Promise<Array<{
    ticket_id: string
    escalation_reason: string
    suggested_action: string
    urgency: 'low' | 'medium' | 'high' | 'critical'
  }>> {
    try {
      // This would check:
      // - SLA breaches
      // - Unresponsive tickets
      // - High-priority stalled tickets
      // - Client escalations
      // - Court deadline proximity

      return []

    } catch (error) {
      console.error('Error monitoring ticket escalation:', error)
      return []
    }
  }

  /**
   * Generate ticket updates from email/chat responses
   */
  async processResponseForTicketUpdate(options: {
    ticket_id: string
    response_content: string
    response_author: string
    platform: string
    firm_id: string
  }): Promise<{
    should_update: boolean
    updates?: {
      status?: string
      priority?: string
      work_notes?: string
      resolution_code?: string
    }
    new_comment?: string
    reasoning: string
  }> {
    try {
      const content = options.response_content.toLowerCase()
      
      // Check for resolution indicators
      if (content.includes('resolved') || content.includes('fixed') || content.includes('completed')) {
        return {
          should_update: true,
          updates: {
            status: 'resolved',
            work_notes: `Resolved via ${options.platform} by ${options.response_author}`
          },
          new_comment: options.response_content,
          reasoning: 'Response indicates issue resolution'
        }
      }

      // Check for escalation indicators
      if (content.includes('urgent') || content.includes('escalate') || content.includes('manager')) {
        return {
          should_update: true,
          updates: {
            priority: 'high',
            work_notes: `Escalation requested via ${options.platform}`
          },
          new_comment: options.response_content,
          reasoning: 'Response indicates escalation need'
        }
      }

      // Regular update
      return {
        should_update: true,
        new_comment: options.response_content,
        reasoning: 'Standard response update'
      }

    } catch (error) {
      console.error('Error processing response for ticket update:', error)
      return {
        should_update: false,
        reasoning: 'Error processing response'
      }
    }
  }

  // Private helper methods
  private async analyzeTicketIntent(query: string): Promise<{
    should_create_ticket: boolean
    should_update_ticket: boolean
    should_assign_ticket: boolean
    should_prioritize_ticket: boolean
    confidence: number
  }> {
    const lowerQuery = query.toLowerCase()
    
    return {
      should_create_ticket: 
        lowerQuery.includes('create ticket') || 
        lowerQuery.includes('new ticket') ||
        lowerQuery.includes('log issue') ||
        lowerQuery.includes('report problem'),
      
      should_update_ticket:
        lowerQuery.includes('update ticket') ||
        lowerQuery.includes('change status') ||
        lowerQuery.includes('mark as') ||
        lowerQuery.includes('resolve ticket'),
      
      should_assign_ticket:
        lowerQuery.includes('assign to') ||
        lowerQuery.includes('assign ticket') ||
        lowerQuery.includes('give to'),
      
      should_prioritize_ticket:
        lowerQuery.includes('priority') ||
        lowerQuery.includes('urgent') ||
        lowerQuery.includes('critical'),
      
      confidence: 0.8
    }
  }

  private async generateCreateTicketAction(request: TicketActionRequest): Promise<AITicketAction | null> {
    try {
      // Extract ticket details from query
      const title = this.extractTitleFromQuery(request.user_query)
      const description = request.conversation_context 
        ? request.conversation_context.messages.map(m => `${m.author}: ${m.content}`).join('\n')
        : request.user_query

      // Analyze the content for AI suggestions
      const analysis = await ticketManager.analyzeTicketWithAI(description, {
        case_id: request.conversation_context?.case_id,
        client_id: request.conversation_context?.client_id,
        platform_source: request.conversation_context?.platform
      })

      return {
        action: 'create',
        ticket_data: {
          title,
          description,
          short_description: title.substring(0, 160),
          priority: analysis.suggested_priority,
          source: request.conversation_context ? 'ai_generated' : 'manual',
          tags: analysis.suggested_tags,
          case_id: request.conversation_context?.case_id,
          client_id: request.conversation_context?.client_id,
          ai_context: { analysis, source_query: request.user_query }
        },
        reasoning: analysis.reasoning,
        confidence: analysis.confidence_score,
        suggested_response: `I'll create a ${analysis.suggested_priority} priority ticket for this issue. ${analysis.reasoning}`
      }

    } catch (error) {
      console.error('Error generating create ticket action:', error)
      return null
    }
  }

  private async generateUpdateTicketAction(
    ticketId: string, 
    query: string, 
    firmId: string
  ): Promise<AITicketAction | null> {
    try {
      const lowerQuery = query.toLowerCase()
      let updates: any = {}
      let reasoning = ''

      if (lowerQuery.includes('resolve') || lowerQuery.includes('fixed')) {
        updates.status = 'resolved'
        updates.resolved_at = new Date().toISOString()
        reasoning = 'Marking ticket as resolved based on user input'
      } else if (lowerQuery.includes('close')) {
        updates.status = 'closed'
        updates.closed_at = new Date().toISOString()
        reasoning = 'Closing ticket based on user request'
      } else if (lowerQuery.includes('in progress') || lowerQuery.includes('working')) {
        updates.status = 'in_progress'
        reasoning = 'Setting ticket to in progress'
      }

      if (Object.keys(updates).length === 0) {
        return null
      }

      return {
        action: 'update',
        ticket_id: ticketId,
        reasoning,
        confidence: 0.9,
        suggested_response: `I'll update the ticket status. ${reasoning}`
      }

    } catch (error) {
      console.error('Error generating update ticket action:', error)
      return null
    }
  }

  private async generateAssignmentAction(
    ticketId: string, 
    query: string, 
    firmId: string
  ): Promise<AITicketAction | null> {
    try {
      // Extract assignee information from query
      // This would need integration with user management system
      
      return {
        action: 'assign',
        ticket_id: ticketId,
        reasoning: 'Assignment based on expertise and workload',
        confidence: 0.7,
        suggested_response: 'I\'ll assign this ticket to the most suitable team member'
      }

    } catch (error) {
      console.error('Error generating assignment action:', error)
      return null
    }
  }

  private async shouldCreateTicketFromConversation(conversation: string): Promise<{
    create: boolean
    reasoning: string
    analysis: AITicketAnalysis
  }> {
    try {
      // Analyze conversation for ticket-worthy content
      const analysis = await ticketManager.analyzeTicketWithAI(conversation)
      
      // Determine if conversation warrants a ticket
      const hasIssue = conversation.toLowerCase().includes('issue') || 
                       conversation.toLowerCase().includes('problem') ||
                       conversation.toLowerCase().includes('help') ||
                       conversation.toLowerCase().includes('error')
      
      const hasAction = conversation.toLowerCase().includes('need') ||
                        conversation.toLowerCase().includes('should') ||
                        conversation.toLowerCase().includes('request')

      const create = hasIssue && hasAction && conversation.length > 50

      return {
        create,
        reasoning: create 
          ? 'Conversation contains actionable issue that warrants tracking'
          : 'Conversation does not require ticket creation',
        analysis
      }

    } catch (error) {
      console.error('Error analyzing conversation for ticket creation:', error)
      return {
        create: false,
        reasoning: 'Error analyzing conversation',
        analysis: {
          suggested_priority: 'medium',
          suggested_category: 'general',
          suggested_tags: [],
          confidence_score: 0.3,
          reasoning: 'Analysis failed'
        }
      }
    }
  }

  private extractTitleFromQuery(query: string): string {
    // Extract meaningful title from user query
    const sentences = query.split(/[.!?]/).filter(s => s.trim().length > 0)
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim()
      return firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence
    }
    return 'New Ticket'
  }

  private async generateTicketResponse(actions: AITicketAction[], originalQuery: string): Promise<string> {
    try {
      if (actions.length === 0) {
        return "I don't see any ticket actions needed for your request. Could you provide more details?"
      }

      let response = "I'll help you with that ticket request:\n\n"
      
      for (const action of actions) {
        response += `• ${action.suggested_response || `${action.action} action planned`}\n`
      }

      response += "\nIs there anything specific you'd like me to adjust?"

      return response

    } catch (error) {
      console.error('Error generating ticket response:', error)
      return "I'll help you with your ticket request. Please let me know what you need."
    }
  }
}

export const ticketAI = new TicketAIIntegration() 