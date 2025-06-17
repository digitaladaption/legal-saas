/**
 * Court Filing Integration Service
 * Handles integrations with CM/ECF, state court systems, and e-filing portals
 */

export interface CourtFilingConfig {
  provider: 'cmecf' | 'texas_online' | 'ny_courts' | 'ca_courts' | 'custom'
  username?: string
  password?: string
  apiKey?: string
  courtId?: string
  jurisdiction?: string
  sandbox?: boolean
  filingEndpoint?: string
}

export interface FilingDocument {
  id: string
  name: string
  type: 'motion' | 'complaint' | 'answer' | 'brief' | 'exhibit' | 'notice' | 'order'
  filePath: string
  mimeType: string
  size: number
  pages?: number
  description?: string
}

export interface CourtFiling {
  id: string
  caseId: string
  caseNumber?: string
  courtId: string
  filingType: string
  documents: FilingDocument[]
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'processed'
  submittedAt?: string
  processedAt?: string
  confirmationNumber?: string
  docketNumber?: string
  fees?: {
    amount: number
    currency: string
    waived: boolean
  }
  parties: CourtParty[]
  attorney: AttorneyInfo
  serviceList?: ServiceInfo[]
  errorMessage?: string
  createdAt: string
}

export interface CourtParty {
  id: string
  name: string
  type: 'plaintiff' | 'defendant' | 'petitioner' | 'respondent' | 'intervenor'
  role?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  counsel?: AttorneyInfo
}

export interface AttorneyInfo {
  id: string
  name: string
  barNumber?: string
  firm?: string
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}

export interface ServiceInfo {
  partyId: string
  method: 'electronic' | 'mail' | 'hand_delivery' | 'publication'
  address?: string
  email?: string
  servedAt?: string
  confirmed: boolean
}

export interface DocketEntry {
  id: string
  caseId: string
  entryNumber: number
  filingDate: string
  description: string
  documentType: string
  filer: string
  pages?: number
  link?: string
}

export interface CaseStatus {
  caseId: string
  caseNumber: string
  status: string
  filingDate: string
  lastModified: string
  nextHearing?: {
    date: string
    time: string
    location: string
    type: string
  }
  judge?: {
    name: string
    title: string
  }
  docketEntries: DocketEntry[]
}

export class CourtFilingService {
  private config: CourtFilingConfig
  private baseUrl: string

  constructor(config: CourtFilingConfig) {
    this.config = config
    this.baseUrl = this.getBaseUrl()
  }

  private getBaseUrl(): string {
    switch (this.config.provider) {
      case 'cmecf':
        return this.config.sandbox 
          ? 'https://ecf-train.uscourts.gov'
          : 'https://ecf.uscourts.gov'
      case 'texas_online':
        return 'https://www.txcourts.gov/efiling'
      case 'ny_courts':
        return 'https://iapps.courts.state.ny.us/nyscef'
      case 'ca_courts':
        return 'https://www.courts.ca.gov/efiling'
      case 'custom':
        return this.config.filingEndpoint || ''
      default:
        throw new Error(`Unsupported court filing provider: ${this.config.provider}`)
    }
  }

  /**
   * Submit a filing to the court system
   */
  async submitFiling(filing: Omit<CourtFiling, 'id' | 'createdAt' | 'status'>): Promise<CourtFiling> {
    try {
      // Mock implementation for demo purposes
      const mockFiling: CourtFiling = {
        id: `filing_${Date.now()}`,
        ...filing,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        confirmationNumber: `CONF-${Date.now()}`,
        createdAt: new Date().toISOString()
      }
      
      console.log(`Submitting filing to ${this.config.provider}:`, mockFiling)
      return mockFiling
    } catch (error) {
      console.error('Error submitting filing:', error)
      throw error
    }
  }

  /**
   * Get filing status by ID
   */
  async getFilingStatus(filingId: string): Promise<CourtFiling> {
    try {
      // Mock implementation
      const mockFiling: CourtFiling = {
        id: filingId,
        caseId: 'case_123',
        caseNumber: '2024-CV-001234',
        courtId: 'court_sdny',
        filingType: 'Motion to Dismiss',
        documents: [
          {
            id: 'doc_1',
            name: 'Motion to Dismiss.pdf',
            type: 'motion',
            filePath: '/documents/motion-dismiss.pdf',
            mimeType: 'application/pdf',
            size: 245760,
            pages: 15,
            description: 'Motion to Dismiss for Failure to State a Claim'
          }
        ],
        status: 'accepted',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        confirmationNumber: 'CONF-1234567890',
        docketNumber: '123-1',
        fees: {
          amount: 350.00,
          currency: 'USD',
          waived: false
        },
        parties: [
          {
            id: 'party_1',
            name: 'John Smith',
            type: 'plaintiff'
          }
        ],
        attorney: {
          id: 'atty_1',
          name: 'Attorney Johnson',
          barNumber: 'NY123456',
          firm: 'Johnson & Associates',
          email: 'attorney@lawfirm.com'
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
      
      return mockFiling
    } catch (error) {
      console.error('Error fetching filing status:', error)
      throw error
    }
  }

  /**
   * Get case docket information
   */
  async getCaseDocket(caseNumber: string): Promise<CaseStatus> {
    try {
      // Mock implementation
      const mockCaseStatus: CaseStatus = {
        caseId: 'case_123',
        caseNumber: caseNumber,
        status: 'Active',
        filingDate: '2024-01-15T10:00:00Z',
        lastModified: new Date().toISOString(),
        nextHearing: {
          date: '2024-07-15',
          time: '10:00 AM',
          location: 'Courtroom 3A',
          type: 'Motion Hearing'
        },
        judge: {
          name: 'Hon. Sarah Wilson',
          title: 'District Judge'
        },
        docketEntries: [
          {
            id: 'entry_1',
            caseId: 'case_123',
            entryNumber: 1,
            filingDate: '2024-01-15T10:00:00Z',
            description: 'Complaint filed by plaintiff',
            documentType: 'Complaint',
            filer: 'Attorney Johnson',
            pages: 20
          }
        ]
      }
      
      console.log(`Fetching docket for case ${caseNumber} from ${this.config.provider}`)
      return mockCaseStatus
    } catch (error) {
      console.error('Error fetching case docket:', error)
      throw error
    }
  }

  /**
   * Test connection to court filing system
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Testing connection to ${this.config.provider} court system`)
      
      if (!this.config.username || !this.config.password) {
        return {
          success: false,
          message: 'Missing authentication credentials'
        }
      }
      
      return { 
        success: true, 
        message: `Successfully connected to ${this.config.provider}` 
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }
}

/**
 * Factory function to create court filing service instances
 */
export function createCourtFilingService(config: CourtFilingConfig): CourtFilingService {
  return new CourtFilingService(config)
}

/**
 * Utility function to format case numbers for different court systems
 */
export function formatCaseNumber(caseNumber: string, provider: string): string {
  switch (provider) {
    case 'cmecf':
      // Federal format: 1:24-cv-00123
      return caseNumber.replace(/[^\d:-]/g, '')
    case 'texas_online':
      // Texas format: DC-24-00123
      return caseNumber.toUpperCase()
    case 'ny_courts':
      // NY format: 123456/2024
      return caseNumber.replace(/[^\d/]/g, '')
    case 'ca_courts':
      // CA format: 24STCV00123
      return caseNumber.toUpperCase().replace(/[^\w]/g, '')
    default:
      return caseNumber
  }
}

/**
 * Generate filing receipt/confirmation
 */
export function generateFilingReceipt(filing: CourtFiling): string {
  return `
Filing Receipt
--------------
Confirmation Number: ${filing.confirmationNumber}
Case Number: ${filing.caseNumber}
Filing Type: ${filing.filingType}
Submitted: ${new Date(filing.submittedAt!).toLocaleString()}
Status: ${filing.status}
Documents: ${filing.documents.length}
Fees: $${filing.fees?.amount || 0}
  `
} 