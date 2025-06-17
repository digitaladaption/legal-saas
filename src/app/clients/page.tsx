'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Phone, Mail, MapPin, FolderOpen, User } from 'lucide-react'
import type { Client, Case } from '@/lib/supabase'

interface ClientWithCases extends Client {
  cases: Case[]
  case_count: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithCases[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [supabase] = useState(() => getSupabaseClient())

  useEffect(() => {
    fetchClients()
  }, [supabase])

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          cases(id, title, status, created_at)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const clientsWithCaseCount = (data || []).map(client => ({
        ...client,
        case_count: client.cases?.length || 0
      }))

      setClients(clientsWithCaseCount)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">Manage your client relationships and case history</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Total Clients: <strong className="text-gray-900">{filteredClients.length}</strong></span>
            <span>Active Cases: <strong className="text-blue-600">{filteredClients.reduce((sum, client) => sum + (client.cases?.filter(c => c.status === 'active')?.length || 0), 0)}</strong></span>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Client Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {client.case_count} case{client.case_count !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{client.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Cases */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Recent Cases</h4>
                  <FolderOpen className="h-4 w-4 text-gray-400" />
                </div>
                
                {client.cases && client.cases.length > 0 ? (
                  <div className="space-y-2">
                    {client.cases.slice(0, 3).map((case_item) => (
                      <div key={case_item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {case_item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(case_item.created_at)}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {case_item.status}
                        </span>
                      </div>
                    ))}
                    
                    {client.cases.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-2">
                        +{client.cases.length - 3} more cases
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No cases yet</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                  <button className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-3 rounded transition-colors">
                    New Case
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first client'}
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors">
              <Plus className="h-4 w-4" />
              Add First Client
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 