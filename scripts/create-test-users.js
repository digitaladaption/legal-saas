const { createClient } = require('@supabase/supabase-js')

// Supabase configuration - using your project
const supabaseUrl = 'https://kromudvcpsscczwmwwoo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need to add this to .env.local

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local')
  console.log('\n📝 To get your service role key:')
  console.log('1. Go to https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/settings/api')
  console.log('2. Copy the "service_role" key (not the anon key)')
  console.log('3. Add it to your .env.local file as SUPABASE_SERVICE_ROLE_KEY=your_key_here')
  process.exit(1)
}

// Initialize Supabase with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    email: 'admin@lawfirmai.com',
    password: 'admin123!',
    user_metadata: {
      first_name: 'Admin',
      last_name: 'User',
      display_name: 'Admin User',
      role: 'admin'
    }
  },
  {
    email: 'attorney@lawfirmai.com', 
    password: 'attorney123!',
    user_metadata: {
      first_name: 'John',
      last_name: 'Attorney',
      display_name: 'John Attorney',
      role: 'attorney'
    }
  },
  {
    email: 'paralegal@lawfirmai.com',
    password: 'paralegal123!',
    user_metadata: {
      first_name: 'Sarah',
      last_name: 'Paralegal',
      display_name: 'Sarah Paralegal', 
      role: 'paralegal'
    }
  },
  {
    email: 'client@lawfirmai.com',
    password: 'client123!',
    user_metadata: {
      first_name: 'Jane',
      last_name: 'Client',
      display_name: 'Jane Client',
      role: 'client'
    }
  },
  {
    email: 'matty@digitaladaption.co.uk',
    password: 'matty123!',
    user_metadata: {
      first_name: 'Matty',
      last_name: 'Developer',
      display_name: 'Matty Developer',
      role: 'admin'
    }
  }
]

async function createTestUsers() {
  console.log('🚀 Creating test users in Supabase...\n')

  for (const userData of testUsers) {
    try {
      console.log(`📧 Creating user: ${userData.email}`)
      
      // Create user with admin API (bypasses email confirmation)
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: userData.user_metadata
      })

      if (error) {
        console.error(`❌ Failed to create ${userData.email}:`, error.message)
      } else {
        console.log(`✅ Created user: ${userData.email} (ID: ${data.user.id})`)
        
        // Create user profile in our custom table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.user_metadata.first_name,
            last_name: userData.user_metadata.last_name,
            display_name: userData.user_metadata.display_name,
            is_active: true
          })

        if (profileError) {
          console.log(`⚠️  Could not create profile for ${userData.email}:`, profileError.message)
        } else {
          console.log(`✅ Created profile for: ${userData.email}`)
        }
      }
    } catch (err) {
      console.error(`❌ Error creating ${userData.email}:`, err.message)
    }
    
    console.log('') // Empty line for readability
  }

  console.log('🎉 Test user creation complete!')
  console.log('\n📋 Available test accounts:')
  console.log('┌─────────────────────────────────┬──────────────┬───────────┐')
  console.log('│ Email                           │ Password     │ Role      │')
  console.log('├─────────────────────────────────┼──────────────┼───────────┤')
  testUsers.forEach(user => {
    console.log(`│ ${user.email.padEnd(31)} │ ${user.password.padEnd(12)} │ ${user.user_metadata.role.padEnd(9)} │`)
  })
  console.log('└─────────────────────────────────┴──────────────┴───────────┘')
}

async function main() {
  try {
    await createTestUsers()
  } catch (error) {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  }
}

main() 