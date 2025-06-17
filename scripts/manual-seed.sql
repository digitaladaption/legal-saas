-- Manual database seeding with sample UK law firm data
-- Run this directly in the Supabase SQL editor

-- Insert sample firm
INSERT INTO firms (id, name, domain, subscription_tier, status, practice_areas, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Smith & Associates Solicitors',
    'smithsolicitors.co.uk',
    'professional',
    'active',
    '["Commercial Law", "Employment Law", "Property Law"]',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO firm_users (id, firm_id, email, name, role, department, status, last_login, created_at) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'admin@smithsolicitors.co.uk',
    'John Smith',
    'admin',
    'Management',
    'active',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '6 months'
),
(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'sarah.johnson@smithsolicitors.co.uk',
    'Sarah Johnson',
    'partner',
    'Commercial Law',
    'active',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '4 months'
),
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'michael.chen@smithsolicitors.co.uk',
    'Michael Chen',
    'associate',
    'Employment Law',
    'active',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 months'
),
(
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'emily.davis@smithsolicitors.co.uk',
    'Emily Davis',
    'paralegal',
    'Commercial Law',
    'active',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '2 months'
),
(
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'david.wilson@smithsolicitors.co.uk',
    'David Wilson',
    'associate',
    'Property Law',
    'active',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 month'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, firm_id, name, email, phone, type, status, created_at) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'TechCorp Ltd',
    'legal@techcorp.co.uk',
    '+44 20 7946 0958',
    'business',
    'active',
    NOW() - INTERVAL '3 months'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'John Doe',
    'john.doe@email.co.uk',
    '+44 161 496 0142',
    'individual',
    'active',
    NOW() - INTERVAL '2 months'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Global Industries plc',
    'contracts@global.co.uk',
    '+44 113 496 0785',
    'business',
    'active',
    NOW() - INTERVAL '4 months'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'Maria Rodriguez',
    'maria.rodriguez@email.co.uk',
    '+44 121 496 0364',
    'individual',
    'active',
    NOW() - INTERVAL '1 month'
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'StartupVentures Ltd',
    'info@startupventures.co.uk',
    '+44 20 3862 4751',
    'business',
    'active',
    NOW() - INTERVAL '2 weeks'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample cases
INSERT INTO cases (id, firm_id, case_number, title, description, client_id, assigned_to, status, priority, practice_area, estimated_hours, hourly_rate, total_billed, created_at, updated_at) VALUES
(
    '11111111-aaaa-aaaa-aaaa-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'SMITH-2024-0001',
    'Commercial Contract Dispute - TechCorp Ltd',
    'Breach of software licensing agreement under English contract law. Client seeks damages for non-delivery of promised features and seeks remedies under Sale of Goods Act 1979.',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'active',
    'high',
    'Commercial Law',
    120,
    350.00,
    28000.00,
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '1 week'
),
(
    '22222222-bbbb-bbbb-bbbb-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'SMITH-2024-0002',
    'Unfair Dismissal Claim - John Doe',
    'Employment tribunal case involving alleged unfair dismissal under Employment Rights Act 1996. Requires investigation of ACAS procedures and TUPE regulations compliance.',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444',
    'active',
    'medium',
    'Employment Law',
    80,
    280.00,
    15200.00,
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '3 days'
),
(
    '33333333-cccc-cccc-cccc-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'SMITH-2024-0003',
    'Company Acquisition - Global Industries plc',
    'Complex acquisition under Companies Act 2006 requiring FCA compliance, due diligence, and Competition and Markets Authority clearance.',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'pending',
    'urgent',
    'Commercial Law',
    200,
    400.00,
    62000.00,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '2 days'
),
(
    '44444444-dddd-dddd-dddd-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'SMITH-2024-0004',
    'Personal Injury Claim - Maria Rodriguez',
    'RTA personal injury case under Civil Liability Act 2018. Negotiating with insurers and assessing quantum under Judicial College Guidelines.',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '44444444-4444-4444-4444-444444444444',
    'active',
    'medium',
    'Personal Injury',
    60,
    245.00,
    9800.00,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '1 day'
),
(
    '55555555-eeee-eeee-eeee-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'SMITH-2024-0005',
    'Company Formation - StartupVentures Ltd',
    'Incorporation under Companies Act 2006 with EIS/SEIS compliance. Includes shareholders agreement and HMRC advance assurance applications.',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '33333333-3333-3333-3333-333333333333',
    'active',
    'low',
    'Commercial Law',
    40,
    320.00,
    6800.00,
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '1 hour'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (id, firm_id, case_id, name, type, size, uploaded_by, file_path, tags, created_at) VALUES
(
    'doc11111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-aaaa-aaaa-aaaa-111111111111',
    'Software_Licence_Agreement_Original.pdf',
    'contract',
    2048576,
    '33333333-3333-3333-3333-333333333333',
    'documents/11111111-1111-1111-1111-111111111111/11111111-aaaa-aaaa-aaaa-111111111111/Software_Licence_Agreement_Original.pdf',
    '["contract", "commercial law", "confidential"]',
    NOW() - INTERVAL '2 months'
),
(
    'doc22222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '11111111-aaaa-aaaa-aaaa-111111111111',
    'Breach_Analysis_Advice.docx',
    'legal_advice',
    512000,
    '55555555-5555-5555-5555-555555555555',
    'documents/11111111-1111-1111-1111-111111111111/11111111-aaaa-aaaa-aaaa-111111111111/Breach_Analysis_Advice.docx',
    '["advice", "analysis", "privileged"]',
    NOW() - INTERVAL '1 month'
),
(
    'doc33333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-bbbb-bbbb-bbbb-222222222222',
    'Employment_Handbook_Review.pdf',
    'policy_document',
    1024000,
    '44444444-4444-4444-4444-444444444444',
    'documents/11111111-1111-1111-1111-111111111111/22222222-bbbb-bbbb-bbbb-222222222222/Employment_Handbook_Review.pdf',
    '["employment", "policy", "GDPR"]',
    NOW() - INTERVAL '5 weeks'
),
(
    'doc44444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    '22222222-bbbb-bbbb-bbbb-222222222222',
    'ACAS_Early_Conciliation_Certificate.pdf',
    'tribunal_document',
    256000,
    '55555555-5555-5555-5555-555555555555',
    'documents/11111111-1111-1111-1111-111111111111/22222222-bbbb-bbbb-bbbb-222222222222/ACAS_Early_Conciliation_Certificate.pdf',
    '["ACAS", "tribunal", "employment"]',
    NOW() - INTERVAL '3 weeks'
),
(
    'doc55555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '33333333-cccc-cccc-cccc-333333333333',
    'CMA_Merger_Notification.xlsx',
    'regulatory_filing',
    128000,
    '33333333-3333-3333-3333-333333333333',
    'documents/11111111-1111-1111-1111-111111111111/33333333-cccc-cccc-cccc-333333333333/CMA_Merger_Notification.xlsx',
    '["CMA", "competition", "regulatory"]',
    NOW() - INTERVAL '3 weeks'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample time entries
INSERT INTO time_entries (id, firm_id, case_id, user_id, description, hours, hourly_rate, date, created_at) VALUES
(
    'time1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-aaaa-aaaa-aaaa-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'Initial client consultation and case strategy under English contract law',
    2.5,
    350.00,
    CURRENT_DATE - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks'
),
(
    'time2222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '11111111-aaaa-aaaa-aaaa-111111111111',
    '55555555-5555-5555-5555-555555555555',
    'Contract review and breach analysis under Sale of Goods Act',
    4.0,
    165.00,
    CURRENT_DATE - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
),
(
    'time3333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-bbbb-bbbb-bbbb-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'Employment law research and ERA 1996 precedent analysis',
    3.5,
    280.00,
    CURRENT_DATE - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
),
(
    'time4444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    '33333333-cccc-cccc-cccc-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Due diligence coordination and Companies House filings',
    6.0,
    400.00,
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
(
    'time5555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '44444444-dddd-dddd-dddd-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Personal injury case preparation and Judicial College Guidelines assessment',
    2.0,
    245.00,
    CURRENT_DATE - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample tickets
INSERT INTO tickets (id, firm_id, ticket_number, title, description, priority, status, reporter_id, assignee_id, category, created_at, updated_at) VALUES
(
    'tick1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'TICK-2024-001',
    'SRA compliance software renewal required',
    'Need to renew Lexcel practice management software and SRA-compliant accounting system. Current licences expire at month end.',
    'medium',
    'open',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'administrative',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
),
(
    'tick2222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'TICK-2024-002',
    'New solicitor onboarding and SRA registration',
    'Setup IT equipment and system access for newly qualified solicitor. Includes SRA registration verification and case management access.',
    'high',
    'in_progress',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'technical',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '4 hours'
),
(
    'tick3333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'TICK-2024-003',
    'Client portal GDPR compliance issue',
    'Client reports GDPR data access request not processing correctly. Portal should provide full data export within statutory timeframe.',
    'high',
    'resolved',
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'technical',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample analytics data
INSERT INTO analytics (id, firm_id, metric_type, metric_name, value, date, metadata, created_at) VALUES
(
    'anal1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'revenue',
    'monthly_revenue',
    425000.00,
    CURRENT_DATE - INTERVAL '1 month',
    '{"cases_count": 5, "active_users": 5, "billable_hours": 1280}',
    NOW() - INTERVAL '1 month'
),
(
    'anal2222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'performance',
    'case_resolution_time',
    45.00,
    CURRENT_DATE - INTERVAL '1 month',
    '{"cases_closed": 8, "success_rate": 87}',
    NOW() - INTERVAL '1 month'
),
(
    'anal3333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'revenue',
    'monthly_revenue',
    385000.00,
    CURRENT_DATE - INTERVAL '2 months',
    '{"cases_count": 4, "active_users": 5, "billable_hours": 1150}',
    NOW() - INTERVAL '2 months'
),
(
    'anal4444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'performance',
    'client_satisfaction',
    4.6,
    CURRENT_DATE - INTERVAL '1 month',
    '{"survey_responses": 15, "avg_rating": 4.6}',
    NOW() - INTERVAL '1 month'
) ON CONFLICT (id) DO NOTHING;

-- Display summary
SELECT 
    'firms' as table_name, 
    COUNT(*) as record_count 
FROM firms 
WHERE id = '11111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
    'firm_users' as table_name, 
    COUNT(*) as record_count 
FROM firm_users 
WHERE firm_id = '11111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
    'clients' as table_name, 
    COUNT(*) as record_count 
FROM clients 
WHERE firm_id = '11111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
    'cases' as table_name, 
    COUNT(*) as record_count 
FROM cases 
WHERE firm_id = '11111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
    'documents' as table_name, 
    COUNT(*) as record_count 
FROM documents 
WHERE firm_id = '11111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
    'time_entries' as table_name, 
    COUNT(*) as record_count 
FROM time_entries 
WHERE firm_id = '11111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
    'tickets' as table_name, 
    COUNT(*) as record_count 
FROM tickets 
WHERE firm_id = '11111111-1111-1111-1111-111111111111'

UNION ALL

SELECT 
    'analytics' as table_name, 
    COUNT(*) as record_count 
FROM analytics 
WHERE firm_id = '11111111-1111-1111-1111-111111111111'

ORDER BY table_name; 