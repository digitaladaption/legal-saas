-- Enterprise Features Migration
-- Adds comprehensive enterprise functionality including audit logging, subscriptions, and analytics

-- Enterprise Users table (extends basic auth)
CREATE TABLE IF NOT EXISTS enterprise_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'partner', 'associate', 'paralegal', 'client')),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    department VARCHAR(100),
    permissions TEXT[], -- Array of permission strings
    sso_provider VARCHAR(50), -- 'azure', 'auth0', 'saml', etc.
    sso_external_id VARCHAR(255),
    last_login TIMESTAMPTZ,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_setup_date TIMESTAMPTZ,
    compliance_status VARCHAR(50) DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'requires_update', 'suspended')),
    last_training_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs table for compliance and security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('authentication', 'data_access', 'document_action', 'user_management', 'system_config', 'compliance')),
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    firm_id UUID REFERENCES firms(id),
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    compliance_relevant BOOLEAN DEFAULT false,
    session_id VARCHAR(255),
    resource_type VARCHAR(50), -- 'case', 'document', 'user', etc.
    resource_id VARCHAR(255),
    action VARCHAR(50), -- 'create', 'read', 'update', 'delete', 'login', etc.
    result VARCHAR(20) DEFAULT 'success' CHECK (result IN ('success', 'failure', 'error'))
);

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL, -- Price in cents
    price_annual INTEGER, -- Annual price in cents (with discount)
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}', -- e.g., {"cases": 100, "users": 10, "storage_gb": 100}
    is_enterprise BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Firm Subscriptions table
CREATE TABLE IF NOT EXISTS firm_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'suspended', 'trialing')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(firm_id) -- One subscription per firm
);

-- Usage Analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_type VARCHAR(50) NOT NULL, -- 'api_calls', 'documents_processed', 'cases_created', etc.
    metric_value INTEGER NOT NULL DEFAULT 0,
    additional_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(firm_id, user_id, date, metric_type)
);

-- Revenue Analytics table
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mrr INTEGER DEFAULT 0, -- Monthly Recurring Revenue in cents
    arr INTEGER DEFAULT 0, -- Annual Recurring Revenue in cents
    new_subscriptions INTEGER DEFAULT 0,
    cancelled_subscriptions INTEGER DEFAULT 0,
    upgraded_subscriptions INTEGER DEFAULT 0,
    downgraded_subscriptions INTEGER DEFAULT 0,
    churn_rate DECIMAL(5,4) DEFAULT 0, -- Percentage as decimal (0.0234 = 2.34%)
    ltv INTEGER DEFAULT 0, -- Customer Lifetime Value in cents
    cac INTEGER DEFAULT 0, -- Customer Acquisition Cost in cents
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(firm_id, date)
);

-- System-wide analytics (aggregate data)
CREATE TABLE IF NOT EXISTS system_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_firms INTEGER DEFAULT 0,
    active_firms INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_cases INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    total_api_calls INTEGER DEFAULT 0,
    total_mrr INTEGER DEFAULT 0,
    total_arr INTEGER DEFAULT 0,
    average_churn_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date)
);

-- Compliance Reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'gdpr', 'hipaa', 'sox', 'custom'
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    report_data JSONB DEFAULT '{}',
    file_path VARCHAR(500), -- S3 path to generated report
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Enterprise Sessions table for advanced session management
CREATE TABLE IF NOT EXISTS enterprise_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_firm_id ON audit_logs(firm_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_firm_id ON usage_analytics(firm_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_date ON usage_analytics(date);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_metric_type ON usage_analytics(metric_type);

CREATE INDEX IF NOT EXISTS idx_revenue_analytics_firm_id ON revenue_analytics(firm_id);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics(date);

CREATE INDEX IF NOT EXISTS idx_enterprise_users_firm_id ON enterprise_users(firm_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_role ON enterprise_users(role);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_sso_provider ON enterprise_users(sso_provider);

CREATE INDEX IF NOT EXISTS idx_firm_subscriptions_firm_id ON firm_subscriptions(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_subscriptions_status ON firm_subscriptions(status);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_annual, features, limits, is_enterprise) VALUES
('Starter', 'Perfect for small firms getting started', 29900, 299900, 
 '["Basic AI Assistant", "Document Management", "Case Tracking", "Email Support"]',
 '{"cases": 25, "users": 3, "storage_gb": 10, "api_calls": 1000}', false),

('Professional', 'Ideal for growing law practices', 59900, 599900,
 '["Advanced AI Assistant", "Document Management", "Case Tracking", "Client Portal", "Analytics Dashboard", "Priority Support"]',
 '{"cases": 100, "users": 10, "storage_gb": 100, "api_calls": 5000}', false),

('Enterprise', 'For large firms with advanced needs', 129900, 1299900,
 '["Custom AI Models", "Advanced Analytics", "SSO & Enterprise Security", "API Access", "Dedicated Support", "Custom Integrations", "Compliance Tools"]',
 '{"cases": -1, "users": -1, "storage_gb": -1, "api_calls": -1}', true);

-- Row Level Security (RLS) Policies
ALTER TABLE enterprise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_sessions ENABLE ROW LEVEL SECURITY;

-- Enterprise Users Policies
CREATE POLICY "Enterprise users can view own firm users" ON enterprise_users
    FOR SELECT USING (firm_id IN (
        SELECT firm_id FROM firm_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin users can manage firm users" ON enterprise_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM enterprise_users eu 
            WHERE eu.id = auth.uid() 
            AND eu.role IN ('admin', 'partner')
            AND eu.firm_id = enterprise_users.firm_id
        )
    );

-- Audit Logs Policies
CREATE POLICY "Users can view own firm audit logs" ON audit_logs
    FOR SELECT USING (firm_id IN (
        SELECT firm_id FROM firm_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Usage Analytics Policies
CREATE POLICY "Users can view own firm analytics" ON usage_analytics
    FOR SELECT USING (firm_id IN (
        SELECT firm_id FROM firm_users WHERE user_id = auth.uid()
    ));

-- Revenue Analytics Policies (Admin/Partner only)
CREATE POLICY "Admin/Partner can view revenue analytics" ON revenue_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enterprise_users eu 
            WHERE eu.id = auth.uid() 
            AND eu.role IN ('admin', 'partner')
            AND eu.firm_id = revenue_analytics.firm_id
        )
    );

-- Subscription Policies
CREATE POLICY "Firm admins can view subscriptions" ON firm_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enterprise_users eu 
            WHERE eu.id = auth.uid() 
            AND eu.role IN ('admin', 'partner')
            AND eu.firm_id = firm_subscriptions.firm_id
        )
    );

-- Functions for analytics
CREATE OR REPLACE FUNCTION update_system_analytics()
RETURNS void AS $$
BEGIN
    INSERT INTO system_analytics (
        date,
        total_firms,
        active_firms,
        total_users,
        active_users,
        total_cases,
        total_documents,
        total_mrr,
        total_arr
    ) VALUES (
        CURRENT_DATE,
        (SELECT COUNT(*) FROM firms),
        (SELECT COUNT(*) FROM firms WHERE updated_at > CURRENT_DATE - INTERVAL '30 days'),
        (SELECT COUNT(*) FROM auth.users),
        (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > CURRENT_DATE - INTERVAL '30 days'),
        (SELECT COUNT(*) FROM cases),
        (SELECT COUNT(*) FROM documents),
        (SELECT COALESCE(SUM(mrr), 0) FROM revenue_analytics WHERE date = CURRENT_DATE),
        (SELECT COALESCE(SUM(arr), 0) FROM revenue_analytics WHERE date = CURRENT_DATE)
    )
    ON CONFLICT (date) DO UPDATE SET
        total_firms = EXCLUDED.total_firms,
        active_firms = EXCLUDED.active_firms,
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        total_cases = EXCLUDED.total_cases,
        total_documents = EXCLUDED.total_documents,
        total_mrr = EXCLUDED.total_mrr,
        total_arr = EXCLUDED.total_arr;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_event_type TEXT,
    p_event_name TEXT,
    p_user_id UUID DEFAULT NULL,
    p_firm_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_risk_level TEXT DEFAULT 'low',
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id TEXT DEFAULT NULL,
    p_action TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Get user details if user_id provided
    IF p_user_id IS NOT NULL THEN
        SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
        SELECT name INTO user_name FROM enterprise_users WHERE id = p_user_id;
    END IF;

    INSERT INTO audit_logs (
        event_type,
        event_name,
        user_id,
        user_email,
        user_name,
        firm_id,
        details,
        ip_address,
        user_agent,
        risk_level,
        compliance_relevant,
        resource_type,
        resource_id,
        action
    ) VALUES (
        p_event_type,
        p_event_name,
        p_user_id,
        user_email,
        user_name,
        p_firm_id,
        p_details,
        p_ip_address,
        p_user_agent,
        p_risk_level,
        p_event_type IN ('compliance', 'data_access', 'authentication'),
        p_resource_type,
        p_resource_id,
        p_action
    ) RETURNING id INTO audit_id;

    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic audit logging
CREATE OR REPLACE FUNCTION trigger_audit_log() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM log_audit_event(
            'data_access',
            TG_TABLE_NAME || '_deleted',
            auth.uid(),
            OLD.firm_id,
            to_jsonb(OLD),
            NULL,
            NULL,
            'medium',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            'delete'
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_event(
            'data_access',
            TG_TABLE_NAME || '_updated',
            auth.uid(),
            NEW.firm_id,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)),
            NULL,
            NULL,
            'low',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            'update'
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM log_audit_event(
            'data_access',
            TG_TABLE_NAME || '_created',
            auth.uid(),
            NEW.firm_id,
            to_jsonb(NEW),
            NULL,
            NULL,
            'low',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            'create'
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_cases_trigger
    AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_documents_trigger
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_enterprise_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON enterprise_users
    FOR EACH ROW EXECUTE FUNCTION trigger_audit_log(); 