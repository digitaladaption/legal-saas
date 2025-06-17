const { createClient } = require('@supabase/supabase-js')

// Use your existing credentials from .env.local
const supabaseUrl = 'https://kromudvcpsscczwmwwoo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyb211ZHZjcHNzY2N6d213d29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjA1NTMsImV4cCI6MjA2NDg5NjU1M30.daJlvrnBoPsqp6SJjTYUxULe5sszJhjYpguKWWdNH8k'

console.log('🚀 Creating test users using Supabase client...\n')

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

const testUsers = [
  {
    email: 'admin@lawfirmai.com',
    password: 'admin123!'
  },
  {
    email: 'attorney@lawfirmai.com', 
    password: 'attorney123!'
  },
  {
    email: 'matty@digitaladaption.co.uk',
    password: 'matty123!'
  }
]

async function createUsers() {
  for (const user of testUsers) {
    try {
      console.log(`📧 Creating user: ${user.email}`)
      
      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.email === 'admin@lawfirmai.com' ? 'Admin' : 
                       user.email === 'attorney@lawfirmai.com' ? 'John' : 'Matty',
            last_name: user.email === 'admin@lawfirmai.com' ? 'User' : 
                      user.email === 'attorney@lawfirmai.com' ? 'Attorney' : 'Developer',
            display_name: user.email === 'admin@lawfirmai.com' ? 'Admin User' : 
                         user.email === 'attorney@lawfirmai.com' ? 'John Attorney' : 'Matty Developer'
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`✅ User ${user.email} already exists`)
        } else {
          console.error(`❌ Error creating ${user.email}:`, error.message)
        }
      } else {
        console.log(`✅ Successfully created user: ${user.email}`)
        if (data.user && !data.user.email_confirmed_at) {
          console.log(`📧 Email confirmation required for ${user.email}`)
        }
      }
    } catch (err) {
      console.error(`❌ Error creating ${user.email}:`, err.message)
    }
    
    console.log('') // Empty line for readability
  }
}

async function main() {
  try {
    await createUsers()
    
    console.log('🎉 User creation process complete!')
    console.log('\n📋 Try signing in with these accounts:')
    console.log('┌─────────────────────────────────┬──────────────┐')
    console.log('│ Email                           │ Password     │')
    console.log('├─────────────────────────────────┼──────────────┤')
    console.log('│ admin@lawfirmai.com            │ admin123!    │')
    console.log('│ attorney@lawfirmai.com         │ attorney123! │')
    console.log('│ matty@digitaladaption.co.uk    │ matty123!    │')
    console.log('└─────────────────────────────────┴──────────────┘')
    
    console.log('\n💡 If email confirmation is required:')
    console.log('🔗 Disable it at: https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/auth/settings')
    console.log('⚙️  Turn OFF "Enable email confirmations"')
    
  } catch (error) {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  }
}

main() 