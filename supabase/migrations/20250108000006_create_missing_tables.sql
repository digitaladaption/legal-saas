-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    type VARCHAR(50) DEFAULT 'individual', -- individual, business
    status VARCHAR(50) DEFAULT 'active', -- active, inactive
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    description TEXT NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    hourly_rate DECIMAL(10,2),
    date DATE NOT NULL,
    billable BOOLEAN DEFAULT true,
    billed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- revenue, performance, usage, etc.
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_firm_id ON clients(firm_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_firm_id ON time_entries(firm_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_case_id ON time_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_analytics_firm_id ON analytics(firm_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Enable RLS (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view clients from their firm" ON clients
    FOR SELECT USING (
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert clients to their firm" ON clients
    FOR INSERT WITH CHECK (
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update clients in their firm" ON clients
    FOR UPDATE USING (
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- RLS Policies for time_entries
CREATE POLICY "Users can view time entries from their firm" ON time_entries
    FOR SELECT USING (
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert time entries to their firm" ON time_entries
    FOR INSERT WITH CHECK (
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update their own time entries" ON time_entries
    FOR UPDATE USING (
        user_id = auth.uid() AND
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- RLS Policies for analytics
CREATE POLICY "Users can view analytics from their firm" ON analytics
    FOR SELECT USING (
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins can insert analytics for their firm" ON analytics
    FOR INSERT WITH CHECK (
        firm_id IN (
            SELECT firm_id FROM firm_users 
            WHERE user_id = auth.uid() AND status = 'active' AND role IN ('admin', 'partner')
        )
    );

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at 
    BEFORE UPDATE ON time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 