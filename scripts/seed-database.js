const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dummy data arrays
const firmNames = [
  "Smith & Associates Law",
  "Johnson Legal Partners", 
  "Wilson Corporate Attorneys",
  "Davis Litigation Group",
  "Brown & Partners LLP"
];

const practiceAreas = [
  "Corporate Law", "Litigation", "Employment Law", "Intellectual Property",
  "Real Estate", "Family Law", "Criminal Defense", "Tax Law", 
  "Immigration", "Personal Injury", "Bankruptcy", "Environmental Law"
];

const userRoles = ['admin', 'partner', 'associate', 'paralegal'];

const caseTypes = [
  "Contract Dispute", "Employment Termination", "Patent Application",
  "Real Estate Transaction", "Divorce Proceedings", "Criminal Defense",
  "Personal Injury Claim", "Corporate Merger", "Trademark Registration",
  "Immigration Visa", "Tax Audit Defense", "Environmental Compliance"
];

const caseStatuses = ['active', 'pending', 'closed', 'on_hold'];

const documentTypes = [
  "Contract", "Brief", "Motion", "Deposition", "Settlement Agreement",
  "Patent Application", "Trademark Filing", "Corporate Bylaws",
  "Employment Agreement", "Real Estate Deed", "Court Filing",
  "Legal Memorandum", "Discovery Request", "Expert Report"
];

// Helper functions
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomAmount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create sample firms
    console.log('📊 Creating firms...');
    const firmsData = firmNames.map((name, index) => ({
      name,
      domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      subscription_tier: randomItem(['starter', 'professional', 'enterprise']),
      status: 'active',
      practice_areas: [randomItem(practiceAreas), randomItem(practiceAreas), randomItem(practiceAreas)],
      created_at: randomDate(new Date(2020, 0, 1), new Date()).toISOString()
    }));

    const { data: firms, error: firmsError } = await supabase
      .from('firms')
      .insert(firmsData)
      .select();

    if (firmsError) throw firmsError;
    console.log(`✅ Created ${firms.length} firms`);

    // 2. Create sample users for each firm
    console.log('👥 Creating users...');
    const usersData = [];
    
    for (const firm of firms) {
      const firmDomain = firm.domain;
      const userCount = randomAmount(8, 25);
      
      // Create admin user
      usersData.push({
        firm_id: firm.id,
        email: `admin@${firmDomain}`,
        name: `${randomItem(['John', 'Jane', 'Michael', 'Sarah'])} ${randomItem(['Smith', 'Johnson', 'Williams', 'Brown'])}`,
        role: 'admin',
        department: 'Management',
        status: 'active',
        last_login: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
        created_at: randomDate(new Date(2023, 0, 1), new Date()).toISOString()
      });

      // Create other users
      for (let i = 1; i < userCount; i++) {
        const firstName = randomItem(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda', 'Charles']);
        const lastName = randomItem(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson']);
        
        usersData.push({
          firm_id: firm.id,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${firmDomain}`,
          name: `${firstName} ${lastName}`,
          role: randomItem(userRoles),
          department: randomItem(practiceAreas),
          status: randomItem(['active', 'active', 'active', 'inactive']), // Most active
          last_login: Math.random() > 0.2 ? randomDate(new Date(2024, 0, 1), new Date()).toISOString() : null,
          created_at: randomDate(new Date(2023, 0, 1), new Date()).toISOString()
        });
      }
    }

    const { data: users, error: usersError } = await supabase
      .from('firm_users')
      .insert(usersData)
      .select();

    if (usersError) throw usersError;
    console.log(`✅ Created ${users.length} users`);

    // 3. Create sample clients
    console.log('🏢 Creating clients...');
    const clientsData = [];
    
    for (const firm of firms) {
      const clientCount = randomAmount(15, 40);
      
      for (let i = 0; i < clientCount; i++) {
        const isCompany = Math.random() > 0.4;
        const companyNames = ['TechCorp Inc', 'Global Industries', 'Startup Ventures', 'Manufacturing Co', 'Retail Solutions', 'Healthcare Partners', 'Financial Services', 'Real Estate Group'];
        const firstName = randomItem(['Alex', 'Morgan', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn']);
        const lastName = randomItem(['Anderson', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker']);
        
        clientsData.push({
          firm_id: firm.id,
          name: isCompany ? randomItem(companyNames) : `${firstName} ${lastName}`,
          email: isCompany ? `contact@${randomItem(companyNames).toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
          phone: `+1-${randomAmount(200, 999)}-${randomAmount(100, 999)}-${randomAmount(1000, 9999)}`,
          type: isCompany ? 'business' : 'individual',
          status: randomItem(['active', 'active', 'active', 'inactive']),
          created_at: randomDate(new Date(2022, 0, 1), new Date()).toISOString()
        });
      }
    }

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert(clientsData)
      .select();

    if (clientsError) throw clientsError;
    console.log(`✅ Created ${clients.length} clients`);

    // 4. Create sample cases
    console.log('⚖️ Creating cases...');
    const casesData = [];
    
    for (const firm of firms) {
      const firmUsers = users.filter(u => u.firm_id === firm.id);
      const firmClients = clients.filter(c => c.firm_id === firm.id);
      const caseCount = randomAmount(25, 80);
      
      for (let i = 0; i < caseCount; i++) {
        const client = randomItem(firmClients);
        const assignedUser = randomItem(firmUsers);
        const caseType = randomItem(caseTypes);
        const status = randomItem(caseStatuses);
        const createdDate = randomDate(new Date(2022, 0, 1), new Date());
        
        casesData.push({
          firm_id: firm.id,
          case_number: `${firm.name.split(' ')[0].toUpperCase()}-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
          title: `${caseType} - ${client.name}`,
          description: `Legal matter involving ${caseType.toLowerCase()} for client ${client.name}. ${randomItem([
            'Complex commercial dispute requiring extensive discovery.',
            'Routine matter with standard documentation requirements.',
            'High-priority case with tight deadlines.',
            'Multi-party litigation with significant damages.',
            'Regulatory compliance matter requiring specialized expertise.'
          ])}`,
          client_id: client.id,
          assigned_to: assignedUser.id,
          status: status,
          priority: randomItem(['low', 'medium', 'high', 'urgent']),
          practice_area: randomItem(practiceAreas),
          estimated_hours: randomAmount(10, 500),
          hourly_rate: randomAmount(200, 800),
          total_billed: randomAmount(5000, 250000),
          created_at: createdDate.toISOString(),
          updated_at: randomDate(createdDate, new Date()).toISOString()
        });
      }
    }

    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .insert(casesData)
      .select();

    if (casesError) throw casesError;
    console.log(`✅ Created ${cases.length} cases`);

    // 5. Create sample documents
    console.log('📄 Creating documents...');
    const documentsData = [];
    
    for (const firm of firms) {
      const firmCases = cases.filter(c => c.firm_id === firm.id);
      const firmUsers = users.filter(u => u.firm_id === firm.id);
      
      // Create documents for each case
      for (const case_ of firmCases) {
        const docCount = randomAmount(3, 15);
        
        for (let i = 0; i < docCount; i++) {
          const docType = randomItem(documentTypes);
          const uploadedBy = randomItem(firmUsers);
          
          documentsData.push({
            firm_id: firm.id,
            case_id: case_.id,
            name: `${docType}_${case_.case_number}_${String(i + 1).padStart(2, '0')}.pdf`,
            type: docType.toLowerCase().replace(' ', '_'),
            size: randomAmount(50000, 5000000), // 50KB to 5MB
            uploaded_by: uploadedBy.id,
            file_path: `documents/${firm.id}/${case_.id}/${docType.toLowerCase().replace(' ', '_')}_${i + 1}.pdf`,
            tags: [docType, case_.practice_area, randomItem(['confidential', 'public', 'internal'])],
            created_at: randomDate(new Date(case_.created_at), new Date()).toISOString()
          });
        }
      }
    }

    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .insert(documentsData)
      .select();

    if (documentsError) throw documentsError;
    console.log(`✅ Created ${documents.length} documents`);

    // 6. Create sample time entries
    console.log('⏰ Creating time entries...');
    const timeEntriesData = [];
    
    for (const firm of firms) {
      const firmCases = cases.filter(c => c.firm_id === firm.id);
      const firmUsers = users.filter(u => u.firm_id === firm.id && u.role !== 'client');
      
      for (const case_ of firmCases) {
        const entryCount = randomAmount(5, 30);
        
        for (let i = 0; i < entryCount; i++) {
          const user = randomItem(firmUsers);
          const hours = (randomAmount(15, 480) / 60); // 0.25 to 8 hours
          const date = randomDate(new Date(case_.created_at), new Date());
          
          timeEntriesData.push({
            firm_id: firm.id,
            case_id: case_.id,
            user_id: user.id,
            description: randomItem([
              'Client consultation and case strategy discussion',
              'Legal research and case law analysis',
              'Document review and preparation',
              'Court filing and procedural motions',
              'Deposition preparation and attendance',
              'Settlement negotiations with opposing counsel',
              'Expert witness coordination and preparation',
              'Case status update and client communication'
            ]),
            hours: parseFloat(hours.toFixed(2)),
            hourly_rate: randomAmount(150, 500),
            date: date.toISOString().split('T')[0],
            created_at: date.toISOString()
          });
        }
      }
    }

    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .insert(timeEntriesData)
      .select();

    if (timeError) throw timeError;
    console.log(`✅ Created ${timeEntries.length} time entries`);

    // 7. Create sample tickets
    console.log('🎫 Creating support tickets...');
    const ticketsData = [];
    
    for (const firm of firms) {
      const firmUsers = users.filter(u => u.firm_id === firm.id);
      const ticketCount = randomAmount(10, 30);
      
      for (let i = 0; i < ticketCount; i++) {
        const reporter = randomItem(firmUsers);
        const assignee = randomItem(firmUsers.filter(u => u.role === 'admin' || u.role === 'partner'));
        const createdDate = randomDate(new Date(2023, 0, 1), new Date());
        
        const ticketTitles = [
          'Software license renewal required',
          'New employee onboarding setup',
          'Document management system access',
          'Client portal configuration',
          'Billing system integration issue',
          'Security audit compliance',
          'Email server configuration',
          'Backup system verification'
        ];
        
        ticketsData.push({
          firm_id: firm.id,
          ticket_number: `TICK-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}`,
          title: randomItem(ticketTitles),
          description: `Detailed description of the issue that requires attention and resolution. This ticket was created to track progress and ensure proper handling.`,
          priority: randomItem(['low', 'medium', 'high', 'critical']),
          status: randomItem(['open', 'in_progress', 'resolved', 'closed']),
          reporter_id: reporter.id,
          assignee_id: assignee.id,
          category: randomItem(['technical', 'administrative', 'billing', 'security']),
          created_at: createdDate.toISOString(),
          updated_at: randomDate(createdDate, new Date()).toISOString()
        });
      }
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsData)
      .select();

    if (ticketsError) throw ticketsError;
    console.log(`✅ Created ${tickets.length} tickets`);

    // 8. Create sample analytics data
    console.log('📊 Creating analytics data...');
    const analyticsData = [];
    
    for (const firm of firms) {
      // Create monthly analytics for the past 12 months
      for (let month = 0; month < 12; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        
        const firmCases = cases.filter(c => c.firm_id === firm.id);
        const firmUsers = users.filter(u => u.firm_id === firm.id);
        
        analyticsData.push({
          firm_id: firm.id,
          metric_type: 'revenue',
          metric_name: 'monthly_revenue',
          value: randomAmount(300000, 800000),
          date: date.toISOString().split('T')[0],
          metadata: {
            cases_count: firmCases.length,
            active_users: firmUsers.filter(u => u.status === 'active').length,
            billable_hours: randomAmount(800, 2000)
          }
        });
        
        analyticsData.push({
          firm_id: firm.id,
          metric_type: 'performance',
          metric_name: 'case_resolution_time',
          value: randomAmount(30, 90),
          date: date.toISOString().split('T')[0],
          metadata: {
            cases_closed: randomAmount(5, 20),
            success_rate: randomAmount(75, 95)
          }
        });
      }
    }

    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .insert(analyticsData)
      .select();

    if (analyticsError) throw analyticsError;
    console.log(`✅ Created ${analytics.length} analytics records`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${firms.length} firms`);
    console.log(`   • ${users.length} users`);
    console.log(`   • ${clients.length} clients`);
    console.log(`   • ${cases.length} cases`);
    console.log(`   • ${documents.length} documents`);
    console.log(`   • ${timeEntries.length} time entries`);
    console.log(`   • ${tickets.length} tickets`);
    console.log(`   • ${analytics.length} analytics records`);
    
    console.log('\n🔐 Sample login credentials:');
    for (const firm of firms.slice(0, 2)) {
      const adminUser = users.find(u => u.firm_id === firm.id && u.role === 'admin');
      console.log(`   Firm: ${firm.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: Admin`);
      console.log(`   Domain: ${firm.domain}\n`);
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase }; 