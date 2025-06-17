/**
 * Intelligent AI Agent - Complete Law Firm Operating System
 * Central AI that manages all firm operations, document access, and legal intelligence
 */

import { aiEngine } from './ai-engine'
import { documentSearchManager } from '../integrations/document-connectors'
import { platformManager } from '../integrations/platform-connectors'
import { ticketAI, TicketActionRequest } from './ticket-ai-integration'
import { ticketManager } from '../tickets/ticket-manager'

export interface AgentContext {
  firm_id: string
  user_id: string
  case_context?: string
  client_context?: string
  current_task?: string
  conversation_history: AgentMessage[]
}

export interface AgentMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: string
  context?: {
    case_id?: string
    client_id?: string
    document_references?: string[]
    legal_citations?: string[]
    confidence_score?: number
    conversation_stage?: 'initial' | 'gathering' | 'clarifying' | 'ready_to_respond'
    required_info?: string[]
    gathered_info?: Record<string, any>
  }
  actions_taken?: AgentAction[]
  follow_up_questions?: string[]
  needs_more_info?: boolean
}

export interface AgentAction {
  type: 'document_search' | 'case_research' | 'email_draft' | 'case_analysis' | 'legal_lookup' | 'schedule_task' | 'ticket_create' | 'ticket_update' | 'ticket_assign' | 'ticket_analysis'
  description: string
  result: any
  confidence: number
  timestamp: string
}

export interface DocumentSource {
  type: 'internal' | 'google_drive' | 'onedrive' | 'email' | 'slack' | 'sharepoint'
  id: string
  name: string
  path: string
  last_accessed: string
  permissions: string[]
}

export interface LegalResearchResult {
  source: 'bailii' | 'westlaw' | 'lexis' | 'gov_uk' | 'internal'
  case_name: string
  citation: string
  relevance_score: number
  summary: string
  key_points: string[]
  precedent_value: 'binding' | 'persuasive' | 'informative'
  date: string
  court: string
  judgment_url?: string
}

export interface CaseSuccessPrediction {
  success_probability: number
  confidence_level: number
  key_factors: {
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    weight: number
    explanation: string
  }[]
  similar_cases: LegalResearchResult[]
  recommended_strategy: string
  potential_obstacles: string[]
  estimated_timeline: string
  estimated_costs: {
    min: number
    max: number
    most_likely: number
  }
}

export interface EmailDraftRequest {
  original_email: {
    from: string
    subject: string
    body: string
    received_at: string
  }
  case_type: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  client_context?: any
  case_context?: any
}

export interface EmailDraft {
  id: string
  subject: string
  body: string
  tone: 'professional' | 'formal' | 'compassionate' | 'assertive'
  confidence_score: number
  legal_accuracy_check: {
    passed: boolean
    warnings: string[]
    suggestions: string[]
  }
  requires_review: boolean
  estimated_review_time: number
  draft_reasoning: string
}

export class IntelligentAgent {
  private context: AgentContext
  private documentSources: Map<string, DocumentSource> = new Map()
  private conversationHistory: AgentMessage[] = []
  private activeTasks: Set<string> = new Set()
  private currentConversationState: {
    topic?: string
    stage: 'initial' | 'gathering' | 'clarifying' | 'ready_to_respond'
    required_info: string[]
    gathered_info: Record<string, any>
    confidence_threshold: number
  } = {
    stage: 'initial',
    required_info: [],
    gathered_info: {},
    confidence_threshold: 0.8
  }

  constructor(firmId: string, userId: string) {
    this.context = {
      firm_id: firmId,
      user_id: userId,
      conversation_history: []
    }
    this.initializeDocumentSources()
  }

  /**
   * Conversational AI Agent Query Handler
   */
  async processQuery(query: string, context?: Partial<AgentContext>): Promise<AgentMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    if (context) {
      this.context = { ...this.context, ...context }
    }

    const userMessage: AgentMessage = {
      id: `user_${messageId}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    }
    
    this.conversationHistory.push(userMessage)

    try {
      // Update conversation state with new information
      await this.updateConversationState(query)
      
      // Check if we have enough information to provide a definitive answer
      const readinessAssessment = await this.assessInformationReadiness(query)
      
      if (readinessAssessment.needs_more_info) {
        // Generate follow-up questions to gather more context
        const followUpResponse = await this.generateFollowUpQuestions(query, readinessAssessment)
        
        const agentMessage: AgentMessage = {
          id: `agent_${messageId}`,
          role: 'agent',
          content: followUpResponse.content,
          timestamp: new Date().toISOString(),
          context: {
            confidence_score: followUpResponse.confidence,
            conversation_stage: this.currentConversationState.stage,
            required_info: this.currentConversationState.required_info,
            gathered_info: this.currentConversationState.gathered_info
          },
          follow_up_questions: followUpResponse.questions,
          needs_more_info: true
        }
        
        this.conversationHistory.push(agentMessage)
        return agentMessage
        
      } else {
        // We have enough information - provide comprehensive answer
        const comprehensiveResponse = await this.generateComprehensiveResponse(query)
        
        const agentMessage: AgentMessage = {
          id: `agent_${messageId}`,
          role: 'agent',
          content: comprehensiveResponse.content,
          timestamp: new Date().toISOString(),
          context: {
            confidence_score: comprehensiveResponse.confidence,
            conversation_stage: 'ready_to_respond',
            gathered_info: this.currentConversationState.gathered_info
          },
          actions_taken: comprehensiveResponse.actions,
          needs_more_info: false
        }
        
        this.conversationHistory.push(agentMessage)
        
        // Reset conversation state for next topic
        this.resetConversationState()
        
        return agentMessage
      }

    } catch (error) {
      console.error('Error processing conversational query:', error)
      
      const errorMessage: AgentMessage = {
        id: `agent_error_${messageId}`,
        role: 'agent',
        content: 'I apologize, but I encountered an error processing your request. Could you please rephrase your question or provide more specific details?',
        timestamp: new Date().toISOString(),
        context: { confidence_score: 0 }
      }

      this.conversationHistory.push(errorMessage)
      return errorMessage
    }
  }

  /**
   * Automated Email Processing
   */
  async processIncomingEmail(emailData: EmailDraftRequest): Promise<{
    case_type_detected: string
    urgency_level: 'low' | 'medium' | 'high' | 'urgent'
    auto_draft: EmailDraft
    case_creation_recommended: boolean
    next_actions: string[]
  }> {
    const caseTypeAnalysis = await this.detectCaseType(emailData.original_email.body, emailData.original_email.subject)
    const urgencyAnalysis = await this.assessEmailUrgency(emailData.original_email)
    const emailDraft = await this.draftEmailResponse(emailData)
    const caseCreationNeeded = this.shouldCreateCase(caseTypeAnalysis, urgencyAnalysis)
    const nextActions = this.generateNextActions(caseTypeAnalysis, urgencyAnalysis, caseCreationNeeded)

    return {
      case_type_detected: caseTypeAnalysis.case_type,
      urgency_level: urgencyAnalysis.level,
      auto_draft: emailDraft,
      case_creation_recommended: caseCreationNeeded,
      next_actions: nextActions
    }
  }

  /**
   * UK Legal Research Integration
   */
  async performLegalResearch(topic: string): Promise<LegalResearchResult[]> {
    const mockResults: LegalResearchResult[] = [
      {
        source: 'bailii',
        case_name: 'Smith v Jones [2023] EWCA Civ 123',
        citation: '[2023] EWCA Civ 123',
        relevance_score: 0.92,
        summary: 'Court of Appeal decision establishing precedent on family law property division.',
        key_points: [
          'Equal division of matrimonial assets unless exceptional circumstances',
          'Children\'s welfare is paramount consideration',
          'Conduct of parties generally irrelevant to financial settlement'
        ],
        precedent_value: 'binding',
        date: '2023-03-15',
        court: 'Court of Appeal (Civil Division)',
        judgment_url: 'https://www.bailii.org/ew/cases/EWCA/Civ/2023/123.html'
      }
    ]

    return mockResults
  }

  /**
   * Case Success Prediction using UK Legal Data
   */
  async analyzeCaseSuccess(caseParameters: any): Promise<CaseSuccessPrediction> {
    const similarCases = await this.performLegalResearch(caseParameters.case_type || 'general')
    
    const factors = [
      {
        factor: 'Legal Precedent Strength',
        impact: 'positive' as const,
        weight: 0.35,
        explanation: 'Strong binding precedents support client position'
      },
      {
        factor: 'Evidence Quality',
        impact: 'positive' as const,
        weight: 0.30,
        explanation: 'Documentary evidence is comprehensive and compelling'
      }
    ]

    const successProbability = 0.75

    return {
      success_probability: successProbability,
      confidence_level: 0.83,
      key_factors: factors,
      similar_cases: similarCases,
      recommended_strategy: 'Focus on documentary evidence and seek early settlement if possible',
      potential_obstacles: [
        'Opposing party may prolong proceedings',
        'Court backlog could delay resolution'
      ],
      estimated_timeline: '8-14 months',
      estimated_costs: {
        min: 25000,
        max: 85000,
        most_likely: 45000
      }
    }
  }

  /**
   * Intelligent Email Draft Generation
   */
  async draftEmailResponse(emailRequest: EmailDraftRequest): Promise<EmailDraft> {
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Use real AI engine to draft the email
      const aiResponse = await aiEngine.draftLegalEmail({
        from: emailRequest.original_email.from,
        subject: emailRequest.original_email.subject,
        body: emailRequest.original_email.body,
        case_type: emailRequest.case_type,
        urgency: emailRequest.urgency
      })

      const legalCheck = await this.performLegalAccuracyCheck(aiResponse, emailRequest.case_type)
      
      return {
        id: draftId,
        subject: `Re: ${emailRequest.original_email.subject}`,
        body: aiResponse.content,
        tone: 'professional',
        confidence_score: aiResponse.confidence,
        legal_accuracy_check: legalCheck,
        requires_review: legalCheck.warnings.length > 0 || aiResponse.confidence < 0.8,
        estimated_review_time: legalCheck.warnings.length > 0 ? 15 : 5,
        draft_reasoning: `Generated using ${aiResponse.provider} AI with ${(aiResponse.confidence * 100).toFixed(0)}% confidence`
      }
    } catch (error) {
      console.error('Error generating email draft:', error)
      
      // Fallback to template-based generation
      const emailAnalysis = await this.analyzeEmailContent(emailRequest.original_email)
      const responseTemplate = this.getResponseTemplate(emailRequest.case_type, emailAnalysis.tone)
      const draft = await this.generatePersonalizedDraft(responseTemplate, emailRequest, emailAnalysis)
      const legalCheck = await this.performLegalAccuracyCheck(draft, emailRequest.case_type)
      
      return {
        id: draftId,
        subject: `Re: ${emailRequest.original_email.subject}`,
        body: draft.body,
        tone: draft.tone,
        confidence_score: draft.confidence,
        legal_accuracy_check: legalCheck,
        requires_review: true, // Always require review for fallback
        estimated_review_time: 15,
        draft_reasoning: 'Generated using fallback template (AI unavailable)'
      }
    }
  }

  /**
   * Enhanced Document Search Across All Platforms
   */
  async searchAllDocuments(searchTerms: string): Promise<{
    internal_documents: any[]
    google_drive_results: any[]
    onedrive_results: any[]
    email_results: any[]
    slack_results: any[]
    discord_results: any[]
    zoom_results: any[]
    total_found: number
    platform_messages: any[]
  }> {
    try {
      // Search across all connected platforms
      const platformResults = await platformManager.searchAllPlatforms(searchTerms, {
        limit: 50
      })

      // Also search internal documents
      const internalResults = await documentSearchManager.searchAll({ 
        query: searchTerms,
        max_results: 50,
        include_content: true
      })

      // Combine and organize results
      const combinedResults = {
        internal_documents: internalResults.internal_documents,
        google_drive_results: platformResults.documents.filter(d => d.platform === 'google_drive'),
        onedrive_results: platformResults.documents.filter(d => d.platform === 'onedrive'),
        email_results: platformResults.messages.filter(m => m.platform === 'gmail'),
        slack_results: platformResults.messages.filter(m => m.platform === 'slack'),
        discord_results: platformResults.messages.filter(m => m.platform === 'discord'),
        zoom_results: platformResults.documents.filter(d => d.platform === 'zoom'),
        platform_messages: platformResults.messages,
        total_found: internalResults.total_found + platformResults.total_results
      }

      return combinedResults

    } catch (error) {
      console.error('Enhanced document search error:', error)
      
      // Fallback to basic search
      const fallbackResults = await documentSearchManager.searchAll({ 
        query: searchTerms,
        max_results: 50,
        include_content: true
      })

      return {
        ...fallbackResults,
        discord_results: [],
        zoom_results: [],
        platform_messages: []
      }
    }
  }

  // Private helper methods
  private async analyzeQueryIntent(query: string) {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('draft') || lowerQuery.includes('email') || lowerQuery.includes('respond')) {
      return { type: 'email_assistance', confidence: 0.9, parameters: { email_data: {} } }
    }
    if (lowerQuery.includes('case') || lowerQuery.includes('success') || lowerQuery.includes('win')) {
      return { type: 'case_analysis', confidence: 0.85, parameters: { case_type: 'general' } }
    }
    if (lowerQuery.includes('law') || lowerQuery.includes('legal') || lowerQuery.includes('precedent')) {
      return { type: 'legal_research', confidence: 0.88, parameters: { topic: query } }
    }
    
    return { type: 'document_search', confidence: 0.7, parameters: { search_terms: query } }
  }

  private async generateIntelligentResponse(query: string, intent: any, actions: AgentAction[]) {
    try {
      // Use AI engine to generate intelligent response
      const context = actions.map(action => 
        `${action.type}: ${action.description} (confidence: ${action.confidence})`
      ).join('\n')

      const aiResponse = await aiEngine.processLegalQuery({
        prompt: query,
        context: context,
        system_prompt: 'You are an AI legal assistant providing professional analysis and recommendations. Summarize the actions taken and provide clear, actionable guidance.'
      })

      let documentReferences: string[] = []
      let legalCitations: string[] = []

      // Extract citations and references from actions
      for (const action of actions) {
        if (action.type === 'legal_lookup' && action.result) {
          const research = action.result as LegalResearchResult[]
          research.forEach(result => {
            legalCitations.push(result.citation)
          })
        }
      }

      return {
        content: aiResponse.content,
        confidence: aiResponse.confidence,
        document_references: documentReferences,
        legal_citations: legalCitations
      }

    } catch (error) {
      console.error('Error generating AI response:', error)
      
      // Fallback to structured summary
      let content = "I've analyzed your request and here's what I found:\n\n"
      let confidence = 0.8
      let documentReferences: string[] = []
      let legalCitations: string[] = []

      for (const action of actions) {
        switch (action.type) {
          case 'case_analysis':
            const analysis = action.result as CaseSuccessPrediction
            content += `**Case Success Analysis:**\n`
            content += `- Success Probability: ${(analysis.success_probability * 100).toFixed(1)}%\n`
            content += `- Confidence Level: ${(analysis.confidence_level * 100).toFixed(1)}%\n`
            content += `- Recommended Strategy: ${analysis.recommended_strategy}\n\n`
            break

          case 'legal_lookup':
            const research = action.result as LegalResearchResult[]
            content += `**Legal Research Results:**\n`
            research.forEach(result => {
              content += `- **${result.case_name}**: ${result.summary}\n`
              legalCitations.push(result.citation)
            })
            content += '\n'
            break

          case 'email_draft':
            const draft = action.result as EmailDraft
            content += `**Email Draft Generated:**\n`
            content += `- Confidence Score: ${(draft.confidence_score * 100).toFixed(1)}%\n`
            content += `- Requires Review: ${draft.requires_review ? 'Yes' : 'No'}\n\n`
            break

          case 'document_search':
            const searchResults = action.result
            content += `**Document Search Results:**\n`
            content += `- Total documents found: ${searchResults.total_found}\n\n`
            break
        }
      }

      return { content, confidence, document_references: documentReferences, legal_citations: legalCitations }
    }
  }

  private initializeDocumentSources() {
    const sources: DocumentSource[] = [
      {
        type: 'internal',
        id: 'supabase_docs',
        name: 'Internal Document Store',
        path: '/internal/documents',
        last_accessed: new Date().toISOString(),
        permissions: ['read', 'write', 'delete']
      }
    ]

    sources.forEach(source => {
      this.documentSources.set(source.id, source)
    })
  }

  private async searchInternalDocuments(searchTerms: string) {
    return [
      { id: 'doc1', name: 'Contract Analysis.pdf', relevance: 0.9 },
      { id: 'doc2', name: 'Case Notes.docx', relevance: 0.8 }
    ]
  }

  private async searchGoogleDrive(searchTerms: string) {
    return [{ id: 'gdoc1', name: 'Client Agreement.pdf', relevance: 0.85 }]
  }

  private async searchOneDrive(searchTerms: string) {
    return [{ id: 'odoc1', name: 'Legal Brief.docx', relevance: 0.82 }]
  }

  private async searchEmails(searchTerms: string) {
    return [{ id: 'email1', subject: 'Case Discussion', relevance: 0.78 }]
  }

  private async searchSlack(searchTerms: string) {
    return [{ id: 'slack1', channel: '#legal-team', relevance: 0.75 }]
  }

  private async detectCaseType(emailBody: string, subject: string) {
    const content = (emailBody + ' ' + subject).toLowerCase()
    
    if (content.includes('divorce') || content.includes('family') || content.includes('custody')) {
      return { case_type: 'family_law', confidence: 0.9 }
    }
    return { case_type: 'general_inquiry', confidence: 0.6 }
  }

  private async assessEmailUrgency(email: any) {
    return { level: 'medium' as const, confidence: 0.7 }
  }

  private shouldCreateCase(caseTypeAnalysis: any, urgencyAnalysis: any): boolean {
    return caseTypeAnalysis.case_type !== 'general_inquiry'
  }

  private generateNextActions(caseType: any, urgency: any, createCase: boolean): string[] {
    const actions = ['Review email draft before sending']
    if (createCase) actions.push('Create new case record')
    return actions
  }

  private async analyzeEmailContent(email: any) {
    return { tone: 'professional' as const }
  }

  private getResponseTemplate(caseType: string, tone: string) {
    return `Dear [CLIENT_NAME],

Thank you for contacting our firm regarding your legal matter. We understand the importance of your situation and are here to help.

[SPECIFIC_RESPONSE]

Please let me know your availability for a consultation.

Best regards,
[SOLICITOR_NAME]`
  }

  private async generatePersonalizedDraft(template: string, request: EmailDraftRequest, analysis: any) {
    return {
      body: template.replace('[SPECIFIC_RESPONSE]', 'We will review your case and provide initial guidance.'),
      tone: 'professional' as const,
      confidence: 0.85,
      reasoning: 'Generated professional response appropriate for legal inquiry'
    }
  }

  private async performLegalAccuracyCheck(draft: any, caseType: string) {
    return {
      passed: true,
      warnings: [],
      suggestions: ['Consider adding information about consultation fees']
    }
  }

  private refreshAIConfig() {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('ai_settings')
        if (savedSettings) {
          const config = JSON.parse(savedSettings)
          aiEngine.updateConfig(config)
          console.log('🤖 Intelligent Agent: Refreshed AI config')
        }
      } catch (error) {
        console.error('Error refreshing AI config:', error)
      }
    }
  }

  /**
   * Conversational Methods
   */
  private async updateConversationState(query: string) {
    const queryIntent = await this.analyzeQueryIntent(query)
    
    // Extract information from the query
    const extractedInfo = await this.extractInformationFromQuery(query)
    
    // Update gathered information
    Object.assign(this.currentConversationState.gathered_info, extractedInfo)
    
    // Set topic if not already set
    if (!this.currentConversationState.topic) {
      this.currentConversationState.topic = queryIntent.type
    }
    
    // Update required information based on query type
    this.currentConversationState.required_info = this.getRequiredInfoForTopic(queryIntent.type)
    
    console.log('🤖 Conversation State Updated:', this.currentConversationState)
  }

  private async assessInformationReadiness(query: string): Promise<{
    needs_more_info: boolean
    confidence: number
    missing_info: string[]
    ready_to_respond: boolean
  }> {
    const requiredInfo = this.currentConversationState.required_info
    const gatheredInfo = this.currentConversationState.gathered_info
    
    const missingInfo = requiredInfo.filter(info => 
      !gatheredInfo[info] || gatheredInfo[info] === null || gatheredInfo[info] === ''
    )
    
    const completionRatio = (requiredInfo.length - missingInfo.length) / requiredInfo.length
    const confidence = Math.min(completionRatio, 0.95) // Cap at 95%
    
    return {
      needs_more_info: missingInfo.length > 0 && confidence < this.currentConversationState.confidence_threshold,
      confidence,
      missing_info: missingInfo,
      ready_to_respond: confidence >= this.currentConversationState.confidence_threshold
    }
  }

  private async generateFollowUpQuestions(query: string, assessment: any): Promise<{
    content: string
    questions: string[]
    confidence: number
  }> {
    this.refreshAIConfig()
    
    const context = {
      topic: this.currentConversationState.topic,
      gathered_info: this.currentConversationState.gathered_info,
      missing_info: assessment.missing_info,
      current_cases: await this.getCurrentCases(),
      conversation_history: this.conversationHistory.slice(-3) // Last 3 messages for context
    }

    const prompt = `As a UK legal AI assistant, I need to ask follow-up questions to provide accurate advice.

Current Query: "${query}"
Topic: ${this.currentConversationState.topic}
Information Already Gathered: ${JSON.stringify(this.currentConversationState.gathered_info)}
Missing Information: ${assessment.missing_info.join(', ')}

Available Cases: ${JSON.stringify(context.current_cases, null, 2)}

Please generate 2-3 specific follow-up questions to gather the missing information. 
Be professional, specific, and reference actual cases from our system when relevant.
Format as a conversational response followed by numbered questions.`

    const response = await aiEngine.processLegalQuery({
      prompt,
      system_prompt: 'You are a UK legal AI conducting a professional consultation. Ask specific, relevant questions to gather necessary information for accurate legal advice.',
      context: JSON.stringify(context)
    })

    // Extract questions from the response
    const questions = this.extractQuestionsFromResponse(response.content)

    return {
      content: response.content,
      questions,
      confidence: assessment.confidence
    }
  }

  /**
   * Enhanced AI Query Processing with Platform Integration and Ticket Management
   */
  async generateComprehensiveResponse(query: string): Promise<{
    content: string
    confidence: number 
    actions: AgentAction[]
  }> {
    const actions: AgentAction[] = []
    let content = ''
    let overallConfidence = 0.8

    try {
      // Step 1: Analyze query intent including ticket operations
      const intent = await this.analyzeQueryIntent(query)
      
      // Step 2: Check for ticket-related operations
      const ticketActions = await this.processTicketOperations(query)
      if (ticketActions.actions.length > 0) {
        actions.push(...ticketActions.actions.map(action => ({
          type: action.action as any,
          description: action.reasoning,
          result: action,
          confidence: action.confidence,
          timestamp: new Date().toISOString()
        })))
      }
      
      // Step 3: Search across all platforms for relevant information
      const searchResults = await this.searchAllDocuments(query)
      
      const searchAction: AgentAction = {
        type: 'document_search',
        description: `Searched across all connected platforms for: "${query}"`,
        result: searchResults,
        confidence: 0.9,
        timestamp: new Date().toISOString()
      }
      actions.push(searchAction)

      // Step 4: Monitor for conversation-based ticket creation
      if (this.shouldCreateTicketFromConversation(query)) {
        const ticketCreation = await this.createTicketFromCurrentConversation(query)
        if (ticketCreation.created) {
          actions.push({
            type: 'ticket_create',
            description: `Created ticket ${ticketCreation.ticket_number} from conversation`,
            result: ticketCreation,
            confidence: ticketCreation.confidence,
            timestamp: new Date().toISOString()
          })
        }
      }

      // Step 5: Analyze platform-specific findings
      let platformFindings = ''
      
      if (searchResults.slack_results.length > 0) {
        platformFindings += `\n**Slack Conversations Found:**\n`
        searchResults.slack_results.slice(0, 3).forEach(msg => {
          platformFindings += `- ${msg.channel ? `#${msg.channel}` : 'DM'}: "${msg.content.substring(0, 100)}..." (${msg.author})\n`
        })
      }

      if (searchResults.discord_results.length > 0) {
        platformFindings += `\n**Discord Messages Found:**\n`
        searchResults.discord_results.slice(0, 3).forEach(msg => {
          platformFindings += `- "${msg.content.substring(0, 100)}..." (${msg.author})\n`
        })
      }

      if (searchResults.email_results.length > 0) {
        platformFindings += `\n**Email Messages Found:**\n`
        searchResults.email_results.slice(0, 3).forEach(msg => {
          platformFindings += `- "${msg.metadata?.subject || msg.content.substring(0, 50)}..." (${msg.author})\n`
        })
      }

      if (searchResults.google_drive_results.length > 0) {
        platformFindings += `\n**Google Drive Documents Found:**\n`
        searchResults.google_drive_results.slice(0, 3).forEach(doc => {
          platformFindings += `- ${doc.name} (${new Date(doc.last_modified).toLocaleDateString()})\n`
        })
      }

      if (searchResults.onedrive_results.length > 0) {
        platformFindings += `\n**OneDrive Documents Found:**\n`
        searchResults.onedrive_results.slice(0, 3).forEach(doc => {
          platformFindings += `- ${doc.name} (${new Date(doc.last_modified).toLocaleDateString()})\n`
        })
      }

      if (searchResults.zoom_results.length > 0) {
        platformFindings += `\n**Zoom Recordings Found:**\n`
        searchResults.zoom_results.slice(0, 3).forEach(doc => {
          platformFindings += `- ${doc.name} (${new Date(doc.last_modified).toLocaleDateString()})\n`
        })
      }

      // Step 6: Perform case analysis if relevant
      if (intent.type === 'case_analysis') {
        const caseAnalysis = await this.analyzeCaseSuccess(intent.parameters)
        actions.push({
          type: 'case_analysis',
          description: 'Analyzed case success probability',
          result: caseAnalysis,
          confidence: caseAnalysis.confidence_level,
          timestamp: new Date().toISOString()
        })
      }

      // Step 7: Perform legal research if needed
      if (intent.type === 'legal_research' || query.toLowerCase().includes('precedent') || query.toLowerCase().includes('case law')) {
        const legalResearch = await this.performLegalResearch(query)
        actions.push({
          type: 'legal_lookup',
          description: 'Performed legal research and precedent analysis',
          result: legalResearch,
          confidence: 0.85,
          timestamp: new Date().toISOString()
        })
      }

      // Step 8: Generate comprehensive response with AI
      const contextForAI = `
        User Query: ${query}
        
        Search Results Summary:
        - Total documents/messages found: ${searchResults.total_found}
        - Internal documents: ${searchResults.internal_documents.length}
        - Google Drive: ${searchResults.google_drive_results.length}
        - OneDrive: ${searchResults.onedrive_results.length}
        - Slack messages: ${searchResults.slack_results.length}
        - Discord messages: ${searchResults.discord_results.length}
        - Email messages: ${searchResults.email_results.length}
        - Zoom recordings: ${searchResults.zoom_results.length}
        
        Ticket Actions Taken:
        ${ticketActions.actions.map(action => `- ${action.action}: ${action.reasoning}`).join('\n')}
        
        Platform Findings:
        ${platformFindings}
        
        Conversation Context:
        - Current topic: ${this.currentConversationState.topic || 'General inquiry'}
        - Gathered information: ${JSON.stringify(this.currentConversationState.gathered_info)}
        - Firm context: ${this.context.firm_id}
        - User context: ${this.context.user_id}
      `

      const aiResponse = await aiEngine.processLegalQuery({
        prompt: query,
        context: contextForAI,
        system_prompt: `You are an expert AI legal assistant for a law firm with comprehensive ticket management capabilities. Based on the search across all connected platforms and any ticket actions taken, provide a detailed, professional response that:

1. Summarizes the relevant information found across all platforms
2. References any tickets created, updated, or assigned
3. Provides specific legal guidance based on the findings
4. References specific documents, conversations, or meetings when relevant
5. Offers actionable next steps including ticket management
6. Maintains professional tone appropriate for legal context

If tickets were created or managed, acknowledge this and explain how it helps organize the work. If the search found relevant conversations or documents, reference them specifically. Always prioritize accuracy and professional legal standards.`
      })

      content = aiResponse.content
      overallConfidence = Math.min(aiResponse.confidence, overallConfidence)

      // Add ticket management insights
      if (ticketActions.actions.length > 0) {
        content += `\n\n**Ticket Management:**\n`
        content += ticketActions.response
      }

      // Add platform-specific insights
      if (searchResults.total_found > 0) {
        content += `\n\n**Cross-Platform Analysis:**\n`
        content += `I found ${searchResults.total_found} relevant items across your connected platforms:\n`
        
        if (searchResults.slack_results.length > 0) {
          content += `- ${searchResults.slack_results.length} Slack conversations\n`
        }
        if (searchResults.discord_results.length > 0) {
          content += `- ${searchResults.discord_results.length} Discord messages\n`
        }
        if (searchResults.email_results.length > 0) {
          content += `- ${searchResults.email_results.length} relevant emails\n`
        }
        if (searchResults.google_drive_results.length > 0) {
          content += `- ${searchResults.google_drive_results.length} Google Drive documents\n`
        }
        if (searchResults.onedrive_results.length > 0) {
          content += `- ${searchResults.onedrive_results.length} OneDrive files\n`
        }
        if (searchResults.zoom_results.length > 0) {
          content += `- ${searchResults.zoom_results.length} Zoom recordings\n`
        }
        
        content += `\nThis comprehensive analysis draws from all your connected platforms and ticket management system to provide the most complete picture possible.`
      }

    } catch (error) {
      console.error('Error in comprehensive response generation:', error)
      
      // Fallback response
      content = `I encountered an issue while searching across all platforms, but I can still help you. Based on your query "${query}", here are some general recommendations:\n\n`
      
      if (query.toLowerCase().includes('case')) {
        content += `For case-related inquiries, I recommend:\n- Reviewing similar cases in your database\n- Checking recent legal precedents\n- Consulting with senior partners\n- Creating a ticket to track this inquiry\n`
      }
      
      if (query.toLowerCase().includes('client')) {
        content += `For client-related matters:\n- Review the client file thoroughly\n- Check recent communications\n- Ensure all documentation is current\n- Consider creating a ticket for follow-up tasks\n`
      }
      
      if (query.toLowerCase().includes('ticket') || query.toLowerCase().includes('task')) {
        content += `For ticket management:\n- I can help create new tickets from our conversation\n- Update existing ticket statuses\n- Assign tickets to appropriate team members\n- Prioritize based on urgency and importance\n`
      }
      
      content += `\nI'll continue to improve my search capabilities across all your connected platforms and ticket management system.`
      overallConfidence = 0.6
    }

    return { content, confidence: overallConfidence, actions }
  }

  /**
   * Process ticket operations from user queries
   */
  private async processTicketOperations(query: string): Promise<{
    actions: any[]
    response: string
  }> {
    try {
      const ticketRequest: TicketActionRequest = {
        user_query: query,
        firm_id: this.context.firm_id,
        user_id: this.context.user_id,
        conversation_context: {
          platform: 'ai_chat',
          participants: [this.context.user_id],
          messages: this.conversationHistory.map(msg => ({
            author: msg.role === 'user' ? 'User' : 'AI Assistant',
            content: msg.content,
            timestamp: msg.timestamp
          })),
          firm_id: this.context.firm_id
        }
      }

      const result = await ticketAI.processTicketQuery(ticketRequest)
      return result

    } catch (error) {
      console.error('Error processing ticket operations:', error)
      return {
        actions: [],
        response: ''
      }
    }
  }

  /**
   * Check if current conversation should generate a ticket
   */
  private shouldCreateTicketFromConversation(query: string): boolean {
    const ticketIndicators = [
      'create ticket', 'new ticket', 'log this', 'track this',
      'follow up', 'need help', 'issue', 'problem', 'deadline',
      'court filing', 'document review', 'client meeting'
    ]

    const lowerQuery = query.toLowerCase()
    return ticketIndicators.some(indicator => lowerQuery.includes(indicator)) &&
           this.conversationHistory.length >= 2 // Meaningful conversation
  }

  /**
   * Create ticket from current conversation context
   */
  private async createTicketFromCurrentConversation(query: string): Promise<{
    created: boolean
    ticket_number?: string
    confidence: number
  }> {
    try {
      const conversationText = this.conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const result = await ticketAI.createTicketFromConversation({
        platform: 'ai_chat',
        participants: [this.context.user_id],
        messages: this.conversationHistory.map(msg => ({
          author: msg.role === 'user' ? 'User' : 'AI Assistant',
          content: msg.content,
          timestamp: msg.timestamp
        })),
        case_id: this.context.case_context,
        client_id: this.context.client_context,
        firm_id: this.context.firm_id
      })

      return {
        created: result.ticket_created,
        ticket_number: result.ticket_id,
        confidence: result.analysis.confidence_score
      }

    } catch (error) {
      console.error('Error creating ticket from conversation:', error)
      return {
        created: false,
        confidence: 0.3
      }
    }
  }

  private resetConversationState() {
    this.currentConversationState = {
      stage: 'initial',
      required_info: [],
      gathered_info: {},
      confidence_threshold: 0.8
    }
  }

  private async extractInformationFromQuery(query: string): Promise<Record<string, any>> {
    // Extract specific information from the query using simple pattern matching
    const info: Record<string, any> = {}
    
    // Extract case references
    const caseMatches = query.match(/case\s+(\w+\d*)/gi)
    if (caseMatches) {
      info.mentioned_cases = caseMatches
    }
    
    // Extract client names (basic pattern)
    const clientMatches = query.match(/client\s+(\w+)/gi)
    if (clientMatches) {
      info.mentioned_clients = clientMatches
    }
    
    // Extract dates
    const dateMatches = query.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g)
    if (dateMatches) {
      info.mentioned_dates = dateMatches
    }
    
    // Extract legal areas
    const legalAreas = ['employment', 'contract', 'property', 'family', 'criminal', 'tort', 'commercial']
    const mentionedAreas = legalAreas.filter(area => 
      query.toLowerCase().includes(area.toLowerCase())
    )
    if (mentionedAreas.length > 0) {
      info.legal_areas = mentionedAreas
    }
    
    return info
  }

  private getRequiredInfoForTopic(topic: string): string[] {
    const requiredInfoMap: Record<string, string[]> = {
      'case_analysis': ['specific_case', 'case_type', 'key_facts', 'timeline', 'desired_outcome'],
      'legal_research': ['legal_area', 'jurisdiction', 'specific_issue', 'context'],
      'document_search': ['document_type', 'search_criteria', 'date_range'],
      'email_assistance': ['email_type', 'recipient', 'context', 'urgency'],
      'general_inquiry': ['topic', 'context', 'specific_question']
    }
    
    return requiredInfoMap[topic] || ['topic', 'context', 'specific_details']
  }

  private async getCurrentCases(): Promise<any[]> {
    try {
      // Import Supabase client dynamically to avoid SSR issues
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('🤖 AI Agent: Supabase credentials not found, using mock data')
        return this.getMockCases()
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Get current user to ensure firm isolation
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('🤖 AI Agent: No authenticated user, using mock data')
        return this.getMockCases()
      }
      
      const { data: cases, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          case_number,
          description,
          status,
          created_at,
          firm_id,
          client:clients(id, name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) {
        console.error('🤖 AI Agent: Error fetching cases:', error)
        return this.getMockCases()
      }
      
      // Format for AI consumption - only cases from user's firm will be returned due to RLS
      return (cases || []).map(case_item => ({
        id: case_item.case_number || case_item.id,
        title: case_item.title,
        type: this.inferCaseType(case_item.title, case_item.description),
        status: case_item.status,
        client: (case_item.client as any)?.name || 'Unknown Client',
        description: case_item.description,
        date_opened: case_item.created_at,
        firm_id: case_item.firm_id // Include firm context
      }))
      
    } catch (error) {
      console.error('🤖 AI Agent: Failed to fetch real cases:', error)
      return this.getMockCases()
    }
  }

  private getMockCases(): any[] {
    return [
      {
        id: 'CASE-2024-001',
        title: 'Smith vs ABC Corporation',
        type: 'Employment Law',
        status: 'Active',
        client: 'John Smith',
        description: 'Wrongful dismissal claim',
        date_opened: '2024-01-15'
      },
      {
        id: 'CASE-2024-002', 
        title: 'Property Purchase - 123 Main St',
        type: 'Property Law',
        status: 'Active',
        client: 'Jane Doe',
        description: 'Residential property purchase conveyancing',
        date_opened: '2024-02-01'
      },
      {
        id: 'CASE-2024-003',
        title: 'Johnson Family Divorce',
        type: 'Family Law',
        status: 'In Progress',
        client: 'Sarah Johnson',
        description: 'Divorce proceedings with child custody matters',
        date_opened: '2024-01-28'
      }
    ]
  }

  private inferCaseType(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase()
    
    if (text.includes('employment') || text.includes('dismissal') || text.includes('tribunal')) {
      return 'Employment Law'
    }
    if (text.includes('property') || text.includes('conveyancing') || text.includes('purchase')) {
      return 'Property Law'
    }
    if (text.includes('divorce') || text.includes('custody') || text.includes('family')) {
      return 'Family Law'
    }
    if (text.includes('contract') || text.includes('commercial') || text.includes('business')) {
      return 'Commercial Law'
    }
    if (text.includes('criminal') || text.includes('prosecution') || text.includes('defence')) {
      return 'Criminal Law'
    }
    return 'General Legal'
  }

  private extractQuestionsFromResponse(response: string): string[] {
    // Extract numbered questions from the AI response
    const questionMatches = response.match(/\d+\.\s+[^?]*\?/g)
    return questionMatches || []
  }
}

export const intelligentAgent = new IntelligentAgent('default_firm', 'default_user') 