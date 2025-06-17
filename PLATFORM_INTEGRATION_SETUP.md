# Platform Integration Setup Guide

This guide helps you connect your law firm's platforms (Slack, Discord, Google Drive, OneDrive, Gmail, Zoom) to your AI assistant for comprehensive document and conversation analysis.

## Overview

The AI assistant can now search across all your connected platforms simultaneously, providing comprehensive insights from:
- **Slack** - Team conversations and files
- **Discord** - Server messages and attachments  
- **Google Drive** - Documents and files
- **OneDrive** - Microsoft files and SharePoint
- **Gmail** - Email conversations and attachments
- **Zoom** - Meeting recordings and transcripts

## Quick Start

1. **Navigate to Integrations**: Go to `/agent/integrations` in your dashboard
2. **Connect Platforms**: Click "Connect" on each platform you want to integrate
3. **Configure Credentials**: Follow the platform-specific setup below
4. **Test Integration**: Use the search feature to verify connections

## Platform-Specific Setup

### 🟢 Google Drive & Gmail

**What you need:**
- Google Cloud Console project
- OAuth 2.0 credentials

**Setup steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google Drive API
   - Gmail API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/platforms/oauth/callback`
5. Add environment variables:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

**Scopes granted:**
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/gmail.readonly`

### 🔵 OneDrive & SharePoint

**What you need:**
- Microsoft Azure App Registration
- API permissions

**Setup steps:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to App registrations → New registration
3. Set redirect URI: `http://localhost:3000/api/platforms/oauth/callback`
4. API permissions:
   - Microsoft Graph → Files.Read.All
   - Microsoft Graph → Mail.Read
5. Add environment variables:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   ```

### 💬 Slack

**What you need:**
- Slack workspace admin access
- Slack app creation

**Setup steps:**
1. Go to [Slack API](https://api.slack.com/apps)
2. Create new app → From scratch
3. OAuth & Permissions → Add scopes:
   - `channels:history`
   - `channels:read`
   - `files:read`
   - `search:read`
   - `users:read`
4. Set redirect URL: `http://localhost:3000/api/platforms/oauth/callback`
5. Install app to workspace
6. Add environment variables:
   ```
   SLACK_CLIENT_ID=your_client_id
   SLACK_CLIENT_SECRET=your_client_secret
   ```

### 🎮 Discord

**What you need:**
- Discord server admin access
- Bot creation

**Setup steps:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. New Application → Bot section
3. Create bot and copy token
4. Server Settings → Integrations → Bots → Add bot
5. Grant permissions:
   - Read Message History
   - View Channels
   - Read Messages
6. Get your Guild ID (Server ID):
   - Enable Developer Mode in Discord
   - Right-click server → Copy Server ID
7. Manual setup in integrations page:
   - Bot Token: `your_bot_token`
   - Guild ID: `your_guild_id`

### 📹 Zoom

**What you need:**
- Zoom Pro/Business account
- Zoom Marketplace app

**Setup steps:**
1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Develop → Build App → OAuth
3. App credentials:
   - Redirect URL: `http://localhost:3000/api/platforms/oauth/callback`
4. Scopes:
   - `recording:read:admin`
   - `meeting:read:admin`
5. Add environment variables:
   ```
   ZOOM_CLIENT_ID=your_client_id
   ZOOM_CLIENT_SECRET=your_client_secret
   ```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Google Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/platforms/oauth/callback

# Microsoft Integration  
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/platforms/oauth/callback

# Slack Integration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:3000/api/platforms/oauth/callback

# Zoom Integration
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_REDIRECT_URI=http://localhost:3000/api/platforms/oauth/callback
```

## Security Considerations

### 🔒 Data Privacy
- All API calls use read-only permissions
- No data is stored permanently on our servers
- Credentials are encrypted in browser storage
- Platform connections can be revoked anytime

### 🛡️ Access Control
- OAuth tokens are scoped to minimum required permissions
- Each platform connection is isolated
- Multi-tenant architecture ensures firm-level data isolation
- Regular credential rotation recommended

### 🔐 Best Practices
1. **Use dedicated service accounts** where possible
2. **Regularly audit connected platforms**
3. **Revoke unused connections**
4. **Monitor API usage** in platform consoles
5. **Enable 2FA** on all connected accounts

## Testing Your Integration

1. **Connection Test**: Check platform status in `/agent/integrations`
2. **Search Test**: Use the search function to query across platforms
3. **AI Integration**: Ask the AI agent questions that would benefit from cross-platform data

### Sample Test Queries:
- "Find all discussions about the Johnson case"
- "Show me recent documents related to employment law"
- "What did we discuss in last week's team meeting?"
- "Find emails from client ABC Corp"

## Troubleshooting

### Common Issues:

**"OAuth Error: Invalid Redirect URI"**
- Ensure redirect URI matches exactly in platform settings
- Check for trailing slashes or http vs https

**"Insufficient Permissions"**
- Verify all required scopes are granted
- Check if workspace/organization admin approval is needed

**"Rate Limit Exceeded"**
- Implement exponential backoff
- Consider upgrading API tier for higher limits

**"Connection Timeout"**
- Check network connectivity
- Verify API endpoint URLs
- Confirm credentials are valid

### Support Resources:
- Platform documentation links in each integration card
- Error logs available in browser console
- Contact IT admin for organization-level permissions

## API Rate Limits

| Platform | Limit | Notes |
|----------|-------|-------|
| Google Drive | 1000 requests/100 seconds | Per user |
| Gmail | 250 quota units/user/second | Burst allowed |
| Slack | 100+ requests/minute | Tier 1 methods |
| OneDrive | 10,000 requests/10 minutes | Per app |
| Zoom | 2000 requests/day | Recording API |
| Discord | 50 requests/second | Per bot |

## Advanced Configuration

### Webhook Setup (Optional)
For real-time notifications, configure webhooks:
- Slack: Event Subscriptions
- Discord: Gateway Events  
- Google: Push Notifications
- Microsoft: Webhook Subscriptions

### Custom Scopes
Additional scopes for enhanced functionality:
- **Slack**: `chat:write` for AI responses
- **Google**: `drive` for document modification
- **Microsoft**: `Files.ReadWrite` for editing

### Batch Processing
For large organizations:
- Implement pagination for large result sets
- Use batch API calls where available
- Consider background sync jobs

## Compliance & Legal

### Data Retention
- Platform data is accessed in real-time
- No long-term storage of platform content
- Audit logs maintained for 90 days

### Regulatory Compliance
- GDPR: Data minimization and purpose limitation
- CCPA: Transparent data usage
- HIPAA: Available with enterprise setup
- SOC 2: Certified security controls

### Data Processing Agreement
Review each platform's DPA:
- [Google DPA](https://cloud.google.com/terms/data-processing-addendum)
- [Microsoft DPA](https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA)
- [Slack DPA](https://slack.com/trust/data-processing-addendum)
- [Zoom DPA](https://zoom.us/docs/doc/Zoom%20Data%20Processing%20Addendum.pdf)

## Getting Help

1. **Check Status Page**: Monitor platform API status
2. **Review Logs**: Browser console for detailed errors
3. **Test Connectivity**: Use platform's API testing tools
4. **Contact Support**: Include error messages and platform details

## Next Steps

Once integrated, your AI assistant will:
- ✅ Search across all connected platforms simultaneously
- ✅ Provide comprehensive case analysis using all available data
- ✅ Reference specific conversations, documents, and meetings
- ✅ Maintain context across different platforms
- ✅ Respect access permissions and data privacy

Ready to transform your law firm's information access! 🚀 