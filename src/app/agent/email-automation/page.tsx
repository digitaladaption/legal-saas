'use client'

import { useState } from 'react'
import { Mail, Send, Brain, FileText, User, Check, Clock } from 'lucide-react'
import { intelligentAgent, EmailDraftRequest } from '@/lib/ai/intelligent-agent'

interface EmailInbox {
  id: string
  from: string
  subject: string
  body: string
  received_at: string
  processed: boolean
}

export default function EmailAutomationPage() {
  const [emails] = useState<EmailInbox[]>([
    {
      id: '1',
      from: 'sarah.johnson@email.com',
      subject: 'Urgent: Divorce Proceedings Inquiry',
      body: `Dear Legal Team,

I hope this email finds you well. I am writing to inquire about representation for divorce proceedings. My situation has become quite urgent as my husband has filed papers, and I need immediate legal assistance.

I have two young children (ages 7 and 10), and I'm particularly concerned about custody arrangements and financial support.

Could someone please contact me as soon as possible to discuss my options?

Best regards,
Sarah Johnson`,
      received_at: '2024-01-15T09:30:00Z',
      processed: false
    }
  ])

  const [selectedEmail, setSelectedEmail] = useState<EmailInbox | null>(null)
  const [draft, setDraft] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const processEmail = async (email: EmailInbox) => {
    setIsProcessing(true)
    try {
      const emailRequest: EmailDraftRequest = {
        original_email: {
          from: email.from,
          subject: email.subject,
          body: email.body,
          received_at: email.received_at
        },
        case_type: 'family_law',
        urgency: 'high'
      }

      const result = await intelligentAgent.processIncomingEmail(emailRequest)
      setDraft(result.auto_draft)
    } catch (error) {
      console.error('Error processing email:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/2 bg-white border-r">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Mail className="w-6 h-6 mr-2" />
            Email Automation
          </h2>
        </div>

        <div className="p-4">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">{email.from}</span>
                {email.processed ? <Check className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}
              </div>
              <h3 className="font-medium mb-2">{email.subject}</h3>
              <p className="text-sm text-gray-600">{email.body.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            <div className="bg-white border-b p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                <button
                  onClick={() => processEmail(selectedEmail)}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing...' : 'Process with AI'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-1">
              <div className="w-1/2 p-6 bg-gray-50">
                <h3 className="font-medium mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Original Email
                </h3>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="whitespace-pre-wrap text-sm">{selectedEmail.body}</div>
                </div>
              </div>

              <div className="w-1/2 p-6">
                <h3 className="font-medium mb-4 flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  AI Draft Response
                </h3>

                {draft ? (
                  <div className="bg-white border rounded-lg">
                    <div className="border-b px-4 py-2 bg-gray-50">
                      <span className="font-medium">Subject: {draft.subject}</span>
                    </div>
                    <div className="p-4">
                      <div className="whitespace-pre-wrap text-sm mb-4">{draft.body}</div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-gray-500">
                          Confidence: {(draft.confidence_score * 100).toFixed(0)}%
                        </span>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                          Send Email
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border">
                    <div className="text-center">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Click "Process with AI" to generate a response</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select an email to view and process</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
