'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { Bell, X, CheckCircle, AlertCircle, Info, FileText, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  type: 'case_update' | 'new_message' | 'document_upload' | 'deadline_reminder' | 'system'
  title: string
  message: string
  case_id?: string
  read: boolean
  created_at: string
}

export default function RealTimeUpdates() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Initialize with some mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'case_update',
        title: 'Case Status Update',
        message: 'Smith vs. Johnson case has been moved to Discovery phase',
        case_id: '1',
        read: false,
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
      },
      {
        id: '2',
        type: 'new_message',
        title: 'New Client Message',
        message: 'Sarah Johnson sent a new message about her divorce case',
        case_id: '1',
        read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      },
      {
        id: '3',
        type: 'document_upload',
        title: 'Document Uploaded',
        message: 'New evidence document uploaded to Garcia Estate case',
        case_id: '2',
        read: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: '4',
        type: 'deadline_reminder',
        title: 'Deadline Approaching',
        message: 'Motion filing deadline in 2 days for Wilson Contract case',
        case_id: '3',
        read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)

    // Set up real-time subscriptions with proper cleanup
    const setupRealtimeSubscriptions = () => {
      console.log('🔧 RealTimeUpdates: Subscriptions temporarily disabled to prevent errors')
      
      // TODO: Re-enable subscriptions once database tables are stable
      // For now, just return a no-op cleanup function
      return () => {
        console.log('🔧 RealTimeUpdates: No cleanup needed')
      }
      
      /* Temporarily disabled to prevent subscription errors
      console.log('🔧 RealTimeUpdates: Setting up subscriptions')
      
      let supabase: any = null
      let channels: any[] = []
      
      try {
        supabase = getSupabaseClient()
        
        // Create unique channel names to avoid conflicts
        const timestamp = Date.now()
        
        // Subscribe to case updates
        const casesChannel = supabase
          .channel(`cases_changes_${timestamp}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cases'
            },
            (payload: any) => {
              console.log('🔧 RealTimeUpdates: Case update received:', payload)
              handleRealTimeUpdate('case_update', 'Case Updated', `Case ${payload.new?.title || 'Unknown'} has been updated`)
            }
          )
          .subscribe()
        
        channels.push(casesChannel)

        // Subscribe to document uploads
        const documentsChannel = supabase
          .channel(`documents_changes_${timestamp}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'documents'
            },
            (payload: any) => {
              console.log('🔧 RealTimeUpdates: Document upload received:', payload)
              handleRealTimeUpdate('document_upload', 'New Document', `Document ${payload.new?.name || 'Unknown'} has been uploaded`)
            }
          )
          .subscribe()
        
        channels.push(documentsChannel)

        // Subscribe to task updates
        const tasksChannel = supabase
          .channel(`tasks_changes_${timestamp}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks'
            },
            (payload: any) => {
              console.log('🔧 RealTimeUpdates: Task update received:', payload)
              handleRealTimeUpdate('case_update', 'Task Updated', `Task ${payload.new?.title || 'Unknown'} status changed`)
            }
          )
          .subscribe()
        
        channels.push(tasksChannel)
        
        console.log('🔧 RealTimeUpdates: Successfully set up', channels.length, 'subscriptions')

      } catch (error) {
        console.error('🔧 RealTimeUpdates: Error setting up subscriptions:', error)
      }

      return () => {
        console.log('🔧 RealTimeUpdates: Cleaning up subscriptions')
        try {
          if (supabase && channels.length > 0) {
            channels.forEach(channel => {
              if (channel) {
                supabase.removeChannel(channel)
              }
            })
          }
        } catch (error) {
          console.error('🔧 RealTimeUpdates: Error during cleanup:', error)
        }
      }
      */
    }

    const cleanup = setupRealtimeSubscriptions()
    return cleanup
  }, []) // Empty dependency array to prevent re-runs

  const handleRealTimeUpdate = (type: Notification['type'], title: string, message: string, case_id?: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      case_id,
      read: false,
      created_at: new Date().toISOString()
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const removeNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'case_update':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case 'document_upload':
        return <FileText className="h-5 w-5 text-purple-500" />
      case 'deadline_reminder':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'system':
        return <Info className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="ml-8 mt-2">
                        <span className="inline-block h-2 w-2 bg-blue-500 rounded-full"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 