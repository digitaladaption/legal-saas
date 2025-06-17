const { createClient } = require('@supabase/supabase-js');

// Use environment variables or hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kromudvcpsscczwmwwoo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment debug:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl,
  keyLength: supabaseKey ? supabaseKey.length : 0
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data
const sampleFirm = {
  name: "Smith & Associates Law",
  domain: "smithlaw.com",
  subscription_tier: "professional",
  status: "active",
  practice_areas: ["Corporate Law", "Litigation", "Employment Law"]
};

const sampleUsers = [
  {
    email: "admin@smithlaw.com",
    name: "John Smith",
    role: "admin",
    department: "Management",
    status: "active"
  },
  {
    email: "sarah.johnson@smithlaw.com", 
    name: "Sarah Johnson",
    role: "partner",
    department: "Corporate Law",
    status: "active"
  },
  {
    email: "michael.chen@smithlaw.com",
    name: "Michael Chen", 
    role: "associate",
    department: "Litigation",
    status: "active"
  },
  {
    email: "emily.davis@smithlaw.com",
    name: "Emily Davis",
    role: "paralegal", 
    department: "Corporate Law",
    status: "active"
  }
];

const sampleClients = [
  {
    name: "TechCorp Inc",
    email: "contact@techcorp.com",
    phone: "+1-555-0123",
    type: "business",
    status: "active"
  },
  {
    name: "John Doe",
    email: "john.doe@email.com", 
    phone: "+1-555-0124",
    type: "individual",
    status: "active"
  },
  {
    name: "Global Industries",
    email: "legal@global.com",
    phone: "+1-555-0125", 
    type: "business",
    status: "active"
  }
];

const sampleCases = [
  {
    case_number: "SMITH-2024-0001",
    title: "Contract Dispute - TechCorp Inc", 
    description: "Commercial contract dispute involving software licensing agreement",
    status: "active",
    priority: "high",
    practice_area: "Corporate Law",
    estimated_hours: 120,
    hourly_rate: 350,
    total_billed: 15000
  },
  {
    case_number: "SMITH-2024-0002",
    title: "Employment Termination - John Doe",
    description: "Wrongful termination claim requiring investigation and response",
    status: "active", 
    priority: "medium",
    practice_area: "Employment Law",
    estimated_hours: 80,
    hourly_rate: 300,
    total_billed: 8500
  },
  {
    case_number: "SMITH-2024-0003", 
    title: "Corporate Merger - Global Industries",
    description: "M&A transaction requiring due diligence and documentation",
    status: "pending",
    priority: "urgent",
    practice_area: "Corporate Law", 
    estimated_hours: 200,
    hourly_rate: 450,
    total_billed: 25000
  }
];

async function seedDatabase() {
  console.log('🌱 Starting simplified database seeding...');

  try {
    // 1. Create sample firm
    console.log('📊 Creating firm...');
    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .insert(sampleFirm)
      .select()
      .single();

    if (firmError) {
      console.log('Firm might already exist:', firmError.message);
      // Try to get existing firm
      const { data: existingFirm } = await supabase
        .from('firms')
        .select()
        .eq('domain', sampleFirm.domain)
        .single();
      
      if (existingFirm) {
        console.log('✅ Using existing firm');
        var firmId = existingFirm.id;
      } else {
        throw firmError;
      }
    } else {
      console.log('✅ Created new firm');
      var firmId = firm.id;
    }

    // 2. Create sample users
    console.log('👥 Creating users...');
    const usersWithFirmId = sampleUsers.map(user => ({
      ...user,
      firm_id: firmId
    }));

    const { data: users, error: usersError } = await supabase
      .from('firm_users')
      .insert(usersWithFirmId)
      .select();

    if (usersError) {
      console.log('Some users might already exist:', usersError.message);
    } else {
      console.log(`✅ Created ${users.length} users`);
    }

    // 3. Create sample clients
    console.log('🏢 Creating clients...');
    const clientsWithFirmId = sampleClients.map(client => ({
      ...client,
      firm_id: firmId
    }));

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert(clientsWithFirmId)
      .select();

    if (clientsError) {
      console.log('Some clients might already exist:', clientsError.message);
    } else {
      console.log(`✅ Created ${clients.length} clients`);
    }

    // Get existing users and clients for case creation
    const { data: existingUsers } = await supabase
      .from('firm_users')
      .select()
      .eq('firm_id', firmId);

    const { data: existingClients } = await supabase
      .from('clients')
      .select()
      .eq('firm_id', firmId);

    // 4. Create sample cases
    if (existingUsers && existingClients && existingUsers.length > 0 && existingClients.length > 0) {
      console.log('⚖️ Creating cases...');
      const casesWithFirmId = sampleCases.map((case_, index) => ({
        ...case_,
        firm_id: firmId,
        client_id: existingClients[index % existingClients.length].id,
        assigned_to: existingUsers[index % existingUsers.length].id
      }));

      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .insert(casesWithFirmId)
        .select();

      if (casesError) {
        console.log('Some cases might already exist:', casesError.message);
      } else {
        console.log(`✅ Created ${cases.length} cases`);
      }
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   • 1 firm: ${sampleFirm.name}`);
    console.log(`   • ${sampleUsers.length} users`);
    console.log(`   • ${sampleClients.length} clients`);
    console.log(`   • ${sampleCases.length} cases`);
    
    console.log('\n🔐 Sample login info:');
    console.log(`   Firm: ${sampleFirm.name}`);
    console.log(`   Domain: ${sampleFirm.domain}`);
    console.log(`   Admin Email: admin@smithlaw.com`);
    console.log(`   Other Users: sarah.johnson@smithlaw.com, michael.chen@smithlaw.com`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('✅ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }); 