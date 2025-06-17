'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Brain,
  FileText,
  BarChart3,
  Lightbulb,
  Upload,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Eye,
  Play,
  ArrowRight,
  Sparkles
} from 'lucide-react'

import { aiEngine, DocumentAnalysis, SmartInsight, PredictiveAnalytics } from '@/lib/ai/ai-engine'

export default function AIPage() {
  const [loading, setLoading] = useState(true)
  const [recentAnalyses, setRecentAnalyses] = useState<DocumentAnalysis[]>([])
  const [insights, setInsights] = useState<SmartInsight[]>([])
  const [aiStats, setAiStats] = useState({
    documentsAnalyzed: 0,
    accuracy: 0,
    timeSaved: 0,
    insightsGenerated: 0
  })

  useEffect(() => {
    fetchAIData()
  }, [])

  const fetchAIData = async () => {
    try {
      setLoading(true)

      // Get data from AI engine
      const analysisHistory = aiEngine.getAnalysisHistory()
      const smartInsights = aiEngine.getSmartInsights()

      // Mock some analyses if none exist
      if (analysisHistory.length === 0) {
        await Promise.all([
          aiEngine.analyzeDocument('doc_1', 'Service Agreement.pdf', 'Sample contract content...', 'contract_review'),
          aiEngine.analyzeDocument('doc_2', 'Employment Contract.docx', 'Employment terms...', 'compliance_check'),
          aiEngine.analyzeDocument('doc_3', 'NDA Template.pdf', 'Non-disclosure agreement...', 'risk_assessment')
        ])
      }

      const updatedHistory = aiEngine.getAnalysisHistory()
      
      setRecentAnalyses(updatedHistory.slice(-5).reverse()) // Get last 5, most recent first
      setInsights(smartInsights)
      
      // Calculate stats
      setAiStats({
        documentsAnalyzed: updatedHistory.length,
        accuracy: Math.round((updatedHistory.reduce((sum, a) => sum + a.confidence_score, 0) / updatedHistory.length) * 100) || 0,
        timeSaved: updatedHistory.length * 2.5, // Assume 2.5 hours saved per analysis
        insightsGenerated: smartInsights.length
      })

    } catch (error) {
      console.error('Error fetching AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runDocumentAnalysis = async () => {
    try {
      // Simulate new document analysis
      const mockContent = `
        CONFIDENTIALITY AGREEMENT
        
        This Confidentiality Agreement is entered into between Company Inc. and Consultant LLC.
        
        1. The Consultant agrees to maintain confidentiality of all proprietary information.
        2. This agreement shall remain in effect for a period of 5 years.
        3. Any breach of this agreement shall result in immediate termination.
      `
      
      const analysis = await aiEngine.analyzeDocument(
        `doc_new_${Date.now()}`,
        'New Confidentiality Agreement.pdf',
        mockContent,
        'contract_review'
      )

      // Refresh data
      fetchAIData()
      
      alert(`Analysis completed for "${analysis.document_name}" with ${analysis.confidence_score * 100}% confidence`)
    } catch (error) {
      alert('Error running analysis: ' + error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-4 h-4" />
      case 'efficiency': return <Zap className="w-4 h-4" />
      case 'risk': return <AlertTriangle className="w-4 h-4" />
      case 'opportunity': return <Target className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Initializing AI systems...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            AI & Machine Learning
          </h1>
          <p className="text-gray-600">
            Leverage artificial intelligence to enhance legal work with document analysis, predictive insights, and smart recommendations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runDocumentAnalysis}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Analysis
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* AI Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.documentsAnalyzed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.accuracy}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+2.3% improvement</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.timeSaved}h</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+18% efficiency</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Smart Insights</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.insightsGenerated}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <Sparkles className="w-4 h-4 mr-1" />
            <span>New insights available</span>
          </div>
        </div>
      </div>

      {/* AI Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/ai/document-analysis"
          className="group block bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
            Document Analysis
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            AI-powered contract review, document classification, and compliance checking
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <span>{recentAnalyses.length} recent analyses</span>
          </div>
        </Link>

        <Link
          href="/ai/predictive-analytics"
          className="group block bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600">
            Predictive Analytics
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Case outcome predictions, timeline estimates, and cost projections
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <span>ML-powered insights</span>
          </div>
        </Link>

        <Link
          href="/ai/insights"
          className="group block bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600">
            Smart Insights
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Pattern recognition, efficiency opportunities, and strategic recommendations
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <span>{insights.length} active insights</span>
          </div>
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Document Analyses */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Document Analyses</h2>
            <Link
              href="/ai/document-analysis"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAnalyses.length > 0 ? recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{analysis.document_name}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {analysis.analysis_type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(analysis.confidence_score * 100)}% confidence
                  </span>
                </div>

                <div className="space-y-2">
                  {analysis.findings.slice(0, 2).map((finding, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-sm text-gray-600 flex-1">
                        {finding.title}
                      </span>
                    </div>
                  ))}
                  {analysis.findings.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{analysis.findings.length - 2} more findings
                    </p>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent analyses</p>
                <button
                  onClick={runDocumentAnalysis}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Run sample analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Smart Insights */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Smart Insights</h2>
            <Link
              href="/ai/insights"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-6">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    insight.type === 'efficiency' ? 'bg-green-100 text-green-600' :
                    insight.type === 'risk' ? 'bg-red-100 text-red-600' :
                    insight.type === 'pattern' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <span className="text-xs text-gray-500">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {insight.description}
                    </p>
                    
                    {insight.actionable && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">Actionable</span>
                        <span className="text-xs text-gray-500">
                          {insight.recommended_actions.length} recommended actions
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 