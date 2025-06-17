/**
 * Real AI Engine Integration
 * Connects to OpenAI GPT and Google Gemini for actual AI processing
 */

export interface AIConfig {
  openai_api_key?: string
  gemini_api_key?: string
  preferred_provider: 'openai' | 'gemini' | 'auto'
}

export interface AIRequest {
  prompt: string
  context?: string
  system_prompt?: string
}

export interface AIResponse {
  content: string
  provider: string
  confidence: number
}

export class AIEngine {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  async processLegalQuery(request: AIRequest): Promise<AIResponse> {
    const availableProviders = this.getAvailableProviders()
    
    // If no real providers available, return mock
    if (availableProviders.length === 1 && availableProviders[0] === 'mock') {
      console.log('🤖 AI Engine: Using mock response (no API keys configured)')
      return this.getMockLegalResponse(request)
    }

    // Determine which provider to use
    let providerToUse: 'openai' | 'gemini' = this.config.preferred_provider as 'openai' | 'gemini'
    if (this.config.preferred_provider === 'auto') {
      // Auto-select: prefer OpenAI for legal queries
      providerToUse = availableProviders.includes('openai') ? 'openai' : 'gemini'
    }

    // Ensure the selected provider is available
    if (!availableProviders.includes(providerToUse)) {
      providerToUse = availableProviders.includes('openai') ? 'openai' : 'gemini'
    }

    console.log('🤖 AI Engine: Using provider:', providerToUse)

    try {
      if (providerToUse === 'openai') {
        return await this.callOpenAI(request)
      } else if (providerToUse === 'gemini') {
        return await this.callGemini(request)
      } else {
        return this.getMockLegalResponse(request)
      }
    } catch (error) {
      console.error('🤖 AI Engine: Error calling AI provider:', error)
      // Fallback to mock on error
      return this.getMockLegalResponse(request)
    }
  }

  private async callOpenAI(request: AIRequest): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openai_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: request.system_prompt || `You are a professional UK legal AI assistant. Provide accurate, professional legal guidance while always including appropriate disclaimers. Reference UK law, SRA guidelines, and current legal practice. Always end responses with appropriate legal disclaimers.`
          },
          {
            role: 'user',
            content: `${request.prompt}\n\nContext: ${request.context || 'No additional context provided'}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      provider: 'openai',
      confidence: 0.9
    }
  }

  private async callGemini(request: AIRequest): Promise<AIResponse> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.gemini_api_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${request.system_prompt || 'You are a professional UK legal AI assistant. Provide accurate, professional legal guidance while always including appropriate disclaimers.'}\n\nQuery: ${request.prompt}\n\nContext: ${request.context || 'No additional context provided'}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.candidates[0].content.parts[0].text,
      provider: 'gemini',  
      confidence: 0.85
    }
  }

  private getMockLegalResponse(request: AIRequest): AIResponse {
    const legalResponse = `**Legal Analysis Complete**

Based on your query: "${request.prompt}"

**Professional Legal Guidance:**
Our analysis indicates this matter falls within standard UK legal practice. The relevant legal framework includes:

• **Statutory Provisions**: Current UK legislation applies
• **Case Law**: Recent precedents support this approach  
• **Professional Standards**: SRA guidelines recommend careful documentation
• **Risk Assessment**: Moderate complexity, standard procedures applicable

**Recommended Next Steps:**
1. Gather supporting documentation
2. Consider client's specific circumstances
3. Review potential alternatives
4. Prepare formal legal advice

**Important:** This preliminary analysis requires follow-up consultation for specific legal advice.

*Generated using mock legal AI analysis - configure API keys for real AI responses*`

    return {
      content: legalResponse,
      provider: 'mock',
      confidence: 0.5
    }
  }

  async draftLegalEmail(emailContext: any): Promise<AIResponse> {
    const emailPrompt = `Draft a professional legal email response for the following:

Subject: ${emailContext.subject || 'Legal Inquiry'}
Client: ${emailContext.client_name || 'Client'}
Original Email: ${emailContext.original_email || 'General legal inquiry'}
Case Type: ${emailContext.case_type || 'General'}
Context: ${JSON.stringify(emailContext)}

Please draft a professional, formal response that:
1. Acknowledges their inquiry professionally
2. Provides appropriate legal guidance for their situation
3. Includes proper legal disclaimers
4. Suggests next steps
5. Maintains SRA professional standards`

    const request: AIRequest = {
      prompt: emailPrompt,
      system_prompt: 'You are a UK qualified solicitor drafting professional client correspondence. Always include appropriate legal disclaimers and maintain professional standards as required by the Solicitor Regulation Authority.',
      context: JSON.stringify(emailContext)
    }

    return await this.processLegalQuery(request)
  }

  getAvailableProviders(): string[] {
    const providers = []
    if (this.config.openai_api_key && this.config.openai_api_key.trim().length > 0) {
      providers.push('openai')
    }
    if (this.config.gemini_api_key && this.config.gemini_api_key.trim().length > 0) {
      providers.push('gemini') 
    }
    return providers.length > 0 ? providers : ['mock']
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig }
    console.log('🤖 AI Engine: Configuration updated', this.config.preferred_provider, 'providers:', this.getAvailableProviders())
  }

  getCurrentConfig(): AIConfig {
    return { ...this.config }
  }
}

const getInitialConfig = (): AIConfig => {
  let config: AIConfig = {
    preferred_provider: 'auto',
    openai_api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    gemini_api_key: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  }

  // Load from localStorage if available (client-side)
  if (typeof window !== 'undefined') {
    try {
      const savedSettings = localStorage.getItem('ai_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        config = { ...config, ...parsed }
        console.log('🤖 AI Engine: Loaded settings from localStorage', config.preferred_provider)
      }
    } catch (error) {
      console.error('Error loading AI settings from localStorage:', error)
    }
  }

  return config
}

export const aiEngine = new AIEngine(getInitialConfig())
