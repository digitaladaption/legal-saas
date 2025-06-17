'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { 
  Scale, 
  FileText, 
  MessageSquare, 
  Calendar,
  Download,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import type { Case, Client, Document } from '@/lib/supabase'

interface ClientPortalData {
  client: Client
  cases: Case[]
  documents: Document[]
  messages: any[]
  upcomingEvents: any[]
}

export default function ClientPortalPage() {
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'messages' | 'calendar'>('overview')

  useEffect(() => {
    fetchClientPortalData()
  }, [])

  async function fetchClientPortalData() {
    try {
      // For demo purposes, let's create mock client portal data
      // In a real implementation, you'd authenticate the client and fetch their specific data
      const mockPortalData: ClientPortalData = {
        client: {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567',
          address: '123 Main Street, Springfield, IL 62701',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        cases: [
          {
            id: '1',
            title: 'Divorce Proceedings - Johnson vs. Johnson',
            description: 'Dissolution of marriage with child custody considerations',
            status: 'active',
            priority: 'high' as const,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-06-01T14:30:00Z',
            client_id: '1',
            assigned_user_id: '1',
            due_date: '2024-07-15T17:00:00Z',
            kanban_stage_id: '3',
            team_id: '1',
            case_type_id: '1',
            source: 'referral'
          },
          {
            id: '2',
            title: 'Estate Planning - Last Will and Testament',
            description: 'Preparation of will and trust documents',
            status: 'completed',
            priority: 'medium' as const,
            created_at: '2024-02-01T09:00:00Z',
            updated_at: '2024-05-15T16:00:00Z',
            client_id: '1',
            assigned_user_id: '2',
            due_date: null,
            kanban_stage_id: '11',
            team_id: '2',
            case_type_id: '2',
            source: 'website'
          }
        ],
        documents: [
          {
            id: '1',
            name: 'Divorce Petition - Filed.pdf',
            file_path: 'documents/divorce-petition.pdf',
            file_size: 245760,
            mime_type: 'application/pdf',
            case_id: '1',
            uploaded_by: 'attorney-id',
            created_at: '2024-01-20T11:00:00Z'
          },
          {
            id: '2',
            name: 'Financial Disclosure Statement.pdf',
            file_path: 'documents/financial-disclosure.pdf',
            file_size: 182340,
            mime_type: 'application/pdf',
            case_id: '1',
            uploaded_by: 'attorney-id',
            created_at: '2024-02-10T14:30:00Z'
          },
          {
            id: '3',
            name: 'Final Will Document.pdf',
            file_path: 'documents/will-final.pdf',
            file_size: 156789,
            mime_type: 'application/pdf',
            case_id: '2',
            uploaded_by: 'attorney-id',
            created_at: '2024-05-15T16:00:00Z'
          }
        ],
        messages: [
          {
            id: '1',
            case_id: '1',
            from: 'Attorney Wilson',
            message: 'Hi Sarah, I\'ve filed the divorce petition today. You should receive confirmation from the court within 3-5 business days.',
            timestamp: '2024-01-20T11:30:00Z',
            read: true
          },
          {
            id: '2', 
            case_id: '1',
            from: 'Attorney Wilson',
            message: 'Please review the financial disclosure statement I\'ve uploaded. Let me know if you have any questions.',
            timestamp: '2024-02-10T15:00:00Z',
            read: false
          }
        ],
        upcomingEvents: [
          {
            id: '1',
            title: 'Court Hearing - Preliminary Conference',
            date: '2024-07-10T10:00:00Z',
            location: 'Family Court, Room 3A',
            case_id: '1'
          },
          {
            id: '2',
            title: 'Attorney Meeting - Case Review',
            date: '2024-06-25T14:00:00Z',
            location: 'Law Office Conference Room',
            case_id: '1'
          }
        ]
      }

      setPortalData(mockPortalData)
      setSelectedCase(mockPortalData.cases[0]?.id || null)
    } catch (error) {
      console.error('Error fetching client portal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'on_hold':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'on_hold':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const selectedCaseData = portalData?.cases.find(c => c.id === selectedCase)
  const selectedCaseDocuments = portalData?.documents.filter(d => d.case_id === selectedCase) || []
  const selectedCaseMessages = portalData?.messages.filter(m => m.case_id === selectedCase) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!portalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please contact your attorney for portal access.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600">Welcome, {portalData.client.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{portalData.client.name}</div>
                <div className="text-xs text-gray-500">{portalData.client.email}</div>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Client Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{portalData.client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{portalData.client.email}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{portalData.client.address}</span>
                </div>
              </div>
            </div>

            {/* Cases List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Cases</h3>
              <div className="space-y-3">
                {portalData.cases.map((case_item) => (
                  <button
                    key={case_item.id}
                    onClick={() => setSelectedCase(case_item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCase === case_item.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {case_item.title}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(case_item.status)}`}>
                        {getStatusIcon(case_item.status)}
                        {case_item.status}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated: {formatDate(case_item.updated_at)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedCaseData && (
              <>
                {/* Case Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedCaseData.title}</h2>
                      <p className="text-gray-600 mt-1">{selectedCaseData.description}</p>
                    </div>
                    <div className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(selectedCaseData.status)}`}>
                      {getStatusIcon(selectedCaseData.status)}
                      {selectedCaseData.status.charAt(0).toUpperCase() + selectedCaseData.status.slice(1)}
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {[
                        { id: 'overview', name: 'Overview', icon: Scale },
                        { id: 'documents', name: 'Documents', icon: FileText },
                        { id: 'messages', name: 'Messages', icon: MessageSquare },
                        { id: 'calendar', name: 'Calendar', icon: Calendar }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <tab.icon className="h-4 w-4" />
                          {tab.name}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {activeTab === 'overview' && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{selectedCaseDocuments.length}</div>
                          <div className="text-sm text-gray-600">Documents</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{selectedCaseMessages.filter(m => !m.read).length}</div>
                          <div className="text-sm text-gray-600">New Messages</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{portalData.upcomingEvents.length}</div>
                          <div className="text-sm text-gray-600">Upcoming Events</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Case Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Case Created</label>
                              <div className="text-sm text-gray-900">{formatDate(selectedCaseData.created_at)}</div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Last Updated</label>
                              <div className="text-sm text-gray-900">{formatDate(selectedCaseData.updated_at)}</div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Priority</label>
                              <div className="text-sm text-gray-900 capitalize">{selectedCaseData.priority}</div>
                            </div>
                            {selectedCaseData.due_date && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Due Date</label>
                                <div className="text-sm text-gray-900">{formatDate(selectedCaseData.due_date)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Case Documents</h3>
                      {selectedCaseDocuments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCaseDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-red-500" />
                                <div>
                                  <div className="font-medium text-gray-900">{doc.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Unknown size'} • 
                                    Uploaded {formatDate(doc.created_at)}
                                  </div>
                                </div>
                              </div>
                              <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50">
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No documents available for this case yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'messages' && (
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Messages</h3>
                      {selectedCaseMessages.length > 0 ? (
                        <div className="space-y-4">
                          {selectedCaseMessages.map((message) => (
                            <div key={message.id} className={`p-4 rounded-lg ${message.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="font-medium text-gray-900">{message.from}</div>
                                <div className="text-sm text-gray-500">{formatDate(message.timestamp)}</div>
                              </div>
                              <div className="text-gray-700">{message.message}</div>
                              {!message.read && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Message Input */}
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No messages yet. Start a conversation with your attorney.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'calendar' && (
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                      {portalData.upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                          {portalData.upcomingEvents.map((event) => (
                            <div key={event.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                              <div className="flex-shrink-0">
                                <Calendar className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{event.title}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatDate(event.date)} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No upcoming events scheduled.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 