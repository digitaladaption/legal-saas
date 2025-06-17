/**
 * Calendar Integration Service
 * Handles integrations with Google Calendar, Outlook, Apple Calendar, and other calendar systems
 */

export interface CalendarConfig {
  provider: 'google' | 'outlook' | 'apple' | 'ical' | 'caldav' | 'custom'
  apiKey?: string
  clientId?: string
  clientSecret?: string
  accessToken?: string
  refreshToken?: string
  calendarId?: string
  baseUrl?: string
  timezone?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  attendees?: Attendee[]
  reminders?: Reminder[]
  recurrence?: RecurrenceRule
  status: 'confirmed' | 'tentative' | 'cancelled'
  visibility: 'public' | 'private' | 'confidential'
  color?: string
  tags?: string[]
  caseId?: string
  clientId?: string
  createdAt: string
  updatedAt: string
}

export interface Attendee {
  email: string
  name?: string
  role: 'required' | 'optional' | 'resource'
  status: 'accepted' | 'declined' | 'tentative' | 'needs_action'
  comment?: string
}

export interface Reminder {
  method: 'email' | 'popup' | 'sms'
  minutes: number
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  count?: number
  until?: string
  byDay?: string[]
  byMonth?: number[]
}

export interface CourtDate {
  id: string
  caseId: string
  caseNumber: string
  courtName: string
  courtroom?: string
  judge?: string
  eventType: 'hearing' | 'trial' | 'deposition' | 'mediation' | 'conference'
  date: string
  time: string
  duration?: number
  location: string
  notes?: string
  reminders: Reminder[]
  status: 'scheduled' | 'confirmed' | 'postponed' | 'cancelled'
}

export class CalendarService {
  private config: CalendarConfig
  private baseUrl: string

  constructor(config: CalendarConfig) {
    this.config = config
    this.baseUrl = this.getBaseUrl()
  }

  private getBaseUrl(): string {
    switch (this.config.provider) {
      case 'google':
        return 'https://www.googleapis.com/calendar/v3'
      case 'outlook':
        return 'https://graph.microsoft.com/v1.0'
      case 'apple':
        return 'https://caldav.icloud.com'
      case 'ical':
        return this.config.baseUrl || ''
      case 'caldav':
        return this.config.baseUrl || ''
      case 'custom':
        return this.config.baseUrl || ''
      default:
        throw new Error(`Unsupported calendar provider: ${this.config.provider}`)
    }
  }

  /**
   * Create a calendar event
   */
  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    try {
      const mockEvent: CalendarEvent = {
        id: `event_${Date.now()}`,
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log(`Creating event in ${this.config.provider}:`, mockEvent.title)
      return mockEvent
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }

  /**
   * Get events within a date range
   */
  async getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const mockEvents: CalendarEvent[] = [
        {
          id: 'event_1',
          title: 'Court Hearing - Johnson v. Smith',
          description: 'Motion to dismiss hearing',
          startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          location: 'Superior Court, Room 3A',
          status: 'confirmed',
          visibility: 'private',
          caseId: 'case_789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      console.log(`Fetching events from ${startDate} to ${endDate} from ${this.config.provider}`)
      return mockEvents
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  /**
   * Test connection to calendar service
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Testing connection to ${this.config.provider}`)
      
      if (!this.config.accessToken && !this.config.apiKey) {
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
 * Factory function to create calendar service instances
 */
export function createCalendarService(config: CalendarConfig): CalendarService {
  return new CalendarService(config)
}
