/**
 * Ticket Management System
 * Comprehensive ticketing with AI integration for law firms
 */

import { createClient } from '@supabase/supabase-js'

export interface Ticket {
  id: string
  ticket_number: string
  title: string
  description?: string
  short_description?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled'
  source: 'manual' | 'ai_generated' | 'email' | 'chat' | 'phone' | 'web_form' | 'api'
  
  // Relationships
  firm_id: string
  category_id?: string
  case_id?: string
  client_id?: string
  assigned_to?: string
  created_by?: string
  
  // AI fields
  ai_confidence_score?: number
  ai_generated_tags?: string[]
  ai_context?: Record<string, any>
  
  // Timing
  sla_due_date?: string
  resolved_at?: string
  closed_at?: string
  first_response_at?: string
  
  // Additional
  tags?: string[]
  custom_fields?: Record<string, any>
  estimated_hours?: number
  actual_hours?: number
  work_notes?: string
  close_notes?: string
  
  created_at: string
  updated_at: string
  
  // Relationships (populated)
  category?: TicketCategory
  case?: any
  client?: any
  assigned_user?: any
  created_user?: any
  comments?: TicketComment[]
}

export interface TicketCategory {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  firm_id: string
  created_at: string
  updated_at: string
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id?: string
  content: string
  is_internal: boolean
  comment_type: string
  metadata?: Record<string, any>
  created_at: string
  user?: any
}

export interface TicketFilter {
  status?: string[]
  priority?: string[]
  assigned_to?: string[]
  category_id?: string[]
  case_id?: string
  client_id?: string
  created_date_from?: string
  created_date_to?: string
  search?: string
  tags?: string[]
  sla_breached?: boolean
}

export interface CreateTicketRequest {
  title: string
  description?: string
  short_description?: string
  priority?: 'critical' | 'high' | 'medium' | 'low'
  category_id?: string
  case_id?: string
  client_id?: string
  assigned_to?: string
  source?: string
  tags?: string[]
  estimated_hours?: number
  ai_context?: Record<string, any>
  custom_fields?: Record<string, any>
}

export interface AITicketAnalysis {
  suggested_priority: 'critical' | 'high' | 'medium' | 'low'
  suggested_category: string
  suggested_assignee?: string
  suggested_tags: string[]
  confidence_score: number
  reasoning: string
  estimated_hours?: number
  related_cases?: string[]
  related_clients?: string[]
}

export class TicketManager {
  private supabase: any

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  /**
   * Get tickets with filtering, sorting, and pagination
   */
  async getTickets(options: {
    filter?: TicketFilter
    sort?: { field: string; direction: 'asc' | 'desc' }
    page?: number
    limit?: number
    firm_id: string
  }): Promise<{
    tickets: Ticket[]
    total: number
    page: number
    total_pages: number
  }> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized')
      }

      let query = this.supabase
        .from('tickets')
        .select(`
          *,
          category:ticket_categories(id, name, color, icon),
          case:cases(id, title, case_number),
          client:clients(id, name, email),
          assigned_user:auth.users(id, email, user_metadata),
          created_user:auth.users(id, email, user_metadata)
        `)
        .eq('firm_id', options.firm_id)

      // Apply filters
      if (options.filter) {
        const filter = options.filter

        if (filter.status && filter.status.length > 0) {
          query = query.in('status', filter.status)
        }

        if (filter.priority && filter.priority.length > 0) {
          query = query.in('priority', filter.priority)
        }

        if (filter.assigned_to && filter.assigned_to.length > 0) {
          query = query.in('assigned_to', filter.assigned_to)
        }

        if (filter.category_id && filter.category_id.length > 0) {
          query = query.in('category_id', filter.category_id)
        }

        if (filter.case_id) {
          query = query.eq('case_id', filter.case_id)
        }

        if (filter.client_id) {
          query = query.eq('client_id', filter.client_id)
        }

        if (filter.created_date_from) {
          query = query.gte('created_at', filter.created_date_from)
        }

        if (filter.created_date_to) {
          query = query.lte('created_at', filter.created_date_to)
        }

        if (filter.search) {
          query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%,ticket_number.ilike.%${filter.search}%`)
        }

        if (filter.tags && filter.tags.length > 0) {
          query = query.overlaps('tags', filter.tags)
        }

        if (filter.sla_breached) {
          query = query.lt('sla_due_date', new Date().toISOString())
        }
      }

      // Apply sorting
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Get total count
      const { count } = await this.supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', options.firm_id)

      // Apply pagination
      const page = options.page || 1
      const limit = options.limit || 25
      const offset = (page - 1) * limit

      const { data: tickets, error } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return {
        tickets: tickets || [],
        total: count || 0,
        page,
        total_pages: Math.ceil((count || 0) / limit)
      }

    } catch (error) {
      console.error('Error fetching tickets:', error)
      throw error
    }
  }

  /**
   * Create a new ticket
   */
  async createTicket(request: CreateTicketRequest & { firm_id: string }): Promise<Ticket> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized')
      }

      const ticketData = {
        ...request,
        status: 'open',
        created_by: (await this.supabase.auth.getUser()).data.user?.id
      }

      const { data: ticket, error } = await this.supabase
        .from('tickets')
        .insert(ticketData)
        .select(`
          *,
          category:ticket_categories(id, name, color, icon),
          case:cases(id, title, case_number),
          client:clients(id, name, email)
        `)
        .single()

      if (error) {
        throw error
      }

      return ticket

    } catch (error) {
      console.error('Error creating ticket:', error)
      throw error
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized')
      }

      const { data: ticket, error } = await this.supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select(`
          *,
          category:ticket_categories(id, name, color, icon),
          case:cases(id, title, case_number),
          client:clients(id, name, email)
        `)
        .single()

      if (error) {
        throw error
      }

      return ticket

    } catch (error) {
      console.error('Error updating ticket:', error)
      throw error
    }
  }

  /**
   * AI-powered ticket analysis and suggestions
   */
  async analyzeTicketWithAI(content: string, context?: {
    case_id?: string
    client_id?: string
    conversation_history?: any[]
    platform_source?: string
  }): Promise<AITicketAnalysis> {
    try {
      // In a real implementation, this would call your AI service
      // For now, we'll implement rule-based analysis with some AI-like features
      
      const analysis: AITicketAnalysis = {
        suggested_priority: this.analyzePriority(content),
        suggested_category: await this.analyzeCategory(content),
        suggested_tags: this.extractTags(content),
        confidence_score: 0.85,
        reasoning: '',
        estimated_hours: this.estimateHours(content)
      }

      // Analyze priority based on keywords and urgency indicators
      analysis.reasoning = this.generateReasoningText(analysis, content)

      // Suggest assignee based on category and workload
      if (context?.case_id) {
        analysis.suggested_assignee = await this.suggestAssigneeForCase(context.case_id)
      }

      return analysis

    } catch (error) {
      console.error('Error analyzing ticket with AI:', error)
      
      // Fallback analysis
      return {
        suggested_priority: 'medium',
        suggested_category: 'general',
        suggested_tags: [],
        confidence_score: 0.5,
        reasoning: 'Basic analysis due to AI service unavailability'
      }
    }
  }

  /**
   * AI-powered ticket creation from conversation
   */
  async createTicketFromConversation(options: {
    conversation: string
    participant_emails?: string[]
    platform_source: string
    case_id?: string
    client_id?: string
    firm_id: string
  }): Promise<{ ticket: Ticket; analysis: AITicketAnalysis }> {
    try {
      // Analyze the conversation
      const analysis = await this.analyzeTicketWithAI(options.conversation, {
        case_id: options.case_id,
        client_id: options.client_id,
        platform_source: options.platform_source
      })

      // Extract title and description from conversation
      const title = this.extractTitleFromConversation(options.conversation)
      const description = this.extractDescriptionFromConversation(options.conversation)

      // Create the ticket
      const ticket = await this.createTicket({
        title,
        description,
        short_description: title.substring(0, 160),
        priority: analysis.suggested_priority,
        category_id: await this.getCategoryIdByName(analysis.suggested_category, options.firm_id),
        case_id: options.case_id,
        client_id: options.client_id,
        source: 'ai_generated',
        tags: analysis.suggested_tags,
        estimated_hours: analysis.estimated_hours,
        ai_context: {
          analysis,
          conversation_source: options.platform_source,
          participants: options.participant_emails,
          confidence_score: analysis.confidence_score
        },
        firm_id: options.firm_id
      })

      return { ticket, analysis }

    } catch (error) {
      console.error('Error creating ticket from conversation:', error)
      throw error
    }
  }

  /**
   * Bulk operations for ticket management
   */
  async bulkUpdateTickets(ticketIds: string[], updates: Partial<Ticket>): Promise<Ticket[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized')
      }

      const { data: tickets, error } = await this.supabase
        .from('tickets')
        .update(updates)
        .in('id', ticketIds)
        .select('*')

      if (error) {
        throw error
      }

      return tickets || []

    } catch (error) {
      console.error('Error bulk updating tickets:', error)
      throw error
    }
  }

  /**
   * Get ticket statistics for dashboard
   */
  async getTicketStats(firm_id: string): Promise<{
    total: number
    by_status: Record<string, number>
    by_priority: Record<string, number>
    sla_breached: number
    avg_resolution_time: number
    unassigned: number
  }> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase not initialized')
      }

      const { data: tickets, error } = await this.supabase
        .from('tickets')
        .select('status, priority, sla_due_date, resolved_at, created_at, assigned_to')
        .eq('firm_id', firm_id)

      if (error) {
        throw error
      }

      const stats = {
        total: tickets?.length || 0,
        by_status: {} as Record<string, number>,
        by_priority: {} as Record<string, number>,
        sla_breached: 0,
        avg_resolution_time: 0,
        unassigned: 0
      }

      if (tickets) {
        // Count by status
        for (const ticket of tickets) {
          stats.by_status[ticket.status] = (stats.by_status[ticket.status] || 0) + 1
          stats.by_priority[ticket.priority] = (stats.by_priority[ticket.priority] || 0) + 1
          
          if (!ticket.assigned_to) {
            stats.unassigned++
          }
          
          if (ticket.sla_due_date && new Date(ticket.sla_due_date) < new Date()) {
            stats.sla_breached++
          }
        }

        // Calculate average resolution time
        const resolvedTickets = tickets.filter(t => t.resolved_at)
        if (resolvedTickets.length > 0) {
          const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.created_at)
            const resolved = new Date(ticket.resolved_at)
            return sum + (resolved.getTime() - created.getTime())
          }, 0)
          
          stats.avg_resolution_time = totalResolutionTime / resolvedTickets.length / (1000 * 60 * 60) // Convert to hours
        }
      }

      return stats

    } catch (error) {
      console.error('Error getting ticket stats:', error)
      throw error
    }
  }

  // Helper methods
  private analyzePriority(content: string): 'critical' | 'high' | 'medium' | 'low' {
    const urgentKeywords = ['urgent', 'emergency', 'critical', 'asap', 'immediately', 'deadline']
    const highKeywords = ['important', 'priority', 'soon', 'quickly']
    
    const lowerContent = content.toLowerCase()
    
    if (urgentKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'critical'
    }
    
    if (highKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'high'
    }
    
    return 'medium'
  }

  private async analyzeCategory(content: string): Promise<string> {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('court') || lowerContent.includes('filing') || lowerContent.includes('deadline')) {
      return 'Court Filing'
    }
    
    if (lowerContent.includes('document') || lowerContent.includes('review') || lowerContent.includes('contract')) {
      return 'Document Review'
    }
    
    if (lowerContent.includes('client') || lowerContent.includes('meeting') || lowerContent.includes('call')) {
      return 'Client Communication'
    }
    
    if (lowerContent.includes('research') || lowerContent.includes('precedent') || lowerContent.includes('law')) {
      return 'Legal Research'
    }
    
    if (lowerContent.includes('bill') || lowerContent.includes('invoice') || lowerContent.includes('payment')) {
      return 'Billing'
    }
    
    return 'General'
  }

  private extractTags(content: string): string[] {
    const tags: string[] = []
    const lowerContent = content.toLowerCase()
    
    // Legal area tags
    const legalAreas = ['employment', 'family', 'criminal', 'property', 'commercial', 'tort']
    for (const area of legalAreas) {
      if (lowerContent.includes(area)) {
        tags.push(area)
      }
    }
    
    // Urgency tags
    if (lowerContent.includes('urgent') || lowerContent.includes('emergency')) {
      tags.push('urgent')
    }
    
    // Document types
    if (lowerContent.includes('contract')) tags.push('contract')
    if (lowerContent.includes('agreement')) tags.push('agreement')
    if (lowerContent.includes('motion')) tags.push('motion')
    
    return tags
  }

  private estimateHours(content: string): number {
    // Simple estimation based on content complexity
    const wordCount = content.split(' ').length
    
    if (wordCount < 50) return 1
    if (wordCount < 200) return 2
    if (wordCount < 500) return 4
    return 8
  }

  private generateReasoningText(analysis: AITicketAnalysis, content: string): string {
    let reasoning = `Based on analysis of the content, I suggest ${analysis.suggested_priority} priority`
    
    if (analysis.suggested_priority === 'critical') {
      reasoning += ' due to urgent keywords detected.'
    } else if (analysis.suggested_priority === 'high') {
      reasoning += ' due to important keywords detected.'
    } else {
      reasoning += ' as standard processing priority.'
    }
    
    reasoning += ` The content appears to be related to ${analysis.suggested_category}.`
    
    if (analysis.suggested_tags.length > 0) {
      reasoning += ` Relevant tags: ${analysis.suggested_tags.join(', ')}.`
    }
    
    return reasoning
  }

  private async suggestAssigneeForCase(caseId: string): Promise<string | undefined> {
    try {
      // In a real implementation, this would query case assignments and workload
      // For now, return undefined to let manual assignment handle it
      return undefined
    } catch (error) {
      return undefined
    }
  }

  private extractTitleFromConversation(conversation: string): string {
    // Extract first line or sentence as title
    const lines = conversation.split('\n').filter(line => line.trim())
    if (lines.length > 0) {
      const firstLine = lines[0].trim()
      return firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine
    }
    return 'Ticket from conversation'
  }

  private extractDescriptionFromConversation(conversation: string): string {
    // Return full conversation as description, trimmed if too long
    return conversation.length > 2000 ? conversation.substring(0, 1997) + '...' : conversation
  }

  private async getCategoryIdByName(categoryName: string, firmId: string): Promise<string | undefined> {
    try {
      if (!this.supabase) return undefined

      const { data: category, error } = await this.supabase
        .from('ticket_categories')
        .select('id')
        .eq('name', categoryName)
        .eq('firm_id', firmId)
        .single()

      if (error || !category) return undefined
      
      return category.id
    } catch (error) {
      return undefined
    }
  }
}

export const ticketManager = new TicketManager() 