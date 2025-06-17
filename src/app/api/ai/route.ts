import { NextRequest, NextResponse } from 'next/server'
import { aiEngine, DocumentAnalysis, SmartInsight } from '@/lib/ai/ai-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'analyses', 'insights', 'stats'
    const analysisId = searchParams.get('analysis_id')
    
    switch (type) {
      case 'analyses':
        const analyses = aiEngine.getAnalysisHistory()
        return NextResponse.json({ success: true, data: analyses })
      
      case 'insights':
        const insights = aiEngine.getSmartInsights()
        return NextResponse.json({ success: true, data: insights })
        
      case 'stats':
        const allAnalyses = aiEngine.getAnalysisHistory()
        const allInsights = aiEngine.getSmartInsights()
        
        const stats = {
          total_analyses: allAnalyses.length,
          avg_confidence: allAnalyses.length > 0 
            ? Math.round((allAnalyses.reduce((sum, a) => sum + a.confidence_score, 0) / allAnalyses.length) * 100)
            : 0,
          total_findings: allAnalyses.reduce((sum, a) => sum + a.findings.length, 0),
          total_insights: allInsights.length,
          actionable_insights: allInsights.filter(i => i.actionable).length,
          avg_processing_time: allAnalyses.length > 0
            ? Math.round(allAnalyses.reduce((sum, a) => sum + a.processing_time_ms, 0) / allAnalyses.length)
            : 0
        }
        
        return NextResponse.json({ success: true, data: stats })
      
      case 'analysis':
        if (!analysisId) {
          return NextResponse.json(
            { success: false, error: 'Analysis ID is required' },
            { status: 400 }
          )
        }
        
        const allAnalysesData = aiEngine.getAnalysisHistory()
        const analysis = allAnalysesData.find(a => a.id === analysisId)
        
        if (!analysis) {
          return NextResponse.json(
            { success: false, error: 'Analysis not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({ success: true, data: analysis })
      
      default:
        // Return overview
        const overview = {
          analyses: aiEngine.getAnalysisHistory().slice(-5), // Last 5 analyses
          insights: aiEngine.getSmartInsights().slice(0, 3), // Top 3 insights
          stats: {
            total_analyses: aiEngine.getAnalysisHistory().length,
            total_insights: aiEngine.getSmartInsights().length
          }
        }
        return NextResponse.json({ success: true, data: overview })
    }
  } catch (error) {
    console.error('Error fetching AI data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    
    switch (action) {
      case 'analyze_document':
        const { document_id, document_name, content, analysis_type = 'document_classification' } = data
        
        if (!document_id || !document_name || !content) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: document_id, document_name, content' },
            { status: 400 }
          )
        }
        
        const analysis = await aiEngine.analyzeDocument(
          document_id,
          document_name,
          content,
          analysis_type
        )
        
        return NextResponse.json({ success: true, data: analysis })
      
      case 'generate_predictions':
        const { case_data } = data
        
        if (!case_data) {
          return NextResponse.json(
            { success: false, error: 'Case data is required' },
            { status: 400 }
          )
        }
        
        const predictions = await aiEngine.generatePredictiveAnalytics(case_data)
        return NextResponse.json({ success: true, data: predictions })
      
      case 'generate_insights':
        const { firm_data = {} } = data
        
        const insights = aiEngine.generateSmartInsights(firm_data)
        return NextResponse.json({ success: true, data: insights })
      
      case 'bulk_analyze':
        const { documents } = data
        
        if (!Array.isArray(documents) || documents.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Documents array is required' },
            { status: 400 }
          )
        }
        
        const bulkResults = []
        
        for (const doc of documents) {
          try {
            const result = await aiEngine.analyzeDocument(
              doc.document_id,
              doc.document_name,
              doc.content,
              doc.analysis_type || 'document_classification'
            )
            bulkResults.push(result)
          } catch (error) {
            bulkResults.push({
              document_id: doc.document_id,
              error: error instanceof Error ? error.message : 'Analysis failed'
            })
          }
        }
        
        return NextResponse.json({ success: true, data: bulkResults })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing AI request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis_id, updates } = body
    
    if (!analysis_id) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID is required' },
        { status: 400 }
      )
    }
    
    // Mock update - in real implementation, would update the analysis
    console.log(`Updating analysis ${analysis_id}:`, updates)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analysis updated successfully',
      data: { analysis_id, updates, updated_at: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Error updating analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update analysis' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysis_id')
    
    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID is required' },
        { status: 400 }
      )
    }
    
    // Mock delete - in real implementation, would remove the analysis
    console.log(`Deleting analysis ${analysisId}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analysis deleted successfully',
      data: { analysis_id: analysisId, deleted_at: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Error deleting analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete analysis' },
      { status: 500 }
    )
  }
} 