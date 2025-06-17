/**
 * Platform Integration Connectors
 * Real API implementations for connecting to external platforms
 */

export interface PlatformMessage {
  id: string
  content: string
  author: string
  timestamp: string
  platform: string
  channel?: string
  thread_id?: string
  attachments?: string[]
  metadata?: Record<string, any>
}

export interface PlatformDocument {
  id: string
  name: string
  content?: string
  type: string
  platform: string
  url?: string
  last_modified: string
  size?: number
  path?: string
  permissions?: string[]
  metadata?: Record<string, any>
}

export interface PlatformConfig {
  platform: string
  enabled: boolean
  credentials: Record<string, any>
  last_sync?: string
  error_status?: string
}

/**
 * Slack Integration
 */
export class SlackConnector {
  private botToken: string
  private userToken: string
  private workspaceId: string

  constructor(botToken: string, userToken?: string, workspaceId?: string) {
    this.botToken = botToken
    this.userToken = userToken || ''
    this.workspaceId = workspaceId || ''
  }

  async searchMessages(query: string, options: {
    channels?: string[]
    dateRange?: { start: string; end: string }
    limit?: number
  } = {}): Promise<PlatformMessage[]> {
    try {
      const searchParams = new URLSearchParams({
        token: this.botToken,
        query: query,
        count: (options.limit || 100).toString(),
        ...(options.dateRange && {
          before: options.dateRange.end,
          after: options.dateRange.start
        })
      })

      const response = await fetch(`https://slack.com/api/search.messages?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data.messages?.matches?.map((message: any) => ({
        id: message.ts,
        content: message.text,
        author: message.user,
        timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
        platform: 'slack',
        channel: message.channel?.name,
        thread_id: message.thread_ts,
        metadata: {
          team: message.team,
          channel_id: message.channel?.id,
          permalink: message.permalink
        }
      })) || []

    } catch (error) {
      console.error('Slack search error:', error)
      return []
    }
  }

  async getChannelMessages(channelId: string, options: {
    limit?: number
    since?: string
  } = {}): Promise<PlatformMessage[]> {
    try {
      const response = await fetch(`https://slack.com/api/conversations.history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channelId,
          limit: options.limit || 100,
          ...(options.since && { oldest: options.since })
        })
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data.messages?.map((message: any) => ({
        id: message.ts,
        content: message.text,
        author: message.user,
        timestamp: new Date(parseFloat(message.ts) * 1000).toISOString(),
        platform: 'slack',
        channel: channelId,
        thread_id: message.thread_ts,
        attachments: message.files?.map((file: any) => file.url_private) || [],
        metadata: {
          message_type: message.type,
          subtype: message.subtype
        }
      })) || []

    } catch (error) {
      console.error('Slack channel messages error:', error)
      return []
    }
  }

  async getChannels(): Promise<Array<{id: string; name: string; is_private: boolean}>> {
    try {
      const response = await fetch(`https://slack.com/api/conversations.list`, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data.channels?.map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        is_private: channel.is_private
      })) || []

    } catch (error) {
      console.error('Slack channels error:', error)
      return []
    }
  }
}

/**
 * Discord Integration
 */
export class DiscordConnector {
  private botToken: string
  private guildId: string

  constructor(botToken: string, guildId: string) {
    this.botToken = botToken
    this.guildId = guildId
  }

  async searchMessages(query: string, options: {
    channelIds?: string[]
    limit?: number
    dateRange?: { start: string; end: string }
  } = {}): Promise<PlatformMessage[]> {
    try {
      const channels = options.channelIds || await this.getChannels()
      const messages: PlatformMessage[] = []

      for (const channelId of channels) {
        const channelMessages = await this.getChannelMessages(channelId, {
          limit: options.limit,
          since: options.dateRange?.start
        })
        
        const filteredMessages = channelMessages.filter(msg => 
          msg.content.toLowerCase().includes(query.toLowerCase())
        )
        
        messages.push(...filteredMessages)
      }

      return messages.slice(0, options.limit || 100)

    } catch (error) {
      console.error('Discord search error:', error)
      return []
    }
  }

  async getChannelMessages(channelId: string, options: {
    limit?: number
    since?: string
  } = {}): Promise<PlatformMessage[]> {
    try {
      const params = new URLSearchParams({
        limit: (options.limit || 100).toString(),
        ...(options.since && { after: options.since })
      })

      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?${params}`, {
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Discord API error: ${data.message}`)
      }

      return data.map((message: any) => ({
        id: message.id,
        content: message.content,
        author: message.author.username,
        timestamp: message.timestamp,
        platform: 'discord',
        channel: channelId,
        thread_id: message.message_reference?.message_id,
        attachments: message.attachments?.map((att: any) => att.url) || [],
        metadata: {
          author_id: message.author.id,
          guild_id: this.guildId,
          message_type: message.type
        }
      }))

    } catch (error) {
      console.error('Discord channel messages error:', error)
      return []
    }
  }

  async getChannels(): Promise<string[]> {
    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${this.guildId}/channels`, {
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Discord API error: ${data.message}`)
      }

      return data
        .filter((channel: any) => channel.type === 0) // Text channels only
        .map((channel: any) => channel.id)

    } catch (error) {
      console.error('Discord channels error:', error)
      return []
    }
  }
}

/**
 * Google Drive Integration
 */
export class GoogleDriveConnector {
  private accessToken: string
  private apiKey: string

  constructor(accessToken: string, apiKey: string) {
    this.accessToken = accessToken
    this.apiKey = apiKey
  }

  async searchFiles(query: string, options: {
    fileTypes?: string[]
    limit?: number
    dateRange?: { start: string; end: string }
  } = {}): Promise<PlatformDocument[]> {
    try {
      let searchQuery = `name contains '${query}' or fullText contains '${query}'`
      
      if (options.fileTypes && options.fileTypes.length > 0) {
        const mimeTypes = options.fileTypes.map(type => `mimeType='${this.getMimeType(type)}'`).join(' or ')
        searchQuery += ` and (${mimeTypes})`
      }

      if (options.dateRange) {
        searchQuery += ` and modifiedTime >= '${options.dateRange.start}' and modifiedTime <= '${options.dateRange.end}'`
      }

      const params = new URLSearchParams({
        q: searchQuery,
        pageSize: (options.limit || 100).toString(),
        fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,parents)',
        key: this.apiKey
      })

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Google Drive API error: ${data.error?.message}`)
      }

      return data.files?.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType,
        platform: 'google_drive',
        url: file.webViewLink,
        last_modified: file.modifiedTime,
        size: parseInt(file.size) || 0,
        path: file.parents?.[0] || '/',
        metadata: {
          mime_type: file.mimeType,
          parents: file.parents
        }
      })) || []

    } catch (error) {
      console.error('Google Drive search error:', error)
      return []
    }
  }

  async getFileContent(fileId: string): Promise<string | null> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        // Try downloading directly for non-Google files
        const directResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        })
        
        if (directResponse.ok) {
          return await directResponse.text()
        }
        
        throw new Error(`Google Drive content error: ${response.statusText}`)
      }

      return await response.text()

    } catch (error) {
      console.error('Google Drive content error:', error)
      return null
    }
  }

  private getMimeType(fileType: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'rtf': 'application/rtf'
    }
    return mimeTypes[fileType] || 'application/octet-stream'
  }
}

/**
 * OneDrive Integration
 */
export class OneDriveConnector {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async searchFiles(query: string, options: {
    fileTypes?: string[]
    limit?: number
    dateRange?: { start: string; end: string }
  } = {}): Promise<PlatformDocument[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        top: (options.limit || 100).toString(),
        select: 'id,name,size,lastModifiedDateTime,webUrl,file,folder,parentReference'
      })

      const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/search(q='${query}')?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`OneDrive API error: ${data.error?.message}`)
      }

      let files = data.value || []

      // Filter by file types if specified
      if (options.fileTypes && options.fileTypes.length > 0) {
        files = files.filter((file: any) => {
          const extension = file.name.split('.').pop()?.toLowerCase()
          return options.fileTypes!.includes(extension)
        })
      }

      // Filter by date range if specified
      if (options.dateRange) {
        files = files.filter((file: any) => {
          const modifiedDate = new Date(file.lastModifiedDateTime)
          const start = new Date(options.dateRange!.start)
          const end = new Date(options.dateRange!.end)
          return modifiedDate >= start && modifiedDate <= end
        })
      }

      return files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.file?.mimeType || 'application/octet-stream',
        platform: 'onedrive',
        url: file.webUrl,
        last_modified: file.lastModifiedDateTime,
        size: file.size || 0,
        path: file.parentReference?.path || '/',
        metadata: {
          is_folder: !!file.folder,
          parent_id: file.parentReference?.id
        }
      }))

    } catch (error) {
      console.error('OneDrive search error:', error)
      return []
    }
  }

  async getFileContent(fileId: string): Promise<string | null> {
    try {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`OneDrive content error: ${response.statusText}`)
      }

      return await response.text()

    } catch (error) {
      console.error('OneDrive content error:', error)
      return null
    }
  }
}

/**
 * Zoom Integration
 */
export class ZoomConnector {
  private apiKey: string
  private apiSecret: string
  private accessToken: string

  constructor(apiKey: string, apiSecret: string, accessToken: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.accessToken = accessToken
  }

  async getMeetingRecordings(options: {
    dateRange?: { start: string; end: string }
    limit?: number
  } = {}): Promise<PlatformDocument[]> {
    try {
      const params = new URLSearchParams({
        page_size: (options.limit || 100).toString(),
        ...(options.dateRange && {
          from: options.dateRange.start,
          to: options.dateRange.end
        })
      })

      const response = await fetch(`https://api.zoom.us/v2/users/me/recordings?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Zoom API error: ${data.message}`)
      }

      const recordings: PlatformDocument[] = []

      data.meetings?.forEach((meeting: any) => {
        meeting.recording_files?.forEach((file: any) => {
          recordings.push({
            id: file.id,
            name: `${meeting.topic} - ${file.file_type}`,
            type: file.file_type,
            platform: 'zoom',
            url: file.play_url,
            last_modified: file.recording_end,
            size: file.file_size,
            metadata: {
              meeting_id: meeting.id,
              meeting_topic: meeting.topic,
              duration: meeting.duration,
              start_time: meeting.start_time,
              recording_type: file.recording_type,
              download_url: file.download_url
            }
          })
        })
      })

      return recordings

    } catch (error) {
      console.error('Zoom recordings error:', error)
      return []
    }
  }

  async getMeetingTranscripts(meetingId: string): Promise<PlatformMessage[]> {
    try {
      const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Zoom API error: ${data.message}`)
      }

      const transcripts: PlatformMessage[] = []

      data.recording_files?.forEach((file: any) => {
        if (file.file_type === 'TRANSCRIPT') {
          transcripts.push({
            id: file.id,
            content: file.transcript || 'Transcript available for download',
            author: 'Zoom Transcript',
            timestamp: file.recording_start,
            platform: 'zoom',
            metadata: {
              meeting_id: meetingId,
              download_url: file.download_url,
              file_size: file.file_size
            }
          })
        }
      })

      return transcripts

    } catch (error) {
      console.error('Zoom transcripts error:', error)
      return []
    }
  }
}

/**
 * Gmail Integration
 */
export class GmailConnector {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async searchEmails(query: string, options: {
    limit?: number
    dateRange?: { start: string; end: string }
  } = {}): Promise<PlatformMessage[]> {
    try {
      let searchQuery = query
      
      if (options.dateRange) {
        searchQuery += ` after:${options.dateRange.start} before:${options.dateRange.end}`
      }

      const params = new URLSearchParams({
        q: searchQuery,
        maxResults: (options.limit || 100).toString()
      })

      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`Gmail API error: ${data.error?.message}`)
      }

      const messages: PlatformMessage[] = []

      // Get details for each message
      for (const message of data.messages || []) {
        const messageDetails = await this.getMessageDetails(message.id)
        if (messageDetails) {
          messages.push(messageDetails)
        }
      }

      return messages

    } catch (error) {
      console.error('Gmail search error:', error)
      return []
    }
  }

  private async getMessageDetails(messageId: string): Promise<PlatformMessage | null> {
    try {
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return null
      }

      const headers = data.payload?.headers || []
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject'
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown'
      const date = headers.find((h: any) => h.name === 'Date')?.value || data.internalDate

      let content = ''
      if (data.payload?.body?.data) {
        content = Buffer.from(data.payload.body.data, 'base64').toString('utf-8')
      } else if (data.payload?.parts) {
        content = this.extractTextFromParts(data.payload.parts)
      }

      return {
        id: messageId,
        content: content,
        author: from,
        timestamp: new Date(parseInt(data.internalDate)).toISOString(),
        platform: 'gmail',
        metadata: {
          subject: subject,
          thread_id: data.threadId,
          labels: data.labelIds,
          snippet: data.snippet
        }
      }

    } catch (error) {
      console.error('Gmail message details error:', error)
      return null
    }
  }

  private extractTextFromParts(parts: any[]): string {
    let text = ''
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64').toString('utf-8')
      } else if (part.parts) {
        text += this.extractTextFromParts(part.parts)
      }
    }
    return text
  }
}

/**
 * Unified Platform Manager
 */
export class PlatformManager {
  private connectors: Map<string, any> = new Map()
  private configurations: Map<string, PlatformConfig> = new Map()

  constructor() {
    this.loadConfigurations()
  }

  async connectPlatform(platform: string, credentials: Record<string, any>): Promise<boolean> {
    try {
      let connector

      switch (platform) {
        case 'slack':
          connector = new SlackConnector(
            credentials.botToken,
            credentials.userToken,
            credentials.workspaceId
          )
          break

        case 'discord':
          connector = new DiscordConnector(
            credentials.botToken,
            credentials.guildId
          )
          break

        case 'google_drive':
          connector = new GoogleDriveConnector(
            credentials.accessToken,
            credentials.apiKey
          )
          break

        case 'onedrive':
          connector = new OneDriveConnector(credentials.accessToken)
          break

        case 'zoom':
          connector = new ZoomConnector(
            credentials.apiKey,
            credentials.apiSecret,
            credentials.accessToken
          )
          break

        case 'gmail':
          connector = new GmailConnector(credentials.accessToken)
          break

        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }

      this.connectors.set(platform, connector)
      this.configurations.set(platform, {
        platform,
        enabled: true,
        credentials,
        last_sync: new Date().toISOString()
      })

      await this.saveConfigurations()
      return true

    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error)
      this.configurations.set(platform, {
        platform,
        enabled: false,
        credentials: {},
        error_status: error.message
      })
      return false
    }
  }

  async searchAllPlatforms(query: string, options: {
    platforms?: string[]
    limit?: number
    dateRange?: { start: string; end: string }
  } = {}): Promise<{
    messages: PlatformMessage[]
    documents: PlatformDocument[]
    total_results: number
  }> {
    const messages: PlatformMessage[] = []
    const documents: PlatformDocument[] = []
    const platforms = options.platforms || Array.from(this.connectors.keys())

    await Promise.all(platforms.map(async (platform) => {
      const connector = this.connectors.get(platform)
      if (!connector) return

      try {
        switch (platform) {
          case 'slack':
          case 'discord':
          case 'gmail':
            const platformMessages = await connector.searchMessages(query, options)
            messages.push(...platformMessages)
            break

          case 'google_drive':
          case 'onedrive':
            const platformDocs = await connector.searchFiles(query, options)
            documents.push(...platformDocs)
            break

          case 'zoom':
            const recordings = await connector.getMeetingRecordings(options)
            documents.push(...recordings)
            break
        }
      } catch (error) {
        console.error(`Error searching ${platform}:`, error)
      }
    }))

    return {
      messages: messages.slice(0, options.limit || 100),
      documents: documents.slice(0, options.limit || 100),
      total_results: messages.length + documents.length
    }
  }

  getConnectedPlatforms(): string[] {
    return Array.from(this.connectors.keys())
  }

  getPlatformStatus(): Record<string, PlatformConfig> {
    const status: Record<string, PlatformConfig> = {}
    this.configurations.forEach((config, platform) => {
      status[platform] = {
        ...config,
        credentials: {} // Don't expose sensitive data
      }
    })
    return status
  }

  private loadConfigurations() {
    try {
      // Only access localStorage on client-side
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('platform_configurations')
        if (stored) {
          const configs = JSON.parse(stored)
          Object.entries(configs).forEach(([platform, config]) => {
            this.configurations.set(platform, config as PlatformConfig)
          })
        }
      }
    } catch (error) {
      console.error('Error loading platform configurations:', error)
    }
  }

  private async saveConfigurations() {
    try {
      // Only access localStorage on client-side
      if (typeof window !== 'undefined') {
        const configs: Record<string, PlatformConfig> = {}
        this.configurations.forEach((config, platform) => {
          configs[platform] = config
        })
        localStorage.setItem('platform_configurations', JSON.stringify(configs))
      }
    } catch (error) {
      console.error('Error saving platform configurations:', error)
    }
  }
}

export const platformManager = new PlatformManager() 