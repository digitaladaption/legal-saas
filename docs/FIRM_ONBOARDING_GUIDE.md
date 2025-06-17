# Law Firm Onboarding & User Management Guide

## Overview

This guide explains exactly how law firms set themselves up on the Legal AI Operating System after purchasing a subscription, including the differences between initial firm setup vs. ongoing user access, and comprehensive user management options.

---

## 🏢 **Firm Setup Process (After Payment)**

### **Step 1: Payment & Account Creation**
1. **Payment Processing**: Firm completes subscription purchase through Stripe
2. **Firm Account Creation**: System automatically creates:
   - Unique firm ID (`firm_123abc`)
   - Firm database tenant with RLS (Row Level Security)
   - Secure document storage folder (`documents/firm-123abc/`)
   - Billing account linkage

### **Step 2: Primary Administrator Setup**
```typescript
// Automatic process after payment
{
  firmId: "firm_123abc",
  firmName: "Smith & Associates Law",
  domain: "smithlaw.com",
  subscription: "professional", // starter, professional, enterprise
  adminUser: {
    name: "John Smith",
    email: "admin@smithlaw.com",
    role: "admin",
    permissions: ["full_access"]
  }
}
```

### **Step 3: Onboarding Wizard**
The firm administrator goes through a 6-step setup wizard:

1. **Firm Information**
   - Firm name, domain, size, practice areas
   - Used for branding and configuration

2. **Admin Account Setup**
   - Primary administrator details
   - Full system permissions granted

3. **SSO Integration (Optional)**
   - Azure AD, Okta, Auth0, or SAML setup
   - Enterprise-grade single sign-on

4. **User Management Strategy**
   - Manual user creation
   - CSV bulk import
   - Active Directory sync

5. **Data Migration**
   - Case and client import
   - Document upload
   - Migration assistance options

6. **Platform Configuration**
   - Workflow settings
   - AI preferences
   - Role definitions

---

## 🔐 **Sign Up vs. Sign In: Key Differences**

### **SIGN UP (First-Time Firm Setup)**
**Who:** Managing Partner or IT Administrator purchasing for the firm
**What Happens:**
- Creates new firm tenant in the system
- Establishes firm-wide settings and configurations
- Sets up primary administrator account
- Configures billing and subscription
- Goes through complete onboarding wizard

**Process:**
```
Purchase Subscription → Firm Creation → Admin Setup → Team Onboarding
```

### **SIGN IN (Ongoing User Access)**
**Who:** Individual lawyers, paralegals, staff added by administrators
**What Happens:**
- Authenticates against existing firm tenant
- Access determined by role and permissions
- Sees only firm-specific data
- No setup required (pre-configured by admin)

**Process:**
```
Invitation Received → Account Creation → Role Assignment → Platform Access
```

---

## 👥 **User Onboarding Options**

### **Option 1: Manual User Addition**
**Best for:** Small firms (1-20 users)

**Process:**
1. Admin navigates to Users → Add User
2. Fills in user details:
   ```typescript
   {
     name: "Sarah Johnson",
     email: "sarah@smithlaw.com", // Must match firm domain
     role: "partner", // admin, partner, associate, paralegal, client
     department: "Corporate Law",
     sendInvite: true
   }
   ```
3. System sends invitation email
4. User clicks invite link and creates password
5. Immediate access to firm's platform

**Admin Interface:**
- Add User button
- Role selection dropdown
- Department assignment
- Automatic invitation sending

### **Option 2: CSV Bulk Import**
**Best for:** Medium firms (20-100 users)

**Process:**
1. Admin downloads CSV template
2. Fills in user information:
   ```csv
   Name,Email,Role,Department,Title
   Sarah Johnson,sarah@smithlaw.com,partner,Corporate Law,Senior Partner
   Michael Chen,michael@smithlaw.com,associate,Litigation,Associate Attorney
   Emily Davis,emily@smithlaw.com,paralegal,Corporate Law,Legal Assistant
   ```
3. Uploads CSV file
4. System validates data and shows preview
5. Bulk invitation emails sent
6. Users receive personalized setup links

**Features:**
- Data validation (email domain checking)
- Duplicate detection
- Role mapping
- Batch processing
- Progress tracking

### **Option 3: Active Directory Integration**
**Best for:** Large firms (100+ users) with existing IT infrastructure

**Setup Requirements:**
- Azure AD or on-premises Active Directory
- SCIM 2.0 or Graph API access
- SSO configuration completed first

**Automatic User Provisioning:**
```typescript
// AD Sync Configuration
{
  adDomain: "smithlaw.onmicrosoft.com",
  syncEnabled: true,
  userMapping: {
    "CN=Partners,DC=smithlaw,DC=com": "partner",
    "CN=Associates,DC=smithlaw,DC=com": "associate",
    "CN=Paralegals,DC=smithlaw,DC=com": "paralegal"
  },
  syncSchedule: "daily", // real-time, hourly, daily
  autoDeprovisioning: true
}
```

**Sync Process:**
1. **Real-time Provisioning**: New AD users automatically get platform accounts
2. **Role Mapping**: AD group membership determines platform roles
3. **Attribute Sync**: Name, email, department, title synchronized
4. **Deprovisioning**: Disabled AD users lose platform access
5. **First Login**: Users sign in with corporate credentials, account auto-created

---

## 🔧 **Advanced User Management Features**

### **Role-Based Access Control (RBAC)**
```typescript
const rolePermissions = {
  admin: {
    users: ["create", "read", "update", "delete"],
    cases: ["create", "read", "update", "delete", "all_cases"],
    documents: ["create", "read", "update", "delete", "all_documents"],
    settings: ["read", "update"],
    billing: ["read", "update"]
  },
  partner: {
    users: ["read", "create_paralegal"],
    cases: ["create", "read", "update", "delete", "assigned_cases"],
    documents: ["create", "read", "update", "delete", "case_documents"],
    settings: ["read"],
    billing: ["read"]
  },
  associate: {
    users: ["read_team"],
    cases: ["read", "update", "assigned_cases"],
    documents: ["create", "read", "update", "case_documents"],
    settings: ["read"]
  },
  paralegal: {
    users: ["read_team"],
    cases: ["read", "update", "assigned_cases"],
    documents: ["create", "read", "case_documents"],
    settings: ["read"]
  },
  client: {
    cases: ["read", "client_cases"],
    documents: ["read", "client_documents"],
    communication: ["read", "create"]
  }
};
```

### **Department-Based Organization**
- **Corporate Law**: Partners, associates, paralegals working on corporate matters
- **Litigation**: Trial attorneys and support staff
- **Employment Law**: Specialized employment attorneys
- **Real Estate**: Property law specialists

### **Enterprise Security Features**
- **Multi-Factor Authentication (MFA)**: Enforced for admin and partner roles
- **Session Management**: Automatic logout after inactivity
- **Access Logging**: All user actions logged for compliance
- **IP Restrictions**: Limit access to office networks
- **Device Management**: Register and approve user devices

---

## 🔄 **Active Directory Integration Details**

### **Supported Identity Providers**
1. **Azure Active Directory (Azure AD)**
   - Native integration with Microsoft Graph API
   - Automatic user and group synchronization
   - Conditional access policy support

2. **On-Premises Active Directory**
   - Via Azure AD Connect
   - LDAP integration
   - Group policy enforcement

3. **Third-Party Providers**
   - Okta
   - Auth0
   - PingIdentity
   - Generic SAML 2.0

### **SCIM 2.0 User Provisioning**
```typescript
// Automated user lifecycle management
const scimConfiguration = {
  endpoint: "https://api.legalos.com/scim/v2",
  authentication: "Bearer token",
  operations: {
    createUser: true,
    updateUser: true,
    deleteUser: true,
    createGroup: true,
    addUserToGroup: true,
    removeUserFromGroup: true
  },
  attributeMapping: {
    "userName": "email",
    "displayName": "name",
    "department": "department",
    "title": "jobTitle",
    "groups": "roles"
  }
};
```

### **Real-Time Sync Events**
- **User Created**: New employee added to AD → Platform account created
- **User Updated**: Role change in AD → Platform permissions updated
- **User Disabled**: Employee leaves → Platform access revoked
- **Group Changes**: AD group membership → Platform role updates

---

## 📊 **User Management Dashboard**

### **Admin Interface Features**
1. **User Overview**
   - Total users, active users, pending invitations
   - SSO adoption rate
   - Security compliance status

2. **Bulk Operations**
   - Select multiple users for role changes
   - Bulk invitation resending
   - Group permission updates

3. **Advanced Filtering**
   - Filter by role, department, status
   - Search by name or email
   - Last login activity

4. **Security Monitoring**
   - Failed login attempts
   - Unusual access patterns
   - MFA compliance tracking

### **Self-Service Features**
- **Profile Management**: Users can update their own information
- **Password Reset**: Secure self-service password reset
- **Device Registration**: Users can register new devices
- **Notification Preferences**: Customize email and in-app notifications

---

## 🚀 **Getting Started Checklist**

### **For New Firms (After Purchase)**
- [ ] Complete payment and receive welcome email
- [ ] Access onboarding wizard with temporary admin link
- [ ] Configure firm information and branding
- [ ] Set up primary administrator account
- [ ] Choose user management strategy (manual/CSV/AD)
- [ ] Configure SSO if using enterprise authentication
- [ ] Import or invite initial users
- [ ] Set up department structure and roles
- [ ] Configure AI and workflow preferences
- [ ] Complete data migration if needed
- [ ] Conduct user training sessions

### **For Adding New Users (Ongoing)**
- [ ] Determine user role and department
- [ ] Add user through preferred method (manual/CSV/AD)
- [ ] Send invitation and setup instructions
- [ ] Verify user receives and accepts invitation
- [ ] Assign to appropriate cases and projects
- [ ] Provide platform training and resources

---

## 🔒 **Security & Compliance**

### **Data Isolation**
Each firm's data is completely isolated:
```sql
-- All queries automatically filtered by firm_id
SELECT * FROM cases WHERE firm_id = 'firm_123abc';
SELECT * FROM documents WHERE firm_id = 'firm_123abc';
SELECT * FROM users WHERE firm_id IN (
  SELECT id FROM firms WHERE id = 'firm_123abc'
);
```

### **Compliance Features**
- **GDPR Compliance**: Data portability and deletion rights
- **HIPAA Ready**: Healthcare law firm requirements
- **SOC 2 Type II**: Enterprise security standards
- **ISO 27001**: Information security management

### **Audit Logging**
Every user action is logged:
```typescript
{
  timestamp: "2024-01-10T15:30:00Z",
  userId: "user_456def",
  firmId: "firm_123abc",
  action: "document_accessed",
  resource: "contract_789ghi",
  ipAddress: "192.168.1.100",
  userAgent: "Chrome/120.0.0.0",
  result: "success"
}
```

---

This comprehensive system ensures that law firms can seamlessly onboard their teams while maintaining enterprise-grade security and compliance standards. 