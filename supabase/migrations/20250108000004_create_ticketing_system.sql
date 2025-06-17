-- Ticketing System Migration
-- Creates a comprehensive ticket management system for law firms

-- Create ticket categories and types
CREATE TABLE IF NOT EXISTS ticket_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
  icon VARCHAR(50) DEFAULT 'folder',
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(name, firm_id)
);

-- Create priority levels
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');

-- Create ticket statuses
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled');

-- Create ticket sources
CREATE TYPE ticket_source AS ENUM ('manual', 'ai_generated', 'email', 'chat', 'phone', 'web_form', 'api');

-- Main tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL, -- Auto-generated: TICK-2024-001
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority priority_level DEFAULT 'medium',
  status ticket_status DEFAULT 'open',
  source ticket_source DEFAULT 'manual',
  
  -- Relationships
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ServiceNow-style fields
  short_description VARCHAR(160), -- Brief summary for lists
  work_notes TEXT, -- Internal notes
  close_notes TEXT, -- Closure details
  resolution_code VARCHAR(50),
  
  -- SLA and timing
  sla_due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  
  -- AI Integration fields
  ai_confidence_score DECIMAL(3,2), -- AI's confidence in auto-assignments
  ai_generated_tags TEXT[], -- AI-suggested tags
  ai_context JSONB, -- Context from AI analysis
  
  -- Metadata
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(ticket_number, firm_id)
);

-- Ticket comments/updates
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true, -- Internal work notes vs client-visible
  comment_type VARCHAR(20) DEFAULT 'comment', -- comment, status_change, assignment, etc.
  metadata JSONB DEFAULT '{}', -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ticket attachments
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ticket relationships (parent/child, linked tickets)
CREATE TABLE IF NOT EXISTS ticket_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  child_ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  relationship_type VARCHAR(20) DEFAULT 'blocks', -- blocks, duplicates, relates_to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(parent_ticket_id, child_ticket_id, relationship_type)
);

-- SLA definitions
CREATE TABLE IF NOT EXISTS sla_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
  
  -- SLA conditions
  priority_levels priority_level[],
  category_ids UUID[],
  
  -- Time targets (in hours)
  first_response_hours INTEGER,
  resolution_hours INTEGER,
  
  -- Business hours settings
  business_hours_only BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workflow automations (for AI integration)
CREATE TABLE IF NOT EXISTS ticket_automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
  
  -- Trigger conditions
  trigger_conditions JSONB NOT NULL, -- When to execute
  actions JSONB NOT NULL, -- What actions to take
  
  -- AI integration
  ai_enabled BOOLEAN DEFAULT false,
  ai_model VARCHAR(50), -- Which AI model to use
  ai_prompt TEXT, -- Custom prompt for AI decisions
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_tickets_firm_id ON tickets(firm_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_sla_due ON tickets(sla_due_date);
CREATE INDEX idx_tickets_case_id ON tickets(case_id);
CREATE INDEX idx_tickets_client_id ON tickets(client_id);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at_trigger
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_tickets_updated_at();

CREATE TRIGGER update_ticket_categories_updated_at_trigger
  BEFORE UPDATE ON ticket_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_tickets_updated_at();

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number(firm_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  sequence_num INTEGER;
  ticket_num TEXT;
BEGIN
  year_str := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get the next sequence number for this firm and year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ticket_number FROM 'TICK-' || year_str || '-([0-9]+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM tickets 
  WHERE firm_id = firm_uuid 
    AND ticket_number LIKE 'TICK-' || year_str || '-%';
  
  ticket_num := 'TICK-' || year_str || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate ticket numbers
CREATE OR REPLACE FUNCTION auto_generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number(NEW.firm_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_ticket_number_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_ticket_number();

-- RLS Policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_automations ENABLE ROW LEVEL SECURITY;

-- Tickets policies
CREATE POLICY "Users can view tickets from their firm" ON tickets
  FOR SELECT USING (
    firm_id IN (
      SELECT fu.firm_id FROM firm_users fu 
      WHERE fu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tickets in their firm" ON tickets
  FOR INSERT WITH CHECK (
    firm_id IN (
      SELECT fu.firm_id FROM firm_users fu 
      WHERE fu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tickets in their firm" ON tickets
  FOR UPDATE USING (
    firm_id IN (
      SELECT fu.firm_id FROM firm_users fu 
      WHERE fu.user_id = auth.uid()
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view ticket categories from their firm" ON ticket_categories
  FOR SELECT USING (
    firm_id IN (
      SELECT fu.firm_id FROM firm_users fu 
      WHERE fu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage ticket categories in their firm" ON ticket_categories
  FOR ALL USING (
    firm_id IN (
      SELECT fu.firm_id FROM firm_users fu 
      WHERE fu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view ticket comments from their firm" ON ticket_comments
  FOR SELECT USING (
    ticket_id IN (
      SELECT t.id FROM tickets t
      JOIN firm_users fu ON t.firm_id = fu.firm_id
      WHERE fu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ticket comments in their firm" ON ticket_comments
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT t.id FROM tickets t
      JOIN firm_users fu ON t.firm_id = fu.firm_id
      WHERE fu.user_id = auth.uid()
    )
  );

-- Insert default categories for existing firms
INSERT INTO ticket_categories (name, description, color, icon, firm_id)
SELECT 
  category_name,
  category_description,
  category_color,
  category_icon,
  f.id as firm_id
FROM firms f
CROSS JOIN (
  VALUES 
    ('General', 'General support and inquiries', '#6B7280', 'help-circle'),
    ('Case Management', 'Case-related tasks and issues', '#3B82F6', 'briefcase'),
    ('Document Review', 'Document processing and review tasks', '#F59E0B', 'file-text'),
    ('Client Communication', 'Client-related communication tasks', '#10B981', 'users'),
    ('Legal Research', 'Legal research and analysis tasks', '#8B5CF6', 'search'),
    ('Court Filing', 'Court filings and deadlines', '#EF4444', 'calendar'),
    ('Billing', 'Billing and invoicing issues', '#059669', 'dollar-sign'),
    ('IT Support', 'Technical support and system issues', '#DC2626', 'settings')
) AS categories(category_name, category_description, category_color, category_icon)
ON CONFLICT (name, firm_id) DO NOTHING;

-- Insert default SLA policy
INSERT INTO sla_policies (name, description, firm_id, priority_levels, first_response_hours, resolution_hours)
SELECT 
  'Standard SLA',
  'Default service level agreement for all tickets',
  f.id,
  ARRAY['critical', 'high', 'medium', 'low']::priority_level[],
  4, -- 4 hours first response
  24 -- 24 hours resolution
FROM firms f
ON CONFLICT DO NOTHING; 