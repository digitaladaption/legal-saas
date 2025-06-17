'use client'

import { useState } from 'react'
import { Brain, Send, Search, Scale, Mail, FileText, Settings } from 'lucide-react'
import { intelligentAgent, AgentMessage } from '@/lib/ai/intelligent-agent'
import Link from 'next/link'

export default function AgentPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: AgentMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await intelligentAgent.processQuery(inputValue)
      setMessages(prev => [...prev, response])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Legal Assistant</h1>
            <p className="text-sm text-gray-500">Complete law firm automation</p>
          </div>
        </div>
        
        <Link
          href="/agent/settings"
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Configure AI</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to your AI Legal Assistant</h2>
            <p className="text-gray-600 mb-6">Ask me about documents, legal research, case analysis, or email drafting</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => setInputValue('Search for family law documents')}
                className="flex items-center space-x-2 p-4 bg-white rounded-lg hover:bg-gray-50 border"
              >
                <Search className="w-5 h-5 text-blue-500" />
                <span>Search Documents</span>
              </button>
              <button
                onClick={() => setInputValue('Find UK family law precedents')}
                className="flex items-center space-x-2 p-4 bg-white rounded-lg hover:bg-gray-50 border"
              >
                <Scale className="w-5 h-5 text-green-500" />
                <span>Legal Research</span>
              </button>
              <button
                onClick={() => setInputValue('Draft a professional legal email')}
                className="flex items-center space-x-2 p-4 bg-white rounded-lg hover:bg-gray-50 border"
              >
                <Mail className="w-5 h-5 text-purple-500" />
                <span>Draft Email</span>
              </button>
              <button
                onClick={() => setInputValue('Analyze case success probability')}
                className="flex items-center space-x-2 p-4 bg-white rounded-lg hover:bg-gray-50 border"
              >
                <FileText className="w-5 h-5 text-orange-500" />
                <span>Case Analysis</span>
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-3xl p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border'
            }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.context?.confidence_score && (
                <div className="mt-2 pt-2 border-t text-sm opacity-75">
                  Confidence: {(message.context.confidence_score * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-left">
            <div className="inline-block bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your law firm operations..."
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
