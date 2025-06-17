'use client'

import { useEffect, useState } from 'react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Users,
  Scale,
  FileText,
  MapPin
} from 'lucide-react'
import type { Case, Client } from '@/lib/supabase'

interface Event {
  id: string
  title: string
  description: string | null
  event_type: 'court_hearing' | 'client_meeting' | 'deadline' | 'internal_meeting'
  start_time: string
  end_time: string | null
  location: string | null
  case_id: string | null
  attendees: string[] | null
  created_at: string
  case?: Case & { client: Client }
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  async function fetchEvents() {
    try {
      // For demo purposes, let's fetch from a hypothetical events table
      // In a real app, you might have an events table
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Since we don't have an events table yet, let's create some mock data
      // You would replace this with actual Supabase query
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Court Hearing - Smith vs. Johnson',
          description: 'Initial hearing for divorce proceedings',
          event_type: 'court_hearing',
          start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 10, 0).toISOString(),
          end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 11, 30).toISOString(),
          location: 'Courtroom 3A, Family Court',
          case_id: null,
          attendees: ['John Smith', 'Attorney Johnson'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Client Meeting - Estate Planning',
          description: 'Review will and trust documents',
          event_type: 'client_meeting',
          start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18, 14, 0).toISOString(),
          end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18, 15, 0).toISOString(),
          location: 'Conference Room B',
          case_id: null,
          attendees: ['Maria Garcia', 'Attorney Wilson'],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Filing Deadline - Motion to Dismiss',
          description: 'Must file motion by end of business day',
          event_type: 'deadline',
          start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25, 17, 0).toISOString(),
          end_time: null,
          location: null,
          case_id: null,
          attendees: null,
          created_at: new Date().toISOString()
        }
      ]

      setEvents(mockEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'court_hearing':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'client_meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deadline':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'internal_meeting':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'court_hearing':
        return <Scale className="h-4 w-4" />
      case 'client_meeting':
        return <Users className="h-4 w-4" />
      case 'deadline':
        return <Clock className="h-4 w-4" />
      case 'internal_meeting':
        return <FileText className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const filteredEvents = events.filter(event => 
    typeFilter === 'all' || event.event_type === typeFilter
  )

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.start_time) > new Date())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Manage court dates, meetings, and deadlines</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Calendar Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Events</option>
                  <option value="court_hearing">Court Hearings</option>
                  <option value="client_meeting">Client Meetings</option>
                  <option value="deadline">Deadlines</option>
                  <option value="internal_meeting">Internal Meetings</option>
                </select>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border border-gray-100 rounded ${
                      day ? 'hover:bg-gray-50' : ''
                    }`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {getEventsForDay(day).slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded border ${getEventTypeColor(event.event_type)}`}
                            >
                              <div className="flex items-center gap-1">
                                {getEventTypeIcon(event.event_type)}
                                <span className="truncate">{event.title}</span>
                              </div>
                            </div>
                          ))}
                          {getEventsForDay(day).length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{getEventsForDay(day).length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-3">
                    <div className="flex items-start gap-2">
                      {getEventTypeIcon(event.event_type)}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(event.start_time)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Court Hearings</span>
                </div>
                <span className="text-sm font-medium">
                  {events.filter(e => e.event_type === 'court_hearing').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Client Meetings</span>
                </div>
                <span className="text-sm font-medium">
                  {events.filter(e => e.event_type === 'client_meeting').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Deadlines</span>
                </div>
                <span className="text-sm font-medium">
                  {events.filter(e => e.event_type === 'deadline').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 