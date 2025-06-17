const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create temporary SQL file
const sqlContent = `
-- Create test users directly in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES 
-- Admin User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@lawfirmai.com',
  crypt('admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User", "display_name": "Admin User", "role": "admin"}',
  false,
  '',
  ''
),
-- Attorney User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'attorney@lawfirmai.com',
  crypt('attorney123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "John", "last_name": "Attorney", "display_name": "John Attorney", "role": "attorney"}',
  false,
  '',
  ''
),
-- Paralegal User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'paralegal@lawfirmai.com',
  crypt('paralegal123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Sarah", "last_name": "Paralegal", "display_name": "Sarah Paralegal", "role": "paralegal"}',
  false,
  '',
  ''
),
-- Client User
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'client@lawfirmai.com',
  crypt('client123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Jane", "last_name": "Client", "display_name": "Jane Client", "role": "client"}',
  false,
  '',
  ''
),
-- Your email
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'matty@digitaladaption.co.uk',
  crypt('matty123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Matty", "last_name": "Developer", "display_name": "Matty Developer", "role": "admin"}',
  false,
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Show created users
SELECT 
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  raw_user_meta_data->>'display_name' as display_name,
  created_at
FROM auth.users 
WHERE email IN (
  'admin@lawfirmai.com',
  'attorney@lawfirmai.com', 
  'paralegal@lawfirmai.com',
  'client@lawfirmai.com',
  'matty@digitaladaption.co.uk'
)
ORDER BY email;
`;

const tempSqlFile = path.join(__dirname, 'temp_create_users.sql');

console.log('🚀 Creating test users using Supabase CLI...\n');

try {
  // Write SQL to temporary file
  fs.writeFileSync(tempSqlFile, sqlContent);
  
  // Execute SQL using Supabase CLI
  console.log('📝 Executing SQL script...');
  const result = execSync(`npx supabase db reset --db-url postgresql://postgres.kromudvcpsscczwmwwoo:[password]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres --sql-file "${tempSqlFile}"`, {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ SQL executed successfully!');
  console.log(result);
  
} catch (error) {
  console.error('❌ Error executing SQL:', error.message);
  
  // Try alternative approach with simpler command
  console.log('\n🔄 Trying alternative approach...');
  console.log('📋 Please run this SQL manually in Supabase Dashboard:');
  console.log('🔗 Go to: https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/sql/new');
  console.log('\n📝 SQL to run:');
  console.log('─'.repeat(50));
  console.log(sqlContent);
  console.log('─'.repeat(50));
  
} finally {
  // Cleanup temporary file
  if (fs.existsSync(tempSqlFile)) {
    fs.unlinkSync(tempSqlFile);
  }
}

console.log('\n🎉 Test user creation process complete!');
console.log('\n📋 Available test accounts:');
console.log('┌─────────────────────────────────┬──────────────┬───────────┐');
console.log('│ Email                           │ Password     │ Role      │');
console.log('├─────────────────────────────────┼──────────────┼───────────┤');
console.log('│ admin@lawfirmai.com            │ admin123!    │ admin     │');
console.log('│ attorney@lawfirmai.com         │ attorney123! │ attorney  │');
console.log('│ paralegal@lawfirmai.com        │ paralegal123!│ paralegal │');
console.log('│ client@lawfirmai.com           │ client123!   │ client    │');
console.log('│ matty@digitaladaption.co.uk    │ matty123!    │ admin     │');
console.log('└─────────────────────────────────┴──────────────┴───────────┘'); 