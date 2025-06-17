/**
 * Billing Integration Service
 * Handles integrations with QuickBooks, Xero, FreshBooks, and other billing systems
 */

export interface BillingConfig {
  provider: 'quickbooks' | 'xero' | 'freshbooks' | 'bill4time'
  apiKey?: string
  secretKey?: string
  accessToken?: string
  refreshToken?: string
  companyId?: string
  sandbox?: boolean
  webhookUrl?: string
}

export interface Invoice {
  id: string
  clientId: string
  caseId?: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  items: InvoiceItem[]
  createdAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
  billableType?: 'time' | 'expense' | 'flat_fee'
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  currency: string
  method: 'credit_card' | 'bank_transfer' | 'check' | 'cash'
  receivedAt: string
  reference?: string
}

export interface BillingWebhookEvent {
  id: string
  type: 'invoice.created' | 'invoice.paid' | 'payment.received' | 'client.updated'
  data: any
  timestamp: string
  provider: string
}

export class BillingService {
  private config: BillingConfig
  private baseUrl: string

  constructor(config: BillingConfig) {
    this.config = config
    this.baseUrl = this.getBaseUrl()
  }

  private getBaseUrl(): string {
    switch (this.config.provider) {
      case 'quickbooks':
        return this.config.sandbox 
          ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
          : 'https://quickbooks.api.intuit.com/v3/company'
      case 'xero':
        return 'https://api.xero.com/api.xro/2.0'
      case 'freshbooks':
        return 'https://api.freshbooks.com/accounting'
      case 'bill4time':
        return 'https://www.bill4time.com/api/web'
      default:
        throw new Error(`Unsupported billing provider: ${this.config.provider}`)
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`Billing API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private getAuthHeaders(): Record<string, string> {
    switch (this.config.provider) {
      case 'quickbooks':
        return {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      case 'xero':
        return {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Xero-tenant-id': this.config.companyId || ''
        }
      case 'freshbooks':
        return {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      case 'bill4time':
        return {
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.secretKey}`).toString('base64')}`
        }
      default:
        return {}
    }
  }

  /**
   * Create an invoice in the billing system
   */
  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
    try {
      let endpoint: string
      let payload: any

      switch (this.config.provider) {
        case 'quickbooks':
          endpoint = `/${this.config.companyId}/invoice`
          payload = this.formatQuickBooksInvoice(invoice)
          break
        case 'xero':
          endpoint = '/Invoices'
          payload = this.formatXeroInvoice(invoice)
          break
        case 'freshbooks':
          endpoint = '/invoices'
          payload = this.formatFreshBooksInvoice(invoice)
          break
        case 'bill4time':
          endpoint = '/invoice'
          payload = this.formatBill4TimeInvoice(invoice)
          break
        default:
          throw new Error(`Invoice creation not implemented for ${this.config.provider}`)
      }

      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      return this.parseInvoiceResponse(response)
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      let endpoint: string

      switch (this.config.provider) {
        case 'quickbooks':
          endpoint = `/${this.config.companyId}/invoice/${invoiceId}`
          break
        case 'xero':
          endpoint = `/Invoices/${invoiceId}`
          break
        case 'freshbooks':
          endpoint = `/invoices/${invoiceId}`
          break
        case 'bill4time':
          endpoint = `/invoice/${invoiceId}`
          break
        default:
          throw new Error(`Invoice retrieval not implemented for ${this.config.provider}`)
      }

      const response = await this.makeRequest(endpoint)
      return this.parseInvoiceResponse(response)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      throw error
    }
  }

  /**
   * Record a payment for an invoice
   */
  async recordPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    try {
      let endpoint: string
      let payload: any

      switch (this.config.provider) {
        case 'quickbooks':
          endpoint = `/${this.config.companyId}/payment`
          payload = this.formatQuickBooksPayment(payment)
          break
        case 'xero':
          endpoint = '/Payments'
          payload = this.formatXeroPayment(payment)
          break
        case 'freshbooks':
          endpoint = '/payments'
          payload = this.formatFreshBooksPayment(payment)
          break
        case 'bill4time':
          endpoint = '/payment'
          payload = this.formatBill4TimePayment(payment)
          break
        default:
          throw new Error(`Payment recording not implemented for ${this.config.provider}`)
      }

      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      return this.parsePaymentResponse(response)
    } catch (error) {
      console.error('Error recording payment:', error)
      throw error
    }
  }

  /**
   * Sync client data from billing system
   */
  async syncClients(): Promise<any[]> {
    try {
      let endpoint: string

      switch (this.config.provider) {
        case 'quickbooks':
          endpoint = `/${this.config.companyId}/customers`
          break
        case 'xero':
          endpoint = '/Contacts'
          break
        case 'freshbooks':
          endpoint = '/clients'
          break
        case 'bill4time':
          endpoint = '/clients'
          break
        default:
          throw new Error(`Client sync not implemented for ${this.config.provider}`)
      }

      const response = await this.makeRequest(endpoint)
      return this.parseClientsResponse(response)
    } catch (error) {
      console.error('Error syncing clients:', error)
      throw error
    }
  }

  /**
   * Process webhook events from billing system
   */
  static async processWebhookEvent(event: BillingWebhookEvent): Promise<void> {
    try {
      console.log(`Processing billing webhook: ${event.type}`, event)

      switch (event.type) {
        case 'invoice.created':
          await this.handleInvoiceCreated(event)
          break
        case 'invoice.paid':
          await this.handleInvoicePaid(event)
          break
        case 'payment.received':
          await this.handlePaymentReceived(event)
          break
        case 'client.updated':
          await this.handleClientUpdated(event)
          break
        default:
          console.log(`Unhandled webhook event type: ${event.type}`)
      }
    } catch (error) {
      console.error('Error processing billing webhook:', error)
      throw error
    }
  }

  private static async handleInvoiceCreated(event: BillingWebhookEvent): Promise<void> {
    // Update case with invoice information
    // Send notification to attorney
    // Log billing activity
    console.log('Handling invoice created event')
  }

  private static async handleInvoicePaid(event: BillingWebhookEvent): Promise<void> {
    // Update payment status in case
    // Send payment confirmation to client
    // Update financial reports
    console.log('Handling invoice paid event')
  }

  private static async handlePaymentReceived(event: BillingWebhookEvent): Promise<void> {
    // Record payment in case management system
    // Update client payment history
    // Trigger any payment-dependent automations
    console.log('Handling payment received event')
  }

  private static async handleClientUpdated(event: BillingWebhookEvent): Promise<void> {
    // Sync client data changes
    // Update contact information
    console.log('Handling client updated event')
  }

  // Format methods for different providers
  private formatQuickBooksInvoice(invoice: any): any {
    return {
      Line: invoice.items.map((item: InvoiceItem) => ({
        Amount: item.amount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: '1' }, // Default service item
          Qty: item.quantity,
          UnitPrice: item.rate
        }
      })),
      CustomerRef: { value: invoice.clientId },
      DueDate: invoice.dueDate,
      TotalAmt: invoice.amount
    }
  }

  private formatXeroInvoice(invoice: any): any {
    return {
      Type: 'ACCREC',
      Contact: { ContactID: invoice.clientId },
      Date: new Date().toISOString().split('T')[0],
      DueDate: invoice.dueDate,
      LineItems: invoice.items.map((item: InvoiceItem) => ({
        Description: item.description,
        Quantity: item.quantity,
        UnitAmount: item.rate,
        LineAmount: item.amount
      }))
    }
  }

  private formatFreshBooksInvoice(invoice: any): any {
    return {
      customerid: invoice.clientId,
      create_date: new Date().toISOString().split('T')[0],
      due_date: invoice.dueDate,
      lines: invoice.items.map((item: InvoiceItem) => ({
        name: item.description,
        qty: item.quantity,
        unit_cost: { amount: item.rate.toString() },
        amount: { amount: item.amount.toString() }
      }))
    }
  }

  private formatBill4TimeInvoice(invoice: any): any {
    return {
      ClientId: invoice.clientId,
      InvoiceDate: new Date().toISOString(),
      DueDate: invoice.dueDate,
      LineItems: invoice.items.map((item: InvoiceItem) => ({
        Description: item.description,
        Hours: item.quantity,
        Rate: item.rate,
        Amount: item.amount
      }))
    }
  }

  private formatQuickBooksPayment(payment: any): any {
    return {
      TotalAmt: payment.amount,
      CustomerRef: { value: payment.clientId },
      Line: [{
        Amount: payment.amount,
        LinkedTxn: [{ TxnId: payment.invoiceId, TxnType: 'Invoice' }]
      }]
    }
  }

  private formatXeroPayment(payment: any): any {
    return {
      Invoice: { InvoiceID: payment.invoiceId },
      Account: { Code: '200' }, // Default bank account
      Date: payment.receivedAt,
      Amount: payment.amount
    }
  }

  private formatFreshBooksPayment(payment: any): any {
    return {
      invoiceid: payment.invoiceId,
      amount: { amount: payment.amount.toString() },
      date: payment.receivedAt,
      type: payment.method
    }
  }

  private formatBill4TimePayment(payment: any): any {
    return {
      InvoiceId: payment.invoiceId,
      Amount: payment.amount,
      PaymentDate: payment.receivedAt,
      PaymentMethod: payment.method
    }
  }

  // Parse response methods
  private parseInvoiceResponse(response: any): Invoice {
    // Implementation would depend on the provider's response format
    // This is a simplified version
    return {
      id: response.id || response.Invoice?.Id || response.invoiceid,
      clientId: response.clientId || response.CustomerRef?.value || response.customerid,
      amount: response.amount || response.TotalAmt || response.total?.amount,
      currency: response.currency || 'USD',
      status: this.normalizeInvoiceStatus(response.status || response.Balance || response.outstanding?.amount),
      dueDate: response.dueDate || response.DueDate || response.due_date,
      items: response.items || [],
      createdAt: response.createdAt || response.TimeCreated || response.created_at
    }
  }

  private parsePaymentResponse(response: any): Payment {
    return {
      id: response.id || response.Payment?.Id || response.paymentid,
      invoiceId: response.invoiceId || response.Line?.[0]?.LinkedTxn?.[0]?.TxnId || response.invoiceid,
      amount: response.amount || response.TotalAmt || response.amount?.amount,
      currency: response.currency || 'USD',
      method: response.method || response.PaymentMethodRef?.name || response.type,
      receivedAt: response.receivedAt || response.TxnDate || response.date,
      reference: response.reference || response.PaymentRefNum || response.note
    }
  }

  private parseClientsResponse(response: any): any[] {
    // Parse clients based on provider format
    if (Array.isArray(response)) {
      return response
    }
    
    return response.QueryResponse?.Customer || 
           response.Contacts || 
           response.clients || 
           []
  }

  private normalizeInvoiceStatus(status: any): 'draft' | 'sent' | 'paid' | 'overdue' {
    if (typeof status === 'number' && status === 0) return 'paid'
    if (typeof status === 'string') {
      const lowerStatus = status.toLowerCase()
      if (lowerStatus.includes('paid')) return 'paid'
      if (lowerStatus.includes('sent') || lowerStatus.includes('authorized')) return 'sent'
      if (lowerStatus.includes('overdue')) return 'overdue'
      if (lowerStatus.includes('draft')) return 'draft'
    }
    return 'sent' // Default
  }

  /**
   * Test connection to billing system
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      let endpoint: string

      switch (this.config.provider) {
        case 'quickbooks':
          endpoint = `/${this.config.companyId}/companyinfo/${this.config.companyId}`
          break
        case 'xero':
          endpoint = '/Organisations'
          break
        case 'freshbooks':
          endpoint = '/users/me'
          break
        case 'bill4time':
          endpoint = '/company'
          break
        default:
          throw new Error(`Connection test not implemented for ${this.config.provider}`)
      }

      await this.makeRequest(endpoint)
      return { success: true, message: 'Connection successful' }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }
}

/**
 * Factory function to create billing service instances
 */
export function createBillingService(config: BillingConfig): BillingService {
  return new BillingService(config)
}

/**
 * Webhook endpoint handler for billing system events
 */
export async function handleBillingWebhook(
  provider: string,
  payload: any,
  headers: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  try {
    const event: BillingWebhookEvent = {
      id: payload.id || Date.now().toString(),
      type: payload.type || payload.event_type,
      data: payload.data || payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      provider
    }

    await BillingService.processWebhookEvent(event)
    return { success: true, message: 'Webhook processed successfully' }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Webhook processing failed' 
    }
  }
} 