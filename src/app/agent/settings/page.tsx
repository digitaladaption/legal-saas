'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Brain, CheckCircle, AlertCircle, Save, Eye, EyeOff, Zap, Info } from 'lucide-react'

export default function AISettingsPage() {
  const [settings, setSettings] = useState({
    openai_api_key: '',
    gemini_api_key: '',
    preferred_provider: 'auto' as 'openai' | 'gemini' | 'auto'
  })

  const [showKeys, setShowKeys] = useState({
    openai: false,
    gemini: false
  })

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const savedSettings = localStorage.getItem('ai_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Error loading AI settings:', error)
      }
    }
  }, [])

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = () => {
    setIsSaving(true)
    
    try {
      // Save to localStorage
      localStorage.setItem('ai_settings', JSON.stringify(settings))
      console.log('🔧 Settings: Saved to localStorage', settings)
      
      // Set environment variables for client-side access
      if (typeof window !== 'undefined') {
        // Store in window object for immediate use
        (window as any).AI_CONFIG = settings
      }
      
      setLastSaved(new Date())
      
      // Visual success feedback (better than alert)
      setTimeout(() => {
        const button = document.querySelector('[data-save-button]')
        if (button) {
          const originalText = button.textContent
          button.textContent = '✅ Saved Successfully!'
          button.classList.add('bg-green-600')
          setTimeout(() => {
            button.textContent = originalText
            button.classList.remove('bg-green-600')
          }, 2000)
        }
      }, 100)
      
    } catch (error) {
      console.error('Error saving AI settings:', error)
      alert('Error saving configuration. Please try again.')
    } finally {
      // Use timeout to ensure UI updates
      setTimeout(() => {
        setIsSaving(false)
      }, 200)
    }
  }

  const getProviderStatus = (provider: 'openai' | 'gemini') => {
    const hasKey = provider === 'openai' ? !!settings.openai_api_key : !!settings.gemini_api_key
    
    if (!hasKey) return { status: 'none', color: 'text-gray-400', icon: Key }
    return { status: 'configured', color: 'text-green-500', icon: CheckCircle }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Configuration</h1>
            <p className="text-gray-600">Configure your AI providers and settings</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Setup Instructions</span>
          </div>
          <p className="text-sm text-blue-700">
            Add your OpenAI and/or Gemini API keys below to enable real AI-powered legal assistance. 
            Your keys are stored locally and used to connect directly to the AI providers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* OpenAI Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">OpenAI GPT</h3>
                <p className="text-sm text-gray-500">GPT-4 for advanced legal reasoning</p>
              </div>
            </div>
            
            {(() => {
              const status = getProviderStatus('openai')
              const Icon = status.icon
              return (
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${status.color}`} />
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.status === 'none' ? 'Not configured' : 'Configured'}
                  </span>
                </div>
              )
            })()}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKeys.openai ? 'text' : 'password'}
                  value={settings.openai_api_key}
                  onChange={(e) => handleSettingChange('openai_api_key', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showKeys.openai ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI Platform</a></p>
              <p className="mt-1">Recommended for: Complex legal analysis, document drafting</p>
            </div>
          </div>
        </div>

        {/* Gemini Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Google Gemini</h3>
                <p className="text-sm text-gray-500">Gemini Pro for comprehensive analysis</p>
              </div>
            </div>
            
            {(() => {
              const status = getProviderStatus('gemini')
              const Icon = status.icon
              return (
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${status.color}`} />
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.status === 'none' ? 'Not configured' : 'Configured'}
                  </span>
                </div>
              )
            })()}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={settings.gemini_api_key}
                  onChange={(e) => handleSettingChange('gemini_api_key', e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showKeys.gemini ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a></p>
              <p className="mt-1">Recommended for: Research, multi-modal analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Provider Preferences</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="provider"
              value="auto"
              checked={settings.preferred_provider === 'auto'}
              onChange={(e) => handleSettingChange('preferred_provider', e.target.value)}
              className="text-purple-500"
            />
            <div>
              <span className="font-medium">Auto (Recommended)</span>
              <p className="text-sm text-gray-500">Automatically select the best available provider</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="provider"
              value="openai"
              checked={settings.preferred_provider === 'openai'}
              onChange={(e) => handleSettingChange('preferred_provider', e.target.value)}
              className="text-purple-500"
            />
            <div>
              <span className="font-medium">OpenAI GPT-4</span>
              <p className="text-sm text-gray-500">Best for complex legal reasoning and document drafting</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="provider"
              value="gemini"
              checked={settings.preferred_provider === 'gemini'}
              onChange={(e) => handleSettingChange('preferred_provider', e.target.value)}
              className="text-purple-500"
            />
            <div>
              <span className="font-medium">Google Gemini</span>
              <p className="text-sm text-gray-500">Excellent for research and comprehensive analysis</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          data-save-button
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center space-x-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">How to Use Your AI Assistant</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2">Getting Started:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>1. Add your API keys above</li>
              <li>2. Choose your preferred provider</li>
              <li>3. Save the configuration</li>
              <li>4. Start using the AI agent</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Available Features:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Intelligent legal research</li>
              <li>• Professional email drafting</li>
              <li>• Case success analysis</li>
              <li>• Document search across platforms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
