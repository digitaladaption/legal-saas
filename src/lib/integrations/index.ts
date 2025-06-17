/**
 * Integration Services Index
 * Exports all integration services and types
 */

// Billing Services
export {
  BillingService,
  createBillingService,
  handleBillingWebhook,
  type BillingConfig,
  type Invoice,
  type InvoiceItem,
  type Payment,
  type BillingWebhookEvent
} from './billing-service'

// Court Filing Services
export {
  CourtFilingService,
  createCourtFilingService,
  formatCaseNumber,
  generateFilingReceipt,
  type CourtFilingConfig,
  type FilingDocument,
  type CourtFiling,
  type CourtParty,
  type AttorneyInfo,
  type ServiceInfo,
  type DocketEntry,
  type CaseStatus
} from './court-filing-service'

// Legal Research Services
export {
  LegalResearchService,
  createLegalResearchService,
  type LegalResearchConfig,
  type SearchQuery,
  type LegalDocument,
  type CaseLaw,
  type CitingCase,
  type KeyNumber
} from './legal-research-service'

// Calendar Services
export {
  CalendarService,
  createCalendarService,
  type CalendarConfig,
  type CalendarEvent,
  type Attendee,
  type Reminder,
  type RecurrenceRule,
  type CourtDate
} from './calendar-service'

// Common types
export interface IntegrationConfig {
  id: string
  name: string
  type: 'billing' | 'court_filing' | 'legal_research' | 'calendar'
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  credentials: Record<string, string>
  settings: Record<string, any>
  webhook_url?: string
  created_at: string
  updated_at: string
}

export interface IntegrationService {
  testConnection(): Promise<{ success: boolean; message: string }>
}

// Integration factory
export function createIntegrationService(config: IntegrationConfig): IntegrationService {
  const { createBillingService } = require('./billing-service')
  const { createCourtFilingService } = require('./court-filing-service')
  const { createLegalResearchService } = require('./legal-research-service')
  const { createCalendarService } = require('./calendar-service')

  switch (config.type) {
    case 'billing':
      return createBillingService({
        provider: config.provider as any,
        ...config.credentials,
        ...config.settings
      })
    
    case 'court_filing':
      return createCourtFilingService({
        provider: config.provider as any,
        ...config.credentials,
        ...config.settings
      })
    
    case 'legal_research':
      return createLegalResearchService({
        provider: config.provider as any,
        ...config.credentials,
        ...config.settings
      })
    
    case 'calendar':
      return createCalendarService({
        provider: config.provider as any,
        ...config.credentials,
        ...config.settings
      })
    
    default:
      throw new Error(`Unsupported integration type: ${config.type}`)
  }
}

// Integration status helpers
export function getIntegrationStatus(config: IntegrationConfig): string {
  switch (config.status) {
    case 'connected':
      return '✅ Connected'
    case 'disconnected':
      return '❌ Disconnected'
    case 'error':
      return '⚠️ Error'
    case 'pending':
      return '🔄 Pending'
    default:
      return '❓ Unknown'
  }
}

export function isIntegrationHealthy(config: IntegrationConfig): boolean {
  return config.status === 'connected'
}

// Integration validation
export function validateIntegrationConfig(config: Partial<IntegrationConfig>): string[] {
  const errors: string[] = []
  
  if (!config.name?.trim()) {
    errors.push('Integration name is required')
  }
  
  if (!config.type) {
    errors.push('Integration type is required')
  }
  
  if (!config.provider?.trim()) {
    errors.push('Provider is required')
  }
  
  return errors
} 