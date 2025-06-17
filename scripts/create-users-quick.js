#!/usr/bin/env node

console.log('🚀 Quick Test User Setup for LawFirmAI');
console.log('=====================================\n');

console.log('📋 Option 1: Use Supabase Dashboard (Recommended)');
console.log('🔗 Go to: https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/sql/new');
console.log('📝 Copy and paste this SQL:\n');

const sql = `-- Create test users for LawFirmAI
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
  '{"first_name": "Admin", "last_name": "User", "display_name": "Admin User"}',
  false,
  '',
  ''
),
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
  '{"first_name": "John", "last_name": "Attorney", "display_name": "John Attorney"}',
  false,
  '',
  ''
),
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
  '{"first_name": "Matty", "last_name": "Developer", "display_name": "Matty Developer"}',
  false,
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT email, email_confirmed_at IS NOT NULL as confirmed, created_at 
FROM auth.users 
WHERE email IN ('admin@lawfirmai.com', 'attorney@lawfirmai.com', 'matty@digitaladaption.co.uk')
ORDER BY email;`;

console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));

console.log('\n✅ After running the SQL, you can sign in with:');
console.log('\n📧 admin@lawfirmai.com → Password: admin123!');
console.log('📧 attorney@lawfirmai.com → Password: attorney123!');
console.log('📧 matty@digitaladaption.co.uk → Password: matty123!');

console.log('\n🔧 Option 2: Disable Email Verification (Alternative)');
console.log('🔗 Go to: https://supabase.com/dashboard/project/kromudvcpsscczwmwwoo/auth/settings');
console.log('⚙️  Turn OFF "Enable email confirmations"');
console.log('💾 Save changes');
console.log('📝 Then you can sign up normally without email verification');

console.log('\n🎉 Once done, refresh your app and try signing in!');
console.log('🌐 Your app: http://localhost:3001/auth/signin'); 