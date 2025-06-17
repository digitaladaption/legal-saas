'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MessageSquare, 
  Mail, 
  FileText, 
  Video, 
  Cloud, 
  Settings, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Search,
  RefreshCw
} from 'lucide-react'

interface PlatformConfig {
  platform: string
  enabled: boolean
  credentials: Record<string, any>
  last_sync?: string
  error_status?: string
}

interface PlatformInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: 'oauth' | 'manual'
  required_fields?: string[]
  scopes?: string[]
  instructions?: string
}

const PLATFORM_INFO: Record<string, PlatformInfo> = {
  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Access team conversations, files, and channels',
    icon: <MessageSquare className="h-5 w-5" />,
    type: 'oauth',
    scopes: ['channels:history', 'channels:read', 'files:read', 'search:read', 'users:read'],
    instructions: 'Connect your Slack workspace to analyze team communications and find relevant discussions.'
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    description: 'Access Discord server messages and files',
    icon: <MessageSquare className="h-5 w-5" />,
    type: 'manual',
    required_fields: ['Bot Token', 'Guild ID'],
    instructions: 'Create a Discord bot in your server and provide the bot token and guild ID.'
  },
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Search and access Google Drive documents',
    icon: <Cloud className="h-5 w-5" />,
    type: 'oauth',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    instructions: 'Connect your Google account to search through your Drive files and documents.'
  },
  onedrive: {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Search and access OneDrive files',
    icon: <Cloud className="h-5 w-5" />,
    type: 'oauth',
    scopes: ['Files.Read.All'],
    instructions: 'Connect your Microsoft account to access OneDrive files and SharePoint documents.'
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    description: 'Search through Gmail messages',
    icon: <Mail className="h-5 w-5" />,
    type: 'oauth',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    instructions: 'Connect your Gmail account to search through email conversations and attachments.'
  },
  zoom: {
    id: 'zoom',
    name: 'Zoom',
    description: 'Access meeting recordings and transcripts',
    icon: <Video className="h-5 w-5" />,
    type: 'oauth',
    scopes: ['recording:read:admin', 'meeting:read:admin'],
    instructions: 'Connect your Zoom account to access meeting recordings and transcripts for analysis.'
  }
}

export default function IntegrationsPage() {
  const [platforms, setPlatforms] = useState<Record<string, PlatformConfig>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [manualCredentials, setManualCredentials] = useState<Record<string, Record<string, string>>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    loadPlatformStatus()
  }, [])

  const loadPlatformStatus = async () => {
    try {
      const response = await fetch('/api/platforms')
      const data = await response.json()
      
      if (data.success) {
        setPlatforms(data.data.platform_status)
      } else {
        setError('Failed to load platform status')
      }
    } catch (error) {
      setError('Error loading platforms')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthConnect = async (platform: string) => {
    try {
      setError('')
      const response = await fetch(`/api/platforms/oauth?platform=${platform}&action=authorize`)
      const data = await response.json()
      
      if (data.success) {
        // Open OAuth popup
        const popup = window.open(
          data.auth_url,
          `oauth_${platform}`,
          'width=600,height=700,scrollbars=yes,resizable=yes'
        )

        // Listen for popup closure
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            // Reload platform status after a short delay
            setTimeout(() => {
              loadPlatformStatus()
            }, 1000)
          }
        }, 1000)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to initiate OAuth connection')
    }
  }

  const handleManualConnect = async (platform: string) => {
    try {
      setError('')
      const credentials = manualCredentials[platform] || {}
      
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          platform,
          credentials
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(`Successfully connected to ${PLATFORM_INFO[platform].name}`)
        loadPlatformStatus()
        setManualCredentials(prev => ({ ...prev, [platform]: {} }))
      } else {
        setError(data.message || 'Failed to connect')
      }
    } catch (error) {
      setError('Connection failed')
    }
  }

  const handleDisconnect = async (platform: string) => {
    try {
      setError('')
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect',
          platform
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(`Disconnected from ${PLATFORM_INFO[platform].name}`)
        loadPlatformStatus()
      } else {
        setError(data.message || 'Failed to disconnect')
      }
    } catch (error) {
      setError('Disconnect failed')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    setError('')

    try {
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query: searchQuery,
          options: {
            limit: 20
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (error) {
      setError('Search request failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const updateManualCredentials = (platform: string, field: string, value: string) => {
    setManualCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect external platforms to expand your AI assistant's knowledge base
          </p>
        </div>
        <Button onClick={loadPlatformStatus} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="platforms">Connected Platforms</TabsTrigger>
          <TabsTrigger value="search">Search Across Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(PLATFORM_INFO).map((platform) => {
              const config = platforms[platform.id]
              const isConnected = config?.enabled === true

              return (
                <Card key={platform.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {platform.icon}
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                      </div>
                      <Badge variant={isConnected ? "success" : "secondary"}>
                        {isConnected ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    <CardDescription>{platform.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {platform.instructions}
                    </p>

                    {config?.error_status && (
                      <Alert variant="destructive">
                        <AlertDescription className="text-xs">
                          {config.error_status}
                        </AlertDescription>
                      </Alert>
                    )}

                    {config?.last_sync && isConnected && (
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(config.last_sync).toLocaleString()}
                      </p>
                    )}

                    {platform.scopes && (
                      <div className="space-y-1">
                        <Label className="text-xs">Required permissions:</Label>
                        <div className="flex flex-wrap gap-1">
                          {platform.scopes.map((scope) => (
                            <Badge key={scope} variant="outline" className="text-xs">
                              {scope.split('.').pop() || scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {platform.type === 'oauth' ? (
                      <div className="flex space-x-2">
                        {!isConnected ? (
                          <Button 
                            onClick={() => handleOAuthConnect(platform.id)}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleDisconnect(platform.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            Disconnect
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {platform.required_fields?.map((field) => (
                          <div key={field} className="space-y-1">
                            <Label className="text-xs">{field}</Label>
                            <Input
                              type={field.toLowerCase().includes('token') ? 'password' : 'text'}
                              placeholder={`Enter ${field}`}
                              value={manualCredentials[platform.id]?.[field] || ''}
                              onChange={(e) => updateManualCredentials(platform.id, field, e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          {!isConnected ? (
                            <Button 
                              onClick={() => handleManualConnect(platform.id)}
                              className="flex-1"
                              disabled={!platform.required_fields?.every(field => 
                                manualCredentials[platform.id]?.[field]?.trim()
                              )}
                            >
                              Connect
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleDisconnect(platform.id)}
                              variant="outline"
                              className="flex-1"
                            >
                              Disconnect
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Across Connected Platforms</CardTitle>
              <CardDescription>
                Search through all your connected platforms simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()}>
                  {searchLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Search Results</h3>
                    <Badge variant="outline">
                      {searchResults.total_results} results
                    </Badge>
                  </div>

                  {searchResults.messages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Messages</h4>
                      {searchResults.messages.map((message: any) => (
                        <Card key={message.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                <Badge variant="outline">{message.platform}</Badge>
                                <span>{message.author}</span>
                                {message.channel && <span>#{message.channel}</span>}
                                <span>{new Date(message.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {searchResults.documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Documents</h4>
                      {searchResults.documents.map((doc: any) => (
                        <Card key={doc.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                <Badge variant="outline">{doc.platform}</Badge>
                                <FileText className="h-3 w-3" />
                                <span>{new Date(doc.last_modified).toLocaleDateString()}</span>
                              </div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              {doc.url && (
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  Open document
                                </a>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {searchResults.total_results === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No results found for "{searchQuery}"
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 