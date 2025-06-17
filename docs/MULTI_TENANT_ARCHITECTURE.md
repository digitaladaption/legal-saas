# Multi-Tenant SaaS Architecture for Law Firms

## Overview
Our Legal AI Operating System uses a **secure multi-tenant architecture** where each law firm gets their own isolated instance within shared infrastructure. This approach provides:

- **Data Isolation**: Complete separation of firm data
- **Cost Efficiency**: Shared infrastructure reduces costs
- **Scalability**: Easy onboarding of new firms
- **Security**: Enterprise-grade isolation and compliance

## 🏢 How Law Firms Get Their Own Instance

### 1. **Firm Registration Process**

When a new law firm signs up:

```sql
-- 1. Create the firm
INSERT INTO firms (name, domain, plan_type, settings) VALUES 
('Smith & Associates Law', 'smithlaw.com', 'professional', '{}');

-- 2. Create the admin user 
INSERT INTO auth.users (email, encrypted_password) VALUES 
('admin@smithlaw.com', 'encrypted_password');

-- 3. Link user to firm
INSERT INTO firm_users (firm_id, user_id, role) VALUES 
('firm-uuid', 'user-uuid', 'admin');
```

### 2. **Automatic Data Isolation**

Every data operation is automatically scoped to the user's firm:

```sql
-- Row Level Security (RLS) ensures users only see their firm's data
CREATE POLICY "Users can only access own firm data" ON cases
    FOR SELECT USING (firm_id = get_user_firm_id());

-- Function to get current user's firm
CREATE FUNCTION get_user_firm_id() RETURNS UUID AS $$
    SELECT firm_id FROM firm_users WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;
```

## 🔒 **Data Isolation Layers**

### **Layer 1: Database Level**
- **firm_id column** on every table
- **Row Level Security (RLS)** policies
- **Automatic triggers** for firm assignment

### **Layer 2: Storage Level**
```
storage/
├── documents/
│   ├── firm-123/
│   │   ├── case-456/
│   │   │   ├── contract.pdf
│   │   │   └── evidence.jpg
│   │   └── case-789/
│   └── firm-456/
│       ├── case-123/
│       └── case-456/
```

### **Layer 3: Application Level**
```typescript
// All API calls automatically filtered by firm
const cases = await supabase
  .from('cases')
  .select('*')
  // RLS automatically adds: WHERE firm_id = user_firm_id()
```

## 🚀 **Onboarding New Law Firms**

### **Step 1: Firm Creation**
```typescript
async function createNewFirm(firmData: {
  name: string;
  domain: string;
  adminEmail: string;
  planType: 'starter' | 'professional' | 'enterprise';
}) {
  // 1. Create firm record
  const { data: firm } = await supabase
    .from('firms')
    .insert({
      name: firmData.name,
      domain: firmData.domain,
      plan_type: firmData.planType,
      settings: getDefaultFirmSettings(),
      created_at: new Date()
    })
    .select()
    .single();

  // 2. Create admin user
  const { data: user } = await supabase.auth.admin.createUser({
    email: firmData.adminEmail,
    email_confirm: true,
    user_metadata: {
      firm_id: firm.id,
      role: 'admin',
      firm_name: firm.name
    }
  });

  // 3. Link user to firm
  await supabase
    .from('firm_users')
    .insert({
      firm_id: firm.id,
      user_id: user.id,
      role: 'admin'
    });

  // 4. Create subscription
  await supabase
    .from('firm_subscriptions')
    .insert({
      firm_id: firm.id,
      plan_id: getPlanId(firmData.planType),
      status: 'trialing',
      trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    });

  return { firm, user };
}
```

### **Step 2: Data Setup**
```typescript
async function setupFirmDefaults(firmId: string) {
  // Create default categories
  await supabase.from('case_categories').insert([
    { name: 'Corporate Law', firm_id: firmId },
    { name: 'Litigation', firm_id: firmId },
    { name: 'Employment Law', firm_id: firmId }
  ]);

  // Create default templates
  await supabase.from('document_templates').insert([
    { name: 'Client Agreement', type: 'contract', firm_id: firmId },
    { name: 'Case Brief', type: 'legal_document', firm_id: firmId }
  ]);

  // Setup default workflows
  await supabase.from('workflows').insert([
    { name: 'New Client Onboarding', firm_id: firmId },
    { name: 'Case Resolution', firm_id: firmId }
  ]);
}
```

## 🏗️ **Architecture Components**

### **1. Core Tables with Multi-Tenancy**
```sql
-- Every business table has firm_id
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    -- other fields...
);

-- Automatic firm assignment trigger
CREATE TRIGGER auto_assign_firm_id_cases
    BEFORE INSERT ON cases
    FOR EACH ROW EXECUTE FUNCTION auto_assign_firm_id();
```

### **2. User Management**
```sql
-- Junction table for firm-user relationships
CREATE TABLE firm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'admin', 'partner', 'associate', etc.
    permissions TEXT[],
    UNIQUE(firm_id, user_id)
);
```

### **3. Subscription Management**
```sql
-- Each firm has one subscription
CREATE TABLE firm_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(firm_id) -- One subscription per firm
);
```

## 🎯 **Real-World Example**

### **Firm A: "Smith & Associates"**
- **Firm ID**: `123e4567-e89b-12d3-a456-426614174000`
- **Users**: 12 lawyers, 3 paralegals
- **Data**: 250 cases, 1,500 documents
- **Storage**: `documents/123e4567-e89b-12d3-a456-426614174000/`

### **Firm B: "Johnson Legal Group"**
- **Firm ID**: `987fcdeb-51c2-4d8f-9876-fedcba987654`  
- **Users**: 8 lawyers, 2 paralegals
- **Data**: 180 cases, 1,200 documents
- **Storage**: `documents/987fcdeb-51c2-4d8f-9876-fedcba987654/`

**Complete Isolation**: Firm A cannot see any of Firm B's data, and vice versa.

## 🔐 **Security Implementation**

### **Row Level Security (RLS)**
```sql
-- Example: Cases table security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "firm_isolation_policy" ON cases
    FOR ALL USING (firm_id = get_user_firm_id());

-- Users can only see cases from their firm
SELECT * FROM cases; -- Automatically filtered by firm_id
```

### **API Security**
```typescript
// Middleware automatically adds firm context
export async function withFirmContext(req: NextRequest) {
  const user = await getUser(req);
  const firmId = await getUserFirmId(user.id);
  
  // All subsequent queries are scoped to this firm
  req.firmId = firmId;
  return req;
}
```

## 📈 **Scaling Benefits**

### **For Law Firms**
- ✅ **Instant Setup**: New firms operational in minutes
- ✅ **No Infrastructure**: No servers to manage
- ✅ **Automatic Updates**: Always latest features
- ✅ **Data Portability**: Easy migration if needed

### **For Our Business**
- ✅ **Cost Efficient**: Shared infrastructure across 1000+ firms
- ✅ **Easy Maintenance**: Single codebase, multiple tenants
- ✅ **Rapid Scaling**: Add new firms without infrastructure changes
- ✅ **Feature Deployment**: Roll out to all firms simultaneously

## 🎛️ **Administration & Management**

### **Firm Management Dashboard**
```typescript
// Admin can manage all firms
const firmStats = await supabase
  .from('system_analytics')
  .select(`
    total_firms,
    active_firms,
    total_revenue,
    churn_rate
  `);

// Individual firm analytics
const firmAnalytics = await supabase
  .from('firm_analytics')
  .select('*')
  .eq('firm_id', firmId);
```

### **Billing & Subscriptions**
```typescript
// Automatic billing per firm
const subscription = await supabase
  .from('firm_subscriptions')
  .select(`
    *,
    subscription_plans(*),
    usage_analytics(*)
  `)
  .eq('firm_id', firmId)
  .single();

// Usage-based billing
const usage = await calculateMonthlyUsage(firmId);
const bill = calculateBill(subscription.plan, usage);
```

## 🚀 **Getting Started**

### **For New Law Firms**
1. **Sign Up**: Visit `/signup` and create firm account
2. **Verification**: Email verification and firm details
3. **Setup**: Choose plan and add team members  
4. **Data Import**: Upload existing cases and documents
5. **Go Live**: Start using AI-powered legal workflows

### **For Enterprise Clients**
1. **Demo**: Schedule personalized demo
2. **Custom Setup**: Tailored configuration and SSO
3. **Data Migration**: White-glove migration service
4. **Training**: Team training and onboarding
5. **Support**: Dedicated customer success manager

## 🎯 **Key Advantages**

✅ **Complete Data Isolation** - Military-grade security  
✅ **Instant Scalability** - From 1 to 10,000+ firms  
✅ **Cost Efficiency** - Shared infrastructure benefits  
✅ **Easy Management** - Single platform, multiple tenants  
✅ **Compliance Ready** - SOC 2, GDPR, HIPAA compliant  
✅ **Enterprise Features** - SSO, audit logging, custom branding  

---

*This architecture allows us to serve small boutique firms and Am Law 100 firms on the same platform while maintaining complete security and isolation.* 