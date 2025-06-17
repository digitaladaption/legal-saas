'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Image, 
  FileVideo, 
  File,
  FolderOpen,
  Plus
} from 'lucide-react'
import type { Document, Case, Client } from '@/lib/supabase'

interface DocumentWithCase extends Document {
  case: Case & { client: Client }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [caseFilter, setCaseFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [cases, setCases] = useState<(Case & { client: Client })[]>([])
  const [supabase] = useState(() => getSupabaseClient())

  useEffect(() => {
    fetchDocuments()
    fetchCases()
  }, [supabase])

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          case:cases(
            id,
            title,
            client:clients(id, name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCases() {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          client:clients(id, name)
        `)
        .order('title', { ascending: true })

      if (error) throw error
      setCases(data || [])
    } catch (error) {
      console.error('Error fetching cases:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          case_id: caseFilter !== 'all' ? caseFilter : null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (dbError) throw dbError

      await fetchDocuments()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
      event.target.value = '' // Reset input
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />
    if (mimeType?.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />
    if (mimeType?.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const downloadFile = async (doc: DocumentWithCase) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.case?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.case?.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCase = caseFilter === 'all' || doc.case_id === caseFilter
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'pdf' && doc.mime_type?.includes('pdf')) ||
                       (typeFilter === 'images' && doc.mime_type?.startsWith('image/')) ||
                       (typeFilter === 'documents' && doc.mime_type?.includes('document'))

    return matchesSearch && matchesCase && matchesType
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">Manage all case documents and files</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Document'}
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search documents, cases, or clients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Case Filter */}
          <div className="lg:w-64">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
            >
              <option value="all">All Cases</option>
              {cases.map((case_item) => (
                <option key={case_item.id} value={case_item.id}>
                  {case_item.title} - {case_item.client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="pdf">PDFs</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Total: <strong className="text-gray-900">{filteredDocuments.length}</strong></span>
            <span>PDFs: <strong className="text-red-600">{filteredDocuments.filter(d => d.mime_type?.includes('pdf')).length}</strong></span>
            <span>Images: <strong className="text-blue-600">{filteredDocuments.filter(d => d.mime_type?.startsWith('image/')).length}</strong></span>
            <span>Total Size: <strong className="text-gray-900">{(filteredDocuments.reduce((sum, d) => sum + (d.file_size || 0), 0) / 1024 / 1024).toFixed(1)} MB</strong></span>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* File Icon and Name */}
                <div className="flex items-start gap-3 mb-3">
                  {getFileIcon(document.mime_type || '')}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </p>
                  </div>
                </div>

                {/* Case Information */}
                {document.case && (
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <FolderOpen className="h-3 w-3" />
                      <span className="truncate">{document.case.title}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      Client: {document.case.client.name}
                    </div>
                  </div>
                )}

                {/* Upload Date */}
                <div className="text-xs text-gray-500 mb-3">
                  Uploaded: {formatDate(document.created_at)}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => downloadFile(document)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800 rounded" title="Preview">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="p-1 text-red-600 hover:text-red-800 rounded" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || caseFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Upload your first document to get started'}
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 cursor-pointer transition-colors">
              <Plus className="h-4 w-4" />
              Upload First Document
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
} 