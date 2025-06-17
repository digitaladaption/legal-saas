'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  Filter,
  Eye,
  Download,
  Share,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Target,
  Play
} from 'lucide-react'

import { aiEngine, DocumentAnalysis, AnalysisFinding } from '@/lib/ai/ai-engine'

export default function DocumentAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<DocumentAnalysis | null>(null)
  const [analysisType, setAnalysisType] = useState<DocumentAnalysis['analysis_type']>('contract_review')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [expandedFindings, setExpandedFindings] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      
      // Get existing analyses
      let history = aiEngine.getAnalysisHistory()
      
      // Create sample analyses if none exist
      if (history.length === 0) {
        await Promise.all([
          aiEngine.analyzeDocument('doc_1', 'Service Agreement - TechCorp.pdf', 'Sample service agreement content...', 'contract_review'),
          aiEngine.analyzeDocument('doc_2', 'Employment Contract - Manager.docx', 'Employment contract terms...', 'compliance_check'),
          aiEngine.analyzeDocument('doc_3', 'NDA - Strategic Partnership.pdf', 'Non-disclosure agreement...', 'risk_assessment'),
          aiEngine.analyzeDocument('doc_4', 'Lease Agreement - Office Space.pdf', 'Commercial lease terms...', 'document_classification'),
          aiEngine.analyzeDocument('doc_5', 'Purchase Agreement - Software License.pdf', 'Software licensing terms...', 'contract_review')
        ])
        history = aiEngine.getAnalysisHistory()
      }
      
      setAnalyses(history.reverse()) // Most recent first
      if (history.length > 0 && !selectedAnalysis) {
        setSelectedAnalysis(history[0])
      }
    } catch (error) {
      console.error('Error fetching analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const runNewAnalysis = async () => {
    try {
      setIsAnalyzing(true)
      
      // Sample document content based on analysis type
      const documentContent = getDocumentSample(analysisType)
      const documentName = getDocumentName(analysisType)
      
      const analysis = await aiEngine.analyzeDocument(
        `doc_${Date.now()}`,
        documentName,
        documentContent,
        analysisType
      )

      // Add to analyses list
      setAnalyses(prev => [analysis, ...prev])
      setSelectedAnalysis(analysis)
      
    } catch (error) {
      console.error('Error running analysis:', error)
      alert('Error running analysis: ' + error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getDocumentSample = (type: DocumentAnalysis['analysis_type']): string => {
    const samples = {
      contract_review: `
        SERVICE AGREEMENT
        
        This Service Agreement is entered into between TechCorp Inc. ("Client") and ConsultingFirm LLC ("Provider").
        
        1. SCOPE OF SERVICES
        Provider shall provide software development and consulting services as detailed in Exhibit A.
        
        2. PAYMENT TERMS
        Client agrees to pay Provider $150,000 annually, payable in monthly installments.
        
        3. TERMINATION
        Either party may terminate this agreement with 30 days written notice.
        
        4. INDEMNIFICATION
        Client agrees to indemnify and hold harmless Provider against all claims arising from this agreement.
        
        5. INTELLECTUAL PROPERTY
        All work product created under this agreement shall be owned by Client.
        
        6. CONFIDENTIALITY
        Both parties agree to maintain confidentiality of proprietary information.
        
        7. GOVERNING LAW
        This agreement shall be governed by the laws of Delaware.
      `,
      compliance_check: `
        EMPLOYEE DATA PROCESSING AGREEMENT
        
        Company processes employee personal data including names, addresses, social security numbers, and performance data.
        
        Data is stored on company servers located in the United States and may be accessed by HR personnel.
        
        Employee data may be shared with third-party payroll providers and benefits administrators.
        
        Data retention period is 7 years after employment termination.
        
        Employees have the right to access and correct their personal information.
      `,
      risk_assessment: `
        ACQUISITION AGREEMENT - STARTUP PURCHASE
        
        Buyer agrees to acquire 100% of StartupCo for $5,000,000 in cash.
        
        No due diligence period specified. Transaction to close within 15 days.
        
        StartupCo warranties and representations are limited to 6 months post-closing.
        
        No escrow or holdback provisions for potential claims.
        
        Buyer assumes all existing liabilities without limitation.
        
        Key employees have no retention agreements or non-compete clauses.
      `,
      document_classification: `
        REAL ESTATE PURCHASE AND SALE AGREEMENT
        
        Property: 123 Main Street, Anytown, State 12345
        Purchase Price: $750,000
        Earnest Money: $50,000
        Closing Date: 60 days from acceptance
        
        Contingencies: Financing, inspection, appraisal
        
        Property sold "as-is" with right to inspect.
        
        Buyer to obtain conventional financing within 45 days.
      `
    }
    
    return samples[type] || samples.contract_review
  }

  const getDocumentName = (type: DocumentAnalysis['analysis_type']): string => {
    const names = {
      contract_review: 'New Service Agreement.pdf',
      compliance_check: 'Employee Data Processing Policy.docx',
      risk_assessment: 'Acquisition Agreement - High Risk.pdf',
      document_classification: 'Real Estate Purchase Agreement.pdf'
    }
    
    return names[type] || 'New Document.pdf'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Info className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const toggleFindingExpansion = (index: number) => {
    setExpandedFindings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const filteredAnalyses = analyses.filter(analysis => 
    analysis.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.analysis_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFindings = selectedAnalysis?.findings.filter(finding =>
    severityFilter === 'all' || finding.severity === severityFilter
  ) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading document analyses...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Analysis</h1>
          <p className="text-gray-600">
            AI-powered document review, contract analysis, and compliance checking
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as DocumentAnalysis['analysis_type'])}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="contract_review">Contract Review</option>
            <option value="compliance_check">Compliance Check</option>
            <option value="risk_assessment">Risk Assessment</option>
            <option value="document_classification">Document Classification</option>
          </select>
          <button
            onClick={runNewAnalysis}
            disabled={isAnalyzing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Sample'}
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border-0 outline-none text-sm"
                />
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {filteredAnalyses.map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedAnalysis?.id === analysis.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{analysis.document_name}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {analysis.analysis_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-600">
                        {Math.round(analysis.confidence_score * 100)}% confidence
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {analysis.findings.length} findings
                      </span>
                      <span className="text-xs text-gray-500">
                        {analysis.processing_time_ms}ms
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="lg:col-span-8">
          {selectedAnalysis ? (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedAnalysis.document_name}
                  </h2>
                  <div className="flex gap-2">
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      <Share className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(selectedAnalysis.confidence_score * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedAnalysis.findings.length}
                    </div>
                    <div className="text-sm text-gray-600">Findings</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedAnalysis.recommendations.length}
                    </div>
                    <div className="text-sm text-gray-600">Recommendations</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedAnalysis.processing_time_ms}ms
                    </div>
                    <div className="text-sm text-gray-600">Processing Time</div>
                  </div>
                </div>

                {/* Document Metadata */}
                {selectedAnalysis.metadata.document_type !== 'unknown' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-600">Type:</span> <span className="font-medium">{selectedAnalysis.metadata.document_type}</span></div>
                        <div><span className="text-gray-600">Parties:</span> <span className="font-medium">{selectedAnalysis.metadata.party_count}</span></div>
                        {selectedAnalysis.metadata.jurisdiction && (
                          <div><span className="text-gray-600">Jurisdiction:</span> <span className="font-medium">{selectedAnalysis.metadata.jurisdiction}</span></div>
                        )}
                        {selectedAnalysis.metadata.contract_value && (
                          <div><span className="text-gray-600">Value:</span> <span className="font-medium">${selectedAnalysis.metadata.contract_value.toLocaleString()}</span></div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Dates</h4>
                      <div className="space-y-1 text-sm">
                        {selectedAnalysis.metadata.key_dates.slice(0, 3).map((date, index) => (
                          <div key={index}>
                            <span className="text-gray-600">{date.type}:</span> 
                            <span className="font-medium ml-1">{new Date(date.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Findings */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Findings</h3>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filteredFindings.map((finding, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getSeverityColor(finding.severity)}`}>
                          {getSeverityIcon(finding.severity)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{finding.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                                {finding.severity}
                              </span>
                              <span className="text-xs text-gray-500">
                                {Math.round(finding.confidence * 100)}% confidence
                              </span>
                              <button
                                onClick={() => toggleFindingExpansion(index)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {expandedFindings.has(index) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                          
                          {finding.location.context && (
                            <div className="text-xs text-gray-500 mb-2">
                              <span className="font-medium">Context:</span> {finding.location.context}
                            </div>
                          )}
                          
                          {expandedFindings.has(index) && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              {finding.suggested_action && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-700">Suggested Action:</span>
                                  <p className="text-xs text-gray-600 mt-1">{finding.suggested_action}</p>
                                </div>
                              )}
                              {finding.location.paragraph && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">Location:</span> Paragraph {finding.location.paragraph}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {selectedAnalysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {selectedAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            rec.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            <Target className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{rec.title}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {rec.priority} priority
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                            
                            <div className="text-xs text-gray-500 space-y-1">
                              <div><span className="font-medium">Reasoning:</span> {rec.reasoning}</div>
                              <div><span className="font-medium">Impact:</span> {rec.estimated_impact}</div>
                              {rec.suggested_timeline && (
                                <div><span className="font-medium">Timeline:</span> {rec.suggested_timeline}</div>
                              )}
                              {rec.assigned_to && (
                                <div><span className="font-medium">Assigned to:</span> {rec.assigned_to}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Selected</h3>
              <p className="text-gray-600 mb-4">
                Select a document from the list or analyze a new document to get started.
              </p>
              <button
                onClick={runNewAnalysis}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4" />
                Analyze Sample Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 